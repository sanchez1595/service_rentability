import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Calendar, DollarSign } from 'lucide-react';
import { Proyecto, PlanPago } from '../../types/services';
import { TIPOS_PLAN_PAGO, PLANTILLAS_PLANES_PAGO } from '../../utils/servicesConstants';
import { formatearInput, formatearMoneda } from '../../utils/formatters';

interface CrearPlanPagoProps {
  proyecto: Proyecto;
  onCrear: (plan: Omit<PlanPago, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCerrar: () => void;
}

interface PlanPagoFormData {
  descripcion: string;
  fechaVencimiento: string;
  monto: string;
  tipo: 'anticipo' | 'cuota' | 'final' | 'hito';
  porcentajeProyecto: string;
}

const crearPlanInicial = (proyecto: Proyecto): PlanPagoFormData => {
  console.log('🔍 DEBUG - Creando plan inicial con proyecto:', proyecto);
  
  const hoy = new Date();
  const fechaDefecto = hoy.toISOString().split('T')[0];
  
  // Asegurar que hay un valor total válido
  const valorTotal = proyecto.valorTotal || 0;
  const montoDefecto = valorTotal > 0 ? (valorTotal * 0.5).toString() : '100000'; // 100k por defecto si no hay valor
  
  console.log('🔍 DEBUG - Valores calculados:', {
    valorTotal,
    montoDefecto,
    fechaDefecto,
    porcentaje: valorTotal > 0 ? '50' : '100'
  });
  
  const planInicial = {
    descripcion: 'Pago del proyecto',
    fechaVencimiento: fechaDefecto,
    monto: montoDefecto,
    tipo: 'cuota' as const,
    porcentajeProyecto: valorTotal > 0 ? '50' : '100'
  };
  
  console.log('🔍 DEBUG - Plan inicial creado:', planInicial);
  return planInicial;
};

export const CrearPlanPago: React.FC<CrearPlanPagoProps> = ({
  proyecto,
  onCrear,
  onCerrar
}) => {
  console.log('🚀 DEBUG - CrearPlanPago iniciado con proyecto:', proyecto);
  
  const planInicial = crearPlanInicial(proyecto);
  console.log('🚀 DEBUG - Plan inicial generado:', planInicial);
  
  const [planes, setPlanes] = useState<PlanPagoFormData[]>([planInicial]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState('');
  const [guardando, setGuardando] = useState(false);
  
  // Debug: Log cada vez que cambien los planes
  useEffect(() => {
    console.log('🔄 DEBUG - Planes actualizados:', planes);
  }, [planes]);

  const agregarPlan = () => {
    setPlanes([...planes, crearPlanInicial(proyecto)]);
  };

  const eliminarPlan = (index: number) => {
    if (planes.length > 1) {
      setPlanes(planes.filter((_, i) => i !== index));
    }
  };

  const actualizarPlan = (index: number, campo: keyof PlanPagoFormData, valor: string) => {
    console.log(`🔧 DEBUG - Actualizando plan ${index}, campo: ${campo}, valor:`, valor);
    
    const nuevosPlanes = [...planes];
    nuevosPlanes[index] = {
      ...nuevosPlanes[index],
      [campo]: valor
    };

    // Si se actualiza el porcentaje, calcular el monto automáticamente
    if (campo === 'porcentajeProyecto') {
      const porcentaje = parseFloat(valor) || 0;
      const valorTotalProyecto = proyecto.valorTotal || 0;
      const monto = valorTotalProyecto > 0 ? (valorTotalProyecto * porcentaje / 100).toString() : '0';
      nuevosPlanes[index].monto = monto;
      console.log(`🔧 DEBUG - Calculado monto automático: ${monto} (${porcentaje}% de ${valorTotalProyecto})`);
    }

    // Si se actualiza el monto, calcular el porcentaje automáticamente
    if (campo === 'monto') {
      const montoLimpio = valor.replace(/[^\d]/g, '');
      const monto = parseFloat(montoLimpio) || 0;
      const valorTotalProyecto = proyecto.valorTotal || 0;
      const porcentaje = valorTotalProyecto > 0 ? (monto / valorTotalProyecto * 100) : 0;
      nuevosPlanes[index].porcentajeProyecto = porcentaje.toFixed(1);
      console.log(`🔧 DEBUG - Calculado porcentaje automático: ${porcentaje}% (${monto} de ${valorTotalProyecto})`);
    }

    console.log(`🔧 DEBUG - Plan actualizado:`, nuevosPlanes[index]);
    setPlanes(nuevosPlanes);
  };

  const aplicarPlantilla = (plantilla: string) => {
    const plantillaConfig = PLANTILLAS_PLANES_PAGO.find(p => p.nombre === plantilla);
    if (!plantillaConfig) return;

    if (plantilla === '50% - 50%') {
      const hoy = new Date();
      const en30Dias = new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      setPlanes([
        {
          descripcion: 'Anticipo del 50%',
          fechaVencimiento: hoy.toISOString().split('T')[0],
          monto: (proyecto.valorTotal * 0.5).toString(),
          tipo: 'anticipo',
          porcentajeProyecto: '50'
        },
        {
          descripcion: 'Pago final del 50%',
          fechaVencimiento: proyecto.fechaFinEstimada,
          monto: (proyecto.valorTotal * 0.5).toString(),
          tipo: 'final',
          porcentajeProyecto: '50'
        }
      ]);
    } else if (plantilla === '40% - 40% - 20%') {
      const hoy = new Date();
      
      // Validar y convertir fechas
      let fechaInicio = proyecto.fechaInicio ? new Date(proyecto.fechaInicio) : new Date(hoy);
      let fechaFin = proyecto.fechaFinEstimada ? new Date(proyecto.fechaFinEstimada) : new Date(hoy.getTime() + 60 * 24 * 60 * 60 * 1000); // 60 días por defecto
      
      // Verificar que las fechas sean válidas
      if (isNaN(fechaInicio.getTime())) {
        fechaInicio = new Date(hoy);
      }
      if (isNaN(fechaFin.getTime())) {
        fechaFin = new Date(hoy.getTime() + 60 * 24 * 60 * 60 * 1000);
      }
      
      const duracionTotal = fechaFin.getTime() - fechaInicio.getTime();
      const fechaMedio = new Date(fechaInicio.getTime() + duracionTotal / 2);
      
      setPlanes([
        {
          descripcion: 'Anticipo del 40%',
          fechaVencimiento: hoy.toISOString().split('T')[0],
          monto: (proyecto.valorTotal * 0.4).toString(),
          tipo: 'anticipo',
          porcentajeProyecto: '40'
        },
        {
          descripcion: 'Pago de avance del 40%',
          fechaVencimiento: fechaMedio.toISOString().split('T')[0],
          monto: (proyecto.valorTotal * 0.4).toString(),
          tipo: 'cuota',
          porcentajeProyecto: '40'
        },
        {
          descripcion: 'Pago final del 20%',
          fechaVencimiento: proyecto.fechaFinEstimada || fechaFin.toISOString().split('T')[0],
          monto: (proyecto.valorTotal * 0.2).toString(),
          tipo: 'final',
          porcentajeProyecto: '20'
        }
      ]);
    }
    
    setPlantillaSeleccionada(plantilla);
  };

  const calcularTotalPorcentaje = () => {
    return planes.reduce((total, plan) => {
      return total + (parseFloat(plan.porcentajeProyecto) || 0);
    }, 0);
  };

  const manejarGuardar = async () => {
    console.log('🔍 DEBUG - Validando planes antes de guardar:', planes);
    console.log('🔍 DEBUG - Proyecto actual:', proyecto);
    
    // Validaciones detalladas
    const errores: string[] = [];
    
    planes.forEach((plan, index) => {
      const cuota = `Cuota #${index + 1}`;
      
      console.log(`🔍 DEBUG - Validando ${cuota}:`, plan);
      
      if (!plan.descripcion.trim()) {
        errores.push(`${cuota}: Falta descripción`);
        console.log(`❌ ERROR - ${cuota}: descripción vacía`);
      }
      
      if (!plan.fechaVencimiento) {
        errores.push(`${cuota}: Falta fecha de vencimiento`);
        console.log(`❌ ERROR - ${cuota}: fecha vacía, valor:`, plan.fechaVencimiento);
      }
      
      console.log(`🔍 DEBUG - ${cuota} monto original:`, plan.monto);
      const montoLimpio = plan.monto.replace(/[^\d]/g, '');
      console.log(`🔍 DEBUG - ${cuota} monto limpio:`, montoLimpio);
      const montoNumerico = parseFloat(montoLimpio) || 0;
      console.log(`🔍 DEBUG - ${cuota} monto numérico:`, montoNumerico);
      
      if (montoNumerico <= 0) {
        errores.push(`${cuota}: El monto debe ser mayor a 0`);
        console.log(`❌ ERROR - ${cuota}: monto inválido:`, montoNumerico);
      }
      
      const porcentaje = parseFloat(plan.porcentajeProyecto) || 0;
      if (porcentaje <= 0) {
        errores.push(`${cuota}: El porcentaje debe ser mayor a 0`);
        console.log(`❌ ERROR - ${cuota}: porcentaje inválido:`, porcentaje);
      }
    });
    
    if (errores.length > 0) {
      alert('Se encontraron los siguientes errores:\n\n' + errores.join('\n'));
      return;
    }

    const totalPorcentaje = calcularTotalPorcentaje();
    if (Math.abs(totalPorcentaje - 100) > 0.1) {
      if (!confirm(`El total de porcentajes es ${totalPorcentaje.toFixed(1)}%. ¿Deseas continuar?`)) {
        return;
      }
    }

    setGuardando(true);
    try {
      // Crear todos los planes
      for (let i = 0; i < planes.length; i++) {
        const plan = planes[i];
        await onCrear({
          proyectoId: proyecto.id,
          numeroCuota: i + 1,
          descripcion: plan.descripcion,
          fechaVencimiento: plan.fechaVencimiento,
          monto: parseFloat(plan.monto.replace(/[^\d]/g, '')) || 0,
          tipo: plan.tipo,
          porcentajeProyecto: parseFloat(plan.porcentajeProyecto) || 0,
          estado: 'pendiente'
        });
      }
      
      onCerrar();
    } catch (error) {
      console.error('Error al crear planes de pago:', error);
      alert('Error al crear los planes de pago');
    } finally {
      setGuardando(false);
    }
  };

  const totalPorcentaje = calcularTotalPorcentaje();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Crear Plan de Pagos</h2>
              <p className="text-slate-600">Proyecto: {proyecto.nombre}</p>
              <p className="text-slate-600">Valor total: <span className="font-bold text-emerald-600">{formatearMoneda(proyecto.valorTotal || 0)}</span></p>
              {(!proyecto.valorTotal || proyecto.valorTotal === 0) && (
                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-700">
                    ⚠️ El proyecto no tiene valor total definido. Ajusta los montos manualmente.
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={onCerrar}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Plantillas */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-700">Plantillas de Pago</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    console.log('🔄 DEBUG - Reiniciando planes con valores por defecto');
                    setPlanes([crearPlanInicial(proyecto)]);
                  }}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  🔄 Reset
                </button>
                <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                  💡 Usa las plantillas para configurar rápidamente
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {PLANTILLAS_PLANES_PAGO.slice(0, 3).map((plantilla) => (
                <button
                  key={plantilla.nombre}
                  onClick={() => aplicarPlantilla(plantilla.nombre)}
                  className={`p-3 border rounded-lg text-left hover:border-indigo-300 transition-colors ${
                    plantillaSeleccionada === plantilla.nombre ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'
                  }`}
                >
                  <p className="font-medium text-slate-800">{plantilla.nombre}</p>
                  <p className="text-sm text-slate-600">{plantilla.descripcion}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Planes de pago */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-700">Cuotas de Pago</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-slate-600">Total: {totalPorcentaje.toFixed(1)}%</span>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    Math.abs(totalPorcentaje - 100) < 0.1 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {Math.abs(totalPorcentaje - 100) < 0.1 ? '✓ Completo' : '⚠ Ajustar'}
                  </div>
                </div>
              </div>
              <button
                onClick={agregarPlan}
                className="bg-indigo-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-indigo-600 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Cuota</span>
              </button>
            </div>

            {planes.map((plan, index) => (
              <div key={index} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-slate-800">Cuota #{index + 1}</h4>
                  {planes.length > 1 && (
                    <button
                      onClick={() => eliminarPlan(index)}
                      className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={plan.descripcion}
                      onChange={(e) => actualizarPlan(index, 'descripcion', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="Ej: Anticipo del 50%"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tipo de Pago
                    </label>
                    <select
                      value={plan.tipo}
                      onChange={(e) => actualizarPlan(index, 'tipo', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      {TIPOS_PLAN_PAGO.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Fecha de Vencimiento
                    </label>
                    <input
                      type="date"
                      value={plan.fechaVencimiento}
                      onChange={(e) => actualizarPlan(index, 'fechaVencimiento', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Porcentaje (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={plan.porcentajeProyecto}
                        onChange={(e) => actualizarPlan(index, 'porcentajeProyecto', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Monto
                      </label>
                      <input
                        type="text"
                        value={formatearInput(plan.monto)}
                        onChange={(e) => actualizarPlan(index, 'monto', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="1000000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-slate-800 mb-3">Resumen del Plan</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Total de cuotas:</p>
                <p className="font-bold text-slate-800">{planes.length}</p>
              </div>
              <div>
                <p className="text-slate-600">Total porcentaje:</p>
                <p className={`font-bold ${Math.abs(totalPorcentaje - 100) <= 0.1 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {totalPorcentaje.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-slate-600">Total monto:</p>
                <p className="font-bold text-emerald-600">
                  {formatearMoneda(
                    planes.reduce((total, plan) => {
                      return total + (parseFloat(plan.monto.replace(/[^\d]/g, '')) || 0);
                    }, 0)
                  )}
                </p>
              </div>
            </div>

            {Math.abs(totalPorcentaje - 100) > 0.1 && (
              <div className="mt-3 p-2 bg-orange-100 border border-orange-200 rounded-lg">
                <p className="text-orange-800 text-sm">
                  ⚠️ El total de porcentajes debe sumar 100%. Actualmente suma {totalPorcentaje.toFixed(1)}%.
                </p>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-4">
            <button
              onClick={manejarGuardar}
              disabled={guardando || planes.length === 0}
              className="flex-1 bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>{guardando ? 'Creando...' : 'Crear Plan de Pagos'}</span>
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
  );
};