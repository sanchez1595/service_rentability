-- =====================================================
-- SCRIPT COMPLETO PARA SISTEMA DE SERVICIOS RENTABILITY
-- =====================================================
-- Este script crea todas las tablas, funciones y datos iniciales
-- necesarios para el sistema completo de gestión de servicios
-- =====================================================

-- Habilitar UUID si no está habilitado
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  empresa VARCHAR(255),
  nit VARCHAR(50),
  email VARCHAR(255),
  telefono VARCHAR(50),
  direccion TEXT,
  ciudad VARCHAR(100),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Servicios
CREATE TABLE IF NOT EXISTS servicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('desarrollo', 'diseño', 'consultoria', 'soporte', 'capacitacion', 'marketing', 'otros')),
  descripcion TEXT,
  costo_base DECIMAL(15,2) NOT NULL DEFAULT 0,
  gastos_fijos DECIMAL(15,2) NOT NULL DEFAULT 0,
  margen_deseado DECIMAL(5,2) NOT NULL DEFAULT 35,
  precio_sugerido DECIMAL(15,2) NOT NULL DEFAULT 0,
  duracion_estimada INTEGER NOT NULL DEFAULT 1,
  tipo_servicio VARCHAR(20) NOT NULL DEFAULT 'unico' CHECK (tipo_servicio IN ('unico', 'recurrente', 'por_horas')),
  precio_por_hora DECIMAL(15,2),
  recursos_necesarios TEXT,
  activo BOOLEAN DEFAULT true,
  veces_cotizado INTEGER DEFAULT 0,
  veces_vendido INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(50) UNIQUE NOT NULL,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_validez DATE NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviada', 'aprobada', 'rechazada', 'vencida')),
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
  descuento_valor DECIMAL(15,2) DEFAULT 0,
  iva DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  notas TEXT,
  terminos_condiciones TEXT,
  fecha_aprobacion DATE,
  fecha_rechazo DATE,
  motivo_rechazo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Items de Cotización
CREATE TABLE IF NOT EXISTS items_cotizacion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cotizacion_id UUID NOT NULL REFERENCES cotizaciones(id) ON DELETE CASCADE,
  servicio_id UUID NOT NULL REFERENCES servicios(id),
  descripcion TEXT,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(15,2) NOT NULL,
  descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
  subtotal DECIMAL(15,2) NOT NULL,
  notas TEXT,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Proyectos
CREATE TABLE IF NOT EXISTS proyectos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  cotizacion_id UUID REFERENCES cotizaciones(id),
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin_estimada DATE,
  fecha_fin_real DATE,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'pausado', 'completado', 'cancelado')),
  valor_total DECIMAL(15,2) NOT NULL DEFAULT 0,
  costo_estimado DECIMAL(15,2) DEFAULT 0,
  costo_real DECIMAL(15,2) DEFAULT 0,
  rentabilidad_estimada DECIMAL(15,2) DEFAULT 0,
  rentabilidad_real DECIMAL(15,2) DEFAULT 0,
  progreso DECIMAL(5,2) DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Planes de Pago
CREATE TABLE IF NOT EXISTS planes_pago (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id),
  numero_cuota INTEGER NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('anticipo', 'cuota', 'final', 'hito')),
  descripcion VARCHAR(255) NOT NULL,
  monto DECIMAL(15,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'parcial', 'pagado', 'vencido', 'cancelado')),
  porcentaje_proyecto DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proyecto_id, numero_cuota)
);

-- Tabla de Pagos
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id),
  plan_pago_id UUID REFERENCES planes_pago(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  monto DECIMAL(15,2) NOT NULL,
  metodo_pago VARCHAR(50),
  numero_referencia VARCHAR(100),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Categorías de Desembolso
CREATE TABLE IF NOT EXISTS categorias_desembolso (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Desembolsos
CREATE TABLE IF NOT EXISTS desembolsos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id),
  categoria_id UUID NOT NULL REFERENCES categorias_desembolso(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  descripcion VARCHAR(255) NOT NULL,
  monto DECIMAL(15,2) NOT NULL,
  proveedor VARCHAR(255),
  numero_documento VARCHAR(100),
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'pagado', 'rechazado')),
  aprobado_por VARCHAR(255),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Configuración
CREATE TABLE IF NOT EXISTS configuracion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(50) NOT NULL,
  clave VARCHAR(100) NOT NULL,
  valor DECIMAL(15,2) NOT NULL DEFAULT 0,
  valor_texto TEXT,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tipo, clave)
);

-- Tabla de Metas
CREATE TABLE IF NOT EXISTS metas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(50) NOT NULL UNIQUE,
  valor DECIMAL(15,2) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Alertas
CREATE TABLE IF NOT EXISTS alertas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(50) NOT NULL UNIQUE,
  valor DECIMAL(15,2) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX idx_cotizaciones_cliente ON cotizaciones(cliente_id);
