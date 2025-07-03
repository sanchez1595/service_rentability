import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useServices } from '../../contexts/ServicesContext';

export const SystemStatus: React.FC = () => {
  const {
    clientes,
    servicios,
    cotizaciones,
    proyectos,
    planesPago,
    pagos,
    desembolsos,
    loading,
    error
  } = useServices();

  const checks = [
    {
      name: 'Conexión a Base de Datos',
      status: !loading && !error,
      details: error || 'Conectado correctamente'
    },
    {
      name: 'Clientes Cargados',
      status: clientes.length > 0,
      details: `${clientes.length} clientes encontrados`
    },
    {
      name: 'Servicios Disponibles',
      status: servicios.length > 0,
      details: `${servicios.length} servicios encontrados`
    },
    {
      name: 'Cotizaciones en Sistema',
      status: true,
      details: `${cotizaciones.length} cotizaciones encontradas`
    },
    {
      name: 'Proyectos Activos',
      status: true,
      details: `${proyectos.length} proyectos encontrados`
    },
    {
      name: 'Planes de Pago',
      status: true,
      details: `${planesPago.length} planes encontrados`
    },
    {
      name: 'Pagos Registrados',
      status: true,
      details: `${pagos.length} pagos encontrados`
    },
    {
      name: 'Desembolsos',
      status: true,
      details: `${desembolsos.length} desembolsos encontrados`
    }
  ];

  const estadosCotizaciones = {
    borrador: cotizaciones.filter(c => c.estado === 'borrador').length,
    enviada: cotizaciones.filter(c => c.estado === 'enviada').length,
    aprobada: cotizaciones.filter(c => c.estado === 'aprobada').length,
    rechazada: cotizaciones.filter(c => c.estado === 'rechazada').length
  };

  const estadosProyectos = {
    activo: proyectos.filter(p => p.estado === 'activo').length,
    pausado: proyectos.filter(p => p.estado === 'pausado').length,
    completado: proyectos.filter(p => p.estado === 'completado').length,
    cancelado: proyectos.filter(p => p.estado === 'cancelado').length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Estado del Sistema</h1>
        
        {/* Checks principales */}
        <div className="grid md:grid-cols-2 gap-4">
          {checks.map((check, index) => (
            <div key={index} className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl">
              {check.status ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className="font-medium text-slate-800">{check.name}</p>
                <p className={`text-sm ${check.status ? 'text-emerald-600' : 'text-red-600'}`}>
                  {check.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detalles de cotizaciones */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Estados de Cotizaciones</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Borradores:</span>
              <span className="font-semibold">{estadosCotizaciones.borrador}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Enviadas:</span>
              <span className="font-semibold text-blue-600">{estadosCotizaciones.enviada}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Aprobadas:</span>
              <span className="font-semibold text-emerald-600">{estadosCotizaciones.aprobada}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Rechazadas:</span>
              <span className="font-semibold text-red-600">{estadosCotizaciones.rechazada}</span>
            </div>
          </div>
          
          {estadosCotizaciones.borrador > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-slate-600">
                ✅ Las cotizaciones en borrador deben mostrar botón de eliminar
              </p>
            </div>
          )}
          
          {estadosCotizaciones.enviada > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                ✅ Las cotizaciones enviadas deben mostrar botones de aprobar/rechazar
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Estados de Proyectos</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Activos:</span>
              <span className="font-semibold text-emerald-600">{estadosProyectos.activo}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Pausados:</span>
              <span className="font-semibold text-yellow-600">{estadosProyectos.pausado}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Completados:</span>
              <span className="font-semibold text-blue-600">{estadosProyectos.completado}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Cancelados:</span>
              <span className="font-semibold text-red-600">{estadosProyectos.cancelado}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Funcionalidades implementadas */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Funcionalidades Implementadas</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            'PDF de cotizaciones',
            'Eliminación de cotizaciones',
            'Aprobación automática',
            'Creación de proyectos',
            'Planes de pago',
            'Registro de pagos',
            'Control de desembolsos',
            'Métricas en tiempo real',
            'Estados de seguimiento'
          ].map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 bg-emerald-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-800 text-sm font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-yellow-800 mb-2">Cómo Probar las Funcionalidades</h3>
            <div className="space-y-2 text-yellow-700">
              <p>• <strong>PDF:</strong> Abre cualquier cotización y busca el botón de descarga (↓)</p>
              <p>• <strong>Eliminar:</strong> En cotizaciones con estado &quot;Borrador&quot;, aparece botón de papelera</p>
              <p>• <strong>Aprobar:</strong> En cotizaciones &quot;Enviadas&quot;, aparece botón verde de check</p>
              <p>• <strong>Planes de Pago:</strong> En proyectos, busca la sección &quot;Planes de Pago&quot; con botón +</p>
              <p>• <strong>Configuración:</strong> Ve a Configuración y busca la pestaña &quot;Cotizaciones&quot;</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};