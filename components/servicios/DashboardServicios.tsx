import React from 'react';
import { FileText, Users, Briefcase, DollarSign, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, CreditCard, Receipt, Calendar, Award } from 'lucide-react';
import { 
  Cliente, 
  Servicio, 
  Cotizacion, 
  Proyecto, 
  PlanPago, 
  Pago, 
  Desembolso, 
  MetricasServicio 
} from '../../types/services';
import { Configuracion, Metas, Alertas } from '../../types';
import { formatearMoneda } from '../../utils/formatters';

interface DashboardServiciosProps {
  clientes: Cliente[];
  servicios: Servicio[];
  cotizaciones: Cotizacion[];
  proyectos: Proyecto[];
  planesPago: PlanPago[];
  pagos: Pago[];
  desembolsos: Desembolso[];
  metricas: MetricasServicio | null;
  configuracion: Configuracion;
  metas: Metas;
  alertas: Alertas;
}

export const DashboardServicios: React.FC<DashboardServiciosProps> = ({
  clientes,
  servicios,
  cotizaciones,
  proyectos,
  planesPago,
  pagos,
  desembolsos,
  metricas,
  configuracion,
  metas,
  alertas
}) => {
  if (!metricas) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Calcular métricas adicionales
  const serviciosActivos = servicios.filter(s => s.activo).length;
  const proyectosActivos = proyectos.filter(p => p.estado === 'activo').length;
  const cotizacionesPendientes = cotizaciones.filter(c => c.estado === 'enviada').length;
  
  // Calcular alertas
  const hoy = new Date().toISOString().split('T')[0];
  const pagosVencidos = planesPago.filter(p => p.estado === 'pendiente' && p.fechaVencimiento < hoy).length;
  const proyectosRetrasados = proyectos.filter(p => {
    if (p.estado !== 'activo') return false;
    const diasRestantes = Math.ceil((new Date(p.fechaFinEstimada).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes < 0;
  }).length;

  // Top servicios más cotizados
  const topServicios = [...servicios]
    .sort((a, b) => (b.vecesCotizado || 0) - (a.vecesCotizado || 0))
    .slice(0, 5);

  // Últimas cotizaciones
  const ultimasCotizaciones = [...cotizaciones]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);

  // Proyectos que necesitan atención
  const proyectosAtencion = proyectos.filter(p => {
    if (p.estado !== 'activo') return false;
    const diasRestantes = Math.ceil((new Date(p.fechaFinEstimada).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const planesVencidos = planesPago.filter(plan => 
      plan.proyectoId === p.id && 
      plan.estado === 'pendiente' && 
      plan.fechaVencimiento < hoy
    ).length;
    
    return diasRestantes <= 7 || planesVencidos > 0;
  }).slice(0, 5);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'borrador': return 'bg-gray-100 text-gray-700';
      case 'enviada': return 'bg-blue-100 text-blue-700';
      case 'aprobada': return 'bg-emerald-100 text-emerald-700';
      case 'rechazada': return 'bg-red-100 text-red-700';
      case 'vencida': return 'bg-orange-100 text-orange-700';
      case 'activo': return 'bg-emerald-100 text-emerald-700';
      case 'pausado': return 'bg-yellow-100 text-yellow-700';
      case 'completado': return 'bg-blue-100 text-blue-700';
      case 'cancelado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Métricas principales */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-emerald-600">{formatearMoneda(metricas.ingresosMes)}</p>
              <p className="text-sm text-slate-500">
                Utilidad: <span className="font-medium text-emerald-600">{formatearMoneda(metricas.utilidadMes)}</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Cotizaciones Enviadas</p>
              <p className="text-2xl font-bold text-blue-600">{metricas.cotizacionesEnviadas}</p>
              <p className="text-sm text-slate-500">
                Tasa conversión: <span className="font-medium">{metricas.tasaConversion.toFixed(1)}%</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Proyectos Activos</p>
              <p className="text-2xl font-bold text-indigo-600">{proyectosActivos}</p>
              <p className="text-sm text-slate-500">
                Total proyectos: <span className="font-medium">{proyectos.length}</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Flujo de Efectivo</p>
              <p className={`text-2xl font-bold ${metricas.flujoEfectivo >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {metricas.flujoEfectivo >= 0 ? '+' : ''}{formatearMoneda(metricas.flujoEfectivo)}
              </p>
              <p className="text-sm text-slate-500">
                Gastos: <span className="font-medium text-red-600">{formatearMoneda(metricas.gastosMes)}</span>
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${metricas.flujoEfectivo >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <TrendingUp className={`w-6 h-6 ${metricas.flujoEfectivo >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Alertas importantes */}
      {(metricas.pagosVencidos > 0 || proyectosRetrasados > 0 || cotizacionesPendientes > 0) && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-red-50 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Alertas y Acciones Requeridas</h2>
              <p className="text-slate-600">Elementos que requieren tu atención</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {metricas.pagosVencidos > 0 && (
              <div className="border border-red-200 bg-red-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CreditCard className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">Pagos Vencidos</h3>
                </div>
                <p className="text-red-700">
                  {metricas.pagosVencidos} pago{metricas.pagosVencidos > 1 ? 's' : ''} vencido{metricas.pagosVencidos > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-red-600 mt-1">Requiere seguimiento inmediato</p>
              </div>
            )}

            {proyectosRetrasados > 0 && (
              <div className="border border-orange-200 bg-orange-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-orange-800">Proyectos Retrasados</h3>
                </div>
                <p className="text-orange-700">
                  {proyectosRetrasados} proyecto{proyectosRetrasados > 1 ? 's' : ''} retrasado{proyectosRetrasados > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-orange-600 mt-1">Revisar cronograma</p>
              </div>
            )}

            {cotizacionesPendientes > 0 && (
              <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Cotizaciones Pendientes</h3>
                </div>
                <p className="text-blue-700">
                  {cotizacionesPendientes} cotización{cotizacionesPendientes > 1 ? 'es' : ''} pendiente{cotizacionesPendientes > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-blue-600 mt-1">Esperando respuesta del cliente</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top servicios */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Servicios Más Cotizados</h2>
              <p className="text-slate-600">Top 5 servicios por demanda</p>
            </div>
          </div>

          <div className="space-y-4">
            {topServicios.map((servicio, index) => (
              <div key={servicio.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{servicio.nombre}</p>
                    <p className="text-sm text-slate-600">{formatearMoneda(parseFloat(servicio.precioSugerido))}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">{servicio.vecesCotizado || 0}</p>
                  <p className="text-xs text-slate-500">cotizaciones</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Últimas cotizaciones */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Últimas Cotizaciones</h2>
              <p className="text-slate-600">Actividad reciente</p>
            </div>
          </div>

          <div className="space-y-4">
            {ultimasCotizaciones.map((cotizacion) => (
              <div key={cotizacion.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-slate-800">{cotizacion.numero}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${obtenerColorEstado(cotizacion.estado)}`}>
                      {cotizacion.estado}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{cotizacion.clienteNombre}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">{formatearMoneda(cotizacion.total)}</p>
                  <p className="text-xs text-slate-500">{formatearFecha(cotizacion.fecha)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Proyectos que requieren atención */}
      {proyectosAtencion.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Briefcase className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Proyectos que Requieren Atención</h2>
              <p className="text-slate-600">Proyectos con fechas próximas o pagos pendientes</p>
            </div>
          </div>

          <div className="space-y-4">
            {proyectosAtencion.map((proyecto) => {
              const diasRestantes = Math.ceil((new Date(proyecto.fechaFinEstimada).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              const planesVencidos = planesPago.filter(plan => 
                plan.proyectoId === proyecto.id && 
                plan.estado === 'pendiente' && 
                plan.fechaVencimiento < hoy
              ).length;

              return (
                <div key={proyecto.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-slate-800">{proyecto.nombre}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${obtenerColorEstado(proyecto.estado)}`}>
                          {proyecto.estado}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{proyecto.clienteNombre}</p>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        {diasRestantes <= 0 && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <Calendar className="w-4 h-4" />
                            <span>Retrasado {Math.abs(diasRestantes)} día{Math.abs(diasRestantes) > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {diasRestantes > 0 && diasRestantes <= 7 && (
                          <div className="flex items-center space-x-1 text-orange-600">
                            <Calendar className="w-4 h-4" />
                            <span>{diasRestantes} día{diasRestantes > 1 ? 's' : ''} restante{diasRestantes > 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {planesVencidos > 0 && (
                          <div className="flex items-center space-x-1 text-red-600">
                            <CreditCard className="w-4 h-4" />
                            <span>{planesVencidos} pago{planesVencidos > 1 ? 's' : ''} vencido{planesVencidos > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <p className="font-bold text-emerald-600">{formatearMoneda(proyecto.valorTotal)}</p>
                      <div className="w-20 bg-slate-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${proyecto.progreso}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{proyecto.progreso}% completado</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resumen general */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
          <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <p className="text-2xl font-bold text-slate-800">{clientes.length}</p>
          <p className="text-sm text-slate-600">Clientes Registrados</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
          <FileText className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <p className="text-2xl font-bold text-slate-800">{serviciosActivos}</p>
          <p className="text-sm text-slate-600">Servicios Activos</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
          <p className="text-2xl font-bold text-slate-800">{metricas.cotizacionesAprobadas}</p>
          <p className="text-sm text-slate-600">Cotizaciones Aprobadas</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 text-center">
          <Briefcase className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
          <p className="text-2xl font-bold text-slate-800">{proyectos.filter(p => p.estado === 'completado').length}</p>
          <p className="text-sm text-slate-600">Proyectos Completados</p>
        </div>
      </div>
    </div>
  );
};