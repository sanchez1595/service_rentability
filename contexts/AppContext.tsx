import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Producto, Venta, Configuracion, Metas, Alertas } from '../types';
import { 
  productosService, 
  ventasService, 
  configuracionService, 
  metasService, 
  alertasService 
} from '../services/database';

interface AppContextType {
  // Estados
  productos: Producto[];
  ventas: Venta[];
  configuracion: Configuracion;
  metas: Metas;
  alertas: Alertas;
  loading: boolean;
  error: string | null;
  
  // Funciones de Productos
  agregarProducto: (producto: Omit<Producto, 'id'>) => Promise<void>;
  actualizarProducto: (id: string, producto: Partial<Producto>) => Promise<void>;
  eliminarProducto: (id: string) => Promise<void>;
  
  // Funciones de Ventas
  registrarVenta: (venta: Omit<Venta, 'id'>) => Promise<void>;
  eliminarVenta: (id: string) => Promise<void>;
  
  // Funciones de Configuración
  actualizarConfiguracion: (tipo: string, clave: string, valor: number) => Promise<void>;
  eliminarConfiguracion: (tipo: string, clave: string) => Promise<void>;
  
  // Funciones de Metas y Alertas
  actualizarMeta: (clave: string, valor: number) => Promise<void>;
  actualizarAlerta: (clave: string, valor: number) => Promise<void>;
  
