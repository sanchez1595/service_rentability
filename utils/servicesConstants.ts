import { 
  ServicioActual, 
  CotizacionActual, 
  CategoriaServicio,
  ItemCotizacionActual 
} from '../types/services';

// Categorías de servicios
export const CATEGORIAS_SERVICIO: { value: CategoriaServicio; label: string; color: string }[] = [
  { value: 'desarrollo', label: 'Desarrollo', color: 'blue' },
  { value: 'diseño', label: 'Diseño', color: 'purple' },
  { value: 'consultoria', label: 'Consultoría', color: 'green' },
  { value: 'soporte', label: 'Soporte', color: 'orange' },
  { value: 'capacitacion', label: 'Capacitación', color: 'pink' },
  { value: 'marketing', label: 'Marketing', color: 'red' },
  { value: 'otros', label: 'Otros', color: 'gray' }
];

// Tipos de servicio
export const TIPOS_SERVICIO = [
  { value: 'unico', label: 'Único' },
  { value: 'recurrente', label: 'Recurrente' },
  { value: 'por_horas', label: 'Por horas' }
];

// Estados de cotización
export const ESTADOS_COTIZACION = [
  { value: 'borrador', label: 'Borrador', color: 'gray' },
  { value: 'enviada', label: 'Enviada', color: 'blue' },
  { value: 'aprobada', label: 'Aprobada', color: 'green' },
  { value: 'rechazada', label: 'Rechazada', color: 'red' },
  { value: 'vencida', label: 'Vencida', color: 'orange' }
];

// Estados de proyecto
export const ESTADOS_PROYECTO = [
  { value: 'activo', label: 'Activo', color: 'green' },
  { value: 'pausado', label: 'Pausado', color: 'yellow' },
  { value: 'completado', label: 'Completado', color: 'blue' },
  { value: 'cancelado', label: 'Cancelado', color: 'red' }
];

// Estados de plan de pago
export const ESTADOS_PLAN_PAGO = [
  { value: 'pendiente', label: 'Pendiente', color: 'gray' },
  { value: 'pagado', label: 'Pagado', color: 'green' },
  { value: 'vencido', label: 'Vencido', color: 'red' },
  { value: 'parcial', label: 'Parcial', color: 'yellow' }
];

// Tipos de plan de pago
export const TIPOS_PLAN_PAGO = [
  { value: 'anticipo', label: 'Anticipo' },
  { value: 'cuota', label: 'Cuota' },
  { value: 'final', label: 'Pago final' },
  { value: 'hito', label: 'Por hito' }
];

// Métodos de pago
export const METODOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'tarjeta', label: 'Tarjeta' }
];

// Estados de desembolso
export const ESTADOS_DESEMBOLSO = [
  { value: 'pendiente', label: 'Pendiente', color: 'gray' },
  { value: 'pagado', label: 'Pagado', color: 'green' },
  { value: 'aprobado', label: 'Aprobado', color: 'blue' }
];

// Valores iniciales
export const SERVICIO_INICIAL: ServicioActual = {
  nombre: '',
  categoria: 'desarrollo',
  descripcion: '',
  costoBase: '',
  gastosFijos: '',
  margenDeseado: '35',
  precioSugerido: '',
  duracionEstimada: '1',
  tipoServicio: 'unico',
  precioPorHora: '',
  recursosNecesarios: '',
  activo: true
};

export const ITEM_COTIZACION_INICIAL: ItemCotizacionActual = {
  servicioId: '',
  descripcion: '',
  cantidad: '1',
  precioUnitario: '',
  descuentoPorcentaje: '0',
  notas: ''
};

export const COTIZACION_INICIAL: CotizacionActual = {
  clienteId: '',
  fecha: new Date().toISOString().split('T')[0],
  fechaValidez: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días
  estado: 'borrador',
  descuentoPorcentaje: '0',
  notas: '',
  terminosCondiciones: `1. Validez de la cotización: 30 días a partir de la fecha de emisión.
2. Forma de pago: 50% anticipo, 50% contra entrega.
3. Los precios no incluyen IVA.
4. Cualquier trabajo adicional será cotizado por separado.
5. El tiempo de entrega está sujeto a la aprobación de la cotización.`,
  items: []
};

