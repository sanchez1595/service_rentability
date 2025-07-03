import React, { useState, useEffect } from 'react';
import { Plus, Minus, Save, X, Calculator, User, FileText, DollarSign, Trash2 } from 'lucide-react';
import { Cliente, Servicio, CotizacionActual, ItemCotizacionActual } from '../../types/services';
import { COTIZACION_INICIAL, ITEM_COTIZACION_INICIAL, IVA_PORCENTAJE } from '../../utils/servicesConstants';
import { formatearInput, formatearInputDecimal, formatearMoneda } from '../../utils/formatters';

interface CrearCotizacionProps {
  clientes: Cliente[];
  servicios: Servicio[];
  onCrear: (cotizacion: any, items: any[]) => Promise<void>;
  onCancelar: () => void;
}

export const CrearCotizacion: React.FC<CrearCotizacionProps> = ({
  clientes,
  servicios,
  onCrear,
  onCancelar
}) => {
  const [cotizacion, setCotizacion] = useState<CotizacionActual>(COTIZACION_INICIAL);
  const [guardando, setGuardando] = useState(false);

  // Debug: Log inicial de servicios
  console.log('CrearCotizacion - Servicios recibidos:', servicios);
  console.log('CrearCotizacion - Servicios activos:', servicios.filter(s => s.activo));

  const manejarCambioCotizacion = (campo: keyof CotizacionActual, valor: string | ItemCotizacionActual[]) => {
    setCotizacion(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const agregarItem = () => {
    const nuevoItem = { ...ITEM_COTIZACION_INICIAL };
    setCotizacion(prev => ({
      ...prev,
      items: [...prev.items, nuevoItem]
    }));
  };

  const actualizarItem = (index: number, campo: keyof ItemCotizacionActual, valor: string) => {
    const nuevosItems = [...cotizacion.items];
    nuevosItems[index] = {
      ...nuevosItems[index],
      [campo]: valor
    };

    // Calcular subtotal automáticamente
    if (campo === 'cantidad' || campo === 'precioUnitario' || campo === 'descuentoPorcentaje') {
      const item = nuevosItems[index];
      const cantidad = parseFloat(item.cantidad) || 0;
      const precio = parseFloat(item.precioUnitario) || 0;
      const descuento = parseFloat(item.descuentoPorcentaje) || 0;
      
      const subtotalSinDescuento = cantidad * precio;
      const descuentoValor = subtotalSinDescuento * (descuento / 100);
      const subtotal = subtotalSinDescuento - descuentoValor;
      
      // No actualizamos el subtotal aquí ya que se calcula en tiempo real
    }

    setCotizacion(prev => ({
      ...prev,
      items: nuevosItems
    }));
  };

  const eliminarItem = (index: number) => {
    setCotizacion(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const seleccionarServicio = (index: number, servicioId: string) => {
    console.log('Seleccionando servicio:', { index, servicioId });
    const servicio = servicios.find(s => s.id === servicioId);
    console.log('Servicio encontrado:', servicio);
    
    if (servicio) {
      // Hacer todas las actualizaciones en una sola operación para evitar race conditions
      const nuevosItems = [...cotizacion.items];
      nuevosItems[index] = {
        ...nuevosItems[index],
        servicioId,
        descripcion: servicio.descripcion || servicio.nombre,
        precioUnitario: servicio.precioSugerido
      };

      console.log('Actualizando item:', nuevosItems[index]);

      setCotizacion(prev => ({
        ...prev,
        items: nuevosItems
      }));
    }
  };

  // Calcular totales
  const calcularTotales = () => {
    let subtotal = 0;
    
    cotizacion.items.forEach(item => {
      const cantidad = parseFloat(item.cantidad) || 0;
      const precio = parseFloat(item.precioUnitario) || 0;
      const descuento = parseFloat(item.descuentoPorcentaje) || 0;
      
      const subtotalItem = cantidad * precio;
      const descuentoValor = subtotalItem * (descuento / 100);
      subtotal += subtotalItem - descuentoValor;
    });

    const descuentoGeneral = parseFloat(cotizacion.descuentoPorcentaje) || 0;
    const descuentoValor = subtotal * (descuentoGeneral / 100);
    const subtotalConDescuento = subtotal - descuentoValor;
    
    const iva = subtotalConDescuento * (IVA_PORCENTAJE / 100);
    const total = subtotalConDescuento + iva;

    return {
      subtotal,
      descuentoValor,
      subtotalConDescuento,
      iva,
      total
    };
  };

  const { subtotal, descuentoValor, subtotalConDescuento, iva, total } = calcularTotales();

  const manejarGuardar = async () => {
    if (!cotizacion.clienteId || cotizacion.items.length === 0) {
      alert('Debe seleccionar un cliente y agregar al menos un servicio');
      return;
    }

    // Validar que todos los items tengan servicio seleccionado, cantidad y precio válidos
    const erroresItems: string[] = [];
    cotizacion.items.forEach((item, index) => {
      const servicioValido = !!item.servicioId;
      const cantidadValida = !!item.cantidad && parseFloat(item.cantidad) > 0;
      const precioValido = !!item.precioUnitario && parseFloat(item.precioUnitario) > 0;
      
      if (!servicioValido) erroresItems.push(`Item ${index + 1}: Debe seleccionar un servicio`);
      if (!cantidadValida) erroresItems.push(`Item ${index + 1}: La cantidad debe ser mayor a 0`);
      if (!precioValido) erroresItems.push(`Item ${index + 1}: El precio debe ser mayor a 0`);
    });
    
    if (erroresItems.length > 0) {
      alert('Por favor corrige los siguientes errores:\n\n' + erroresItems.join('\n'));
      return;
    }

    setGuardando(true);
    try {
      const cotizacionData = {
        clienteId: cotizacion.clienteId,
        fecha: cotizacion.fecha,
        fechaValidez: cotizacion.fechaValidez,
        estado: cotizacion.estado,
        subtotal,
        descuentoPorcentaje: parseFloat(cotizacion.descuentoPorcentaje) || 0,
        descuentoValor,
        iva,
        total,
        notas: cotizacion.notas,
        terminosCondiciones: cotizacion.terminosCondiciones
      };

      const itemsData = cotizacion.items.map(item => {
        const cantidad = parseFloat(item.cantidad) || 0;
        const precio = parseFloat(item.precioUnitario) || 0;
        const descuento = parseFloat(item.descuentoPorcentaje) || 0;
        const subtotalItem = cantidad * precio;
        const descuentoItemValor = subtotalItem * (descuento / 100);
        
        return {
          servicioId: item.servicioId,
          descripcion: item.descripcion,
          cantidad,
          precioUnitario: precio,
          descuentoPorcentaje: descuento,
          subtotal: subtotalItem - descuentoItemValor,
          notas: item.notas
        };
      });

      await onCrear(cotizacionData, itemsData);
      alert('Cotización creada exitosamente');
      onCancelar();
    } catch (error) {
      console.error('Error al crear cotización:', error);
      alert('Error al crear la cotización');
    } finally {
      setGuardando(false);
    }
  };

  const clienteSeleccionado = clientes.find(c => c.id === cotizacion.clienteId);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Nueva Cotización</h2>
            <p className="text-slate-600">Crea una cotización profesional para tu cliente</p>
          </div>
        </div>
        
        <button
          onClick={onCancelar}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-8">
        {/* Información básica */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Cliente *
            </label>
            <select
              value={cotizacion.clienteId}
              onChange={(e) => manejarCambioCotizacion('clienteId', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="">Seleccionar cliente...</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.empresa && `- ${cliente.empresa}`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={cotizacion.fecha}
                onChange={(e) => manejarCambioCotizacion('fecha', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Válida hasta
              </label>
              <input
                type="date"
                value={cotizacion.fechaValidez}
                onChange={(e) => manejarCambioCotizacion('fechaValidez', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Información del cliente seleccionado */}
        {clienteSeleccionado && (
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <User className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-800">Información del Cliente</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Nombre:</span>
                <span className="ml-2 font-medium">{clienteSeleccionado.nombre}</span>
              </div>
              {clienteSeleccionado.empresa && (
                <div>
                  <span className="text-slate-500">Empresa:</span>
                  <span className="ml-2 font-medium">{clienteSeleccionado.empresa}</span>
                </div>
              )}
              {clienteSeleccionado.email && (
                <div>
                  <span className="text-slate-500">Email:</span>
                  <span className="ml-2">{clienteSeleccionado.email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items de la cotización */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Servicios</h3>
            <button
              onClick={agregarItem}
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Servicio</span>
            </button>
          </div>

          <div className="space-y-4">
            {cotizacion.items.map((item, index) => {
              console.log(`Renderizando item ${index}:`, item);
              return (
              <div key={index} className="border border-slate-200 rounded-xl p-4">
                <div className="grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Servicio
                      </label>
                      <select
                        value={item.servicioId}
                        onChange={(e) => {
                          console.log('Select onChange - value:', e.target.value);
                          seleccionarServicio(index, e.target.value);
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      >
                        <option value="">Seleccionar servicio...</option>
                        {servicios.filter(s => s.activo).map((servicio) => {
                          console.log('Renderizando opción:', { id: servicio.id, nombre: servicio.nombre, precio: servicio.precioSugerido });
                          return (
                            <option key={servicio.id} value={servicio.id}>
                              {servicio.nombre} - ${formatearMoneda(parseFloat(servicio.precioSugerido))}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Cantidad
                        </label>
                        <input
                          type="text"
                          value={item.cantidad}
                          onChange={(e) => actualizarItem(index, 'cantidad', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Precio Unit.
                        </label>
                        <input
                          type="text"
                          value={formatearInputDecimal(item.precioUnitario)}
                          onChange={(e) => actualizarItem(index, 'precioUnitario', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Desc. %
                        </label>
                        <input
                          type="text"
                          value={item.descuentoPorcentaje}
                          onChange={(e) => actualizarItem(index, 'descuentoPorcentaje', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={item.descripcion}
                      onChange={(e) => actualizarItem(index, 'descripcion', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                      placeholder="Descripción detallada del servicio..."
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Subtotal: <span className="font-semibold text-emerald-600">
                        ${formatearMoneda(
                          (parseFloat(item.cantidad) || 0) * (parseFloat(item.precioUnitario) || 0) * 
                          (1 - (parseFloat(item.descuentoPorcentaje) || 0) / 100)
                        )}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => eliminarItem(index)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              );
            })}

            {cotizacion.items.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-xl">
                <Calculator className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 mb-2">No hay servicios agregados</p>
                <p className="text-slate-500 text-sm">Agrega servicios para crear la cotización</p>
              </div>
            )}
          </div>
        </div>

        {/* Totales */}
        {cotizacion.items.length > 0 && (
          <div className="border-t border-slate-200 pt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Descuento General (%)
                </label>
                <input
                  type="text"
                  value={cotizacion.descuentoPorcentaje}
                  onChange={(e) => manejarCambioCotizacion('descuentoPorcentaje', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="font-semibold text-slate-800 mb-4">Resumen</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-medium">${formatearMoneda(subtotal)}</span>
                  </div>
                  {descuentoValor > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Descuento:</span>
                      <span className="text-red-600">-${formatearMoneda(descuentoValor)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">IVA ({IVA_PORCENTAJE}%):</span>
                    <span className="font-medium">${formatearMoneda(iva)}</span>
                  </div>
                  <div className="border-t border-slate-300 pt-2 flex justify-between">
                    <span className="font-bold text-slate-800">Total:</span>
                    <span className="font-bold text-emerald-600 text-lg">${formatearMoneda(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notas y términos */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Notas
            </label>
            <textarea
              value={cotizacion.notas}
              onChange={(e) => manejarCambioCotizacion('notas', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              placeholder="Notas adicionales sobre la cotización..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Términos y Condiciones
            </label>
            <textarea
              value={cotizacion.terminosCondiciones}
              onChange={(e) => manejarCambioCotizacion('terminosCondiciones', e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              placeholder="Términos y condiciones..."
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-4 pt-6 border-t border-slate-200">
          <button
            onClick={manejarGuardar}
            disabled={guardando || !cotizacion.clienteId || cotizacion.items.length === 0}
            className="flex-1 bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{guardando ? 'Guardando...' : 'Crear Cotización'}</span>
          </button>
          
          <button
            onClick={onCancelar}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};