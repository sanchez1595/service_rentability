import React from 'react';
import { AlertTriangle, Settings, TrendingDown, Package, DollarSign, Users } from 'lucide-react';
import { Producto, Venta, Alertas as AlertasType } from '../../types';
import { formatearNumero } from '../../utils/formatters';
import { calcularVentasReales30Dias } from '../../utils/calculations';

interface AlertasProps {
  productos: Producto[];
  alertas: AlertasType;
  actualizarAlertas: (alertas: Partial<AlertasType>) => void;
  ventas: Venta[];
}

export const Alertas: React.FC<AlertasProps> = ({ productos, alertas, actualizarAlertas, ventas }) => {
  // Generar alertas del negocio
  const generarAlertas = () => {
    const alertasActivas: Array<{
      tipo: 'danger' | 'warning' | 'info';
      mensaje: string;
      categoria: string;
      producto: string;
      icono: typeof AlertTriangle;
    }> = [];
    
    productos.forEach(producto => {
      const margen = ((parseFloat(producto.precioVenta) - parseFloat(producto.costoCompra)) / parseFloat(producto.precioVenta)) * 100;
      const stock = parseFloat(producto.stock) || 0;
      const ventasRecientes = calcularVentasReales30Dias(producto.id, ventas);
      const precioCompetencia = parseFloat(producto.precioCompetencia) || 0;
      const precioVenta = parseFloat(producto.precioVenta) || 0;
      
      // Margen bajo
      if (margen < alertas.margenMinimo) {
        alertasActivas.push({
          tipo: 'danger',
          mensaje: `${producto.nombre}: Margen muy bajo (${margen.toFixed(1)}%)`,
          categoria: 'Rentabilidad',
          producto: producto.nombre,
          icono: DollarSign
        });
      }
      
      // Stock bajo
      if (stock < alertas.stockMinimo) {
        alertasActivas.push({
          tipo: 'warning',
          mensaje: `${producto.nombre}: Stock crítico (${stock} unidades)`,
          categoria: 'Inventario',
          producto: producto.nombre,
          icono: Package
        });
      }
      
      // Sin ventas recientes
      if (ventasRecientes === 0) {
        alertasActivas.push({
          tipo: 'info',
          mensaje: `${producto.nombre}: Sin ventas en los últimos 30 días`,
          categoria: 'Ventas',
          producto: producto.nombre,
          icono: TrendingDown
        });
      }
      
      // Precio vs competencia
      if (precioCompetencia > 0 && precioVenta > 0) {
        const diferencia = ((precioVenta - precioCompetencia) / precioCompetencia) * 100;
        if (Math.abs(diferencia) > alertas.diferenciaPrecioCompetencia) {
          alertasActivas.push({
            tipo: diferencia > 0 ? 'warning' : 'info',
            mensaje: `${producto.nombre}: Precio ${diferencia > 0 ? 'superior' : 'inferior'} a competencia (${Math.abs(diferencia).toFixed(1)}%)`,
            categoria: 'Competencia',
            producto: producto.nombre,
            icono: Users
          });
        }
      }
    });
    
    return alertasActivas;
  };

  const alertasActivas = generarAlertas();
  const alertasPorCategoria = alertasActivas.reduce((acc, alerta) => {
    acc[alerta.categoria] = (acc[alerta.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const alertasCriticas = alertasActivas.filter(a => a.tipo === 'danger');
  const alertasAdvertencia = alertasActivas.filter(a => a.tipo === 'warning');
  const alertasInformativas = alertasActivas.filter(a => a.tipo === 'info');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <AlertTriangle className="text-red-500" />
          Sistema de Alertas
        </h2>
        <div className="text-sm text-gray-600">
          {alertasActivas.length} alertas activas
        </div>
      </div>

      {/* Configuración de Alertas */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Settings className="text-blue-500" />
          Configuración de Umbrales
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Margen Mínimo (%)
            </label>
            <input
              type="number"
              value={alertas.margenMinimo}
              onChange={(e) => actualizarAlertas({ margenMinimo: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="20"
              step="0.1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Mínimo
            </label>
            <input
              type="number"
              value={alertas.stockMinimo}
              onChange={(e) => actualizarAlertas({ stockMinimo: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="5"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Días Sin Venta
            </label>
            <input
              type="number"
              value={alertas.diasSinVenta}
              onChange={(e) => actualizarAlertas({ diasSinVenta: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="30"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diferencia Competencia (%)
            </label>
            <input
              type="number"
              value={alertas.diferenciaPrecioCompetencia}
              onChange={(e) => actualizarAlertas({ diferenciaPrecioCompetencia: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="15"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Resumen de Alertas */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Total Alertas</h4>
          <p className="text-2xl font-bold text-gray-800">{alertasActivas.length}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-red-200 bg-red-50">
          <h4 className="text-sm font-medium text-red-600 mb-2">Críticas</h4>
          <p className="text-2xl font-bold text-red-600">{alertasCriticas.length}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-yellow-200 bg-yellow-50">
          <h4 className="text-sm font-medium text-yellow-600 mb-2">Advertencias</h4>
          <p className="text-2xl font-bold text-yellow-600">{alertasAdvertencia.length}</p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-blue-200 bg-blue-50">
          <h4 className="text-sm font-medium text-blue-600 mb-2">Informativas</h4>
          <p className="text-2xl font-bold text-blue-600">{alertasInformativas.length}</p>
        </div>
      </div>

      {/* Alertas por Categoría */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Alertas por Categoría</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(alertasPorCategoria).map(([categoria, cantidad]) => (
            <div key={categoria} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{categoria}</span>
              <span className="text-lg font-bold text-gray-800">{cantidad}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-4">
        {alertasCriticas.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
            <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-red-500" />
              Alertas Críticas ({alertasCriticas.length})
            </h3>
            <div className="space-y-3">
              {alertasCriticas.map((alerta, index) => {
                const Icon = alerta.icono;
                return (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <Icon className="w-5 h-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">{alerta.mensaje}</p>
                      <p className="text-xs text-red-600 mt-1">Categoría: {alerta.categoria}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {alertasAdvertencia.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-yellow-200 shadow-sm">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" />
              Advertencias ({alertasAdvertencia.length})
            </h3>
            <div className="space-y-3">
              {alertasAdvertencia.map((alerta, index) => {
                const Icon = alerta.icono;
                return (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Icon className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">{alerta.mensaje}</p>
                      <p className="text-xs text-yellow-600 mt-1">Categoría: {alerta.categoria}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {alertasInformativas.length > 0 && (
          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-blue-500" />
              Información ({alertasInformativas.length})
            </h3>
            <div className="space-y-3">
              {alertasInformativas.map((alerta, index) => {
                const Icon = alerta.icono;
                return (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-800">{alerta.mensaje}</p>
                      <p className="text-xs text-blue-600 mt-1">Categoría: {alerta.categoria}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {alertasActivas.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto text-green-400 mb-4" size={64} />
            <p className="text-xl text-green-600 mb-2">¡Todo está en orden!</p>
            <p className="text-gray-500">No hay alertas activas en este momento</p>
          </div>
        )}
      </div>
    </div>
  );
};