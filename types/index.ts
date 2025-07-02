export interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  costoCompra: string;
  gastosFijos: string;
  margenDeseado: string;
  precioVenta: string;
  utilidad: string;
  stock: string;
  ventasUltimos30Dias: string;
  precioCompetencia: string;
  fechaUltimaVenta: string;
  rotacion: string;
  esPaquete: boolean;
  unidadesPorPaquete: string;
  costoUnitario: string;
  cantidadPaquetes: string;
}

export interface Venta {
  id: string;
  productoId: string;
  productoNombre: string;
  cantidad: number;
  precioVenta: number;
  costoUnitario: number;
  fecha: string;
  cliente: string;
  metodoPago: string;
  utilidadTotal: number;
  ingresoTotal: number;
  tipoVenta: 'unidad' | 'paquete';
}

export interface VentaActual {
  productoId: string;
  cantidad: string;
  precioVenta: string;
  fecha: string;
  cliente: string;
  metodoPago: string;
  tipoVenta: 'unidad' | 'paquete';
}

export interface ProductoActual {
  nombre: string;
  categoria: string;
  costoCompra: string;
  gastosFijos: string;
  margenDeseado: string;
  precioVenta: string;
  utilidad: string;
  stock: string;
  ventasUltimos30Dias: string;
  precioCompetencia: string;
  fechaUltimaVenta: string;
  rotacion: string;
  esPaquete: boolean;
  unidadesPorPaquete: string;
  costoUnitario: string;
  cantidadPaquetes: string;
}

export interface Metas {
  ventasMensuales: number;
  unidadesMensuales: number;
  margenPromedio: number;
  rotacionInventario: number;
}

export interface Alertas {
  margenMinimo: number;
  stockMinimo: number;
  diasSinVenta: number;
  diferenciaPrecioCompetencia: number;
}

export interface Configuracion {
  porcentajes: {
    contabilidad: number;
    mercadeo: number;
    ventas: number;
    salarios: number;
    compras: number;
    extras: number;
  };
  costosFijos: {
    arriendo: number;
    energia: number;
    gas: number;
    aseo: number;
    internet: number;
    agua: number;
    servidores: number;
  };
  herramientas: {
    figma: number;
    chatgpt: number;
    correos: number;
    servidor: number;
    dominio: number;
  };
  ventasEstimadas: number;
}

export type Vista = 'dashboard' | 'ventas' | 'calculadora' | 'inventario' | 'alertas' | 'abc' | 'simulador' | 'metas' | 'informes' | 'configuracion';
export type Categoria = 'alimentacion' | 'pañales' | 'ropa' | 'juguetes' | 'higiene' | 'accesorios' | 'mobiliario' | 'otros';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'nequi' | 'daviplata';
export type Rotacion = 'alta' | 'media' | 'baja';