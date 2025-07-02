-- Eliminar tablas existentes si es necesario (solo para desarrollo)
-- DROP TABLE IF EXISTS desembolsos CASCADE;
-- DROP TABLE IF EXISTS pagos CASCADE;
-- DROP TABLE IF EXISTS planes_pago CASCADE;
-- DROP TABLE IF EXISTS proyectos CASCADE;
-- DROP TABLE IF EXISTS items_cotizacion CASCADE;
-- DROP TABLE IF EXISTS cotizaciones CASCADE;
-- DROP TABLE IF EXISTS servicios CASCADE;
-- DROP TABLE IF EXISTS clientes CASCADE;
-- DROP TABLE IF EXISTS categorias_desembolso CASCADE;

-- Crear tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  empresa VARCHAR(255),
  nit VARCHAR(50),
  email VARCHAR(255),
  telefono VARCHAR(50),
  direccion TEXT,
  ciudad VARCHAR(100),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de servicios (reemplaza productos)
CREATE TABLE IF NOT EXISTS servicios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  descripcion TEXT,
  costo_base DECIMAL(10, 2) NOT NULL DEFAULT 0,
  gastos_fijos DECIMAL(10, 2) NOT NULL DEFAULT 0,
  margen_deseado DECIMAL(5, 2) NOT NULL DEFAULT 30,
  precio_sugerido DECIMAL(10, 2) NOT NULL DEFAULT 0,
  duracion_estimada INTEGER DEFAULT 1, -- en días
  tipo_servicio VARCHAR(50) DEFAULT 'unico', -- 'unico', 'recurrente', 'por_horas'
  precio_por_hora DECIMAL(10, 2) DEFAULT 0,
  recursos_necesarios TEXT,
  activo BOOLEAN DEFAULT TRUE,
  veces_cotizado INTEGER DEFAULT 0,
  veces_vendido INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de cotizaciones (reemplaza ventas)
CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero VARCHAR(50) UNIQUE NOT NULL, -- QUOTE-2024-001
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  fecha DATE NOT NULL,
  fecha_validez DATE NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'borrador', -- 'borrador', 'enviada', 'aprobada', 'rechazada', 'vencida'
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  descuento_porcentaje DECIMAL(5, 2) DEFAULT 0,
  descuento_valor DECIMAL(10, 2) DEFAULT 0,
  iva DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notas TEXT,
  terminos_condiciones TEXT,
  fecha_aprobacion DATE,
  fecha_rechazo DATE,
  motivo_rechazo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de items de cotización
