import React from 'react';
import { Edit2, Trash2, Save, X, Calculator, Plus, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { Servicio, ServicioActual } from '../../types/services';
import { Configuracion } from '../../types';
import { CATEGORIAS_SERVICIO, TIPOS_SERVICIO } from '../../utils/servicesConstants';
import { formatearInput, formatearMoneda } from '../../utils/formatters';
import { calcularPrecioServicio, formatearDuracion } from '../../utils/servicesConstants';

interface GestionServiciosProps {
  servicios: Servicio[];
  servicioActual: ServicioActual;
  editandoId: string | null;
  onCambioInput: (campo: keyof ServicioActual, valor: string) => void;
  onCalcularPrecios: () => void;
  onAgregarServicio: () => void;
  onEditarServicio: (id: string) => void;
  onGuardarEdicion: () => void;
  onEliminarServicio: (id: string) => void;
  onCancelarEdicion: () => void;
  configuracion: Configuracion;
}

export const GestionServicios: React.FC<GestionServiciosProps> = ({
  servicios,
  servicioActual,
  editandoId,
  onCambioInput,
  onCalcularPrecios,
  onAgregarServicio,
  onEditarServicio,
  onGuardarEdicion,
  onEliminarServicio,
  onCancelarEdicion,
  configuracion
}) => {
  const formatearNumero = (numero: number | string | undefined | null) => {
    if (numero === null || numero === undefined || numero === '') {
      return '0';
    }
    
    const num = typeof numero === 'string' ? parseFloat(numero.replace(/[^\d.-]/g, '')) : numero;
    
    if (isNaN(num)) {
      return '0';
    }
    
    return new Intl.NumberFormat('es-CO').format(num);
  };

  const formatearPrecio = (precio: string | number | undefined | null) => {
    if (precio === null || precio === undefined || precio === 0 || precio === '0') {
      return 'No definido';
    }
    return `$${formatearNumero(precio)}`;
  };

  const mostrarPrecioServicio = (servicio: any) => {
    if (servicio.tipoServicio === 'por_horas') {
      const precio = formatearPrecio(servicio.precioPorHora);
      return precio === 'No definido' ? 'No definido' : `${precio}/hora`;
    } else {
      return formatearPrecio(servicio.precioSugerido);
    }
  };

  const obtenerColorCategoria = (categoria: string) => {
    const cat = CATEGORIAS_SERVICIO.find(c => c.value === categoria);
    return cat?.color || 'gray';
  };

  const obtenerIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'recurrente':
        return '🔄';
      case 'por_horas':
        return '⏱️';
      default:
        return '📋';
    }
  };

  // Calcular precio automáticamente cuando cambian los valores
  React.useEffect(() => {
    if (servicioActual.costoBase || servicioActual.margenDeseado) {
      const costoBase = parseFloat(servicioActual.costoBase) || 0;
      const gastosFijos = parseFloat(servicioActual.gastosFijos) || 0;
      const margen = parseFloat(servicioActual.margenDeseado) || 35;
      
      const precioCalculado = calcularPrecioServicio(costoBase, gastosFijos, margen, configuracion);
      
      if (precioCalculado !== parseFloat(servicioActual.precioSugerido)) {
        onCambioInput('precioSugerido', precioCalculado.toString());
      }
    }
  }, [servicioActual.costoBase, servicioActual.gastosFijos, servicioActual.margenDeseado, configuracion]);

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {editandoId ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h2>
            <p className="text-slate-600">Configura servicios con precios automáticos</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Información básica */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nombre del Servicio
              </label>
              <input
                type="text"
                value={servicioActual.nombre}
                onChange={(e) => onCambioInput('nombre', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ej: Desarrollo Web Básico"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Categoría
              </label>
              <select
                value={servicioActual.categoria}
                onChange={(e) => onCambioInput('categoria', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {CATEGORIAS_SERVICIO.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Descripción
            </label>
            <textarea
              value={servicioActual.descripcion}
              onChange={(e) => onCambioInput('descripcion', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Describe brevemente el servicio y qué incluye..."
            />
          </div>

          {/* Configuración del servicio */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-purple-800 mb-3">Configuración del Servicio</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  Tipo de Servicio
                </label>
                <select
                  value={servicioActual.tipoServicio}
                  onChange={(e) => onCambioInput('tipoServicio', e.target.value)}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                >
                  {TIPOS_SERVICIO.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  {servicioActual.tipoServicio === 'por_horas' ? 'Precio por Hora' : 'Duración (días)'}
                </label>
                {servicioActual.tipoServicio === 'por_horas' ? (
                  <input
                    type="text"
                    value={formatearInput(servicioActual.precioPorHora)}
                    onChange={(e) => onCambioInput('precioPorHora', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    placeholder="120000"
                  />
                ) : (
                  <input
                    type="text"
                    value={servicioActual.duracionEstimada}
                    onChange={(e) => onCambioInput('duracionEstimada', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    placeholder="15"
                  />
                )}
                <p className="text-xs text-purple-600 mt-1">
                  {servicioActual.tipoServicio === 'por_horas' 
                    ? 'Tarifa por hora de trabajo'
                    : `Duración estimada: ${formatearDuracion(parseInt(servicioActual.duracionEstimada) || 0)}`
                  }
                </p>
              </div>
            </div>

            {servicioActual.tipoServicio !== 'por_horas' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  Recursos Necesarios
                </label>
                <textarea
                  value={servicioActual.recursosNecesarios}
                  onChange={(e) => onCambioInput('recursosNecesarios', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white resize-none"
                  placeholder="Ej: 1 Desarrollador senior, 1 Diseñador, Hosting, Dominio..."
                />
              </div>
            )}
          </div>

          {/* Cálculo de precios */}
          {servicioActual.tipoServicio !== 'por_horas' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-emerald-800 mb-3">Cálculo de Precios</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Costo Base
                  </label>
                  <input
                    type="text"
                    value={formatearInput(servicioActual.costoBase)}
                    onChange={(e) => onCambioInput('costoBase', e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    placeholder="800000"
                  />
                  <p className="text-xs text-emerald-600 mt-1">Costo directo del servicio</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Gastos Fijos Asignados
                  </label>
                  <input
                    type="text"
                    value={formatearInput(servicioActual.gastosFijos)}
                    onChange={(e) => onCambioInput('gastosFijos', e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    placeholder="150000"
                  />
                  <p className="text-xs text-emerald-600 mt-1">Proporción de gastos fijos</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Margen Deseado (%)
                  </label>
                  <input
                    type="text"
                    value={servicioActual.margenDeseado}
                    onChange={(e) => onCambioInput('margenDeseado', e.target.value)}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    placeholder="35"
                  />
                  <p className="text-xs text-emerald-600 mt-1">Margen de ganancia deseado</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-700 mb-2">
                    Precio Sugerido
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formatearInput(servicioActual.precioSugerido)}
                      onChange={(e) => onCambioInput('precioSugerido', e.target.value)}
                      className="w-full px-3 py-2 pr-8 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-emerald-100 font-semibold text-emerald-800"
                      readOnly
                    />
                    <DollarSign className="absolute right-2 top-2.5 w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">Calculado automáticamente</p>
                </div>
              </div>
            </div>
          )}

          {/* Estado del servicio */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="servicioActivo"
                checked={servicioActual.activo}
                onChange={(e) => onCambioInput('activo', e.target.checked.toString())}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="servicioActivo" className="text-sm font-medium text-slate-700">
                Servicio activo y disponible para cotizar
              </label>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3 pt-4 border-t border-slate-200">
            {editandoId ? (
              <>
                <button
                  onClick={onGuardarEdicion}
                  className="flex-1 bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Guardar Cambios</span>
                </button>
                <button
                  onClick={onCancelarEdicion}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
              </>
            ) : (
              <button
                onClick={onAgregarServicio}
                disabled={!servicioActual.nombre || (!servicioActual.costoBase && servicioActual.tipoServicio !== 'por_horas')}
                className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Servicio</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de servicios */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Catálogo de Servicios</h2>
              <p className="text-slate-600">{servicios.length} servicios registrados</p>
            </div>
          </div>
        </div>

        {servicios.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 mb-2">No hay servicios registrados</p>
            <p className="text-slate-500 text-sm">Agrega tu primer servicio para comenzar</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {servicios.map((servicio) => (
              <div
                key={servicio.id}
                className={`border rounded-xl p-4 transition-all hover:shadow-md ${
                  editandoId === servicio.id 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg">{obtenerIconoTipo(servicio.tipoServicio)}</span>
                      <h3 className="font-semibold text-slate-800">{servicio.nombre}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${obtenerColorCategoria(servicio.categoria)}-100 text-${obtenerColorCategoria(servicio.categoria)}-700`}>
                        {CATEGORIAS_SERVICIO.find(c => c.value === servicio.categoria)?.label}
                      </span>
                      {!servicio.activo && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Inactivo
                        </span>
                      )}
                    </div>

                    {servicio.descripcion && (
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">{servicio.descripcion}</p>
                    )}

                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <DollarSign className={`w-4 h-4 ${
                          mostrarPrecioServicio(servicio) === 'No definido' 
                            ? 'text-slate-400' 
                            : 'text-emerald-600'
                        }`} />
                        <span className={`font-semibold ${
                          mostrarPrecioServicio(servicio) === 'No definido' 
                            ? 'text-slate-500' 
                            : 'text-emerald-700'
                        }`}>
                          {mostrarPrecioServicio(servicio)}
                        </span>
                      </div>

                      {servicio.tipoServicio !== 'por_horas' && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-slate-600">
                            {formatearDuracion(servicio.duracionEstimada)}
                          </span>
                        </div>
                      )}

                      <div className="text-slate-500">
                        {servicio.vecesCotizado} cotizado{servicio.vecesCotizado !== 1 ? 's' : ''} • {servicio.vecesVendido} vendido{servicio.vecesVendido !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => onEditarServicio(servicio.id)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar servicio"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEliminarServicio(servicio.id)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar servicio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};