import { useState, useCallback } from 'react';
import { Venta, VentaActual, Producto } from '../types';
import { VENTA_INICIAL } from '../utils/constants';

export const useVentas = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [ventaActual, setVentaActual] = useState<VentaActual>(VENTA_INICIAL);

  const registrarVenta = useCallback((productos: Producto[]) => {
    if (!ventaActual.productoId || !ventaActual.cantidad || ventaActual.cantidad === '') return false;
    
    const producto = productos.find(p => p.id == ventaActual.productoId);
    if (!producto) return false;
    
    const cantidad = parseFloat(ventaActual.cantidad) || 0;
    const stockActual = parseFloat(producto.stock) || 0;
    
    if (cantidad > stockActual) {
      alert('No hay suficiente stock para esta venta');
      return false;
    }
    
    // Crear registro de venta exactamente como en el original
    const nuevaVenta: Venta = {
      id: Date.now().toString(),
      productoId: ventaActual.productoId,
      productoNombre: producto.nombre,
      cantidad: cantidad,
      precioVenta: parseFloat(ventaActual.precioVenta) || parseFloat(producto.precioVenta) || 0,
      costoUnitario: parseFloat(producto.costoCompra) || 0,
      fecha: ventaActual.fecha,
      cliente: ventaActual.cliente || 'Cliente general',
      metodoPago: ventaActual.metodoPago,
      utilidadTotal: ((parseFloat(ventaActual.precioVenta) || parseFloat(producto.precioVenta) || 0) - (parseFloat(producto.costoCompra) || 0)) * cantidad,
      ingresoTotal: (parseFloat(ventaActual.precioVenta) || parseFloat(producto.precioVenta) || 0) * cantidad,
      tipoVenta: ventaActual.tipoVenta || 'unidad'
    };
    
    // Agregar venta al historial
    setVentas(prev => [nuevaVenta, ...prev]);
    
    // Limpiar formulario de venta
    setVentaActual({
      productoId: '',
      cantidad: '',
      precioVenta: '',
      fecha: new Date().toISOString().split('T')[0],
      cliente: '',
      metodoPago: 'efectivo',
      tipoVenta: 'unidad'
    });
    
    // Mostrar confirmación
    alert(`¡Venta registrada! ${cantidad} unidades de ${producto.nombre}`);
    return true;
  }, [ventaActual]);

  const actualizarVentaActual = useCallback((campo: keyof VentaActual, valor: string) => {
    setVentaActual(prev => ({
      ...prev,
      [campo]: valor
    }));
  }, []);

  const eliminarVenta = useCallback((id: string) => {
    setVentas(prev => prev.filter(v => v.id !== id));
  }, []);

  return {
    ventas,
    ventaActual,
    registrarVenta,
    actualizarVentaActual,
    eliminarVenta,
    setVentas
  };
};