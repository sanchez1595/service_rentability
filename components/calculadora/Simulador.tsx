import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Calculator, Play, RotateCcw } from 'lucide-react';
import { Producto, Configuracion } from '../../types';
import { formatearNumero, formatearMoneda } from '../../utils/formatters';

interface SimuladorProps {
  productos: Producto[];
  configuracion: Configuracion;
}

export const Simulador: React.FC<SimuladorProps> = ({ productos, configuracion }) => {
  const [escenarioActivo, setEscenarioActivo] = useState<string | null>(null);
  const [porcentajePersonalizado, setPorcentajePersonalizado] = useState(10);

  // Simulador de escenarios
  const simularEscenario = (tipo: string, porcentaje: number) => {
    return productos.map(producto => {
      const costoActual = parseFloat(producto.costoCompra) || 0;
      const precioActual = parseFloat(producto.precioVenta) || 0;
      let nuevoCosto = costoActual;
      let nuevoPrecio = precioActual;
      
      switch (tipo) {
        case 'aumento_costo':
          nuevoCosto = costoActual * (1 + porcentaje / 100);
          break;
        case 'reduccion_precio':
          nuevoPrecio = precioActual * (1 - porcentaje / 100);
          break;
        case 'aumento_precio':
          nuevoPrecio = precioActual * (1 + porcentaje / 100);
          break;
      }
      
      const nuevaUtilidad = nuevoPrecio - nuevoCosto;
      const nuevoMargen = nuevoPrecio > 0 ? (nuevaUtilidad / nuevoPrecio) * 100 : 0;
      const impacto = nuevaUtilidad - (precioActual - costoActual);
      
      return {
        ...producto,
        nuevoCosto,
        nuevoPrecio,
        nuevaUtilidad,
        nuevoMargen,
        impacto,
        margenActual: precioActual > 0 ? ((precioActual - costoActual) / precioActual) * 100 : 0
      };
    });
  };

  const escenarios = [
    {
      id: 'aumento_costo',
      nombre: 'Aumento de Costos',
      descripcion: 'Simula el impacto de un aumento en los costos de compra',
      porcentaje: 15,
      color: 'red',
      icono: TrendingUp
    },
    {
      id: 'reduccion_precio',
      nombre: 'Reducción de Precios',
      descripcion: 'Simula el impacto de una reducción competitiva de precios',
      porcentaje: 10,
      color: 'orange',
      icono: TrendingDown
    },
    {
      id: 'aumento_precio',
      nombre: 'Aumento de Precios',
      descripcion: 'Simula el impacto de un aumento en los precios de venta',
      porcentaje: 5,
      color: 'green',
      icono: TrendingUp
    }
  ];

  const resultadosSimulacion = escenarioActivo ? simularEscenario(escenarioActivo, porcentajePersonalizado) : [];
  const impactoTotal = resultadosSimulacion.reduce((sum, producto) => sum + (producto.impacto * (parseFloat(producto.ventasUltimos30Dias) || 1)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calculator className="text-blue-500" />
          Simulador de Escenarios
        </h2>
        <button
          onClick={() => setEscenarioActivo(null)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Limpiar
        </button>
      </div>

      {/* Descripción del Simulador */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">¿Cómo funciona el simulador?</h3>
        <p className="text-blue-700 mb-4">
          El simulador te permite probar diferentes escenarios de negocio y ver cómo afectarían 
          la rentabilidad de tus productos antes de tomar decisiones importantes.
        </p>
        <div className="bg-blue-100 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Casos de uso:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Evaluar el impacto de aumentos en los costos de proveedores</li>
            <li>• Planificar estrategias de descuentos y promociones</li>
            <li>• Analizar la viabilidad de aumentos de precios</li>
            <li>• Prepararse para cambios en el mercado</li>
          </ul>
        </div>
      </div>

      {/* Configuración del Escenario */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurar Simulación</h3>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {escenarios.map((escenario) => {
            const Icon = escenario.icono;
            return (
              <button
                key={escenario.id}
                onClick={() => setEscenarioActivo(escenario.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  escenarioActivo === escenario.id
                    ? `border-${escenario.color}-500 bg-${escenario.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 text-${escenario.color}-500`} />
                  <h4 className="font-semibold text-gray-800">{escenario.nombre}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">{escenario.descripcion}</p>
                <p className="text-xs text-gray-500">Porcentaje sugerido: {escenario.porcentaje}%</p>
              </button>
            );
          })}
        </div>

        {escenarioActivo && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porcentaje de Cambio (%)
                </label>
                <input
                  type="number"
                  value={porcentajePersonalizado}
                  onChange={(e) => setPorcentajePersonalizado(parseFloat(e.target.value) || 0)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                  step="0.1"
                />
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setEscenarioActivo(escenarioActivo)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Ejecutar Simulación
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resultados de la Simulación */}
      {escenarioActivo && resultadosSimulacion.length > 0 && (
        <div className="space-y-6">
          {/* Resumen del Impacto */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Impacto General</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Productos Afectados</h4>
                <p className="text-2xl font-bold text-gray-800">{resultadosSimulacion.length}</p>
              </div>
              
              <div className={`bg-${impactoTotal >= 0 ? 'green' : 'red'}-50 p-4 rounded-lg`}>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Impacto en Utilidades</h4>
                <p className={`text-2xl font-bold text-${impactoTotal >= 0 ? 'green' : 'red'}-600`}>
                  {impactoTotal >= 0 ? '+' : ''}{formatearMoneda(impactoTotal.toFixed(0))}
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Margen Promedio Nuevo</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {resultadosSimulacion.length > 0 
                    ? (resultadosSimulacion.reduce((sum, p) => sum + p.nuevoMargen, 0) / resultadosSimulacion.length).toFixed(1)
                    : 0
                  }%
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Productos Rentables</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {resultadosSimulacion.filter(p => p.nuevoMargen > 0).length}
                </p>
              </div>
            </div>
          </div>

          {/* Tabla de Resultados Detallados */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                Resultados Detallados - {escenarios.find(e => e.id === escenarioActivo)?.nombre} ({porcentajePersonalizado}%)
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Actual</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Nuevo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Actual</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Nuevo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margen Actual</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margen Nuevo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impacto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {resultadosSimulacion.map((producto) => (
                    <tr key={producto.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                          <div className="text-sm text-gray-500 capitalize">{producto.categoria}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        ${formatearNumero(parseFloat(producto.costoCompra) || 0)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        ${formatearNumero(producto.nuevoCosto.toFixed(0))}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        ${formatearNumero(parseFloat(producto.precioVenta) || 0)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        ${formatearNumero(producto.nuevoPrecio.toFixed(0))}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm font-medium ${
                          producto.margenActual >= 30 ? 'text-green-600' :
                          producto.margenActual >= 20 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {producto.margenActual.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm font-medium ${
                          producto.nuevoMargen >= 30 ? 'text-green-600' :
                          producto.nuevoMargen >= 20 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {producto.nuevoMargen.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${
                            producto.impacto >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {producto.impacto >= 0 ? '+' : ''}${formatearNumero(producto.impacto.toFixed(0))}
                          </span>
                          {producto.impacto >= 0 ? (
                            <TrendingUp className="ml-1 w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="ml-1 w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {productos.length === 0 && (
        <div className="text-center py-12">
          <Calculator className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-xl text-gray-500 mb-2">No hay productos para simular</p>
          <p className="text-gray-400">Agrega productos a tu inventario para usar el simulador</p>
        </div>
      )}
    </div>
  );
};