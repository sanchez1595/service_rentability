-- Script para migrar datos existentes cuando se implementa autenticación
-- IMPORTANTE: Ejecutar este script DESPUÉS de registrar tu primer usuario

-- Opción 1: Asignar todos los datos existentes al primer usuario registrado
-- (Descomenta las líneas siguientes si quieres usar esta opción)

/*
-- Obtener el primer usuario registrado
WITH first_user AS (
  SELECT id FROM auth.users ORDER BY created_at LIMIT 1
)
-- Actualizar productos sin user_id
UPDATE productos 
SET user_id = (SELECT id FROM first_user) 
WHERE user_id IS NULL;

-- Actualizar ventas sin user_id
UPDATE ventas 
SET user_id = (SELECT id FROM first_user) 
WHERE user_id IS NULL;

-- Actualizar configuracion sin user_id
UPDATE configuracion 
SET user_id = (SELECT id FROM first_user) 
WHERE user_id IS NULL;

-- Actualizar metas sin user_id
UPDATE metas 
SET user_id = (SELECT id FROM first_user) 
WHERE user_id IS NULL;

-- Actualizar alertas sin user_id
UPDATE alertas 
SET user_id = (SELECT id FROM first_user) 
WHERE user_id IS NULL;
*/

-- Opción 2: Asignar a un usuario específico por email
-- REEMPLAZA 'tu-email@ejemplo.com' con tu email real

/*
-- Actualizar productos
UPDATE productos 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'tu-email@ejemplo.com'
) 
WHERE user_id IS NULL;

-- Actualizar ventas
UPDATE ventas 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'tu-email@ejemplo.com'
) 
WHERE user_id IS NULL;

-- Actualizar configuracion
UPDATE configuracion 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'tu-email@ejemplo.com'
) 
WHERE user_id IS NULL;

-- Actualizar metas
UPDATE metas 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'tu-email@ejemplo.com'
) 
WHERE user_id IS NULL;

-- Actualizar alertas
UPDATE alertas 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'tu-email@ejemplo.com'
) 
WHERE user_id IS NULL;
*/

-- Opción 3: Ver todos los datos sin filtro (temporalmente deshabilitar RLS)
-- SOLO para debugging - NO dejar así en producción

/*
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE ventas DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion DISABLE ROW LEVEL SECURITY;
ALTER TABLE metas DISABLE ROW LEVEL SECURITY;
ALTER TABLE alertas DISABLE ROW LEVEL SECURITY;
*/

-- Para volver a habilitar RLS después de migrar:
/*
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
*/

-- Verificar datos existentes sin user_id
SELECT 'productos' as tabla, count(*) as registros_sin_user_id FROM productos WHERE user_id IS NULL
UNION ALL
SELECT 'ventas' as tabla, count(*) as registros_sin_user_id FROM ventas WHERE user_id IS NULL
UNION ALL
SELECT 'configuracion' as tabla, count(*) as registros_sin_user_id FROM configuracion WHERE user_id IS NULL
UNION ALL
SELECT 'metas' as tabla, count(*) as registros_sin_user_id FROM metas WHERE user_id IS NULL
UNION ALL
SELECT 'alertas' as tabla, count(*) as registros_sin_user_id FROM alertas WHERE user_id IS NULL; 