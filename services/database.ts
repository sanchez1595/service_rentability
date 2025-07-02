import { supabase, ProductoDB, VentaDB, ConfiguracionDB, MetaDB, AlertaDB } from '../lib/supabase';
import { Producto, Venta, Configuracion, Metas, Alertas } from '../types';

// Funciones de conversión entre tipos locales y DB
const convertProductoFromDB = (productoDB: ProductoDB): Producto => ({
  id: productoDB.id,
  nombre: productoDB.nombre,
  categoria: productoDB.categoria,
  costoCompra: productoDB.costo_compra.toString(),
  gastosFijos: productoDB.gastos_fijos.toString(),
  margenDeseado: productoDB.margen_deseado.toString(),
  precioVenta: productoDB.precio_venta.toString(),
  utilidad: productoDB.utilidad.toString(),
  stock: productoDB.stock.toString(),
  ventasUltimos30Dias: productoDB.ventas_ultimos_30_dias.toString(),
  precioCompetencia: productoDB.precio_competencia.toString(),
  fechaUltimaVenta: productoDB.fecha_ultima_venta || '',
  rotacion: productoDB.rotacion,
  esPaquete: productoDB.es_paquete || false,
  unidadesPorPaquete: (productoDB.unidades_por_paquete || 1).toString(),
  costoUnitario: (productoDB.costo_unitario || 0).toString(),
  cantidadPaquetes: (productoDB.cantidad_paquetes || 1).toString()
});

const convertProductoToDB = (producto: Producto): Omit<ProductoDB, 'id' | 'created_at' | 'updated_at'> => ({
  nombre: producto.nombre,
  categoria: producto.categoria,
  costo_compra: parseFloat(producto.costoCompra) || 0,
  gastos_fijos: parseFloat(producto.gastosFijos) || 0,
  margen_deseado: parseFloat(producto.margenDeseado) || 30,
  precio_venta: parseFloat(producto.precioVenta) || 0,
  utilidad: parseFloat(producto.utilidad) || 0,
  stock: parseInt(producto.stock) || 0,
  ventas_ultimos_30_dias: parseInt(producto.ventasUltimos30Dias) || 0,
  precio_competencia: parseFloat(producto.precioCompetencia) || 0,
  fecha_ultima_venta: producto.fechaUltimaVenta || null,
  rotacion: producto.rotacion,
  es_paquete: producto.esPaquete || false,
  unidades_por_paquete: parseInt(producto.unidadesPorPaquete) || 1,
  costo_unitario: parseFloat(producto.costoUnitario) || 0,
  cantidad_paquetes: parseInt(producto.cantidadPaquetes) || 1
});

const convertVentaFromDB = (ventaDB: VentaDB): Venta => ({
  id: ventaDB.id,
  productoId: ventaDB.producto_id,
  productoNombre: ventaDB.producto_nombre,
  cantidad: ventaDB.cantidad,
  precioVenta: ventaDB.precio_venta,
  costoUnitario: ventaDB.costo_unitario,
  fecha: ventaDB.fecha,
  cliente: ventaDB.cliente,
  metodoPago: ventaDB.metodo_pago,
  utilidadTotal: ventaDB.utilidad_total,
  ingresoTotal: ventaDB.ingreso_total,
  tipoVenta: (ventaDB.tipo_venta as 'unidad' | 'paquete') || 'unidad'
});

const convertVentaToDB = (venta: Omit<Venta, 'id'>): Omit<VentaDB, 'id' | 'created_at'> => ({
  producto_id: venta.productoId,
  producto_nombre: venta.productoNombre,
  cantidad: venta.cantidad,
  precio_venta: venta.precioVenta,
  costo_unitario: venta.costoUnitario,
  fecha: venta.fecha,
  cliente: venta.cliente,
  metodo_pago: venta.metodoPago,
  utilidad_total: venta.utilidadTotal,
  ingreso_total: venta.ingresoTotal,
  tipo_venta: venta.tipoVenta
});

