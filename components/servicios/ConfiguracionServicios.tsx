import React, { useState } from 'react';
import { Settings, Plus, Trash2, Save, DollarSign, Percent, Wrench, Building, FileText, User } from 'lucide-react';
import { formatearInput, formatearMoneda } from '../../utils/formatters';
import { Configuracion, Metas, Alertas } from '../../types/services';

interface ConfiguracionServiciosProps {
  configuracion: Configuracion;
  metas: Metas;
  alertas: Alertas;
  onActualizarConfiguracion: (config: Partial<Configuracion>) => Promise<void>;
  onActualizarConfiguracionCompleta: (config: Partial<Configuracion>) => Promise<void>;
  onActualizarMetas: (metas: Partial<Metas>) => Promise<void>;
  onActualizarAlertas: (alertas: Partial<Alertas>) => Promise<void>;
  onActualizarTodosLosPrecios?: () => Promise<void>;
}

export const ConfiguracionServicios: React.FC<ConfiguracionServiciosProps> = ({
  configuracion,
  metas,
  alertas,
  onActualizarConfiguracion,
  onActualizarConfiguracionCompleta,
  onActualizarMetas,
  onActualizarAlertas
}) => {

  const [nuevoPorcentaje, setNuevoPorcentaje] = useState({ clave: '', valor: '' });
  const [nuevoCostoFijo, setNuevoCostoFijo] = useState({ clave: '', valor: '' });
  const [nuevaHerramienta, setNuevaHerramienta] = useState({ clave: '', valor: '' });
  const [guardando, setGuardando] = useState(false);

  const [configLocal, setConfigLocal] = useState(configuracion);
  const [metasLocal, setMetasLocal] = useState(metas);
  const [alertasLocal, setAlertasLocal] = useState(alertas);

  const actualizarPorcentaje = (clave: string, valor: number) => {
    setConfigLocal(prev => ({
      ...prev,
      porcentajes: {
        ...prev.porcentajes,
        [clave]: valor
      }
    }));
  };

  const agregarPorcentaje = () => {
    if (nuevoPorcentaje.clave && nuevoPorcentaje.valor) {
      setConfigLocal(prev => ({
        ...prev,
        porcentajes: {
          ...prev.porcentajes,
          [nuevoPorcentaje.clave]: parseFloat(nuevoPorcentaje.valor) || 0
        }
      }));
      setNuevoPorcentaje({ clave: '', valor: '' });
    }
  };

  const eliminarPorcentaje = (clave: string) => {
    setConfigLocal(prev => {
      const { [clave]: _, ...resto } = prev.porcentajes;
      return {
        ...prev,
        porcentajes: resto
      };
    });
  };

  const agregarCostoFijo = () => {
    if (nuevoCostoFijo.clave && nuevoCostoFijo.valor) {
      setConfigLocal(prev => ({
        ...prev,
        costosFijos: {
          ...prev.costosFijos,
          [nuevoCostoFijo.clave]: parseFloat(nuevoCostoFijo.valor.replace(/[^\\d]/g, '')) || 0
        }
      }));
      setNuevoCostoFijo({ clave: '', valor: '' });
    }
  };

  const eliminarCostoFijo = (clave: string) => {
    setConfigLocal(prev => {
      const { [clave]: _, ...resto } = prev.costosFijos;
      return {
        ...prev,
        costosFijos: resto
      };
    });
  };

  const agregarHerramienta = () => {
    if (nuevaHerramienta.clave && nuevaHerramienta.valor) {
      setConfigLocal(prev => ({
        ...prev,
        herramientas: {
          ...prev.herramientas,
          [nuevaHerramienta.clave]: parseFloat(nuevaHerramienta.valor.replace(/[^\\d]/g, '')) || 0
        }
      }));
      setNuevaHerramienta({ clave: '', valor: '' });
    }
  };

  const eliminarHerramienta = (clave: string) => {
    setConfigLocal(prev => {
      const { [clave]: _, ...resto } = prev.herramientas;
      return {
        ...prev,
        herramientas: resto
      };
    });
  };

  const guardarConfiguracion = async () => {
    setGuardando(true);
    try {
      await onActualizarConfiguracionCompleta(configLocal);
      await onActualizarMetas(metasLocal);
      await onActualizarAlertas(alertasLocal);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-slate-50 rounded-xl">
            <Settings className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Configuración del Sistema</h1>
            <p className="text-slate-600">Configura costos, márgenes y parámetros operativos</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={guardarConfiguracion}
            disabled={guardando}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>{guardando ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Costos Fijos Mensuales */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-red-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Costos Fijos Mensuales</h2>
              <p className="text-slate-600">Gastos operativos del negocio</p>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(configLocal.costosFijos).map(([clave, valor]) => (
              <div key={clave} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex-1">
                  <p className="font-medium text-slate-800 capitalize">{clave.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-slate-600">{formatearMoneda(valor)}</p>
                </div>
                <button
                  onClick={() => eliminarCostoFijo(clave)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="border-t border-slate-200 pt-4">
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={nuevoCostoFijo.clave}
                  onChange={(e) => setNuevoCostoFijo(prev => ({ ...prev, clave: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Concepto"
                />
                <input
                  type="text"
                  value={formatearInput(nuevoCostoFijo.valor)}
                  onChange={(e) => setNuevoCostoFijo(prev => ({ ...prev, valor: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Valor"
                />
                <button
                  onClick={agregarCostoFijo}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Porcentajes Operativos */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Percent className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Porcentajes Operativos</h2>
              <p className="text-slate-600">Márgenes y porcentajes del negocio</p>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(configLocal.porcentajes).map(([clave, valor]) => (
              <div key={clave} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex-1">
                  <p className="font-medium text-slate-800 capitalize">{clave.replace(/_/g, ' ')}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="number"
                      value={valor}
                      onChange={(e) => actualizarPorcentaje(clave, parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.1"
                    />
                    <span className="text-sm text-slate-600">%</span>
                  </div>
                </div>
                <button
                  onClick={() => eliminarPorcentaje(clave)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="border-t border-slate-200 pt-4">
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={nuevoPorcentaje.clave}
                  onChange={(e) => setNuevoPorcentaje(prev => ({ ...prev, clave: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Concepto"
                />
                <input
                  type="number"
                  value={nuevoPorcentaje.valor}
                  onChange={(e) => setNuevoPorcentaje(prev => ({ ...prev, valor: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Porcentaje"
                />
                <button
                  onClick={agregarPorcentaje}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Herramientas y Equipos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-purple-50 rounded-xl">
            <Wrench className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Herramientas y Equipos</h2>
            <p className="text-slate-600">Costos de herramientas y equipos necesarios</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(configLocal.herramientas).map(([clave, valor]) => (
            <div key={clave} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div className="flex-1">
                <p className="font-medium text-slate-800 capitalize">{clave.replace(/_/g, ' ')}</p>
                <p className="text-sm text-slate-600">{formatearMoneda(valor)}</p>
              </div>
              <button
                onClick={() => eliminarHerramienta(clave)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl">
            <div className="space-y-3">
              <input
                type="text"
                value={nuevaHerramienta.clave}
                onChange={(e) => setNuevaHerramienta(prev => ({ ...prev, clave: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                placeholder="Nombre"
              />
              <input
                type="text"
                value={formatearInput(nuevaHerramienta.valor)}
                onChange={(e) => setNuevaHerramienta(prev => ({ ...prev, valor: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                placeholder="Costo"
              />
              <button
                onClick={agregarHerramienta}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración de Empresa */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <Building className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Información de la Empresa</h2>
            <p className="text-slate-600">Datos que aparecerán en cotizaciones y documentos</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nombre de la Empresa
            </label>
            <input
              type="text"
              value={configLocal.empresa?.nombre || ''}
              onChange={(e) => setConfigLocal(prev => ({
                ...prev,
                empresa: { ...prev.empresa, nombre: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Mi Empresa SAS"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              NIT/RUT
            </label>
            <input
              type="text"
              value={configLocal.empresa?.nit || ''}
              onChange={(e) => setConfigLocal(prev => ({
                ...prev,
                empresa: { ...prev.empresa, nit: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="123456789-0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Teléfono
            </label>
            <input
              type="text"
              value={configLocal.empresa?.telefono || ''}
              onChange={(e) => setConfigLocal(prev => ({
                ...prev,
                empresa: { ...prev.empresa, telefono: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="+57 300 123 4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={configLocal.empresa?.email || ''}
              onChange={(e) => setConfigLocal(prev => ({
                ...prev,
                empresa: { ...prev.empresa, email: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="contacto@miempresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ciudad
            </label>
            <input
              type="text"
              value={configLocal.empresa?.ciudad || ''}
              onChange={(e) => setConfigLocal(prev => ({
                ...prev,
                empresa: { ...prev.empresa, ciudad: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Bogotá, Colombia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={configLocal.empresa?.direccion || ''}
              onChange={(e) => setConfigLocal(prev => ({
                ...prev,
                empresa: { ...prev.empresa, direccion: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Calle 123 #45-67"
            />
          </div>
        </div>
      </div>

      {/* Configuración de Cotizaciones y PDF */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Configuración de Cotizaciones</h2>
            <p className="text-slate-600">Personaliza el formato y contenido de las cotizaciones</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Validez por defecto (días)
            </label>
            <input
              type="number"
              value={configLocal.cotizaciones?.validezDias || 30}
              onChange={(e) => setConfigLocal(prev => ({
                ...prev,
                cotizaciones: { ...prev.cotizaciones, validezDias: parseInt(e.target.value) || 30 }
              }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="30"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              IVA por defecto (%)
            </label>
            <input
              type="number"
              value={configLocal.cotizaciones?.ivaDefecto || 19}
              onChange={(e) => setConfigLocal(prev => ({
                ...prev,
                cotizaciones: { ...prev.cotizaciones, ivaDefecto: parseFloat(e.target.value) || 19 }
              }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="19"
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Formato de numeración
            </label>
            <input
              type="text"
              value={configLocal.cotizaciones?.formatoNumero || 'QUOTE-{YYYY}-{###}'}
              onChange={(e) => setConfigLocal(prev => ({
                ...prev,
                cotizaciones: { ...prev.cotizaciones, formatoNumero: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="QUOTE-{YYYY}-{###}"
            />
            <p className="text-xs text-slate-500 mt-1">
              Use {'{YYYY}'} para año, {'{###}'} para número consecutivo
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="mostrarLogo"
              checked={configLocal.cotizaciones?.mostrarLogo || false}
              onChange={(e) => setConfigLocal(prev => ({
                ...prev,
                cotizaciones: { ...prev.cotizaciones, mostrarLogo: e.target.checked }
              }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
            />
            <label htmlFor="mostrarLogo" className="text-sm font-medium text-slate-700">
              Mostrar logo en PDF
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Términos y condiciones por defecto
            </label>
            <textarea
              value={configLocal.cotizaciones?.terminosCondiciones || `1. Validez de la cotización: 30 días a partir de la fecha de emisión.
2. Forma de pago: 50% anticipo, 50% contra entrega.
3. Los precios no incluyen IVA.
4. Cualquier trabajo adicional será cotizado por separado.
5. El tiempo de entrega está sujeto a la aprobación de la cotización.`}
              onChange={(e) => setConfigLocal(prev => ({
                ...prev,
                cotizaciones: { ...prev.cotizaciones, terminosCondiciones: e.target.value }
              }))}
              rows={6}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Ingrese los términos y condiciones..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nota al pie del PDF
            </label>
            <input
              type="text"
              value={configLocal.cotizaciones?.notaPie || 'Gracias por confiar en nosotros'}
              onChange={(e) => setConfigLocal(prev => ({
                ...prev,
                cotizaciones: { ...prev.cotizaciones, notaPie: e.target.value }
              }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Gracias por confiar en nosotros"
            />
          </div>
        </div>
      </div>

      {/* Configuración General */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Configuración General</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ventas Estimadas Mensuales
            </label>
            <input
              type="text"
              value={formatearInput(configLocal.ventasEstimadas.toString())}
              onChange={(e) => setConfigLocal(prev => ({
                ...prev,
                ventasEstimadas: parseFloat(e.target.value.replace(/[^\\d]/g, '')) || 0
              }))}
              className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="5000000"
            />
          </div>
        </div>
      </div>
    </div>
  );
};