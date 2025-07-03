-- =====================================================
-- DATOS DE EJEMPLO PARA SISTEMA DE SERVICIOS
-- =====================================================
-- Este script inserta datos de ejemplo para probar todas
-- las funcionalidades del sistema
-- EJECUTAR DESPUÉS del script principal SCRIPT_COMPLETO_SISTEMA_SERVICIOS.sql
-- =====================================================

-- =====================================================
-- CLIENTES DE EJEMPLO
-- =====================================================
INSERT INTO clientes (nombre, empresa, nit, email, telefono, direccion, ciudad, notas) VALUES 
('Juan Pérez', 'TechCorp SAS', '900123456-7', 'juan.perez@techcorp.com', '+57 300 123 4567', 'Calle 100 #15-20 Of. 301', 'Bogotá', 'Cliente corporativo importante, prefiere comunicación por email'),
('María García', 'Startup Innovation', '901234567-8', 'maria@startup.com', '+57 310 987 6543', 'Carrera 7 #80-45 Piso 5', 'Bogotá', 'Empresa de tecnología emergente, muy exigentes con los tiempos'),
('Carlos Rodríguez', 'Soluciones Web SAS', '902345678-9', 'carlos@solucionesweb.com', '+57 320 456 7890', 'Avenida 68 #25-30', 'Medellín', 'Requiere soluciones web personalizadas y soporte continuo'),
('Ana López', 'Marketing Digital Pro', '903456789-0', 'ana@marketingpro.com', '+57 315 789 1234', 'Calle 85 #12-15 Local 204', 'Cali', 'Especializada en marketing digital, busca servicios de desarrollo'),
('Pedro Martínez', 'Consultoría Empresarial XYZ', '904567890-1', 'pedro@consultoriaXYZ.com', '+57 318 234 5678', 'Carrera 15 #90-25', 'Bogotá', 'Consultoría estratégica, interesados en dashboards'),
('Laura Sánchez', 'E-commerce Solutions', '905678901-2', 'laura@ecommerce.co', '+57 322 345 6789', 'Calle 72 #10-34', 'Barranquilla', 'Necesita desarrollo de tienda online');

-- =====================================================
-- SERVICIOS DE EJEMPLO
-- =====================================================
INSERT INTO servicios (nombre, categoria, descripcion, costo_base, gastos_fijos, margen_deseado, precio_sugerido, duracion_estimada, tipo_servicio, precio_por_hora, recursos_necesarios, activo, veces_cotizado, veces_vendido) VALUES 
-- Desarrollo
('Desarrollo Web Corporativo', 'desarrollo', 'Sitio web corporativo con diseño responsive, CMS y optimización SEO', 2500000, 500000, 35, 4050000, 30, 'unico', 0, 'Desarrollador Frontend, Backend, Diseñador UI/UX', true, 15, 8),
('Aplicación Web Personalizada', 'desarrollo', 'Desarrollo de aplicación web a medida con panel de administración', 4000000, 800000, 40, 6720000, 45, 'unico', 0, 'Full Stack Developer, DevOps, QA Tester', true, 10, 5),
('API REST', 'desarrollo', 'Desarrollo de API REST con documentación completa', 1800000, 300000, 35, 2835000, 20, 'unico', 0, 'Backend Developer, Arquitecto de Software', true, 8, 6),

-- Diseño
('Diseño de Identidad Visual', 'diseño', 'Logo, manual de marca, papelería corporativa y aplicaciones', 800000, 200000, 40, 1400000, 15, 'unico', 0, 'Diseñador Gráfico Senior, Ilustrador', true, 20, 12),
('Diseño UI/UX', 'diseño', 'Diseño de interfaces y experiencia de usuario para aplicaciones', 1200000, 250000, 45, 2102500, 20, 'unico', 0, 'Diseñador UI/UX, Researcher', true, 12, 7),
('Rediseño de Sitio Web', 'diseño', 'Actualización completa del diseño visual de sitio existente', 1000000, 200000, 35, 1620000, 15, 'unico', 0, 'Diseñador Web, Frontend Developer', true, 9, 5),

