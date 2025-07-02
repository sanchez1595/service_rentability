import React, { useState } from 'react';
import { Settings, Plus, Trash2, Target, AlertTriangle, DollarSign, X, RefreshCw } from 'lucide-react';
import { Configuracion as ConfiguracionType, Metas, Alertas } from '../../types';
import { formatearInput, formatearMoneda } from '../../utils/formatters';
import { useNumericInput } from '../../hooks/useNumericInput';

interface ConfiguracionProps {
  configuracion: ConfiguracionType;
  metas: Metas;
  alertas: Alertas;
  onActualizarConfiguracion: (config: Partial<ConfiguracionType>) => void;
  onActualizarMetas: (metas: Partial<Metas>) => void;
  onActualizarAlertas: (alertas: Partial<Alertas>) => void;
  onActualizarTodosLosPrecios?: () => Promise<void>;
}

export const ConfiguracionComponent: React.FC<ConfiguracionProps> = ({
  configuracion,
  metas,
  alertas,
  onActualizarConfiguracion,
  onActualizarMetas,
  onActualizarAlertas,
  onActualizarTodosLosPrecios
}) => {
  const { manejarCambioNumerico } = useNumericInput();
  const [actualizandoPrecios, setActualizandoPrecios] = useState(false);

  const actualizarCostoFijo = (key: string, valor: string) => {
    manejarCambioNumerico(valor, (valorLimpio) => {
      const nuevoValor = parseInt(valorLimpio) || 0;
      onActualizarConfiguracion({
        costosFijos: {
          ...configuracion.costosFijos,
          [key]: nuevoValor
        }
      });
    });
  };

  const actualizarHerramienta = (key: string, valor: string) => {
    manejarCambioNumerico(valor, (valorLimpio) => {
      const nuevoValor = parseInt(valorLimpio) || 0;
      onActualizarConfiguracion({
        herramientas: {
          ...configuracion.herramientas,
          [key]: nuevoValor
        }
      });
    });
  };

  const actualizarPorcentaje = (key: string, valor: string) => {
    const nuevoValor = parseFloat(valor) || 0;
    onActualizarConfiguracion({
      porcentajes: {
        ...configuracion.porcentajes,
        [key]: nuevoValor
      }
    });
  };

  const actualizarVentasEstimadas = (valor: string) => {
    manejarCambioNumerico(valor, (valorLimpio) => {
      const nuevoValor = parseInt(valorLimpio) || 1;
      onActualizarConfiguracion({ ventasEstimadas: nuevoValor });
    });
  };

  const agregarCostoFijo = () => {
    const nombre = prompt('Nombre del nuevo costo fijo:');
    if (nombre && nombre.trim()) {
      onActualizarConfiguracion({
        costosFijos: {
          ...configuracion.costosFijos,
          [nombre.toLowerCase().replace(/\s+/g, '_')]: 0
        }
      });
    }
  };

  const eliminarCostoFijo = (key: string) => {
    if (confirm('¿Estás seguro de eliminar este costo fijo?')) {
      const nuevosCostos = { ...configuracion.costosFijos };
      delete (nuevosCostos as any)[key];
      onActualizarConfiguracion({
        costosFijos: nuevosCostos
      });
    }
  };

  const agregarHerramienta = () => {
    const nombre = prompt('Nombre de la nueva herramienta:');
    if (nombre && nombre.trim()) {
      onActualizarConfiguracion({
        herramientas: {
          ...configuracion.herramientas,
          [nombre.toLowerCase().replace(/\s+/g, '_')]: 0
        }
      });
    }
  };

  const eliminarHerramienta = (key: string) => {
    if (confirm('¿Estás seguro de eliminar esta herramienta?')) {
      const nuevasHerramientas = { ...configuracion.herramientas };
      delete (nuevasHerramientas as any)[key];
      onActualizarConfiguracion({
        herramientas: nuevasHerramientas
      });
    }
  };

  const agregarPorcentaje = () => {
    const nombre = prompt('Nombre del nuevo porcentaje operativo:');
    if (nombre && nombre.trim()) {
      onActualizarConfiguracion({
        porcentajes: {
          ...configuracion.porcentajes,
          [nombre.toLowerCase().replace(/\s+/g, '_')]: 0
        }
      });
    }
  };

  const eliminarPorcentaje = (key: string) => {
    if (confirm('¿Estás seguro de eliminar este porcentaje?')) {
      const nuevosPorcentajes = { ...configuracion.porcentajes };
      delete (nuevosPorcentajes as any)[key];
      onActualizarConfiguracion({
        porcentajes: nuevosPorcentajes
      });
    }
  };

  const manejarActualizacionMasiva = async () => {
    if (!onActualizarTodosLosPrecios) return;
    
    const confirmar = confirm(
      '¿Estás seguro de actualizar TODOS los precios de TODOS los productos?\n\n' +
      'Esta acción recalculará los precios de venta de todos los productos ' +
      'basándose en la configuración actual de costos fijos, herramientas y porcentajes operativos.\n\n' +
      'Los nuevos precios se guardarán automáticamente.'
    );
    
    if (!confirmar) return;
    
    try {
      setActualizandoPrecios(true);
      await onActualizarTodosLosPrecios();
      alert('✅ Todos los precios han sido actualizados exitosamente');
    } catch (error) {
      console.error('Error al actualizar precios:', error);
      alert('❌ Error al actualizar los precios. Por favor intenta de nuevo.');
    } finally {
      setActualizandoPrecios(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Ventas Estimadas */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <Target className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Ventas Estimadas Mensuales</h3>
            <p className="text-slate-600">Base para distribuir costos fijos</p>
          </div>
        </div>
        
        <div className="max-w-md">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Productos Vendidos por Mes
          </label>
          <input
            type="text"
            value={formatearInput(configuracion.ventasEstimadas)}
            onChange={(e) => actualizarVentasEstimadas(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="100"
          />
          <p className="text-sm text-slate-500 mt-2">
            Este número se usa para distribuir los costos fijos entre todos los productos
          </p>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-indigo-800">📊 Resumen de Configuración</h4>
            {onActualizarTodosLosPrecios && (
              <button
                onClick={manejarActualizacionMasiva}
                disabled={actualizandoPrecios}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                title="Actualizar todos los precios con la configuración actual"
              >
                <RefreshCw className={`w-4 h-4 ${actualizandoPrecios ? 'animate-spin' : ''}`} />
                <span>{actualizandoPrecios ? 'Actualizando...' : 'Actualizar Todos los Precios'}</span>
              </button>
            )}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Costos Fijos Totales:</span>
              <span className="font-bold text-red-600">
                ${formatearInput(Object.values(configuracion.costosFijos).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0) + 
                   Object.values(configuracion.herramientas).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Porcentajes Operativos:</span>
              <span className="font-bold text-purple-600">
                {Object.values(configuracion.porcentajes).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Ventas Estimadas:</span>
              <span className="font-bold text-blue-600">
                {formatearInput(configuracion.ventasEstimadas || 0)} productos/mes
              </span>
            </div>
            <div className="flex justify-between border-t border-indigo-200 pt-2 mt-3">
              <span className="text-slate-600 font-semibold">Costo fijo por producto:</span>
              <span className="font-bold text-indigo-700">
                ${formatearInput(((Object.values(configuracion.costosFijos).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0) + 
                   Object.values(configuracion.herramientas).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0)) / 
                   (configuracion.ventasEstimadas || 1)).toFixed(0))}
              </span>
            </div>
          </div>
          {onActualizarTodosLosPrecios && (
            <div className="bg-emerald-100 border border-emerald-300 rounded-lg p-3 mt-4">
              <div className="text-sm text-emerald-800">
                <div className="font-semibold mb-1">💡 Actualización Masiva de Precios</div>
                <div>Cuando modifiques costos fijos, herramientas o porcentajes, usa el botón de arriba para actualizar automáticamente todos los precios de tus productos.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Costos Fijos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Costos Fijos Mensuales</h3>
              <p className="text-slate-600">Gastos que pagas cada mes sin importar las ventas</p>
            </div>
          </div>
          <button
            onClick={agregarCostoFijo}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Agregar</span>
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(configuracion.costosFijos).map(([key, value]) => (
            <div key={key} className="bg-slate-50 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <label className="block text-sm font-semibold text-slate-700 capitalize">
                  {key.replace(/_/g, ' ')} ($)
                </label>
                <button
                  onClick={() => eliminarCostoFijo(key)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                  title="Eliminar costo fijo"
                >
                  <X size={16} />
                </button>
              </div>
              <input
                type="text"
                value={formatearInput(value)}
                onChange={(e) => actualizarCostoFijo(key, e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="0"
              />
            </div>
          ))}
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-6">
          <div className="text-sm font-medium text-red-700">Total Costos Fijos Mensuales:</div>
          <div className="text-2xl font-bold text-red-800">
            ${formatearInput(Object.values(configuracion.costosFijos).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0))}
          </div>
        </div>
      </div>

      {/* Herramientas y Servicios */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Herramientas y Servicios</h3>
              <p className="text-slate-600">Software, plataformas y servicios digitales</p>
            </div>
          </div>
          <button
            onClick={agregarHerramienta}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Agregar</span>
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(configuracion.herramientas).map(([key, value]) => (
            <div key={key} className="bg-slate-50 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <label className="block text-sm font-semibold text-slate-700 capitalize">
                  {key.replace(/_/g, ' ')} ($)
                </label>
                <button
                  onClick={() => eliminarHerramienta(key)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                  title="Eliminar herramienta"
                >
                  <X size={16} />
                </button>
              </div>
              <input
                type="text"
                value={formatearInput(value)}
                onChange={(e) => actualizarHerramienta(key, e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="0"
              />
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
          <div className="text-sm font-medium text-blue-700">Total Herramientas y Servicios:</div>
          <div className="text-2xl font-bold text-blue-800">
            ${formatearInput(Object.values(configuracion.herramientas).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0))}
          </div>
        </div>
      </div>

      {/* Porcentajes Operativos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Porcentajes Operativos</h3>
              <p className="text-slate-600">Gastos como porcentaje del costo del producto</p>
            </div>
          </div>
          <button
            onClick={agregarPorcentaje}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Agregar</span>
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(configuracion.porcentajes).map(([key, value]) => (
            <div key={key} className="bg-slate-50 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <label className="block text-sm font-semibold text-slate-700 capitalize">
                  {key.replace(/_/g, ' ')} (%)
                </label>
                <button
                  onClick={() => eliminarPorcentaje(key)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                  title="Eliminar porcentaje"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => actualizarPorcentaje(key, e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0"
                />
                <span className="text-slate-500 text-sm">%</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mt-6">
          <div className="text-sm font-medium text-purple-700">Total Porcentajes Operativos:</div>
          <div className="text-2xl font-bold text-purple-800">
            {Object.values(configuracion.porcentajes).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-teal-50 rounded-xl">
              <Target className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Metas del Negocio</h3>
              <p className="text-slate-600">Define tus objetivos empresariales</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ventas Mensuales Objetivo
              </label>
              <input
                type="text"
                value={formatearInput(metas.ventasMensuales)}
                onChange={(e) => manejarCambioNumerico(e.target.value, (valorLimpio) => {
                  onActualizarMetas({ ventasMensuales: parseInt(valorLimpio) || 0 });
                })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="2,000,000"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Unidades Mensuales Objetivo
              </label>
              <input
                type="text"
                value={formatearInput(metas.unidadesMensuales)}
                onChange={(e) => manejarCambioNumerico(e.target.value, (valorLimpio) => {
                  onActualizarMetas({ unidadesMensuales: parseInt(valorLimpio) || 0 });
                })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Margen Promedio Objetivo (%)
              </label>
              <input
                type="number"
                value={metas.margenPromedio}
                onChange={(e) => onActualizarMetas({ margenPromedio: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="35"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Rotación de Inventario Anual
              </label>
              <input
                type="number"
                value={metas.rotacionInventario}
                onChange={(e) => onActualizarMetas({ rotacionInventario: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="12"
                step="0.1"
              />
            </div>


          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-red-50 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Configuración de Alertas</h3>
              <p className="text-slate-600">Parámetros para el sistema de alertas</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Margen Mínimo de Alerta (%)
              </label>
              <input
                type="number"
                value={alertas.margenMinimo}
                onChange={(e) => onActualizarAlertas({ margenMinimo: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="20"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Stock Mínimo de Alerta
              </label>
              <input
                type="text"
                value={formatearInput(alertas.stockMinimo)}
                onChange={(e) => manejarCambioNumerico(e.target.value, (valorLimpio) => {
                  onActualizarAlertas({ stockMinimo: parseInt(valorLimpio) || 0 });
                })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Días Sin Venta para Alerta
              </label>
              <input
                type="text"
                value={formatearInput(alertas.diasSinVenta)}
                onChange={(e) => manejarCambioNumerico(e.target.value, (valorLimpio) => {
                  onActualizarAlertas({ diasSinVenta: parseInt(valorLimpio) || 0 });
                })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Diferencia de Precio vs Competencia (%)
              </label>
              <input
                type="number"
                value={alertas.diferenciaPrecioCompetencia}
                onChange={(e) => onActualizarAlertas({ diferenciaPrecioCompetencia: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="15"
                step="0.1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};