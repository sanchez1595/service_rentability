import React, { useState } from 'react';
import { Briefcase, Plus, Eye, Play, Pause, CheckCircle, X, Calendar, DollarSign, TrendingUp, AlertTriangle, Filter, Search } from 'lucide-react';
import { Proyecto, Cliente, PlanPago, Pago, Desembolso } from '../../types/services';
import { ESTADOS_PROYECTO } from '../../utils/servicesConstants';
import { formatearMoneda } from '../../utils/formatters';
import { VerProyecto } from './VerProyecto';

interface GestionProyectosProps {
  proyectos: Proyecto[];
  clientes: Cliente[];
  planesPago: PlanPago[];
  pagos: Pago[];
  desembolsos: Desembolso[];
  onActualizarProyecto: (id: string, proyecto: Partial<Proyecto>) => Promise<void>;
  onCompletarProyecto: (id: string) => Promise<void>;
  onCrearPlanPago: (plan: Omit<PlanPago, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onRegistrarPago: (pago: Omit<Pago, 'id' | 'created_at'>) => Promise<void>;
  onAgregarDesembolso: (desembolso: Omit<Desembolso, 'id' | 'created_at'>) => Promise<void>;
}

export const GestionProyectos: React.FC<GestionProyectosProps> = ({
  proyectos,
  clientes,
  planesPago,
  pagos,
  desembolsos,
  onActualizarProyecto,
  onCompletarProyecto,
  onCrearPlanPago,
  onRegistrarPago,
  onAgregarDesembolso
}) => {
  const [vistaActiva, setVistaActiva] = useState<'lista' | 'ver'>('lista');
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');

  const obtenerColorEstado = (estado: string) => {
    const estadoConfig = ESTADOS_PROYECTO.find(e => e.value === estado);
    return estadoConfig?.color || 'gray';
  };

  const obtenerLabelEstado = (estado: string) => {
    const estadoConfig = ESTADOS_PROYECTO.find(e => e.value === estado);
    return estadoConfig?.label || estado;
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calcularDiasRestantes = (fechaFin: string) => {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diffTime = fin.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calcularEstadisticasProyecto = (proyecto: Proyecto) => {
    const planesProyecto = planesPago.filter(p => p.proyectoId === proyecto.id);
    const pagosProyecto = pagos.filter(p => p.proyectoId === proyecto.id);
    const desembolsosProyecto = desembolsos.filter(d => d.proyectoId === proyecto.id && d.estado === 'pagado');

    const totalPlanificado = planesProyecto.reduce((sum, p) => sum + p.monto, 0);
    const totalRecibido = pagosProyecto.reduce((sum, p) => sum + p.monto, 0);
    const totalGastado = desembolsosProyecto.reduce((sum, d) => sum + d.monto, 0);
    const pendienteCobro = totalPlanificado - totalRecibido;
    const rentabilidadActual = totalRecibido - totalGastado;

    const planesPendientes = planesProyecto.filter(p => p.estado === 'pendiente').length;
    const planesVencidos = planesProyecto.filter(p => {
      const hoy = new Date().toISOString().split('T')[0];
      return p.estado === 'pendiente' && p.fechaVencimiento < hoy;
    }).length;

    return {
      totalPlanificado,
      totalRecibido,
      totalGastado,
      pendienteCobro,
      rentabilidadActual,
      planesPendientes,
      planesVencidos,
      porcentajeCobrado: totalPlanificado > 0 ? (totalRecibido / totalPlanificado) * 100 : 0
    };
  };

  const manejarVerProyecto = (proyecto: Proyecto) => {
    setProyectoSeleccionado(proyecto);
    setVistaActiva('ver');
  };

  const manejarCambiarEstado = async (id: string, nuevoEstado: string) => {
    try {
      await onActualizarProyecto(id, { estado: nuevoEstado as any });
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del proyecto');
    }
  };

  const manejarActualizarProgreso = async (id: string, progreso: number) => {
    try {
      await onActualizarProyecto(id, { progreso });
    } catch (error) {
      console.error('Error al actualizar progreso:', error);
      alert('Error al actualizar el progreso');
    }
  };

  const manejarCompletar = async (id: string) => {
    if (confirm('¿Confirmas que el proyecto está completado?')) {
      try {
        await onCompletarProyecto(id);
      } catch (error) {
        console.error('Error al completar proyecto:', error);
        alert('Error al completar el proyecto');
      }
    }
  };

  // Filtrar proyectos
  const proyectosFiltrados = proyectos.filter(proyecto => {
    const cumpleFiltroEstado = filtroEstado === 'todos' || proyecto.estado === filtroEstado;
    const cumpleBusqueda = busqueda === '' || 
      proyecto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      proyecto.clienteNombre?.toLowerCase().includes(busqueda.toLowerCase());
    
    return cumpleFiltroEstado && cumpleBusqueda;
  });

  // Métricas generales
  const metricas = {
    total: proyectos.length,
    activos: proyectos.filter(p => p.estado === 'activo').length,
    completados: proyectos.filter(p => p.estado === 'completado').length,
    valorTotal: proyectos.reduce((sum, p) => sum + (p.valorTotal || 0), 0),
    rentabilidadTotal: proyectos.reduce((sum, p) => {
      const stats = calcularEstadisticasProyecto(p);
      return sum + stats.rentabilidadActual;
    }, 0)
  };

  if (vistaActiva === 'ver' && proyectoSeleccionado) {
    return (
      <VerProyecto
        proyecto={proyectoSeleccionado}
        clientes={clientes}
        planesPago={planesPago.filter(p => p.proyectoId === proyectoSeleccionado.id)}
        pagos={pagos.filter(p => p.proyectoId === proyectoSeleccionado.id)}
        desembolsos={desembolsos.filter(d => d.proyectoId === proyectoSeleccionado.id)}
        onVolver={() => {
          setVistaActiva('lista');
          setProyectoSeleccionado(null);
        }}
        onActualizarProyecto={onActualizarProyecto}
        onCompletarProyecto={onCompletarProyecto}
        onCrearPlanPago={onCrearPlanPago}
        onRegistrarPago={onRegistrarPago}
        onAgregarDesembolso={onAgregarDesembolso}
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
              <p className="text-slate-600 text-sm">Total Proyectos</p>
              <p className="text-2xl font-bold text-slate-800">{metricas.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Activos</p>
              <p className="text-2xl font-bold text-emerald-600">{metricas.activos}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Completados</p>
              <p className="text-2xl font-bold text-blue-600">{metricas.completados}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Rentabilidad Total</p>
              <p className={`text-2xl font-bold ${metricas.rentabilidadTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatearMoneda(Math.abs(metricas.rentabilidadTotal))}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${metricas.rentabilidadTotal >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <TrendingUp className={`w-6 h-6 ${metricas.rentabilidadTotal >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de proyectos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Gestión de Proyectos</h2>
              <p className="text-slate-600">{proyectosFiltrados.length} proyectos</p>
            </div>
          </div>
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
              placeholder="Buscar por nombre o cliente..."
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
              {ESTADOS_PROYECTO.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de proyectos */}
        {proyectosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 mb-2">
              {busqueda || filtroEstado !== 'todos' ? 'No se encontraron proyectos' : 'No hay proyectos registrados'}
            </p>
            <p className="text-slate-500 text-sm">
              {busqueda || filtroEstado !== 'todos' ? 'Intenta con otros filtros' : 'Los proyectos se crean automáticamente al aprobar cotizaciones'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {proyectosFiltrados.map((proyecto) => {
              const estadisticas = calcularEstadisticasProyecto(proyecto);
              const diasRestantes = calcularDiasRestantes(proyecto.fechaFinEstimada);
              const estaRetrasado = diasRestantes < 0 && proyecto.estado === 'activo';
              
              return (
                <div
                  key={proyecto.id}
                  className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-bold text-slate-800 text-lg">{proyecto.nombre}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${obtenerColorEstado(proyecto.estado)}-100 text-${obtenerColorEstado(proyecto.estado)}-700`}>
                          {obtenerLabelEstado(proyecto.estado)}
                        </span>
                        {estaRetrasado && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Retrasado</span>
                          </span>
                        )}
                        {estadisticas.planesVencidos > 0 && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            {estadisticas.planesVencidos} pago{estadisticas.planesVencidos > 1 ? 's' : ''} vencido{estadisticas.planesVencidos > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <p className="text-slate-600 mb-3">Cliente: <span className="font-medium">{proyecto.clienteNombre}</span></p>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Progreso</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-emerald-500 h-2 rounded-full transition-all"
                                style={{ width: `${proyecto.progreso}%` }}
                              />
                            </div>
                            <span className="font-medium text-slate-700">{proyecto.progreso}%</span>
                          </div>
                        </div>

                        <div>
                          <p className="text-slate-500">Fecha Límite</p>
                          <p className={`font-medium ${estaRetrasado ? 'text-red-600' : 'text-slate-700'}`}>
                            {formatearFecha(proyecto.fechaFinEstimada)}
                            <span className={`ml-1 text-xs ${diasRestantes <= 7 && diasRestantes > 0 ? 'text-orange-600' : estaRetrasado ? 'text-red-600' : 'text-slate-500'}`}>
                              ({diasRestantes > 0 ? `${diasRestantes} días` : estaRetrasado ? `${Math.abs(diasRestantes)} días de retraso` : 'Completado'})
                            </span>
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-500">Valor / Cobrado</p>
                          <p className="font-medium text-slate-700">
                            {formatearMoneda(proyecto.valorTotal)} / {formatearMoneda(estadisticas.totalRecibido)}
                          </p>
                          <div className="w-full bg-slate-200 rounded-full h-1 mt-1">
                            <div 
                              className="bg-emerald-500 h-1 rounded-full"
                              style={{ width: `${Math.min(estadisticas.porcentajeCobrado, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <p className="text-slate-500">Rentabilidad</p>
                          <p className={`font-bold ${estadisticas.rentabilidadActual >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {estadisticas.rentabilidadActual >= 0 ? '+' : ''}{formatearMoneda(estadisticas.rentabilidadActual)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-6">
                      <button
                        onClick={() => manejarVerProyecto(proyecto)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Ver proyecto"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {proyecto.estado === 'activo' && (
                        <>
                          <button
                            onClick={() => manejarCambiarEstado(proyecto.id, 'pausado')}
                            className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Pausar proyecto"
                          >
                            <Pause className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => manejarCompletar(proyecto.id)}
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Completar proyecto"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {proyecto.estado === 'pausado' && (
                        <button
                          onClick={() => manejarCambiarEstado(proyecto.id, 'activo')}
                          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Reanudar proyecto"
                        >
                          <Play className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Alertas importantes */}
                  {(estadisticas.planesPendientes > 0 || estaRetrasado) && (
                    <div className="border-t border-slate-200 pt-4 mt-4">
                      <div className="flex items-center space-x-4 text-sm">
                        {estadisticas.planesPendientes > 0 && (
                          <div className="flex items-center space-x-1 text-orange-600">
                            <DollarSign className="w-4 h-4" />
                            <span>{estadisticas.planesPendientes} pago{estadisticas.planesPendientes > 1 ? 's' : ''} pendiente{estadisticas.planesPendientes > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        
                        {estaRetrasado && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <Calendar className="w-4 h-4" />
                            <span>Proyecto retrasado</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};