-- Consultoría
('Consultoría SEO', 'consultoria', 'Auditoría SEO completa, estrategia y plan de optimización', 600000, 150000, 45, 1087500, 10, 'unico', 0, 'Especialista SEO, Analista de Datos', true, 25, 18),
('Consultoría de Transformación Digital', 'consultoria', 'Análisis y estrategia de transformación digital empresarial', 0, 0, 50, 0, 5, 'por_horas', 150000, 'Consultor Senior, Analista de Procesos', true, 6, 3),
('Auditoría de Seguridad Web', 'consultoria', 'Análisis de vulnerabilidades y plan de mejora de seguridad', 800000, 200000, 40, 1400000, 7, 'unico', 0, 'Experto en Ciberseguridad', true, 4, 2),

-- Soporte
('Soporte Técnico Mensual', 'soporte', 'Soporte técnico y mantenimiento mensual de sistemas', 300000, 100000, 30, 520000, 30, 'recurrente', 0, 'Técnico de Soporte, Administrador de Sistemas', true, 15, 10),
('Mantenimiento Web Premium', 'soporte', 'Mantenimiento, actualizaciones y mejoras continuas', 500000, 150000, 35, 877500, 30, 'recurrente', 0, 'Desarrollador, Administrador de Sistemas', true, 8, 6),
('Soporte de Emergencia', 'soporte', 'Soporte técnico de emergencia 24/7', 0, 0, 60, 0, 1, 'por_horas', 200000, 'Equipo de Soporte Senior', true, 5, 4),

-- Capacitación
('Capacitación en Marketing Digital', 'capacitacion', 'Workshop intensivo de 2 días sobre marketing digital', 400000, 100000, 50, 750000, 2, 'unico', 0, 'Instructor Certificado, Material Didáctico', true, 12, 8),
('Curso de Desarrollo Web', 'capacitacion', 'Curso completo de desarrollo web (40 horas)', 800000, 200000, 45, 1450000, 10, 'unico', 0, 'Instructor Senior, Laboratorio', true, 6, 4),
('Taller de UX/UI', 'capacitacion', 'Taller práctico de diseño de interfaces (16 horas)', 500000, 100000, 40, 840000, 4, 'unico', 0, 'Diseñador UX Senior, Herramientas', true, 8, 5),

-- Marketing
('Gestión de Redes Sociales', 'marketing', 'Manejo completo de redes sociales por mes', 500000, 150000, 35, 877500, 30, 'recurrente', 0, 'Community Manager, Diseñador, Copywriter', true, 18, 12),
('Campaña de Email Marketing', 'marketing', 'Diseño y ejecución de campaña de email marketing', 300000, 80000, 40, 532000, 7, 'unico', 0, 'Especialista en Email Marketing', true, 10, 7),
('Estrategia de Content Marketing', 'marketing', 'Plan estratégico de contenidos para 3 meses', 600000, 150000, 45, 1087500, 15, 'unico', 0, 'Content Strategist, Redactor', true, 7, 4);

-- =====================================================
-- COTIZACIONES DE EJEMPLO (diferentes estados)
-- =====================================================

