import { useState, useCallback } from 'react';
import { Producto, ProductoActual } from '../types';
import { PRODUCTO_INICIAL } from '../utils/constants';
import { calcularPrecios } from '../utils/calculations';

export const useProductos = (configuracion: any) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoActual, setProductoActual] = useState<ProductoActual>(PRODUCTO_INICIAL);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const manejarCambioInput = useCallback((campo: keyof ProductoActual, valor: string) => {
    setProductoActual(prev => {
      const newProducto = {
        ...prev,
        [campo]: valor
      };
      
      // Si es un producto con paquete, calcular automáticamente el stock y costo unitario
      if (newProducto.esPaquete) {
        const cantidadPaquetes = parseFloat(newProducto.cantidadPaquetes) || 0;
        const unidadesPorPaquete = parseFloat(newProducto.unidadesPorPaquete) || 0;
        const costoTotal = parseFloat(newProducto.costoCompra) || 0;
        
        // Calcular stock automáticamente
        if (cantidadPaquetes > 0 && unidadesPorPaquete > 0) {
          newProducto.stock = (cantidadPaquetes * unidadesPorPaquete).toString();
        }
        
        // Calcular costo unitario automáticamente
        if (costoTotal > 0 && cantidadPaquetes > 0 && unidadesPorPaquete > 0) {
          const totalUnidades = cantidadPaquetes * unidadesPorPaquete;
          newProducto.costoUnitario = (costoTotal / totalUnidades).toFixed(2);
        }
      }
      
      return newProducto;
    });
  }, []);

  const calcularPreciosProducto = useCallback(() => {
    const { precioVenta, utilidad, costoUnitario } = calcularPrecios(productoActual, configuracion);
    
    setProductoActual(prev => ({
      ...prev,
      precioVenta: precioVenta.toString(),
      utilidad: utilidad.toString(),
      costoUnitario: costoUnitario.toString()
    }));
  }, [productoActual, configuracion]);

  const agregarProducto = useCallback(() => {
    if (!productoActual.nombre || !productoActual.costoCompra) return;

    const nuevoProducto: Producto = {
      ...productoActual,
      id: Date.now().toString()
    };

    setProductos(prev => [...prev, nuevoProducto]);
    setProductoActual(PRODUCTO_INICIAL);
  }, [productoActual]);

  const editarProducto = useCallback((id: string) => {
    const producto = productos.find(p => p.id === id);
    if (producto) {
      setProductoActual(producto);
      setEditandoId(id);
    }
  }, [productos]);

  const guardarEdicion = useCallback(() => {
    if (!editandoId) return;

    setProductos(prev => 
      prev.map(p => p.id === editandoId ? { ...productoActual, id: editandoId } : p)
    );
    setProductoActual(PRODUCTO_INICIAL);
    setEditandoId(null);
  }, [editandoId, productoActual]);

  const eliminarProducto = useCallback((id: string) => {
    setProductos(prev => prev.filter(p => p.id !== id));
  }, []);

  const cancelarEdicion = useCallback(() => {
    setProductoActual(PRODUCTO_INICIAL);
    setEditandoId(null);
  }, []);

  return {
    productos,
    productoActual,
    editandoId,
    manejarCambioInput,
    calcularPreciosProducto,
    agregarProducto,
    editarProducto,
    guardarEdicion,
    eliminarProducto,
    cancelarEdicion,
    setProductos
  };
};