CREATE INDEX idx_cotizaciones_estado ON cotizaciones(estado);
CREATE INDEX idx_items_cotizacion ON items_cotizacion(cotizacion_id);
CREATE INDEX idx_proyectos_cliente ON proyectos(cliente_id);
CREATE INDEX idx_proyectos_estado ON proyectos(estado);
CREATE INDEX idx_planes_pago_proyecto ON planes_pago(proyecto_id);
CREATE INDEX idx_pagos_proyecto ON pagos(proyecto_id);
CREATE INDEX idx_desembolsos_proyecto ON desembolsos(proyecto_id);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_servicios_updated_at BEFORE UPDATE ON servicios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cotizaciones_updated_at BEFORE UPDATE ON cotizaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_proyectos_updated_at BEFORE UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_planes_pago_updated_at BEFORE UPDATE ON planes_pago
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_desembolsos_updated_at BEFORE UPDATE ON desembolsos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Función para incrementar veces cotizado
CREATE OR REPLACE FUNCTION incrementar_veces_cotizado(servicio_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE servicios 
  SET veces_cotizado = veces_cotizado + 1
  WHERE id = servicio_id;
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar veces vendido
CREATE OR REPLACE FUNCTION incrementar_veces_vendido(servicio_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE servicios 
  SET veces_vendido = veces_vendido + 1
  WHERE id = servicio_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATOS INICIALES DE CONFIGURACIÓN
-- =====================================================

-- Configuración de porcentajes
INSERT INTO configuracion (tipo, clave, valor, descripcion) VALUES
('porcentaje', 'contabilidad', 2, 'Porcentaje para contabilidad'),
('porcentaje', 'mercadeo', 5, 'Porcentaje para mercadeo'),
('porcentaje', 'ventas', 15, 'Porcentaje para ventas'),
('porcentaje', 'salarios', 10, 'Porcentaje para salarios'),
('porcentaje', 'compras', 2, 'Porcentaje para compras'),
('porcentaje', 'extras', 5, 'Porcentaje para gastos extras');

-- Configuración de costos fijos
INSERT INTO configuracion (tipo, clave, valor, descripcion) VALUES
('costo_fijo', 'arriendo', 1000000, 'Costo mensual de arriendo'),
('costo_fijo', 'energia', 200000, 'Costo mensual de energía'),
('costo_fijo', 'gas', 50000, 'Costo mensual de gas'),
('costo_fijo', 'aseo', 800000, 'Costo mensual de aseo'),
('costo_fijo', 'internet', 200000, 'Costo mensual de internet'),
('costo_fijo', 'agua', 200000, 'Costo mensual de agua'),
('costo_fijo', 'servidores', 110000, 'Costo mensual de servidores');

-- Configuración de herramientas
INSERT INTO configuracion (tipo, clave, valor, descripcion) VALUES
('herramienta', 'figma', 51600, 'Costo mensual de Figma'),
('herramienta', 'chatgpt', 86000, 'Costo mensual de ChatGPT'),
('herramienta', 'correos', 51600, 'Costo mensual de correos'),
('herramienta', 'servidor', 100000, 'Costo mensual de servidor'),
('herramienta', 'dominio', 120000, 'Costo anual de dominios');

-- Configuración general
INSERT INTO configuracion (tipo, clave, valor, descripcion) VALUES
('general', 'ventas_estimadas', 100, 'Número de ventas estimadas mensuales');

-- Configuración de empresa
INSERT INTO configuracion (tipo, clave, valor, valor_texto, descripcion) VALUES
('empresa', 'nombre', 0, 'Mi Empresa SAS', 'Nombre de la empresa'),
('empresa', 'nit', 0, '123456789-0', 'NIT de la empresa'),
('empresa', 'direccion', 0, 'Calle 123 #45-67', 'Dirección de la empresa'),
('empresa', 'telefono', 0, '+57 300 123 4567', 'Teléfono de la empresa'),
('empresa', 'email', 0, 'contacto@miempresa.com', 'Email de la empresa'),
('empresa', 'ciudad', 0, 'Bogotá, Colombia', 'Ciudad de la empresa');

-- Configuración de cotizaciones
INSERT INTO configuracion (tipo, clave, valor, valor_texto, descripcion) VALUES
('cotizaciones', 'validezDias', 30, NULL, 'Días de validez por defecto'),
('cotizaciones', 'ivaDefecto', 19, NULL, 'Porcentaje de IVA por defecto'),
('cotizaciones', 'terminosCondiciones', 0, '1. Validez de la cotización: 30 días a partir de la fecha de emisión.
2. Forma de pago: 50% anticipo, 50% contra entrega.
3. Los precios no incluyen IVA.
4. Cualquier trabajo adicional será cotizado por separado.
5. El tiempo de entrega está sujeto a la aprobación de la cotización.', 'Términos y condiciones por defecto'),
('cotizaciones', 'notaPie', 0, 'Gracias por confiar en nosotros', 'Nota al pie de las cotizaciones'),
('cotizaciones', 'mostrarLogo', 0, NULL, 'Mostrar logo en PDF (0=No, 1=Sí)'),
('cotizaciones', 'formatoNumero', 0, 'QUOTE-{YYYY}-{###}', 'Formato de numeración de cotizaciones');

-- Metas iniciales
INSERT INTO metas (tipo, valor, descripcion) VALUES
('ventas_mensuales', 5000000, 'Meta de ventas mensuales en pesos'),
('unidades_mensuales', 20, 'Meta de unidades vendidas mensuales'),
('margen_promedio', 40, 'Meta de margen de ganancia promedio (%)'),
('rotacion_inventario', 6, 'Meta de rotación de inventario (veces/año)');

-- Alertas iniciales
INSERT INTO alertas (tipo, valor, descripcion) VALUES
('margen_minimo', 25, 'Margen mínimo aceptable (%)'),
('stock_minimo', 5, 'Stock mínimo antes de alerta'),
('dias_sin_venta', 30, 'Días sin venta antes de alerta'),
('diferencia_precio_competencia', 15, 'Diferencia máxima con competencia (%)');

-- Categorías de desembolso iniciales
INSERT INTO categorias_desembolso (nombre, descripcion) VALUES
('Materiales', 'Compra de materiales y suministros'),
('Mano de Obra', 'Pagos a personal y contratistas'),
('Servicios', 'Servicios externos y subcontrataciones'),
('Transporte', 'Gastos de transporte y logística'),
('Equipos', 'Alquiler o compra de equipos'),
('Otros', 'Otros gastos del proyecto');

-- =====================================================
-- POLÍTICAS DE SEGURIDAD (Row Level Security)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_cotizacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes_pago ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_desembolso ENABLE ROW LEVEL SECURITY;
ALTER TABLE desembolsos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir todo a usuarios autenticados)
-- NOTA: Ajusta estas políticas según tus necesidades de seguridad

-- Clientes
CREATE POLICY "Usuarios autenticados pueden ver clientes" ON clientes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear clientes" ON clientes
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar clientes" ON clientes
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar clientes" ON clientes
  FOR DELETE TO authenticated USING (true);

-- Servicios
CREATE POLICY "Usuarios autenticados pueden ver servicios" ON servicios
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear servicios" ON servicios
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar servicios" ON servicios
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar servicios" ON servicios
  FOR DELETE TO authenticated USING (true);

-- Cotizaciones
CREATE POLICY "Usuarios autenticados pueden ver cotizaciones" ON cotizaciones
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear cotizaciones" ON cotizaciones
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar cotizaciones" ON cotizaciones
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar cotizaciones" ON cotizaciones
  FOR DELETE TO authenticated USING (true);

-- Items de cotización
CREATE POLICY "Usuarios autenticados pueden ver items" ON items_cotizacion
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear items" ON items_cotizacion
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar items" ON items_cotizacion
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar items" ON items_cotizacion
  FOR DELETE TO authenticated USING (true);

-- Proyectos
CREATE POLICY "Usuarios autenticados pueden ver proyectos" ON proyectos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear proyectos" ON proyectos
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar proyectos" ON proyectos
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar proyectos" ON proyectos
  FOR DELETE TO authenticated USING (true);

-- Planes de pago
CREATE POLICY "Usuarios autenticados pueden ver planes" ON planes_pago
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear planes" ON planes_pago
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar planes" ON planes_pago
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar planes" ON planes_pago
  FOR DELETE TO authenticated USING (true);

-- Pagos
CREATE POLICY "Usuarios autenticados pueden ver pagos" ON pagos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear pagos" ON pagos
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar pagos" ON pagos
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar pagos" ON pagos
  FOR DELETE TO authenticated USING (true);

-- Categorías de desembolso
CREATE POLICY "Usuarios autenticados pueden ver categorías" ON categorias_desembolso
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear categorías" ON categorias_desembolso
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar categorías" ON categorias_desembolso
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar categorías" ON categorias_desembolso
  FOR DELETE TO authenticated USING (true);

-- Desembolsos
CREATE POLICY "Usuarios autenticados pueden ver desembolsos" ON desembolsos
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear desembolsos" ON desembolsos
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar desembolsos" ON desembolsos
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar desembolsos" ON desembolsos
  FOR DELETE TO authenticated USING (true);

-- Configuración
CREATE POLICY "Usuarios autenticados pueden ver configuración" ON configuracion
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear configuración" ON configuracion
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar configuración" ON configuracion
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar configuración" ON configuracion
  FOR DELETE TO authenticated USING (true);

-- Metas
CREATE POLICY "Usuarios autenticados pueden ver metas" ON metas
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear metas" ON metas
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar metas" ON metas
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar metas" ON metas
  FOR DELETE TO authenticated USING (true);

-- Alertas
CREATE POLICY "Usuarios autenticados pueden ver alertas" ON alertas
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden crear alertas" ON alertas
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Usuarios autenticados pueden actualizar alertas" ON alertas
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Usuarios autenticados pueden eliminar alertas" ON alertas
  FOR DELETE TO authenticated USING (true);

-- =====================================================
-- SCRIPT COMPLETADO
-- =====================================================
-- Para ejecutar este script:
-- 1. Ve a tu panel de Supabase
-- 2. Ve a SQL Editor
-- 3. Copia y pega todo este contenido
-- 4. Ejecuta el script
-- =====================================================