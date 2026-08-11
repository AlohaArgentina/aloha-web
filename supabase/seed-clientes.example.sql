-- YA EJECUTADO en el proyecto real (11/08/2026) para AVC, Airsat y Fiberty,
-- con logins de prueba avc@aloha.net.ar / airsat@aloha.net.ar /
-- fiberty@aloha.net.ar (a reemplazar por los mails reales de cada cliente
-- cuando se les comunique el panel — desde Authentication → Users se puede
-- editar el email de un usuario sin perder su fila en "clientes", porque
-- el vínculo es por auth_user_id, no por email).
--
-- Este archivo queda como referencia de qué se cargó y con qué IDs. Para
-- responsable_cliente y descripcion_servicio, ver nota abajo. Para volver a
-- usar este archivo en otro proyecto (ej. Supabase de test), reemplazar los
-- 'PEGAR-USER-UID-DE-...' por los UUID reales de Authentication → Users.

insert into clientes (auth_user_id, nombre, responsable_cliente, coordinador_aloha, contacto_coordinador, horario_atencion, descripcion_servicio, fecha_inicio) values
  ('PEGAR-USER-UID-DE-AVC',      'AVC',     'Completar', 'Rodrigo Tortosa', 'rodrigo@aloha.net.ar', 'Lunes a domingo de 10 a 22 hs', 'Completar', null),
  ('PEGAR-USER-UID-DE-AIRSAT',   'Airsat',  'Completar', 'Rodrigo Tortosa', 'rodrigo@aloha.net.ar', 'Lunes a domingo de 10 a 22 hs', 'Completar', null),
  ('PEGAR-USER-UID-DE-FIBERTY',  'Fiberty', 'Completar', 'Rodrigo Tortosa', 'rodrigo@aloha.net.ar', 'Lunes a domingo de 10 a 22 hs', 'Completar', null);

-- responsable_cliente (contacto del lado del cliente) y descripcion_servicio
-- quedaron en "Completar": se pueden editar en cualquier momento desde el
-- Table Editor de Supabase, fila por fila, sin volver a tocar este script.
