-- Migración: Agregar campos de paquete a la tabla productos
-- Ejecutar este script si ya tienes datos en tu tabla productos

-- Agregar nuevos campos solo si no existen
DO $$
BEGIN
    -- Agregar campo es_paquete si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'es_paquete') THEN
        ALTER TABLE productos ADD COLUMN es_paquete BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
    
    -- Agregar campo unidades_por_paquete si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'unidades_por_paquete') THEN
        ALTER TABLE productos ADD COLUMN unidades_por_paquete INTEGER NOT NULL DEFAULT 1;
    END IF;
    
    -- Agregar campo costo_unitario si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'productos' AND column_name = 'costo_unitario') THEN
        ALTER TABLE productos ADD COLUMN costo_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Actualizar costo_unitario para productos existentes
UPDATE productos 
SET costo_unitario = costo_compra 
WHERE costo_unitario = 0 AND costo_compra > 0; 