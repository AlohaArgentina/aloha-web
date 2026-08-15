-- Esquema del panel de clientes (AVC, Airsat, Fiberty).
-- Ya aplicado en el proyecto real vía Supabase MCP (migraciones
-- panel_clientes_schema + optimizar_rls_auth_uid). Este archivo documenta
-- el estado actual; para un proyecto nuevo, ejecutar una sola vez en
-- Supabase: Project → SQL Editor → New query → pegar y correr.
--
-- Diseño: cada cliente tiene un único login (creado a mano en Authentication →
-- Users, igual que el admin). Esta tabla "clientes" vincula ese login
-- (auth_user_id) con el resto de sus datos. reportes/facturas guardan solo el
-- link de Drive, nunca el archivo en sí: Supabase no almacena documentos acá.
--
-- Row Level Security (RLS) es lo que impide que un cliente vea los datos de
-- otro: cada política sólo deja pasar filas cuyo auth_user_id (o cuyo
-- cliente_id, vía join) coincide con el usuario logueado. auth.uid() va
-- envuelto en (select ...) para que se evalúe una sola vez por consulta y no
-- una vez por fila (recomendación del linter de performance de Supabase).

create table clientes (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id),
  nombre text not null,
  responsable_cliente text,
  coordinador_aloha text,
  contacto_coordinador text,
  horario_atencion text,
  descripcion_servicio text,
  fecha_inicio date,
  created_at timestamptz not null default now()
);

create table reportes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  periodo date not null, -- primer día del mes que representa, ej. 2026-07-01
  drive_url text not null,
  created_at timestamptz not null default now(),
  unique (cliente_id, periodo)
);

create table facturas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  periodo date not null,
  drive_url text not null,
  monto numeric,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'pagada')),
  created_at timestamptz not null default now(),
  unique (cliente_id, periodo)
);

alter table clientes enable row level security;
alter table reportes enable row level security;
alter table facturas enable row level security;

create policy "cada cliente ve solo su propia fila" on clientes
  for select using (auth_user_id = (select auth.uid()));

create policy "cada cliente ve solo sus propios reportes" on reportes
  for select using (
    cliente_id in (select id from clientes where auth_user_id = (select auth.uid()))
  );

create policy "cada cliente ve solo sus propias facturas" on facturas
  for select using (
    cliente_id in (select id from clientes where auth_user_id = (select auth.uid()))
  );

-- Crear tablas por SQL (en vez de por el editor de tablas de Supabase) no
-- otorga automáticamente permiso de lectura a los roles de la API. RLS
-- controla QUÉ filas puede ver cada quien, pero antes de eso Postgres exige
-- este permiso a nivel de tabla — sin él, cualquier consulta se rechaza con
-- 403 aunque las políticas de RLS estén perfectas. Solo se otorga a
-- "authenticated": "anon" no recibe nada, así que un visitante sin sesión no
-- puede leer ninguna fila de estas tablas.
grant select on clientes, reportes, facturas to authenticated;

-- ---------------------------------------------------------------------------
-- Administradores (panel de administración de clientes, /panel-admin)
-- ---------------------------------------------------------------------------
--
-- El panel de administración usa el mismo proyecto y el mismo login de
-- Supabase Auth que /area-clientes: no hay un backend ni un proyecto
-- separado para el equipo de Aloha. Lo que distingue a un administrador de
-- un cliente es tener una fila en esta tabla — igual que "perfiles" separa
-- coordinador de agente en aloha-desk.
--
-- El alta es manual: primero el login en Authentication → Users (con una
-- contraseña provisoria), después una fila acá vinculada por auth_user_id.
-- No hay jerarquía de roles: todo administrador tiene los mismos permisos.

create table administradores (
  auth_user_id uuid primary key references auth.users(id),
  nombre text not null,
  created_at timestamptz not null default now()
);

alter table administradores enable row level security;

create policy "un administrador ve su propia fila" on administradores
  for select using (auth_user_id = (select auth.uid()));

grant select on administradores to authenticated;

-- Función auxiliar, mismo criterio que es_coordinador() en aloha-desk:
-- security definer + search_path fijo para que una política que la llama no
-- dispare recursión de RLS sobre "administradores" al evaluarse.
create or replace function public.es_administrador()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from administradores where auth_user_id = (select auth.uid())
  );
$$;

revoke execute on function public.es_administrador() from public, anon;
grant  execute on function public.es_administrador() to authenticated;

-- Alta de cliente por email. El login se sigue creando a mano en
-- Authentication → Users, igual que hasta ahora: esta función solo vincula
-- ese login (buscado por email) con una fila nueva en "clientes" — no hay
-- forma de listar auth.users desde el navegador con la anon key, así que sin
-- esto el panel no podría resolver el auth_user_id por sí solo.
create or replace function public.crear_cliente(p_email text, p_nombre text)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_auth_user_id uuid;
  v_cliente_id uuid;
begin
  if not es_administrador() then
    raise exception 'Solo un administrador puede crear clientes.';
  end if;

  select id into v_auth_user_id from auth.users where email = p_email;
  if v_auth_user_id is null then
    raise exception 'No existe ningún usuario con ese email. Crealo primero en Authentication → Users.';
  end if;

  insert into clientes (auth_user_id, nombre) values (v_auth_user_id, p_nombre)
  returning id into v_cliente_id;

  return v_cliente_id;
end;
$$;

revoke execute on function public.crear_cliente(text, text) from public, anon;
grant  execute on function public.crear_cliente(text, text) to authenticated;

-- Hasta acá "clientes"/"reportes"/"facturas" solo tenían política de select
-- para el propio cliente: nadie podía escribir, ni siquiera coordinación —
-- la edición era manual en el Table Editor. Estas políticas agregan lo que
-- falta, sin tocar las que ya existían.
create policy "administradores pueden ver todos los clientes" on clientes
  for select using (es_administrador());
create policy "administradores pueden crear clientes" on clientes
  for insert with check (es_administrador());
create policy "administradores pueden editar clientes" on clientes
  for update using (es_administrador()) with check (es_administrador());
create policy "administradores pueden eliminar clientes" on clientes
  for delete using (es_administrador());

create policy "administradores pueden ver todos los reportes" on reportes
  for select using (es_administrador());
create policy "administradores pueden crear reportes" on reportes
  for insert with check (es_administrador());
create policy "administradores pueden editar reportes" on reportes
  for update using (es_administrador()) with check (es_administrador());
create policy "administradores pueden eliminar reportes" on reportes
  for delete using (es_administrador());

create policy "administradores pueden ver todas las facturas" on facturas
  for select using (es_administrador());
create policy "administradores pueden crear facturas" on facturas
  for insert with check (es_administrador());
create policy "administradores pueden editar facturas" on facturas
  for update using (es_administrador()) with check (es_administrador());
create policy "administradores pueden eliminar facturas" on facturas
  for delete using (es_administrador());

grant insert, update, delete on clientes, reportes, facturas to authenticated;
