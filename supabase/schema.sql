-- Esquema del panel de clientes (AVC, Airsat, Fiberty).
-- Ejecutar una sola vez en Supabase: Project → SQL Editor → New query → pegar y correr.
--
-- Diseño: cada cliente tiene un único login (creado a mano en Authentication →
-- Users, igual que el admin). Esta tabla "clientes" vincula ese login
-- (auth_user_id) con el resto de sus datos. reportes/facturas guardan solo el
-- link de Drive, nunca el archivo en sí: Supabase no almacena documentos acá.
--
-- Row Level Security (RLS) es lo que impide que un cliente vea los datos de
-- otro: cada política sólo deja pasar filas cuyo auth_user_id (o cuyo
-- cliente_id, vía join) coincide con el usuario logueado (auth.uid()).

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
  for select using (auth_user_id = auth.uid());

create policy "cada cliente ve solo sus propios reportes" on reportes
  for select using (
    cliente_id in (select id from clientes where auth_user_id = auth.uid())
  );

create policy "cada cliente ve solo sus propias facturas" on facturas
  for select using (
    cliente_id in (select id from clientes where auth_user_id = auth.uid())
  );
