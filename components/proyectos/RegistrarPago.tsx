import React, { useState } from 'react';
import { X, CreditCard, DollarSign } from 'lucide-react';
import { Proyecto, PlanPago, Pago } from '../../types/services';
import { METODOS_PAGO } from '../../utils/servicesConstants';
import { formatearInput, formatearMoneda } from '../../utils/formatters';

interface RegistrarPagoProps {
  proyecto: Proyecto;
  planesPago: PlanPago[];
  onRegistrar: (pago: Omit<Pago, 'id' | 'created_at'>) => Promise<void>;
  onCerrar: () => void;
}

interface PagoFormData {
  planPagoId: string;
  fecha: string;
  monto: string;
  metodoPago: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta';
  numeroReferencia: string;
  notas: string;
}

const PAGO_INICIAL: PagoFormData = {
  planPagoId: '',
  fecha: new Date().toISOString().split('T')[0],
  monto: '',
  metodoPago: 'transferencia',
  numeroReferencia: '',
  notas: ''
};

export const RegistrarPago: React.FC<RegistrarPagoProps> = ({
  proyecto,
  planesPago,
  onRegistrar,
  onCerrar
}) => {
  const [pago, setPago] = useState<PagoFormData>(PAGO_INICIAL);
  const [guardando, setGuardando] = useState(false);

  // Filtrar solo planes pendientes o parciales
  const planesPendientes = planesPago.filter(p => 
    p.estado === 'pendiente' || p.estado === 'parcial'
  );

  const manejarCambioCampo = (campo: keyof PagoFormData, valor: string) => {
    setPago(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Si selecciona un plan de pago, prellenar el monto
    if (campo === 'planPagoId' && valor) {
      const plan = planesPago.find(p => p.id === valor);
      if (plan) {
        setPago(prev => ({
          ...prev,
          monto: plan.monto.toString()
        }));
      }
    }
  };

  const manejarGuardar = async () => {
    // Validaciones básicas
    if (!pago.fecha || !pago.monto) {
      alert('La fecha y el monto son obligatorios');
      return;
    }

    const montoNumerico = parseFloat(pago.monto.replace(/[^\d]/g, '')) || 0;
    if (montoNumerico <= 0) {
      alert('El monto debe ser mayor a cero');
      return;
    }

    // Validar que el pago no exceda el monto pendiente del plan si está asociado
    if (pago.planPagoId) {
      const plan = planesPago.find(p => p.id === pago.planPagoId);
      if (plan && montoNumerico > plan.monto) {
        if (!confirm(`El monto (${formatearMoneda(montoNumerico)}) es mayor al monto del plan (${formatearMoneda(plan.monto)}). ¿Deseas continuar?`)) {
          return;
        }
      }
    }

    setGuardando(true);
    try {
      await onRegistrar({
        proyectoId: proyecto.id,
        planPagoId: pago.planPagoId || undefined,
        fecha: pago.fecha,
        monto: montoNumerico,
        metodoPago: pago.metodoPago,
        numeroReferencia: pago.numeroReferencia || undefined,
        notas: pago.notas || undefined
      });
      
      onCerrar();
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Error al registrar el pago');
    } finally {
      setGuardando(false);
    }
  };

  const planSeleccionado = pago.planPagoId ? planesPago.find(p => p.id === pago.planPagoId) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Registrar Pago</h2>
              <p className="text-slate-600">Proyecto: {proyecto.nombre}</p>
            </div>
            <button
              onClick={onCerrar}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Asociar a plan de pago */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Plan de Pago (Opcional)
              </label>
              <select
                value={pago.planPagoId}
                onChange={(e) => manejarCambioCampo('planPagoId', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="">Pago no asociado a plan específico</option>
                {planesPendientes.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    Cuota #{plan.numeroCuota} - {plan.descripcion} ({formatearMoneda(plan.monto)})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Si no seleccionas un plan, será un pago general al proyecto
              </p>
            </div>

            {/* Información del plan seleccionado */}
            {planSeleccionado && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h3 className="font-semibold text-emerald-800 mb-2">Plan Seleccionado</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-emerald-600">Descripción:</span>
                    <span className="ml-2 font-medium">{planSeleccionado.descripcion}</span>
                  </div>
                  <div>
                    <span className="text-emerald-600">Monto:</span>
                    <span className="ml-2 font-medium">{formatearMoneda(planSeleccionado.monto)}</span>
                  </div>
                  <div>
                    <span className="text-emerald-600">Vencimiento:</span>
                    <span className="ml-2 font-medium">
                      {new Date(planSeleccionado.fechaVencimiento).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                  <div>
                    <span className="text-emerald-600">Estado:</span>
                    <span className={`ml-2 font-medium ${
                      planSeleccionado.estado === 'pendiente' ? 'text-orange-600' : 'text-yellow-600'
                    }`}>
                      {planSeleccionado.estado === 'pendiente' ? 'Pendiente' : 'Parcial'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Detalles del pago */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Fecha del Pago *
                </label>
                <input
                  type="date"
                  value={pago.fecha}
                  onChange={(e) => manejarCambioCampo('fecha', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Monto Recibido *
                </label>
                <input
                  type="text"
                  value={formatearInput(pago.monto)}
                  onChange={(e) => manejarCambioCampo('monto', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="1000000"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Método de Pago
                </label>
                <select
                  value={pago.metodoPago}
                  onChange={(e) => manejarCambioCampo('metodoPago', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  {METODOS_PAGO.map((metodo) => (
                    <option key={metodo.value} value={metodo.value}>
                      {metodo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Número de Referencia
                </label>
                <input
                  type="text"
                  value={pago.numeroReferencia}
                  onChange={(e) => manejarCambioCampo('numeroReferencia', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Número de transacción, cheque, etc."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Notas
              </label>
              <textarea
                value={pago.notas}
                onChange={(e) => manejarCambioCampo('notas', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                placeholder="Información adicional sobre el pago..."
              />
            </div>

            {/* Resumen */}
            {pago.monto && (
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Resumen del Pago</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monto a registrar:</span>
                    <span className="font-bold text-emerald-600">
                      {formatearMoneda(parseFloat(pago.monto.replace(/[^\d]/g, '')) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Método:</span>
                    <span className="font-medium">
                      {METODOS_PAGO.find(m => m.value === pago.metodoPago)?.label}
                    </span>
                  </div>
                  {planSeleccionado && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Asociado a:</span>
                      <span className="font-medium">{planSeleccionado.descripcion}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={manejarGuardar}
                disabled={guardando || !pago.fecha || !pago.monto}
                className="flex-1 bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>{guardando ? 'Registrando...' : 'Registrar Pago'}</span>
              </button>
              
              <button
                onClick={onCerrar}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};