  // Función de recarga
  recargarDatos: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [configuracion, setConfiguracion] = useState<Configuracion>({
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
  });
  const [metas, setMetas] = useState<Metas>({
    ventasMensuales: 2000000,
    unidadesMensuales: 200,
    margenPromedio: 35,
    rotacionInventario: 12
  });
  const [alertas, setAlertas] = useState<Alertas>({
    margenMinimo: 20,
    stockMinimo: 5,
    diasSinVenta: 30,
    diferenciaPrecioCompetencia: 15
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productosData, ventasData, configuracionData, metasData, alertasData] = await Promise.all([
        productosService.obtenerTodos(),
        ventasService.obtenerTodas(),
        configuracionService.obtener(),
        metasService.obtener(),
        alertasService.obtener()
      ]);
      
      setProductos(productosData);
      setVentas(ventasData);
      setConfiguracion(configuracionData);
      setMetas(metasData);
      setAlertas(alertasData);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('Error al cargar los datos. Por favor, recarga la página.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Funciones de Productos
  const agregarProducto = async (producto: Omit<Producto, 'id'>) => {
    try {
      const nuevoProducto = await productosService.crear(producto);
      setProductos(prev => [nuevoProducto, ...prev]);
    } catch (err) {
      console.error('Error agregando producto:', err);
      throw new Error('No se pudo agregar el producto');
    }
  };

  const actualizarProducto = async (id: string, producto: Partial<Producto>) => {
    try {
      const productoActualizado = await productosService.actualizar(id, producto);
      setProductos(prev => prev.map(p => p.id === id ? productoActualizado : p));
    } catch (err) {
      console.error('Error actualizando producto:', err);
      throw new Error('No se pudo actualizar el producto');
    }
  };

  const eliminarProducto = async (id: string) => {
    try {
      await productosService.eliminar(id);
      setProductos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error eliminando producto:', err);
      throw new Error('No se pudo eliminar el producto');
    }
  };

  // Funciones de Ventas
  const registrarVenta = async (venta: Omit<Venta, 'id'>) => {
    try {
      const nuevaVenta = await ventasService.crear(venta);
      setVentas(prev => [nuevaVenta, ...prev]);
      
      // Actualizar stock del producto
      const producto = productos.find(p => p.id === venta.productoId);
      if (producto) {
        let unidadesVendidas = venta.cantidad;
        
        // Si es venta por paquete, multiplicar por unidades del paquete
        if (venta.tipoVenta === 'paquete' && producto.esPaquete && producto.unidadesPorPaquete) {
          unidadesVendidas = venta.cantidad * parseFloat(producto.unidadesPorPaquete);
        }
        
        const nuevoStock = parseInt(producto.stock) - unidadesVendidas;
        await actualizarProducto(venta.productoId, { 
          stock: nuevoStock.toString(),
          fechaUltimaVenta: venta.fecha
        });
      }
    } catch (err) {
      console.error('Error registrando venta:', err);
      throw new Error('No se pudo registrar la venta');
    }
  };

  const eliminarVenta = async (id: string) => {
    try {
      await ventasService.eliminar(id);
      setVentas(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      console.error('Error eliminando venta:', err);
      throw new Error('No se pudo eliminar la venta');
    }
  };

  // Funciones de Configuración
  const actualizarConfiguracion = async (tipo: string, clave: string, valor: number) => {
    try {
      await configuracionService.actualizar(tipo, clave, valor);
      
      setConfiguracion(prev => {
        const newConfig = { ...prev };
        
        if (tipo === 'porcentaje') {
          newConfig.porcentajes = { ...prev.porcentajes, [clave]: valor };
        } else if (tipo === 'costo_fijo') {
          newConfig.costosFijos = { ...prev.costosFijos, [clave]: valor };
        } else if (tipo === 'herramienta') {
          newConfig.herramientas = { ...prev.herramientas, [clave]: valor };
        } else if (tipo === 'general' && clave === 'ventas_estimadas') {
          newConfig.ventasEstimadas = valor;
        }
        
        return newConfig;
      });
    } catch (err) {
      console.error('Error actualizando configuración:', err);
      throw new Error('No se pudo actualizar la configuración');
    }
  };

  const eliminarConfiguracion = async (tipo: string, clave: string) => {
    try {
      await configuracionService.eliminar(tipo, clave);
      
      setConfiguracion(prev => {
        const newConfig = { ...prev };
        
        if (tipo === 'porcentaje') {
          const newPorcentajes = { ...prev.porcentajes };
          delete (newPorcentajes as any)[clave];
          newConfig.porcentajes = newPorcentajes;
        } else if (tipo === 'costo_fijo') {
          const newCostosFijos = { ...prev.costosFijos };
          delete (newCostosFijos as any)[clave];
          newConfig.costosFijos = newCostosFijos;
        } else if (tipo === 'herramienta') {
          const newHerramientas = { ...prev.herramientas };
          delete (newHerramientas as any)[clave];
          newConfig.herramientas = newHerramientas;
        }
        
        return newConfig;
      });
    } catch (err) {
      console.error('Error eliminando configuración:', err);
      throw new Error('No se pudo eliminar la configuración');
    }
  };

  // Funciones de Metas y Alertas
  const actualizarMeta = async (clave: string, valor: number) => {
    try {
      await metasService.actualizar(clave, valor);
      
      setMetas(prev => ({
        ...prev,
        [clave === 'ventas_mensuales' ? 'ventasMensuales' : 
         clave === 'unidades_mensuales' ? 'unidadesMensuales' :
         clave === 'margen_promedio' ? 'margenPromedio' :
         'rotacionInventario']: valor
      }));
    } catch (err) {
      console.error('Error actualizando meta:', err);
      throw new Error('No se pudo actualizar la meta');
    }
  };

  const actualizarAlerta = async (clave: string, valor: number) => {
    try {
      await alertasService.actualizar(clave, valor);
      
      setAlertas(prev => ({
        ...prev,
        [clave === 'margen_minimo' ? 'margenMinimo' : 
         clave === 'stock_minimo' ? 'stockMinimo' :
         clave === 'dias_sin_venta' ? 'diasSinVenta' :
         'diferenciaPrecioCompetencia']: valor
      }));
    } catch (err) {
      console.error('Error actualizando alerta:', err);
      throw new Error('No se pudo actualizar la alerta');
    }
  };

  const value: AppContextType = {
    productos,
    ventas,
    configuracion,
    metas,
    alertas,
    loading,
    error,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    registrarVenta,
    eliminarVenta,
    actualizarConfiguracion,
    eliminarConfiguracion,
    actualizarMeta,
    actualizarAlerta,
    recargarDatos: cargarDatos
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};