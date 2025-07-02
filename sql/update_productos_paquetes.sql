-- Migración para agregar el campo cantidadPaquetes a los productos
-- y tipoVenta a las ventas

-- Agregar campo cantidadPaquetes a la tabla productos
ALTER TABLE productos ADD COLUMN IF NOT EXISTS cantidad_paquetes TEXT DEFAULT '1';

-- Agregar campo tipoVenta a la tabla ventas
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS tipo_venta TEXT DEFAULT 'unidad';

-- Actualizar productos existentes que son paquetes para que tengan cantidad_paquetes = '1'
UPDATE productos 
SET cantidad_paquetes = '1' 
WHERE es_paquete = true AND cantidad_paquetes IS NULL;

-- Actualizar ventas existentes para que tengan tipo_venta = 'unidad'
UPDATE ventas 
SET tipo_venta = 'unidad' 
WHERE tipo_venta IS NULL;

-- Verificar que los cambios se aplicaron correctamente
SELECT 
    nombre,
    es_paquete,
    unidades_por_paquete,
    cantidad_paquetes,
    stock,
    costo_unitario
FROM productos 
WHERE es_paquete = true
LIMIT 5;

-- Verificar la tabla de ventas
SELECT 
    id,
    producto_nombre,
    cantidad,
    tipo_venta,
    fecha
FROM ventas 
ORDER BY fecha DESC
LIMIT 5;