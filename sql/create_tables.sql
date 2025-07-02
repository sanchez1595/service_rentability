-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  costo_compra DECIMAL(10, 2) NOT NULL DEFAULT 0,
  gastos_fijos DECIMAL(10, 2) NOT NULL DEFAULT 0,
  margen_deseado DECIMAL(5, 2) NOT NULL DEFAULT 30,
  precio_venta DECIMAL(10, 2) NOT NULL DEFAULT 0,
  utilidad DECIMAL(10, 2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  ventas_ultimos_30_dias INTEGER NOT NULL DEFAULT 0,
  precio_competencia DECIMAL(10, 2) DEFAULT 0,
  fecha_ultima_venta TIMESTAMP,
  rotacion VARCHAR(20) NOT NULL DEFAULT 'media',
  es_paquete BOOLEAN NOT NULL DEFAULT FALSE,
  unidades_por_paquete INTEGER NOT NULL DEFAULT 1,
  costo_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de ventas
CREATE TABLE IF NOT EXISTS ventas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  producto_nombre VARCHAR(255) NOT NULL,
  cantidad INTEGER NOT NULL,
  precio_venta DECIMAL(10, 2) NOT NULL,
  costo_unitario DECIMAL(10, 2) NOT NULL,
  fecha DATE NOT NULL,
  cliente VARCHAR(255) DEFAULT 'Cliente general',
  metodo_pago VARCHAR(50) NOT NULL DEFAULT 'efectivo',
  utilidad_total DECIMAL(10, 2) NOT NULL,
  ingreso_total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de configuración
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL, -- 'porcentaje', 'costo_fijo', 'herramienta', 'general'
  clave VARCHAR(100) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tipo, clave)
);

-- Crear tabla de metas
CREATE TABLE IF NOT EXISTS metas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clave VARCHAR(100) NOT NULL UNIQUE,
  valor DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de alertas
CREATE TABLE IF NOT EXISTS alertas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clave VARCHAR(100) NOT NULL UNIQUE,
  valor DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_stock ON productos(stock);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_ventas_producto_id ON ventas(producto_id);
CREATE INDEX IF NOT EXISTS idx_configuracion_tipo ON configuracion(tipo);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers solo si no existen
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_productos_updated_at') THEN
        CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_configuracion_updated_at') THEN
        CREATE TRIGGER update_configuracion_updated_at BEFORE UPDATE ON configuracion
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_metas_updated_at') THEN
        CREATE TRIGGER update_metas_updated_at BEFORE UPDATE ON metas
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_alertas_updated_at') THEN
        CREATE TRIGGER update_alertas_updated_at BEFORE UPDATE ON alertas
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Insertar configuración inicial
INSERT INTO configuracion (tipo, clave, valor) VALUES
  ('porcentaje', 'contabilidad', 2),
  ('porcentaje', 'mercadeo', 5),
  ('porcentaje', 'ventas', 15),
  ('porcentaje', 'salarios', 10),
  ('porcentaje', 'compras', 2),
  ('porcentaje', 'extras', 5),
  ('costo_fijo', 'arriendo', 1000000),
  ('costo_fijo', 'energia', 200000),
  ('costo_fijo', 'gas', 50000),
  ('costo_fijo', 'aseo', 800000),
  ('costo_fijo', 'internet', 200000),
  ('costo_fijo', 'agua', 200000),
  ('costo_fijo', 'servidores', 110000),
  ('herramienta', 'figma', 51600),
  ('herramienta', 'chatgpt', 86000),
  ('herramienta', 'correos', 51600),
  ('herramienta', 'servidor', 100000),
  ('herramienta', 'dominio', 120000),
  ('general', 'ventas_estimadas', 100)
ON CONFLICT (tipo, clave) DO NOTHING;

-- Insertar metas iniciales
INSERT INTO metas (clave, valor) VALUES
  ('ventas_mensuales', 2000000),
  ('unidades_mensuales', 200),
  ('margen_promedio', 35),
  ('rotacion_inventario', 12)
ON CONFLICT (clave) DO NOTHING;

-- Insertar alertas iniciales
INSERT INTO alertas (clave, valor) VALUES
  ('margen_minimo', 20),
  ('stock_minimo', 5),
  ('dias_sin_venta', 30),
  ('diferencia_precio_competencia', 15)
ON CONFLICT (clave) DO NOTHING;