-- Cotización 1: ENVIADA (lista para aprobar)
INSERT INTO cotizaciones (numero, cliente_id, fecha, fecha_validez, estado, subtotal, descuento_porcentaje, descuento_valor, iva, total, notas, terminos_condiciones) VALUES 
('QUOTE-2024-001', 
 (SELECT id FROM clientes WHERE nombre = 'Juan Pérez'), 
 CURRENT_DATE - INTERVAL '5 days', 
 CURRENT_DATE + INTERVAL '25 days', 
 'enviada', 
 4050000, 
 0, 
 0, 
 769500, 
 4819500, 
 'Propuesta para desarrollo de sitio web corporativo con todas las funcionalidades solicitadas. Incluye 3 meses de soporte post-lanzamiento.',
 '1. Validez de la cotización: 30 días a partir de la fecha de emisión.
2. Forma de pago: 50% anticipo, 50% contra entrega.
3. Los precios no incluyen IVA.
4. Incluye 3 revisiones del diseño.
5. El tiempo de entrega está sujeto a la aprobación de la cotización.
6. Hosting y dominio no incluidos.');

-- Items para cotización 1
INSERT INTO items_cotizacion (cotizacion_id, servicio_id, descripcion, cantidad, precio_unitario, descuento_porcentaje, subtotal, notas, orden) VALUES 
((SELECT id FROM cotizaciones WHERE numero = 'QUOTE-2024-001'), 
 (SELECT id FROM servicios WHERE nombre = 'Desarrollo Web Corporativo'), 
 'Sitio web corporativo con 5 secciones principales, blog integrado y panel de administración', 
 1, 
 4050000, 
 0, 
 4050000, 
 'Incluye diseño responsive y optimización SEO básica', 
 1);

-- Cotización 2: APROBADA (convertida a proyecto)
INSERT INTO cotizaciones (numero, cliente_id, fecha, fecha_validez, estado, subtotal, descuento_porcentaje, descuento_valor, iva, total, notas, terminos_condiciones, fecha_aprobacion) VALUES 
('QUOTE-2024-002', 
 (SELECT id FROM clientes WHERE nombre = 'María García'), 
 CURRENT_DATE - INTERVAL '20 days', 
 CURRENT_DATE - INTERVAL '5 days', 
 'aprobada', 
 2275000, 
 5, 
 113750, 
 410737.5, 
 2572487.5, 
 'Paquete completo de diseño de marca + consultoría SEO. Descuento especial por paquete completo.',
 DEFAULT,
 CURRENT_DATE - INTERVAL '10 days');

-- Items para cotización 2
INSERT INTO items_cotizacion (cotizacion_id, servicio_id, descripcion, cantidad, precio_unitario, descuento_porcentaje, subtotal, notas, orden) VALUES 
((SELECT id FROM cotizaciones WHERE numero = 'QUOTE-2024-002'), 
 (SELECT id FROM servicios WHERE nombre = 'Diseño de Identidad Visual'), 
 'Logo y manual de marca completo', 
 1, 
 1400000, 
 0, 
 1400000, 
 'Incluye 3 propuestas de logo y aplicaciones básicas', 
 1),
((SELECT id FROM cotizaciones WHERE numero = 'QUOTE-2024-002'), 
 (SELECT id FROM servicios WHERE nombre = 'Consultoría SEO'), 
 'Auditoría SEO y plan de optimización para 6 meses', 
 1, 
 1087500, 
 10, 
 978750, 
 'Descuento del 10% por paquete', 
 2);

-- Cotización 3: BORRADOR (para probar eliminación)
INSERT INTO cotizaciones (numero, cliente_id, fecha, fecha_validez, estado, subtotal, descuento_porcentaje, descuento_valor, iva, total, notas) VALUES 
('QUOTE-2024-003', 
 (SELECT id FROM clientes WHERE nombre = 'Carlos Rodríguez'), 
 CURRENT_DATE, 
 CURRENT_DATE + INTERVAL '30 days', 
 'borrador', 
 877500, 
 10, 
 87750, 
 150075, 
 939825, 
 'Cotización en proceso de elaboración. Pendiente definir alcance completo.');

-- Items para cotización 3
INSERT INTO items_cotizacion (cotizacion_id, servicio_id, descripcion, cantidad, precio_unitario, descuento_porcentaje, subtotal, orden) VALUES 
((SELECT id FROM cotizaciones WHERE numero = 'QUOTE-2024-003'), 
 (SELECT id FROM servicios WHERE nombre = 'Gestión de Redes Sociales'), 
 'Gestión de Facebook, Instagram y LinkedIn por 3 meses', 
 3, 
 877500, 
 0, 
 2632500, 
 1);

-- Cotización 4: RECHAZADA
INSERT INTO cotizaciones (numero, cliente_id, fecha, fecha_validez, estado, subtotal, descuento_porcentaje, descuento_valor, iva, total, notas, fecha_rechazo, motivo_rechazo) VALUES 
('QUOTE-2024-004', 
 (SELECT id FROM clientes WHERE nombre = 'Ana López'), 
 CURRENT_DATE - INTERVAL '35 days', 
 CURRENT_DATE - INTERVAL '5 days', 
 'rechazada', 
 750000, 
 0, 
 0, 
 142500, 
 892500, 
 'Capacitación solicitada para equipo de 8 personas',
 CURRENT_DATE - INTERVAL '7 days',
 'Presupuesto excede el límite aprobado por la empresa');

-- Items para cotización 4
INSERT INTO items_cotizacion (cotizacion_id, servicio_id, descripcion, cantidad, precio_unitario, descuento_porcentaje, subtotal, orden) VALUES 
((SELECT id FROM cotizaciones WHERE numero = 'QUOTE-2024-004'), 
 (SELECT id FROM servicios WHERE nombre = 'Capacitación en Marketing Digital'), 
 'Workshop para equipo de marketing (8 personas)', 
 1, 
 750000, 
 0, 
 750000, 
 1);

-- Cotización 5: ENVIADA (próxima a vencer)
INSERT INTO cotizaciones (numero, cliente_id, fecha, fecha_validez, estado, subtotal, descuento_porcentaje, descuento_valor, iva, total, notas) VALUES 
('QUOTE-2024-005', 
 (SELECT id FROM clientes WHERE nombre = 'Pedro Martínez'), 
 CURRENT_DATE - INTERVAL '25 days', 
 CURRENT_DATE + INTERVAL '5 days', 
 'enviada', 
 6720000, 
 0, 
 0, 
 1276800, 
 7996800, 
 'Desarrollo de dashboard personalizado con visualización de datos en tiempo real');

-- Items para cotización 5
INSERT INTO items_cotizacion (cotizacion_id, servicio_id, descripcion, cantidad, precio_unitario, descuento_porcentaje, subtotal, orden) VALUES 
((SELECT id FROM cotizaciones WHERE numero = 'QUOTE-2024-005'), 
 (SELECT id FROM servicios WHERE nombre = 'Aplicación Web Personalizada'), 
 'Dashboard con integración de múltiples fuentes de datos', 
 1, 
 6720000, 
 0, 
 6720000, 
 1);

-- Cotización 6: BORRADOR (múltiples servicios)
INSERT INTO cotizaciones (numero, cliente_id, fecha, fecha_validez, estado, subtotal, descuento_porcentaje, descuento_valor, iva, total, notas) VALUES 
('QUOTE-2024-006', 
 (SELECT id FROM clientes WHERE nombre = 'Laura Sánchez'), 
 CURRENT_DATE, 
 CURRENT_DATE + INTERVAL '30 days', 
 'borrador', 
 7452000, 
 15, 
 1117800, 
 1195524, 
 7529724, 
 'Proyecto completo de e-commerce con diseño, desarrollo y marketing digital');

-- Items para cotización 6
INSERT INTO items_cotizacion (cotizacion_id, servicio_id, descripcion, cantidad, precio_unitario, descuento_porcentaje, subtotal, notas, orden) VALUES 
((SELECT id FROM cotizaciones WHERE numero = 'QUOTE-2024-006'), 
 (SELECT id FROM servicios WHERE nombre = 'Aplicación Web Personalizada'), 
 'Tienda online con carrito de compras y pasarela de pagos', 
 1, 
 6720000, 
 10, 
 6048000, 
 'Incluye integración con pasarelas de pago locales', 
 1),
((SELECT id FROM cotizaciones WHERE numero = 'QUOTE-2024-006'), 
 (SELECT id FROM servicios WHERE nombre = 'Diseño UI/UX'), 
 'Diseño completo de la experiencia de compra', 
 1, 
 2102500, 
 20, 
 1682000, 
 'Descuento especial por proyecto completo', 
 2),
((SELECT id FROM cotizaciones WHERE numero = 'QUOTE-2024-006'), 
 (SELECT id FROM servicios WHERE nombre = 'Gestión de Redes Sociales'), 
 'Lanzamiento en redes sociales (primer mes)', 
 1, 
 877500, 
 15, 
 745875, 
 'Incluye campaña de lanzamiento', 
 3);

-- =====================================================
-- PROYECTO DE EJEMPLO (desde cotización aprobada)
-- =====================================================
INSERT INTO proyectos (nombre, descripcion, cliente_id, cotizacion_id, fecha_inicio, fecha_fin_estimada, estado, valor_total, costo_estimado, costo_real, rentabilidad_estimada, progreso, notas) VALUES 
('Identidad Visual + SEO - Startup Innovation', 
 'Desarrollo completo de identidad visual corporativa y estrategia SEO para Startup Innovation', 
 (SELECT id FROM clientes WHERE nombre = 'María García'), 
 (SELECT id FROM cotizaciones WHERE numero = 'QUOTE-2024-002'), 
 CURRENT_DATE - INTERVAL '10 days', 
 CURRENT_DATE + INTERVAL '20 days', 
 'activo', 
 2572487.5, 
 1800000, 
 850000, 
 772487.5, 
 35, 
 'Proyecto en desarrollo. Logo aprobado, manual de marca en proceso. SEO: auditoría completada.');

-- =====================================================
-- PLANES DE PAGO PARA EL PROYECTO
-- =====================================================
INSERT INTO planes_pago (proyecto_id, numero_cuota, tipo, descripcion, monto, fecha_vencimiento, estado, porcentaje_proyecto) VALUES 
-- Plan 50-50
((SELECT id FROM proyectos WHERE nombre LIKE 'Identidad Visual + SEO%'), 
 1, 
 'anticipo', 
 'Anticipo del 50% para iniciar el proyecto', 
 1286243.75, 
 CURRENT_DATE - INTERVAL '10 days', 
 'pagado', 
 50),
((SELECT id FROM proyectos WHERE nombre LIKE 'Identidad Visual + SEO%'), 
 2, 
 'final', 
 'Pago final del 50% contra entrega', 
 1286243.75, 
 CURRENT_DATE + INTERVAL '20 days', 
 'pendiente', 
 50);

-- =====================================================
-- PAGOS REGISTRADOS
-- =====================================================
INSERT INTO pagos (proyecto_id, plan_pago_id, fecha, monto, metodo_pago, numero_referencia, notas) VALUES 
((SELECT id FROM proyectos WHERE nombre LIKE 'Identidad Visual + SEO%'),
 (SELECT id FROM planes_pago WHERE proyecto_id = (SELECT id FROM proyectos WHERE nombre LIKE 'Identidad Visual + SEO%') AND numero_cuota = 1),
 CURRENT_DATE - INTERVAL '9 days',
 1286243.75,
 'Transferencia Bancaria',
 'REF-2024-001',
 'Pago recibido y confirmado. Cliente solicita factura.');

-- =====================================================
-- DESEMBOLSOS DEL PROYECTO
-- =====================================================
INSERT INTO desembolsos (proyecto_id, categoria_id, fecha, descripcion, monto, proveedor, numero_documento, estado, aprobado_por, notas) VALUES 
((SELECT id FROM proyectos WHERE nombre LIKE 'Identidad Visual + SEO%'),
 (SELECT id FROM categorias_desembolso WHERE nombre = 'Materiales'),
 CURRENT_DATE - INTERVAL '8 days',
 'Licencia de fuentes tipográficas premium',
 150000,
 'MyFonts.com',
 'INV-MF-2024-123',
 'pagado',
 'Admin',
 'Fuentes para el manual de marca'),
 
((SELECT id FROM proyectos WHERE nombre LIKE 'Identidad Visual + SEO%'),
 (SELECT id FROM categorias_desembolso WHERE nombre = 'Servicios'),
 CURRENT_DATE - INTERVAL '5 days',
 'Fotografía profesional para marca',
 500000,
 'Studio Photo Pro',
 'FAC-SPP-2024-456',
 'pagado',
 'Admin',
 'Sesión fotográfica para aplicaciones de marca'),
 
((SELECT id FROM proyectos WHERE nombre LIKE 'Identidad Visual + SEO%'),
 (SELECT id FROM categorias_desembolso WHERE nombre = 'Mano de Obra'),
 CURRENT_DATE - INTERVAL '3 days',
 'Freelancer especialista SEO',
 200000,
 'Carlos SEO Expert',
 'RH-001',
 'pendiente',
 NULL,
 'Apoyo en auditoría técnica SEO');

-- =====================================================
-- OTRO PROYECTO ACTIVO (sin cotización previa)
-- =====================================================
INSERT INTO proyectos (nombre, descripcion, cliente_id, fecha_inicio, fecha_fin_estimada, estado, valor_total, costo_estimado, progreso, notas) VALUES 
('Mantenimiento Web - TechCorp', 
 'Servicio de mantenimiento mensual y soporte técnico continuo', 
 (SELECT id FROM clientes WHERE nombre = 'Juan Pérez'), 
 CURRENT_DATE - INTERVAL '60 days', 
 CURRENT_DATE + INTERVAL '30 days', 
 'activo', 
 520000, 
 400000, 
 80, 
 'Contrato de mantenimiento mensual renovable. Cliente satisfecho con el servicio.');

-- Planes de pago mensuales
INSERT INTO planes_pago (proyecto_id, numero_cuota, tipo, descripcion, monto, fecha_vencimiento, estado, porcentaje_proyecto) VALUES 
((SELECT id FROM proyectos WHERE nombre = 'Mantenimiento Web - TechCorp'), 
 1, 
 'cuota', 
 'Mensualidad - Mes 1', 
 520000, 
 CURRENT_DATE - INTERVAL '60 days', 
 'pagado', 
 33.33),
((SELECT id FROM proyectos WHERE nombre = 'Mantenimiento Web - TechCorp'), 
 2, 
 'cuota', 
 'Mensualidad - Mes 2', 
 520000, 
 CURRENT_DATE - INTERVAL '30 days', 
 'pagado', 
 33.33),
((SELECT id FROM proyectos WHERE nombre = 'Mantenimiento Web - TechCorp'), 
 3, 
 'cuota', 
 'Mensualidad - Mes 3', 
 520000, 
 CURRENT_DATE, 
 'pendiente', 
 33.34);

-- Pagos del mantenimiento
INSERT INTO pagos (proyecto_id, plan_pago_id, fecha, monto, metodo_pago, numero_referencia) VALUES 
((SELECT id FROM proyectos WHERE nombre = 'Mantenimiento Web - TechCorp'),
 (SELECT id FROM planes_pago WHERE proyecto_id = (SELECT id FROM proyectos WHERE nombre = 'Mantenimiento Web - TechCorp') AND numero_cuota = 1),
 CURRENT_DATE - INTERVAL '60 days',
 520000,
 'Transferencia Bancaria',
 'REF-MANT-001'),
 
((SELECT id FROM proyectos WHERE nombre = 'Mantenimiento Web - TechCorp'),
 (SELECT id FROM planes_pago WHERE proyecto_id = (SELECT id FROM proyectos WHERE nombre = 'Mantenimiento Web - TechCorp') AND numero_cuota = 2),
 CURRENT_DATE - INTERVAL '30 days',
 520000,
 'Transferencia Bancaria',
 'REF-MANT-002');

-- =====================================================
-- PROYECTO COMPLETADO
-- =====================================================
INSERT INTO proyectos (nombre, descripcion, cliente_id, fecha_inicio, fecha_fin_estimada, fecha_fin_real, estado, valor_total, costo_estimado, costo_real, rentabilidad_real, progreso, notas) VALUES 
('Rediseño Web - Consultoría XYZ', 
 'Rediseño completo del sitio web corporativo con nueva imagen', 
 (SELECT id FROM clientes WHERE nombre = 'Pedro Martínez'), 
 CURRENT_DATE - INTERVAL '90 days', 
 CURRENT_DATE - INTERVAL '60 days', 
 CURRENT_DATE - INTERVAL '65 days', 
 'completado', 
 1620000, 
 1200000, 
 1150000, 
 470000, 
 100, 
 'Proyecto completado exitosamente. Cliente muy satisfecho. Entregado 5 días antes de lo previsto.');

-- =====================================================
-- COTIZACIONES ADICIONALES PARA DASHBOARD
-- =====================================================

-- Más cotizaciones en diferentes estados para métricas
INSERT INTO cotizaciones (numero, cliente_id, fecha, fecha_validez, estado, subtotal, descuento_porcentaje, descuento_valor, iva, total, notas) VALUES 
('QUOTE-2024-007', (SELECT id FROM clientes WHERE nombre = 'Carlos Rodríguez'), CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', 'enviada', 2835000, 0, 0, 538650, 3373650, 'Desarrollo de API REST para integración'),
('QUOTE-2024-008', (SELECT id FROM clientes WHERE nombre = 'Ana López'), CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE + INTERVAL '22 days', 'enviada', 840000, 5, 42000, 151620, 949620, 'Taller de UX/UI para equipo de diseño'),
('QUOTE-2024-009', (SELECT id FROM clientes WHERE nombre = 'Laura Sánchez'), CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '10 days', 'aprobada', 532000, 0, 0, 101080, 633080, 'Campaña de email marketing');

-- Items para estas cotizaciones
INSERT INTO items_cotizacion (cotizacion_id, servicio_id, descripcion, cantidad, precio_unitario, descuento_porcentaje, subtotal, orden) VALUES 
((SELECT id FROM cotizaciones WHERE numero = 'QUOTE-2024-007'), (SELECT id FROM servicios WHERE nombre = 'API REST'), 'API con documentación Swagger', 1, 2835000, 0, 2835000, 1),
((SELECT id FROM cotizaciones WHERE numero = 'QUOTE-2024-008'), (SELECT id FROM servicios WHERE nombre = 'Taller de UX/UI'), 'Taller para 6 personas', 1, 840000, 0, 840000, 1),
((SELECT id FROM cotizaciones WHERE numero = 'QUOTE-2024-009'), (SELECT id FROM servicios WHERE nombre = 'Campaña de Email Marketing'), 'Campaña para base de 5000 contactos', 1, 532000, 0, 532000, 1);

-- =====================================================
-- ACTUALIZAR CONTADORES DE SERVICIOS
-- =====================================================
-- Actualizar veces_cotizado basado en los items creados
UPDATE servicios s
SET veces_cotizado = (
  SELECT COUNT(DISTINCT ic.cotizacion_id)
  FROM items_cotizacion ic
  WHERE ic.servicio_id = s.id
);

-- Actualizar veces_vendido basado en cotizaciones aprobadas
UPDATE servicios s
SET veces_vendido = (
  SELECT COUNT(DISTINCT ic.cotizacion_id)
  FROM items_cotizacion ic
  JOIN cotizaciones c ON ic.cotizacion_id = c.id
  WHERE ic.servicio_id = s.id
  AND c.estado = 'aprobada'
);

-- =====================================================
-- MENSAJE FINAL
-- =====================================================
-- Los datos de ejemplo han sido insertados exitosamente.
-- 
-- Resumen de datos creados:
-- - 6 Clientes
-- - 18 Servicios (3 de cada categoría)
-- - 9 Cotizaciones en diferentes estados:
--   * 3 Enviadas (para probar aprobación)
--   * 2 Aprobadas (ya convertidas en proyectos)
--   * 2 Borradores (para probar eliminación)
--   * 1 Rechazada
-- - 3 Proyectos (1 desde cotización, 1 de mantenimiento, 1 completado)
-- - Planes de pago configurados
-- - Pagos registrados
-- - Desembolsos de ejemplo
-- 
-- Puedes usar estos datos para probar todas las funcionalidades del sistema.
-- =====================================================