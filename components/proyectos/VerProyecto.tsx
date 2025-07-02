import React, { useState } from 'react';
import { ArrowLeft, Calendar, DollarSign, TrendingUp, Plus, Edit2, CheckCircle, AlertTriangle, CreditCard, Receipt, User, Building } from 'lucide-react';
import { Proyecto, Cliente, PlanPago, Pago, Desembolso } from '../../types/services';
import { ESTADOS_PROYECTO, TIPOS_PLAN_PAGO, METODOS_PAGO } from '../../utils/servicesConstants';
import { formatearMoneda } from '../../utils/formatters';
import { CrearPlanPago } from './CrearPlanPago';
import { RegistrarPago } from './RegistrarPago';
import { RegistrarDesembolso } from './RegistrarDesembolso';

interface VerProyectoProps {
  proyecto: Proyecto;
  clientes: Cliente[];
  planesPago: PlanPago[];
  pagos: Pago[];
  desembolsos: Desembolso[];
  onVolver: () => void;
  onActualizarProyecto: (id: string, proyecto: Partial<Proyecto>) => Promise<void>;
  onCompletarProyecto: (id: string) => Promise<void>;
  onCrearPlanPago: (plan: Omit<PlanPago, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onRegistrarPago: (pago: Omit<Pago, 'id' | 'created_at'>) => Promise<void>;
  onAgregarDesembolso: (desembolso: Omit<Desembolso, 'id' | 'created_at'>) => Promise<void>;
}

export const VerProyecto: React.FC<VerProyectoProps> = ({
  proyecto,
  clientes,
  planesPago,
  pagos,
  desembolsos,
  onVolver,
  onActualizarProyecto,
  onCompletarProyecto,
  onCrearPlanPago,
  onRegistrarPago,
  onAgregarDesembolso
}) => {
  const [modalActivo, setModalActivo] = useState<'planPago' | 'pago' | 'desembolso' | null>(null);
  const [editandoProgreso, setEditandoProgreso] = useState(false);
  const [nuevoProgreso, setNuevoProgreso] = useState(proyecto.progreso.toString());

  const cliente = clientes.find(c => c.id === proyecto.clienteId);

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

  // Calcular estadísticas financieras
  const totalPlanificado = planesPago.reduce((sum, p) => sum + p.monto, 0);
  const totalRecibido = pagos.reduce((sum, p) => sum + p.monto, 0);
  const totalGastado = desembolsos.filter(d => d.estado === 'pagado').reduce((sum, d) => sum + d.monto, 0);
  const pendienteCobro = totalPlanificado - totalRecibido;
  const rentabilidadActual = totalRecibido - totalGastado;
  const porcentajeCobrado = totalPlanificado > 0 ? (totalRecibido / totalPlanificado) * 100 : 0;

  // Alertas
  const planesPendientes = planesPago.filter(p => p.estado === 'pendiente').length;
  const hoy = new Date().toISOString().split('T')[0];
  const planesVencidos = planesPago.filter(p => p.estado === 'pendiente' && p.fechaVencimiento < hoy).length;
  const diasRestantes = calcularDiasRestantes(proyecto.fechaFinEstimada);
  const estaRetrasado = diasRestantes < 0 && proyecto.estado === 'activo';

  const manejarActualizarProgreso = async () => {
    const progreso = Math.min(100, Math.max(0, parseFloat(nuevoProgreso) || 0));
    try {
      await onActualizarProyecto(proyecto.id, { progreso });
      setEditandoProgreso(false);
    } catch (error) {
      console.error('Error al actualizar progreso:', error);
      alert('Error al actualizar el progreso');
    }
  };

  const manejarCompletar = async () => {
    if (confirm('¿Confirmas que el proyecto está completado?')) {
      try {
        await onCompletarProyecto(proyecto.id);
      } catch (error) {
        console.error('Error al completar proyecto:', error);
        alert('Error al completar el proyecto');
      }
    }
  };

  const manejarCambiarEstado = async (nuevoEstado: string) => {
    try {
      await onActualizarProyecto(proyecto.id, { estado: nuevoEstado as any });
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del proyecto');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onVolver}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-800">{proyecto.nombre}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${obtenerColorEstado(proyecto.estado)}-100 text-${obtenerColorEstado(proyecto.estado)}-700`}>
                  {obtenerLabelEstado(proyecto.estado)}
                </span>
                {estaRetrasado && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Retrasado</span>
                  </span>
                )}
              </div>
              <p className="text-slate-600">
                Valor total: <span className="font-bold text-emerald-600 text-xl">{formatearMoneda(proyecto.valorTotal)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {proyecto.estado === 'activo' && (
              <>
                <button
                  onClick={() => manejarCambiarEstado('pausado')}
                  className="px-4 py-2 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  Pausar
                </button>
                <button
                  onClick={manejarCompletar}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Completar</span>
                </button>
              </>
            )}
            
            {proyecto.estado === 'pausado' && (
              <button
                onClick={() => manejarCambiarEstado('activo')}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
              >
                Reanudar
              </button>
            )}
          </div>
        </div>

        {/* Información básica */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-slate-500 text-sm">Fecha de inicio</p>
              <p className="font-medium">{formatearFecha(proyecto.fechaInicio)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-slate-500 text-sm">Fecha límite</p>
              <p className={`font-medium ${estaRetrasado ? 'text-red-600' : ''}`}>
                {formatearFecha(proyecto.fechaFinEstimada)}
                <span className={`ml-1 text-xs ${diasRestantes <= 7 && diasRestantes > 0 ? 'text-orange-600' : estaRetrasado ? 'text-red-600' : 'text-slate-500'}`}>
                  ({diasRestantes > 0 ? `${diasRestantes} días` : estaRetrasado ? `${Math.abs(diasRestantes)} días de retraso` : 'Completado'})
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-slate-500 text-sm">Progreso</p>
              <div className="flex items-center space-x-2">
                {editandoProgreso ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={nuevoProgreso}
                      onChange={(e) => setNuevoProgreso(e.target.value)}
                      min="0"
                      max="100"
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                    <span className="text-sm">%</span>
                    <button
                      onClick={manejarActualizarProgreso}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${proyecto.progreso}%` }}
                      />
                    </div>
                    <span className="font-medium text-slate-700">{proyecto.progreso}%</span>
                    <button
                      onClick={() => setEditandoProgreso(true)}
                      className="p-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <DollarSign className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-slate-500 text-sm">Rentabilidad actual</p>
              <p className={`font-bold text-lg ${rentabilidadActual >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {rentabilidadActual >= 0 ? '+' : ''}{formatearMoneda(rentabilidadActual)}
              </p>
            </div>
          </div>
        </div>

        {/* Alertas importantes */}
        {(planesPendientes > 0 || planesVencidos > 0 || estaRetrasado) && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Alertas del Proyecto</h3>
            </div>
            <div className="space-y-1 text-sm text-orange-700">
              {planesVencidos > 0 && (
                <p>• {planesVencidos} pago{planesVencidos > 1 ? 's' : ''} vencido{planesVencidos > 1 ? 's' : ''}</p>
              )}
              {planesPendientes > 0 && (
                <p>• {planesPendientes} pago{planesPendientes > 1 ? 's' : ''} pendiente{planesPendientes > 1 ? 's' : ''}</p>
              )}
              {estaRetrasado && (
                <p>• Proyecto retrasado por {Math.abs(diasRestantes)} día{Math.abs(diasRestantes) > 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Información del cliente */}
      {cliente && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-purple-50 rounded-xl">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Cliente</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-slate-500 text-sm mb-1">Nombre</p>
              <p className="font-semibold text-slate-800">{cliente.nombre}</p>
            </div>

            {cliente.empresa && (
              <div>
                <p className="text-slate-500 text-sm mb-1">Empresa</p>
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-slate-500" />
                  <p className="font-medium text-slate-800">{cliente.empresa}</p>
                </div>
              </div>
            )}

            {cliente.email && (
              <div>
                <p className="text-slate-500 text-sm mb-1">Email</p>
                <p className="text-slate-800">{cliente.email}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Métricas financieras */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Planificado</p>
              <p className="text-2xl font-bold text-slate-800">{formatearMoneda(totalPlanificado)}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Cobrado</p>
              <p className="text-2xl font-bold text-emerald-600">{formatearMoneda(totalRecibido)}</p>
              <div className="w-full bg-slate-200 rounded-full h-1 mt-2">
                <div 
                  className="bg-emerald-500 h-1 rounded-full"
                  style={{ width: `${Math.min(porcentajeCobrado, 100)}%` }}
                />
              </div>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Gastado</p>
              <p className="text-2xl font-bold text-red-600">{formatearMoneda(totalGastado)}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Pendiente Cobro</p>
              <p className={`text-2xl font-bold ${pendienteCobro > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                {formatearMoneda(pendienteCobro)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${pendienteCobro > 0 ? 'bg-orange-50' : 'bg-emerald-50'}`}>
              <DollarSign className={`w-6 h-6 ${pendienteCobro > 0 ? 'text-orange-600' : 'text-emerald-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Planes de pago */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Planes de Pago</h2>
              <p className="text-slate-600">{planesPago.length} cuotas configuradas</p>
            </div>
          </div>
          
          <button
            onClick={() => setModalActivo('planPago')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Plan</span>
          </button>
        </div>

        {planesPago.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 mb-2">No hay planes de pago configurados</p>
            <p className="text-slate-500 text-sm">Configura los pagos para este proyecto</p>
          </div>
        ) : (
          <div className="space-y-3">
            {planesPago
              .sort((a, b) => a.numeroCuota - b.numeroCuota)
              .map((plan) => {
                const esVencido = plan.estado === 'pendiente' && plan.fechaVencimiento < hoy;
                
                return (
                  <div key={plan.id} className={`border rounded-lg p-4 ${esVencido ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-semibold text-slate-800">Cuota #{plan.numeroCuota}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            plan.estado === 'pagado' ? 'bg-emerald-100 text-emerald-700' :
                            plan.estado === 'parcial' ? 'bg-yellow-100 text-yellow-700' :
                            esVencido ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {plan.estado === 'pagado' ? 'Pagado' :
                             plan.estado === 'parcial' ? 'Parcial' :
                             esVencido ? 'Vencido' : 'Pendiente'}
                          </span>
                          <span className="text-sm text-slate-600">{plan.descripcion}</span>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Monto: </span>
                            <span className="font-semibold">{formatearMoneda(plan.monto)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Vencimiento: </span>
                            <span className={esVencido ? 'text-red-600 font-semibold' : ''}>{formatearFecha(plan.fechaVencimiento)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Tipo: </span>
                            <span>{TIPOS_PLAN_PAGO.find(t => t.value === plan.tipo)?.label}</span>
                          </div>
                        </div>
                      </div>
                      
                      {plan.estado === 'pendiente' && (
                        <button
                          onClick={() => setModalActivo('pago')}
                          className="ml-4 bg-emerald-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-emerald-600 transition-colors"
                        >
                          Registrar Pago
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Historial de pagos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <CreditCard className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Historial de Pagos</h2>
              <p className="text-slate-600">{pagos.length} pagos registrados</p>
            </div>
          </div>
          
          <button
            onClick={() => setModalActivo('pago')}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Pago</span>
          </button>
        </div>

        {pagos.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 mb-2">No hay pagos registrados</p>
            <p className="text-slate-500 text-sm">Los pagos aparecerán aquí cuando se registren</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pagos
              .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
              .map((pago) => (
                <div key={pago.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Monto: </span>
                          <span className="font-bold text-emerald-600">{formatearMoneda(pago.monto)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Fecha: </span>
                          <span>{formatearFecha(pago.fecha)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Método: </span>
                          <span>{METODOS_PAGO.find(m => m.value === pago.metodoPago)?.label}</span>
                        </div>
                        {pago.numeroReferencia && (
                          <div>
                            <span className="text-slate-500">Ref: </span>
                            <span>{pago.numeroReferencia}</span>
                          </div>
                        )}
                      </div>
                      
                      {pago.notas && (
                        <div className="mt-2 p-2 bg-slate-50 rounded text-sm text-slate-600">
                          {pago.notas}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Desembolsos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-50 rounded-xl">
              <Receipt className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Desembolsos</h2>
              <p className="text-slate-600">{desembolsos.length} gastos registrados</p>
            </div>
          </div>
          
          <button
            onClick={() => setModalActivo('desembolso')}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Gasto</span>
          </button>
        </div>

        {desembolsos.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 mb-2">No hay gastos registrados</p>
            <p className="text-slate-500 text-sm">Los gastos del proyecto aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {desembolsos
              .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
              .map((desembolso) => (
                <div key={desembolso.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-semibold text-slate-800">{desembolso.descripcion}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          desembolso.estado === 'pagado' ? 'bg-emerald-100 text-emerald-700' :
                          desembolso.estado === 'aprobado' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {desembolso.estado === 'pagado' ? 'Pagado' :
                           desembolso.estado === 'aprobado' ? 'Aprobado' : 'Pendiente'}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Monto: </span>
                          <span className="font-bold text-red-600">{formatearMoneda(desembolso.monto)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Fecha: </span>
                          <span>{formatearFecha(desembolso.fecha)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Categoría: </span>
                          <span>{desembolso.categoriaNombre}</span>
                        </div>
                        {desembolso.proveedor && (
                          <div>
                            <span className="text-slate-500">Proveedor: </span>
                            <span>{desembolso.proveedor}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Modales */}
      {modalActivo === 'planPago' && (
        <CrearPlanPago
          proyecto={proyecto}
          onCrear={onCrearPlanPago}
          onCerrar={() => setModalActivo(null)}
        />
      )}

      {modalActivo === 'pago' && (
        <RegistrarPago
          proyecto={proyecto}
          planesPago={planesPago}
          onRegistrar={onRegistrarPago}
          onCerrar={() => setModalActivo(null)}
        />
      )}

      {modalActivo === 'desembolso' && (
        <RegistrarDesembolso
          proyecto={proyecto}
          onAgregar={onAgregarDesembolso}
          onCerrar={() => setModalActivo(null)}
        />
      )}
    </div>
  );
};