// Servicio de Productos
export const productosService = {
  async obtenerTodos(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(convertProductoFromDB);
  },

  async crear(producto: Omit<Producto, 'id'>): Promise<Producto> {
    const productoDB = convertProductoToDB({ ...producto, id: '' });
    
    const { data, error } = await supabase
      .from('productos')
      .insert([productoDB])
      .select()
      .single();
    
    if (error) throw error;
    return convertProductoFromDB(data);
  },

  async actualizar(id: string, producto: Partial<Producto>): Promise<Producto> {
    const updates: any = {};
    
    if (producto.nombre !== undefined) updates.nombre = producto.nombre;
    if (producto.categoria !== undefined) updates.categoria = producto.categoria;
    if (producto.costoCompra !== undefined) updates.costo_compra = parseFloat(producto.costoCompra) || 0;
    if (producto.gastosFijos !== undefined) updates.gastos_fijos = parseFloat(producto.gastosFijos) || 0;
    if (producto.margenDeseado !== undefined) updates.margen_deseado = parseFloat(producto.margenDeseado) || 30;
    if (producto.precioVenta !== undefined) updates.precio_venta = parseFloat(producto.precioVenta) || 0;
    if (producto.utilidad !== undefined) updates.utilidad = parseFloat(producto.utilidad) || 0;
    if (producto.stock !== undefined) updates.stock = parseInt(producto.stock) || 0;
    if (producto.ventasUltimos30Dias !== undefined) updates.ventas_ultimos_30_dias = parseInt(producto.ventasUltimos30Dias) || 0;
    if (producto.precioCompetencia !== undefined) updates.precio_competencia = parseFloat(producto.precioCompetencia) || 0;
    if (producto.fechaUltimaVenta !== undefined) updates.fecha_ultima_venta = producto.fechaUltimaVenta || null;
    if (producto.rotacion !== undefined) updates.rotacion = producto.rotacion;
    if (producto.esPaquete !== undefined) updates.es_paquete = producto.esPaquete;
    if (producto.unidadesPorPaquete !== undefined) updates.unidades_por_paquete = parseInt(producto.unidadesPorPaquete) || 1;
    if (producto.costoUnitario !== undefined) updates.costo_unitario = parseFloat(producto.costoUnitario) || 0;
    
    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return convertProductoFromDB(data);
  },

  async eliminar(id: string): Promise<void> {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async actualizarTodosLosPrecios(productos: Producto[], configuracion: Configuracion): Promise<void> {
    const { error } = await supabase
      .from('productos')
      .upsert(productos.map(producto => ({
        id: producto.id,
        precio_venta: parseFloat(producto.precioVenta) || 0,
        utilidad: parseFloat(producto.utilidad) || 0,
        gastos_fijos: parseFloat(producto.gastosFijos) || 0
      })), { onConflict: 'id' });
    
    if (error) throw error;
  }
};

// Servicio de Ventas
export const ventasService = {
  async obtenerTodas(): Promise<Venta[]> {
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .order('fecha', { ascending: false });
    
    if (error) throw error;
    return (data || []).map(convertVentaFromDB);
  },

  async crear(venta: Omit<Venta, 'id'>): Promise<Venta> {
    const ventaDB = convertVentaToDB(venta);
    
    const { data, error } = await supabase
      .from('ventas')
      .insert([ventaDB])
      .select()
      .single();
    
    if (error) throw error;
    return convertVentaFromDB(data);
  },

  async eliminar(id: string): Promise<void> {
    const { error } = await supabase
      .from('ventas')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Servicio de Configuración
export const configuracionService = {
  async obtener(): Promise<Configuracion> {
    const { data, error } = await supabase
      .from('configuracion')
      .select('*');
    
    if (error) throw error;
    
    const configuracion: Configuracion = {
      porcentajes: {} as any,
      costosFijos: {} as any,
      herramientas: {} as any,
      ventasEstimadas: 100
    };
    
    (data || []).forEach((item: ConfiguracionDB) => {
      if (item.tipo === 'porcentaje') {
        (configuracion.porcentajes as any)[item.clave] = item.valor;
      } else if (item.tipo === 'costo_fijo') {
        (configuracion.costosFijos as any)[item.clave] = item.valor;
      } else if (item.tipo === 'herramienta') {
        (configuracion.herramientas as any)[item.clave] = item.valor;
      } else if (item.tipo === 'general' && item.clave === 'ventas_estimadas') {
        configuracion.ventasEstimadas = item.valor;
      }
    });
    
    return configuracion;
  },

  async actualizar(tipo: string, clave: string, valor: number): Promise<void> {
    const { error } = await supabase
      .from('configuracion')
      .upsert([{ tipo, clave, valor }], { onConflict: 'tipo,clave' });
    
    if (error) throw error;
  },

  async eliminar(tipo: string, clave: string): Promise<void> {
    const { error } = await supabase
      .from('configuracion')
      .delete()
      .eq('tipo', tipo)
      .eq('clave', clave);
    
    if (error) throw error;
  }
};

// Servicio de Metas
export const metasService = {
  async obtener(): Promise<Metas> {
    const { data, error } = await supabase
      .from('metas')
      .select('*');
    
    if (error) throw error;
    
    const metas: Metas = {
      ventasMensuales: 2000000,
      unidadesMensuales: 200,
      margenPromedio: 35,
      rotacionInventario: 12
    };
    
    (data || []).forEach((item: MetaDB) => {
      switch (item.clave) {
        case 'ventas_mensuales':
          metas.ventasMensuales = item.valor;
          break;
        case 'unidades_mensuales':
          metas.unidadesMensuales = item.valor;
          break;
        case 'margen_promedio':
          metas.margenPromedio = item.valor;
          break;
        case 'rotacion_inventario':
          metas.rotacionInventario = item.valor;
          break;
      }
    });
    
    return metas;
  },

  async actualizar(clave: string, valor: number): Promise<void> {
    const { error } = await supabase
      .from('metas')
      .upsert([{ clave, valor }], { onConflict: 'clave' });
    
    if (error) throw error;
  }
};

// Servicio de Alertas
export const alertasService = {
  async obtener(): Promise<Alertas> {
    const { data, error } = await supabase
      .from('alertas')
      .select('*');
    
    if (error) throw error;
    
    const alertas: Alertas = {
      margenMinimo: 20,
      stockMinimo: 5,
      diasSinVenta: 30,
      diferenciaPrecioCompetencia: 15
    };
    
    (data || []).forEach((item: AlertaDB) => {
      switch (item.clave) {
        case 'margen_minimo':
          alertas.margenMinimo = item.valor;
          break;
        case 'stock_minimo':
          alertas.stockMinimo = item.valor;
          break;
        case 'dias_sin_venta':
          alertas.diasSinVenta = item.valor;
          break;
        case 'diferencia_precio_competencia':
          alertas.diferenciaPrecioCompetencia = item.valor;
          break;
      }
    });
    
    return alertas;
  },

  async actualizar(clave: string, valor: number): Promise<void> {
    const { error } = await supabase
      .from('alertas')
      .upsert([{ clave, valor }], { onConflict: 'clave' });
    
    if (error) throw error;
  }
};