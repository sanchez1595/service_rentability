import React, { useState } from 'react';
import { FileText, Plus, Edit2, Eye, Check, X, Clock, AlertTriangle, Search, Filter } from 'lucide-react';
import { Cotizacion, Cliente, Servicio } from '../../types/services';
import { ESTADOS_COTIZACION } from '../../utils/servicesConstants';
import { formatearMoneda } from '../../utils/formatters';
import { CrearCotizacion } from './CrearCotizacion';
import { VerCotizacion } from './VerCotizacion';

interface GestionCotizacionesProps {
  cotizaciones: Cotizacion[];
  clientes: Cliente[];
  servicios: Servicio[];
  onCrearCotizacion: (cotizacion: any, items: any[]) => Promise<void>;
  onActualizarCotizacion: (id: string, cotizacion: Partial<Cotizacion>) => Promise<void>;
  onAprobarCotizacion: (id: string) => Promise<void>;
  onRechazarCotizacion: (id: string, motivo: string) => Promise<void>;
}

export const GestionCotizaciones: React.FC<GestionCotizacionesProps> = ({
  cotizaciones,
  clientes,
  servicios,
  onCrearCotizacion,
  onActualizarCotizacion,
  onAprobarCotizacion,
  onRechazarCotizacion
}) => {
  const [vistaActiva, setVistaActiva] = useState<'lista' | 'crear' | 'ver'>('lista');
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState<Cotizacion | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');

  const obtenerColorEstado = (estado: string) => {
    const estadoConfig = ESTADOS_COTIZACION.find(e => e.value === estado);
    return estadoConfig?.color || 'gray';
  };

  const obtenerLabelEstado = (estado: string) => {
    const estadoConfig = ESTADOS_COTIZACION.find(e => e.value === estado);
    return estadoConfig?.label || estado;
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calcularDiasVencimiento = (fechaValidez: string) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaValidez);
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const manejarVerCotizacion = (cotizacion: Cotizacion) => {
    setCotizacionSeleccionada(cotizacion);
    setVistaActiva('ver');
  };

  const manejarAprobar = async (id: string) => {
    if (confirm('¿Confirmas la aprobación de esta cotización? Se creará automáticamente un proyecto.')) {
      try {
        await onAprobarCotizacion(id);
        alert('Cotización aprobada y proyecto creado exitosamente');
      } catch (error) {
        console.error('Error al aprobar cotización:', error);
        alert('Error al aprobar la cotización');
      }
    }
  };

  const manejarRechazar = async (id: string) => {
    const motivo = prompt('Motivo del rechazo (opcional):');
    if (motivo !== null) {
      try {
        await onRechazarCotizacion(id, motivo || 'Sin motivo especificado');
      } catch (error) {
        console.error('Error al rechazar cotización:', error);
        alert('Error al rechazar la cotización');
      }
    }
  };

  // Filtrar cotizaciones
  const cotizacionesFiltradas = cotizaciones.filter(cotizacion => {
    const cumpleFiltroEstado = filtroEstado === 'todos' || cotizacion.estado === filtroEstado;
    const cumpleBusqueda = busqueda === '' || 
      cotizacion.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
      cotizacion.clienteNombre?.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleFiltroEstado && cumpleBusqueda;
  });

  // Métricas rápidas
  const metricas = {
    total: cotizaciones.length,
    borradores: cotizaciones.filter(c => c.estado === 'borrador').length,
    enviadas: cotizaciones.filter(c => c.estado === 'enviada').length,
    aprobadas: cotizaciones.filter(c => c.estado === 'aprobada').length,
    valorTotal: cotizaciones.reduce((sum, c) => sum + (c.total || 0), 0),
    valorAprobado: cotizaciones.filter(c => c.estado === 'aprobada').reduce((sum, c) => sum + (c.total || 0), 0)
  };

  if (vistaActiva === 'crear') {
    return (
      <CrearCotizacion
        clientes={clientes}
        servicios={servicios}
        onCrear={onCrearCotizacion}
        onCancelar={() => setVistaActiva('lista')}
      />
    );
  }

  if (vistaActiva === 'ver' && cotizacionSeleccionada) {
    return (
      <VerCotizacion
        cotizacion={cotizacionSeleccionada}
        clientes={clientes}
        servicios={servicios}
        onVolver={() => {
          setVistaActiva('lista');
          setCotizacionSeleccionada(null);
        }}
        onAprobar={manejarAprobar}
        onRechazar={manejarRechazar}
        onActualizar={onActualizarCotizacion}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header con métricas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Cotizaciones</p>
              <p className="text-2xl font-bold text-slate-800">{metricas.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Enviadas</p>
              <p className="text-2xl font-bold text-blue-600">{metricas.enviadas}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Aprobadas</p>
              <p className="text-2xl font-bold text-emerald-600">{metricas.aprobadas}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Valor Aprobado</p>
              <p className="text-2xl font-bold text-emerald-600">{formatearMoneda(metricas.valorAprobado)}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Gestión de Cotizaciones</h2>
              <p className="text-slate-600">{cotizacionesFiltradas.length} cotizaciones</p>
            </div>
          </div>

          <button
            onClick={() => setVistaActiva('crear')}
            className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Cotización</span>
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Buscar por número o cliente..."
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
            >
              <option value="todos">Todos los estados</option>
              {ESTADOS_COTIZACION.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de cotizaciones */}
        {cotizacionesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 mb-2">
              {busqueda || filtroEstado !== 'todos' ? 'No se encontraron cotizaciones' : 'No hay cotizaciones registradas'}
            </p>
            <p className="text-slate-500 text-sm">
              {busqueda || filtroEstado !== 'todos' ? 'Intenta con otros filtros' : 'Crea tu primera cotización para comenzar'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cotizacionesFiltradas.map((cotizacion) => {
              const diasVencimiento = calcularDiasVencimiento(cotizacion.fechaValidez);
              const estaVencida = diasVencimiento < 0 && cotizacion.estado === 'enviada';
              
              return (
                <div
                  key={cotizacion.id}
                  className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="font-bold text-slate-800 text-lg">{cotizacion.numero}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${obtenerColorEstado(cotizacion.estado)}-100 text-${obtenerColorEstado(cotizacion.estado)}-700`}>
                          {obtenerLabelEstado(cotizacion.estado)}
                        </span>
                        {estaVencida && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Vencida</span>
                          </span>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Cliente</p>
                          <p className="font-semibold text-slate-800">{cotizacion.clienteNombre}</p>
                        </div>
                        
                        <div>
                          <p className="text-slate-500">Fecha</p>
                          <p className="text-slate-700">{formatearFecha(cotizacion.fecha)}</p>
                        </div>
                        
                        <div>
                          <p className="text-slate-500">Validez</p>
                          <p className={`text-slate-700 ${estaVencida ? 'text-red-600 font-semibold' : ''}`}>
                            {formatearFecha(cotizacion.fechaValidez)}
                            {cotizacion.estado === 'enviada' && (
                              <span className={`ml-1 text-xs ${diasVencimiento <= 3 ? 'text-red-600' : 'text-slate-500'}`}>
                                ({diasVencimiento > 0 ? `${diasVencimiento} días` : 'Vencida'})
                              </span>
                            )}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-slate-500">Valor Total</p>
                          <p className="font-bold text-emerald-600 text-lg">{formatearMoneda(cotizacion.total)}</p>
                        </div>
                      </div>

                      {cotizacion.notas && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                          <p className="text-slate-600 text-sm">{cotizacion.notas}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-6">
                      <button
                        onClick={() => manejarVerCotizacion(cotizacion)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Ver cotización"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {cotizacion.estado === 'enviada' && (
                        <>
                          <button
                            onClick={() => manejarAprobar(cotizacion.id)}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Aprobar cotización"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => manejarRechazar(cotizacion.id)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Rechazar cotización"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};