// Términos y condiciones por defecto
export const TERMINOS_CONDICIONES_DEFAULT = `1. Validez de la cotización: 30 días a partir de la fecha de emisión.
2. Forma de pago: 50% anticipo, 50% contra entrega.
3. Los precios no incluyen IVA.
4. Cualquier trabajo adicional será cotizado por separado.
5. El tiempo de entrega está sujeto a la aprobación de la cotización.
6. Los precios están sujetos a cambios sin previo aviso.
7. Una vez iniciado el proyecto, no se realizan devoluciones del anticipo.
8. El cliente debe proporcionar toda la información necesaria para la ejecución del proyecto.
9. Los tiempos de entrega pueden variar según la complejidad del proyecto.
10. Garantizamos la calidad de nuestro trabajo según los estándares acordados.`;

// Plantillas de planes de pago
export const PLANTILLAS_PLANES_PAGO = [
  {
    nombre: '50% - 50%',
    descripcion: 'Anticipo del 50% y pago final del 50%',
    planes: [
      { tipo: 'anticipo', porcentaje: 50, descripcion: 'Anticipo del 50%' },
      { tipo: 'final', porcentaje: 50, descripcion: 'Pago final del 50%' }
    ]
  },
  {
    nombre: '40% - 40% - 20%',
    descripcion: 'Anticipo, avance y pago final',
    planes: [
      { tipo: 'anticipo', porcentaje: 40, descripcion: 'Anticipo del 40%' },
      { tipo: 'cuota', porcentaje: 40, descripcion: 'Pago de avance del 40%' },
      { tipo: 'final', porcentaje: 20, descripcion: 'Pago final del 20%' }
    ]
  },
  {
    nombre: 'Mensual',
    descripcion: 'Pagos mensuales iguales',
    planes: [] // Se generan dinámicamente según la duración
  },
  {
    nombre: 'Por hitos',
    descripcion: 'Pagos por cumplimiento de hitos',
    planes: [] // Se definen manualmente
  }
];

// Calcular precio sugerido para servicios
export const calcularPrecioServicio = (
  costoBase: number,
  gastosFijos: number,
  margenDeseado: number,
  configuracion: any
): number => {
  const costoTotal = costoBase + gastosFijos;
  
  // Aplicar porcentajes operativos
  const porcentajesOperativos = Object.values(configuracion.porcentajes)
    .reduce((sum: number, val: any) => sum + (parseFloat(val.toString()) || 0), 0);
  
  const costoConOperativos = costoTotal * (1 + porcentajesOperativos / 100);
  
  // Aplicar margen deseado
  const precioFinal = costoConOperativos * (1 + margenDeseado / 100);
  
  return Math.round(precioFinal);
};

// Formatos de número para servicios
export const formatearDuracion = (dias: number | string): string => {
  const diasNum = typeof dias === 'string' ? parseInt(dias) || 0 : dias || 0;
  
  if (diasNum === 0) return 'Inmediato';
  if (diasNum === 1) return '1 día';
  if (diasNum < 7) return `${diasNum} días`;
  if (diasNum === 7) return '1 semana';
  if (diasNum < 30) return `${Math.ceil(diasNum / 7)} semanas`;
  if (diasNum === 30) return '1 mes';
  if (diasNum < 365) return `${Math.ceil(diasNum / 30)} meses`;
  return `${Math.ceil(diasNum / 365)} año${diasNum >= 730 ? 's' : ''}`;
};

// Colores para métricas
export const COLORES_METRICAS = {
  ingresos: 'emerald',
  gastos: 'red',
  utilidad: 'blue',
  cotizaciones: 'purple',
  proyectos: 'orange',
  pagos: 'green'
};

// IVA por defecto (Colombia)
export const IVA_PORCENTAJE = 19;