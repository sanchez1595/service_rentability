import React from 'react';
import { ShoppingCart, Calendar, CheckCircle, Clock, Package, BarChart3, Trash2, Plus } from 'lucide-react';
import { Producto, Venta, VentaActual } from '../../types';
import { formatearInput, formatearMoneda } from '../../utils/formatters';
import { Combobox } from '../common/Combobox';

interface GestionVentasProps {
  productos: Producto[];
  ventas: Venta[];
  ventaActual: VentaActual;
  onActualizarVenta: (campo: keyof VentaActual, valor: string) => void;
  onRegistrarVenta: () => void;
  onEliminarVenta: (id: string) => void;
  setVistaActiva: (vista: string) => void;
}

export const GestionVentas: React.FC<GestionVentasProps> = ({
  productos,
  ventas,
  ventaActual,
  onActualizarVenta,
  onRegistrarVenta,
  onEliminarVenta,
  setVistaActiva
}) => {
  const formatearNumero = (numero: number | string) => {
    return new Intl.NumberFormat('es-CO').format(Number(numero));
  };

  const parsearInput = (valor: string) => {
    return valor.replace(/[^\d]/g, '');
  };

  // Preparar opciones para el combobox
  const opcionesProductos = productos
    .filter(p => (parseFloat(p.stock) || 0) > 0)
    .map(producto => ({
      id: producto.id,
      label: producto.nombre,
      subtitle: `Stock: ${formatearNumero(producto.stock || '0')} - $${formatearNumero(parseFloat(producto.precioVenta || '0').toFixed(0))}`
    }));

  const handleProductChange = (productoId: string) => {
    onActualizarVenta('productoId', productoId);
    if (productoId) {
      const producto = productos.find(p => p.id === productoId);
      if (producto) {
        // Establecer tipo de venta por defecto
        if (producto.esPaquete) {
          onActualizarVenta('tipoVenta', 'unidad');
        } else {
          onActualizarVenta('tipoVenta', 'unidad');
        }
        onActualizarVenta('precioVenta', producto.precioVenta);
      }
    }
  };

  const handleTipoVentaChange = (tipoVenta: string) => {
    onActualizarVenta('tipoVenta', tipoVenta);
    
    // Actualizar precio según el tipo de venta
    if (ventaActual.productoId) {
      const producto = productos.find(p => p.id === ventaActual.productoId);
      if (producto) {
        if (tipoVenta === 'paquete' && producto.esPaquete && producto.unidadesPorPaquete) {
          const precioPaquete = parseFloat(producto.precioVenta) * parseFloat(producto.unidadesPorPaquete);
          onActualizarVenta('precioVenta', precioPaquete.toString());
        } else {
          onActualizarVenta('precioVenta', producto.precioVenta);
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Formulario de Venta */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Registrar Nueva Venta</h2>
              <p className="text-slate-600">Actualiza tu inventario automáticamente</p>
            </div>
          </div>
          
          {productos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 mb-4">Primero debes agregar productos a tu inventario</p>
              <button
                onClick={() => setVistaActiva('calculadora')}
                className="bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-600 transition-colors"
              >
                Agregar Productos
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Producto */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Producto
                </label>
                <Combobox
                  options={opcionesProductos}
                  value={ventaActual.productoId}
                  onChange={handleProductChange}
                  placeholder="Buscar producto..."
                />
              </div>

              {/* Info del producto seleccionado */}
              {ventaActual.productoId && (() => {
                const productoSeleccionado = productos.find(p => p.id == ventaActual.productoId);
                return (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Información del Producto</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600 font-medium">Stock:</span>
                        <div className="font-bold">{formatearNumero(productoSeleccionado?.stock || 0)} unidades</div>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Precio unitario:</span>
                        <div className="font-bold">${formatearNumero(parseFloat(productoSeleccionado?.precioVenta || '0').toFixed(0))}</div>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Costo unitario:</span>
                        <div className="font-bold">${formatearNumero(parseFloat(productoSeleccionado?.costoUnitario || productoSeleccionado?.costoCompra || '0').toFixed(0))}</div>
                      </div>
                    </div>
                    
                    {productoSeleccionado?.esPaquete && (
                      <div className="mt-3 pt-3 border-t border-blue-300">
                        <div className="text-amber-700 font-medium text-sm mb-2">💦 Producto en paquete</div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-amber-600">Unidades por paquete:</span>
                            <div className="font-bold text-amber-800">{productoSeleccionado.unidadesPorPaquete}</div>
                          </div>
                          <div>
                            <span className="text-amber-600">Precio paquete completo:</span>
                            <div className="font-bold text-amber-800">
                              ${formatearNumero(((parseFloat(productoSeleccionado.precioVenta) || 0) * (parseFloat(productoSeleccionado.unidadesPorPaquete) || 1)).toFixed(0))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
              
              {/* Tipo de Venta - Solo para productos en paquete */}
              {ventaActual.productoId && (() => {
                const productoSeleccionado = productos.find(p => p.id == ventaActual.productoId);
                if (productoSeleccionado?.esPaquete) {
                  return (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Tipo de Venta
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center p-3 border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                          <input
                            type="radio"
                            name="tipoVenta"
                            value="unidad"
                            checked={ventaActual.tipoVenta === 'unidad'}
                            onChange={(e) => handleTipoVentaChange(e.target.value)}
                            className="mr-3 text-emerald-600"
                          />
                          <div>
                            <div className="text-sm font-medium">Por unidad</div>
                            <div className="text-xs text-slate-500">Vender unidades individuales</div>
                          </div>
                        </label>
                        <label className="flex items-center p-3 border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                          <input
                            type="radio"
                            name="tipoVenta"
                            value="paquete"
                            checked={ventaActual.tipoVenta === 'paquete'}
                            onChange={(e) => handleTipoVentaChange(e.target.value)}
                            className="mr-3 text-amber-600"
                          />
                          <div>
                            <div className="text-sm font-medium">Por paquete</div>
                            <div className="text-xs text-slate-500">Vender paquete completo</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              
              {/* Cantidad y Precio */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {(() => {
                      const productoSeleccionado = productos.find(p => p.id == ventaActual.productoId);
                      if (productoSeleccionado?.esPaquete && ventaActual.tipoVenta === 'paquete') {
                        return 'Cantidad de Paquetes';
                      }
                      return 'Cantidad de Unidades';
                    })()}
                  </label>
                  <input
                    type="text"
                    value={formatearInput(ventaActual.cantidad)}
                    onChange={(e) => onActualizarVenta('cantidad', parsearInput(e.target.value).toString())}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder={(() => {
                      const productoSeleccionado = productos.find(p => p.id == ventaActual.productoId);
                      if (productoSeleccionado?.esPaquete && ventaActual.tipoVenta === 'paquete') {
                        return 'Ej: 2 paquetes';
                      }
                      return 'Ej: 1 unidad';
                    })()}
                  />
                  {(() => {
                    const productoSeleccionado = productos.find(p => p.id == ventaActual.productoId);
                    if (productoSeleccionado?.esPaquete && ventaActual.tipoVenta === 'paquete' && ventaActual.cantidad) {
                      const cantidadPaquetes = parseFloat(ventaActual.cantidad) || 0;
                      const unidadesPorPaquete = parseFloat(productoSeleccionado.unidadesPorPaquete) || 0;
                      const totalUnidades = cantidadPaquetes * unidadesPorPaquete;
                      return (
                        <p className="text-xs text-amber-600 mt-1">
                          = {formatearNumero(totalUnidades)} unidades individuales
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Precio de Venta ($)
                  </label>
                  <input
                    type="text"
                    value={formatearInput(ventaActual.precioVenta)}
                    onChange={(e) => onActualizarVenta('precioVenta', parsearInput(e.target.value).toString())}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
              
              {/* Cliente y Método de Pago */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Cliente (Opcional)
                  </label>
                  <input
                    type="text"
                    value={ventaActual.cliente}
                    onChange={(e) => onActualizarVenta('cliente', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Nombre del cliente"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Método de Pago
                  </label>
                  <select
                    value={ventaActual.metodoPago}
                    onChange={(e) => onActualizarVenta('metodoPago', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="efectivo">💵 Efectivo</option>
                    <option value="tarjeta">💳 Tarjeta</option>
                    <option value="transferencia">🏦 Transferencia</option>
                    <option value="nequi">📱 Nequi</option>
                    <option value="daviplata">📲 Daviplata</option>
                  </select>
                </div>
              </div>
              
              {/* Fecha */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Fecha de Venta
                </label>
                <input
                  type="date"
                  value={ventaActual.fecha}
                  onChange={(e) => onActualizarVenta('fecha', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Resumen de Venta */}
              {ventaActual.productoId && ventaActual.cantidad && ventaActual.precioVenta && (() => {
                const productoSeleccionado = productos.find(p => p.id == ventaActual.productoId);
                const cantidad = parseFloat(ventaActual.cantidad) || 0;
                const precioVenta = parseFloat(ventaActual.precioVenta) || 0;
                const costoUnitario = parseFloat(productoSeleccionado?.costoUnitario || productoSeleccionado?.costoCompra || '0') || 0;
                
                let totalVenta = cantidad * precioVenta;
                let utilidadTotal = 0;
                
                if (ventaActual.tipoVenta === 'paquete' && productoSeleccionado?.esPaquete) {
                  // Para venta por paquete, calcular utilidad del paquete completo
                  const unidadesPorPaquete = parseFloat(productoSeleccionado.unidadesPorPaquete) || 1;
                  const costoTotalPaquete = costoUnitario * unidadesPorPaquete;
                  utilidadTotal = (precioVenta - costoTotalPaquete) * cantidad;
                } else {
                  // Para venta por unidad
                  utilidadTotal = (precioVenta - costoUnitario) * cantidad;
                }
                
                return (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                    <h4 className="font-bold text-emerald-800 mb-4">💰 Resumen de la Venta</h4>
                    <div className="space-y-3">
                      <div className="text-sm text-emerald-700 mb-2">
                        Vendiendo: {cantidad} {ventaActual.tipoVenta === 'paquete' ? 'paquete(s)' : 'unidad(es)'}
                        {ventaActual.tipoVenta === 'paquete' && productoSeleccionado?.esPaquete && (
                          <span className="block text-xs">
                            = {cantidad * (parseFloat(productoSeleccionado.unidadesPorPaquete) || 0)} unidades individuales
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-700">Total a cobrar:</span>
                        <span className="text-2xl font-bold text-emerald-800">
                          ${formatearNumero(totalVenta.toFixed(0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-emerald-700">Utilidad total:</span>
                        <span className="text-xl font-bold text-emerald-600">
                          ${formatearNumero(utilidadTotal.toFixed(0))}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              <button
                onClick={onRegistrarVenta}
                disabled={!ventaActual.productoId || !ventaActual.cantidad || ventaActual.cantidad === ''}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                <CheckCircle size={20} />
                <span>Registrar Venta</span>
              </button>
            </div>
          )}
        </div>

        {/* Ventas de Hoy */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Ventas de Hoy</h3>
              <p className="text-slate-600">Registro en tiempo real</p>
            </div>
          </div>
          
          {(() => {
            const ventasHoy = ventas.filter(venta => 
              venta.fecha === new Date().toISOString().split('T')[0]
            );
            
            if (ventasHoy.length === 0) {
              return (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600">No hay ventas registradas hoy</p>
                  <p className="text-sm text-slate-500 mt-1">¡Comienza registrando tu primera venta!</p>
                </div>
              );
            }
            
            const totalVentasHoy = ventasHoy.reduce((sum, venta) => sum + venta.ingresoTotal, 0);
            const totalUtilidadHoy = ventasHoy.reduce((sum, venta) => sum + venta.utilidadTotal, 0);
            
            return (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-sm font-medium text-blue-700">Total Ventas</p>
                    <p className="text-2xl font-bold text-blue-800">${formatearNumero(totalVentasHoy.toFixed(0))}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <p className="text-sm font-medium text-emerald-700">Utilidad</p>
                    <p className="text-2xl font-bold text-emerald-800">${formatearNumero(totalUtilidadHoy.toFixed(0))}</p>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {ventasHoy.map(venta => (
                    <div key={venta.id} className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{venta.productoNombre}</p>
                          <p className="text-sm text-slate-600">
                            {formatearNumero(venta.cantidad)} unidades × ${formatearNumero(venta.precioVenta.toFixed(0))}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                            <span>👤 {venta.cliente}</span>
                            <span>💳 {venta.metodoPago}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-600">${formatearNumero(venta.ingresoTotal.toFixed(0))}</p>
                          <p className="text-sm text-slate-500">+${formatearNumero(venta.utilidadTotal.toFixed(0))}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Historial de Ventas */}
      {ventas.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-50 rounded-xl">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Historial de Ventas</h3>
                <p className="text-slate-600">Últimas {Math.min(ventas.length, 10)} ventas registradas</p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Fecha</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Producto</th>
                  <th className="text-center py-3 px-2 font-semibold text-slate-700">Cantidad</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Precio Unit.</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Total</th>
                  <th className="text-right py-3 px-2 font-semibold text-slate-700">Utilidad</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Cliente</th>
                  <th className="text-left py-3 px-2 font-semibold text-slate-700">Pago</th>
                </tr>
              </thead>
              <tbody>
                {ventas.slice(0, 10).map(venta => (
                  <tr key={venta.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 text-sm">{new Date(venta.fecha).toLocaleDateString()}</td>
                    <td className="py-3 px-2 font-medium">{venta.productoNombre}</td>
                    <td className="py-3 px-2 text-center">{formatearNumero(venta.cantidad)}</td>
                    <td className="py-3 px-2 text-right">${formatearNumero(venta.precioVenta.toFixed(0))}</td>
                    <td className="py-3 px-2 text-right font-bold text-blue-600">
                      ${formatearNumero(venta.ingresoTotal.toFixed(0))}
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-emerald-600">
                      ${formatearNumero(venta.utilidadTotal.toFixed(0))}
                    </td>
                    <td className="py-3 px-2 text-sm">{venta.cliente}</td>
                    <td className="py-3 px-2">
                      <span className="capitalize bg-slate-100 px-2 py-1 rounded-lg text-xs font-medium">
                        {venta.metodoPago}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {ventas.length > 10 && (
            <div className="text-center mt-4">
              <p className="text-slate-500">
                Mostrando las 10 ventas más recientes de {ventas.length} total
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};