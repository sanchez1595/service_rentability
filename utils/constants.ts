import { Categoria, Configuracion, Metas, Alertas } from '../types';

export const CATEGORIAS: Categoria[] = [
  'alimentacion',
  'pañales',
  'ropa',
  'juguetes',
  'higiene',
  'accesorios',
  'mobiliario',
  'otros'
];

export const CONFIGURACION_INICIAL: Configuracion = {
  porcentajes: {
    contabilidad: 2,
    mercadeo: 5,
    ventas: 15,
    salarios: 10,
    compras: 2,
    extras: 5
  },
  costosFijos: {
    arriendo: 1000000,
    energia: 200000,
    gas: 50000,
    aseo: 800000,
    internet: 200000,
    agua: 200000,
    servidores: 110000
  },
  herramientas: {
    figma: 51600,
    chatgpt: 86000,
    correos: 51600,
    servidor: 100000,
    dominio: 120000
  },
  ventasEstimadas: 100
};

export const METAS_INICIALES: Metas = {
  ventasMensuales: 2000000,
  unidadesMensuales: 200,
  margenPromedio: 35,
  rotacionInventario: 12
};

export const ALERTAS_INICIALES: Alertas = {
  margenMinimo: 20,
  stockMinimo: 5,
  diasSinVenta: 30,
  diferenciaPrecioCompetencia: 15
};

export const PRODUCTO_INICIAL = {
  nombre: '',
  categoria: 'alimentacion' as Categoria,
  costoCompra: '',
  gastosFijos: '',
  margenDeseado: '30',
  precioVenta: '',
  utilidad: '',
  stock: '',
  ventasUltimos30Dias: '',
  precioCompetencia: '',
  fechaUltimaVenta: '',
  rotacion: 'alta' as const,
  esPaquete: false,
  unidadesPorPaquete: '1',
  costoUnitario: '',
  cantidadPaquetes: '1'
};

export const VENTA_INICIAL = {
  productoId: '',
  cantidad: '',
  precioVenta: '',
  fecha: new Date().toISOString().split('T')[0],
  cliente: '',
  metodoPago: 'efectivo' as const,
  tipoVenta: 'unidad' as const
};