CREATE TABLE IF NOT EXISTS items_cotizacion (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cotizacion_id UUID NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE RESTRICT,
  descripcion TEXT NOT NULL,
  cantidad DECIMAL(10, 2) NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  descuento_porcentaje DECIMAL(5, 2) DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  notas TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de proyectos (cotizaciones aprobadas)
CREATE TABLE IF NOT EXISTS proyectos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cotizacion_id UUID NOT NULL REFERENCES cotizaciones(id) ON DELETE RESTRICT,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  nombre VARCHAR(255) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin_estimada DATE NOT NULL,
  fecha_fin_real DATE,
  estado VARCHAR(50) NOT NULL DEFAULT 'activo', -- 'activo', 'pausado', 'completado', 'cancelado'
  progreso DECIMAL(5, 2) DEFAULT 0, -- porcentaje de avance
  valor_total DECIMAL(10, 2) NOT NULL,
  costo_estimado DECIMAL(10, 2) DEFAULT 0,
  costo_real DECIMAL(10, 2) DEFAULT 0,
  rentabilidad_estimada DECIMAL(10, 2) DEFAULT 0,
  rentabilidad_real DECIMAL(10, 2) DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de planes de pago
CREATE TABLE IF NOT EXISTS planes_pago (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  numero_cuota INTEGER NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'cuota', -- 'anticipo', 'cuota', 'final', 'hito'
  porcentaje_proyecto DECIMAL(5, 2),
  estado VARCHAR(50) NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'pagado', 'vencido', 'parcial'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de pagos recibidos
CREATE TABLE IF NOT EXISTS pagos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE RESTRICT,
  plan_pago_id UUID REFERENCES planes_pago(id) ON DELETE SET NULL,
  fecha DATE NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  metodo_pago VARCHAR(50) NOT NULL DEFAULT 'transferencia', -- 'efectivo', 'transferencia', 'cheque', 'tarjeta'
  numero_referencia VARCHAR(100),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de categorías de desembolso
CREATE TABLE IF NOT EXISTS categorias_desembolso (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL DEFAULT 'variable', -- 'fijo', 'variable'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de desembolsos
CREATE TABLE IF NOT EXISTS desembolsos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proyecto_id UUID REFERENCES proyectos(id) ON DELETE RESTRICT,
  categoria_id UUID NOT NULL REFERENCES categorias_desembolso(id) ON DELETE RESTRICT,
  fecha DATE NOT NULL,
  descripcion TEXT NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  proveedor VARCHAR(255),
  numero_factura VARCHAR(100),
  metodo_pago VARCHAR(50) NOT NULL DEFAULT 'transferencia',
  estado VARCHAR(50) NOT NULL DEFAULT 'pagado', -- 'pendiente', 'pagado', 'aprobado'
  aprobado_por VARCHAR(255),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_clientes_empresa ON clientes(empresa);
CREATE INDEX IF NOT EXISTS idx_servicios_categoria ON servicios(categoria);
CREATE INDEX IF NOT EXISTS idx_servicios_activo ON servicios(activo);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estado ON cotizaciones(estado);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_cliente ON cotizaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_fecha ON cotizaciones(fecha);
CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos(estado);
CREATE INDEX IF NOT EXISTS idx_proyectos_cliente ON proyectos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_planes_pago_proyecto ON planes_pago(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_planes_pago_estado ON planes_pago(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_proyecto ON pagos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha);
CREATE INDEX IF NOT EXISTS idx_desembolsos_proyecto ON desembolsos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_desembolsos_fecha ON desembolsos(fecha);

-- Extender triggers para nuevas tablas
DO $$
BEGIN
    -- Trigger para clientes
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_clientes_updated_at') THEN
        CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Trigger para servicios
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_servicios_updated_at') THEN
        CREATE TRIGGER update_servicios_updated_at BEFORE UPDATE ON servicios
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Trigger para cotizaciones
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cotizaciones_updated_at') THEN
        CREATE TRIGGER update_cotizaciones_updated_at BEFORE UPDATE ON cotizaciones
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Trigger para proyectos
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_proyectos_updated_at') THEN
        CREATE TRIGGER update_proyectos_updated_at BEFORE UPDATE ON proyectos
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Trigger para planes_pago
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_planes_pago_updated_at') THEN
        CREATE TRIGGER update_planes_pago_updated_at BEFORE UPDATE ON planes_pago
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Insertar categorías de desembolso iniciales
INSERT INTO categorias_desembolso (nombre, descripcion, tipo) VALUES
  ('Materiales', 'Materiales y suministros para el proyecto', 'variable'),
  ('Mano de obra', 'Pagos a personal y contratistas', 'variable'),
  ('Transporte', 'Gastos de transporte y logística', 'variable'),
  ('Herramientas', 'Compra o alquiler de herramientas', 'variable'),
  ('Servicios externos', 'Servicios subcontratados', 'variable'),
  ('Licencias', 'Licencias de software o permisos', 'fijo'),
  ('Otros', 'Otros gastos del proyecto', 'variable')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar servicios de ejemplo
INSERT INTO servicios (nombre, categoria, descripcion, costo_base, margen_deseado, precio_sugerido, duracion_estimada, tipo_servicio) VALUES
  ('Desarrollo Web Básico', 'desarrollo', 'Sitio web corporativo hasta 5 páginas', 800000, 40, 1120000, 15, 'unico'),
  ('Desarrollo E-commerce', 'desarrollo', 'Tienda online con pasarela de pagos', 2500000, 35, 3375000, 30, 'unico'),
  ('Mantenimiento Web', 'soporte', 'Mantenimiento mensual de sitio web', 300000, 50, 450000, 0, 'recurrente'),
  ('Consultoría TI', 'consultoria', 'Consultoría tecnológica por hora', 0, 60, 120000, 0, 'por_horas'),
  ('Diseño de Logo', 'diseño', 'Diseño de identidad corporativa', 500000, 45, 725000, 7, 'unico')
ON CONFLICT DO NOTHING;