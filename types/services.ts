// Tipos para el sistema de servicios y cotizaciones

export interface Cliente {
  id: string;
  nombre: string;
  empresa?: string;
  nit?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  notas?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  categoria: string;
  descripcion?: string;
  costoBase: string;
  gastosFijos: string;
  margenDeseado: string;
  precioSugerido: string;
  duracionEstimada: number;
  tipoServicio: 'unico' | 'recurrente' | 'por_horas';
  precioPorHora?: string;
  recursosNecesarios?: string;
  activo: boolean;
  vecesCotizado: number;
  vecesVendido: number;
  created_at?: string;
  updated_at?: string;
}

export interface Cotizacion {
  id: string;
  numero: string;
  clienteId: string;
  clienteNombre?: string; // Para joins
  fecha: string;
  fechaValidez: string;
  estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida';
  subtotal: number;
  descuentoPorcentaje: number;
  descuentoValor: number;
  iva: number;
  total: number;
  notas?: string;
  terminosCondiciones?: string;
  fechaAprobacion?: string;
  fechaRechazo?: string;
  motivoRechazo?: string;
  items?: ItemCotizacion[];
  created_at?: string;
  updated_at?: string;
}

export interface ItemCotizacion {
  id: string;
  cotizacionId: string;
  servicioId: string;
  servicioNombre?: string; // Para joins
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuentoPorcentaje: number;
  subtotal: number;
  notas?: string;
  orden: number;
  created_at?: string;
}

export interface Proyecto {
  id: string;
  cotizacionId: string;
  clienteId: string;
  clienteNombre?: string; // Para joins
  nombre: string;
  fechaInicio: string;
  fechaFinEstimada: string;
  fechaFinReal?: string;
  estado: 'activo' | 'pausado' | 'completado' | 'cancelado';
  progreso: number;
  valorTotal: number;
  costoEstimado: number;
  costoReal: number;
  rentabilidadEstimada: number;
  rentabilidadReal: number;
  notas?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PlanPago {
  id: string;
  proyectoId: string;
  numeroCuota: number;
  descripcion: string;
  fechaVencimiento: string;
  monto: number;
  tipo: 'anticipo' | 'cuota' | 'final' | 'hito';
  porcentajeProyecto?: number;
  estado: 'pendiente' | 'pagado' | 'vencido' | 'parcial';
  montoPagado?: number; // Para calcular pagos parciales
  created_at?: string;
  updated_at?: string;
}

export interface Pago {
  id: string;
  proyectoId: string;
  planPagoId?: string;
  fecha: string;
  monto: number;
  metodoPago: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta';
  numeroReferencia?: string;
  notas?: string;
  created_at?: string;
}

export interface CategoriaDesembolso {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: 'fijo' | 'variable';
  created_at?: string;
}

export interface Desembolso {
  id: string;
  proyectoId?: string;
  categoriaId: string;
  categoriaNombre?: string; // Para joins
  fecha: string;
  descripcion: string;
  monto: number;
  proveedor?: string;
  numeroFactura?: string;
  metodoPago: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta';
  estado: 'pendiente' | 'pagado' | 'aprobado';
  aprobadoPor?: string;
  notas?: string;
  created_at?: string;
}

// Tipos para formularios
export interface ServicioActual {
  nombre: string;
  categoria: string;
  descripcion: string;
  costoBase: string;
  gastosFijos: string;
  margenDeseado: string;
  precioSugerido: string;
  duracionEstimada: string;
  tipoServicio: 'unico' | 'recurrente' | 'por_horas';
  precioPorHora: string;
  recursosNecesarios: string;
  activo: boolean;
}

export interface CotizacionActual {
  clienteId: string;
  fecha: string;
  fechaValidez: string;
  estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida';
  descuentoPorcentaje: string;
  notas: string;
  terminosCondiciones: string;
  items: ItemCotizacionActual[];
}

export interface ItemCotizacionActual {
  servicioId: string;
  descripcion: string;
  cantidad: string;
  precioUnitario: string;
  descuentoPorcentaje: string;
  notas: string;
}

// Tipos de categorías
export type CategoriaServicio = 'desarrollo' | 'diseño' | 'consultoria' | 'soporte' | 'capacitacion' | 'marketing' | 'otros';

// Tipos de vistas
export type VistaServicio = 'dashboard' | 'servicios' | 'cotizaciones' | 'proyectos' | 'clientes' | 'pagos' | 'desembolsos' | 'reportes' | 'configuracion';

// Tipos para métricas
export interface MetricasServicio {
  cotizacionesEnviadas: number;
  cotizacionesAprobadas: number;
  tasaConversion: number;
  ingresosMes: number;
  gastosMes: number;
  utilidadMes: number;
  proyectosActivos: number;
  pagosVencidos: number;
  flujoEfectivo: number;
}

export interface ResumenProyecto {
  proyecto: Proyecto;
  pagosRecibidos: number;
  pagosPendientes: number;
  desembolsosRealizados: number;
  rentabilidadActual: number;
  diasRestantes: number;
  alertas: string[];
}