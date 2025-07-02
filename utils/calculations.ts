import { Producto, Venta, ProductoActual, Configuracion } from '../types';

export const calcularPrecios = (
  productoActual: ProductoActual,
  configuracion: Configuracion
) => {
  const costoTotal = parseFloat(productoActual.costoCompra) || 0;
  const gastos = parseFloat(productoActual.gastosFijos) || 0;
  const margen = parseFloat(productoActual.margenDeseado) || 0;
  const esPaquete = productoActual.esPaquete;
  const unidadesPorPaquete = parseFloat(productoActual.unidadesPorPaquete) || 1;
  const cantidadPaquetes = parseFloat(productoActual.cantidadPaquetes) || 1;

  const totalCostosFijos = Object.values(configuracion.costosFijos)
    .reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0);
  const totalHerramientas = Object.values(configuracion.herramientas)
    .reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0);
  const costoFijoPorProducto = (totalCostosFijos + totalHerramientas) / (configuracion.ventasEstimadas || 1);

  const totalPorcentajes = Object.values(configuracion.porcentajes)
    .reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0);

  // Si es paquete, dividir todos los costos entre las unidades totales
  let costoUnitario = costoTotal;
  let gastosUnitarios = gastos;
  let costoFijoUnitario = costoFijoPorProducto;

  if (esPaquete && unidadesPorPaquete > 0 && cantidadPaquetes > 0) {
    const unidadesTotales = unidadesPorPaquete * cantidadPaquetes;
    costoUnitario = costoTotal / unidadesTotales;
    gastosUnitarios = gastos / unidadesTotales;
    costoFijoUnitario = costoFijoPorProducto;
  }

  const costoBase = costoUnitario + gastosUnitarios + costoFijoUnitario;
  const precioConPorcentajes = costoBase / (1 - (totalPorcentajes / 100));
  const precioVenta = precioConPorcentajes / (1 - margen / 100);
  const utilidad = precioVenta - costoBase;

  return {
    precioVenta: Math.round(precioVenta),
    utilidad: Math.round(utilidad),
    costoBase: Math.round(costoBase),
    costoFijoPorProducto: Math.round(costoFijoUnitario),
    totalPorcentajes,
    costoUnitario: Math.round(costoUnitario)
  };
};

export const calcularVentasReales30Dias = (
  productoId: string,
  ventas: Venta[]
): number => {
  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - 30);
  
  return ventas
    .filter(venta => 
      venta.productoId === productoId && 
      new Date(venta.fecha) >= hace30Dias
    )
    .reduce((total, venta) => total + venta.cantidad, 0);
};

export const calcularIngresosReales30Dias = (
  ventas: Venta[],
  productoId: string | null = null
): number => {
  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - 30);
  
  return ventas
    .filter(venta => {
      const dentroFecha = new Date(venta.fecha) >= hace30Dias;
      return productoId ? (venta.productoId === productoId && dentroFecha) : dentroFecha;
    })
    .reduce((total, venta) => total + venta.ingresoTotal, 0);
};

export const obtenerTendenciaVentas = (ventas: Venta[]) => {
  const hoy = new Date();
  const hace7Dias = new Date();
  hace7Dias.setDate(hoy.getDate() - 7);
  const hace14Dias = new Date();
  hace14Dias.setDate(hoy.getDate() - 14);

  const ventasUltimos7 = ventas
    .filter(venta => new Date(venta.fecha) >= hace7Dias)
    .reduce((total, venta) => total + venta.ingresoTotal, 0);

  const ventas7DiasAnteriores = ventas
    .filter(venta => {
      const fecha = new Date(venta.fecha);
      return fecha >= hace14Dias && fecha < hace7Dias;
    })
    .reduce((total, venta) => total + venta.ingresoTotal, 0);

  const cambio = ventas7DiasAnteriores > 0 
    ? ((ventasUltimos7 - ventas7DiasAnteriores) / ventas7DiasAnteriores) * 100 
    : 0;

  return {
    ventasUltimos7,
    ventas7DiasAnteriores,
    cambioPortentual: cambio,
    tendencia: cambio > 5 ? 'subiendo' : cambio < -5 ? 'bajando' : 'estable'
  };
};

export const calcularMargenPromedio = (productos: Producto[]): number => {
  if (productos.length === 0) return 0;
  
  const totalMargen = productos.reduce((sum, producto) => {
    const margen = parseFloat(producto.margenDeseado) || 0;
    return sum + margen;
  }, 0);
  
  return totalMargen / productos.length;
};

export const calcularStockTotal = (productos: Producto[]): number => {
  return productos.reduce((total, producto) => {
    return total + (parseFloat(producto.stock) || 0);
  }, 0);
};

export const calcularValorInventario = (productos: Producto[]): number => {
  return productos.reduce((total, producto) => {
    const stock = parseFloat(producto.stock) || 0;
    const costo = parseFloat(producto.costoCompra) || 0;
    return total + (stock * costo);
  }, 0);
};