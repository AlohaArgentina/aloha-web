-- Paso 2: correr DESPUÉS de schema.sql y DESPUÉS de crear los 3 logins en
-- Authentication → Users (uno por cliente, mismo proceso que el admin).
--
-- El login admin ya tiene su fila de demo/comercial cargada (nombre
-- "Cuenta Demo"), usada tanto para probar el panel como para mostrárselo a
-- leads. Este archivo es solo para AVC, Airsat y Fiberty.
--
-- Por cada usuario creado, entrar a su ficha en Authentication → Users y
-- copiar el "User UID" (es un UUID, algo como 1c915c43-0876-467b-b030-...).
-- Reemplazar los tres 'PEGAR-USER-UID-DE-...' de abajo por esos valores
-- reales antes de correr esto. Los demás campos son de arranque: se pueden
-- editar en cualquier momento desde el Table Editor de Supabase, no hace
-- falta volver a este script.

insert into clientes (auth_user_id, nombre, responsable_cliente, coordinador_aloha, contacto_coordinador, horario_atencion, descripcion_servicio, fecha_inicio) values
  ('PEGAR-USER-UID-DE-AVC',      'AVC',     'Completar', 'Completar', 'Completar', 'Lunes a viernes 9 a 18 hs', 'Completar', null),
  ('PEGAR-USER-UID-DE-AIRSAT',   'Airsat',  'Completar', 'Completar', 'Completar', 'Lunes a viernes 9 a 18 hs', 'Completar', null),
  ('PEGAR-USER-UID-DE-FIBERTY',  'Fiberty', 'Completar', 'Completar', 'Completar', 'Lunes a viernes 9 a 18 hs', 'Completar', null);
