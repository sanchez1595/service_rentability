import React from 'react';
import { TrendingUp, DollarSign, Package, BarChart3, Target, TrendingDown, ArrowUp, ArrowDown, AlertTriangle, Activity, ShoppingCart } from 'lucide-react';
import { Producto, Venta, Metas, Alertas, Configuracion } from '../../types';
import { formatearNumero, formatearMoneda } from '../../utils/formatters';
import { calcularIngresosReales30Dias, obtenerTendenciaVentas } from '../../utils/calculations';

interface DashboardProps {
  productos: Producto[];
  ventas: Venta[];
  metas: Metas;
  alertas: Alertas;
  configuracion: Configuracion;
}

export const Dashboard: React.FC<DashboardProps> = ({ productos, ventas, metas, alertas, configuracion }) => {
  // Calcular ventas de hoy
  const hoy = new Date().toISOString().split('T')[0];
  const ventasHoy = ventas.filter(venta => venta.fecha === hoy);
  const ventasHoyTotal = ventasHoy.reduce((sum, venta) => sum + (venta.ingresoTotal || 0), 0);
  const unidadesHoy = ventasHoy.reduce((sum, venta) => sum + (venta.cantidad || 0), 0);

  // Calcular ventas mensuales
  const ventasMensuales = calcularIngresosReales30Dias(ventas);
  const progresoVentasMensuales = metas.ventasMensuales > 0 ? (ventasMensuales / metas.ventasMensuales) * 100 : 0;

  // Calcular utilidad mensual
  const utilidadMensual = ventas
    .filter(venta => {
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      return new Date(venta.fecha) >= hace30Dias;
    })
    .reduce((sum, venta) => sum + (venta.utilidadTotal || 0), 0);

  // Obtener tendencia
  const tendencia = obtenerTendenciaVentas(ventas);

  // Generar alertas
  const alertasActivas: Array<{tipo: string, mensaje: string}> = [];
  productos.forEach(producto => {
    const margen = ((parseFloat(producto.precioVenta) - parseFloat(producto.costoCompra)) / parseFloat(producto.precioVenta)) * 100;
    const stock = parseFloat(producto.stock) || 0;
    
    if (margen < alertas.margenMinimo) {
      alertasActivas.push({ tipo: 'danger', mensaje: `${producto.nombre}: Margen bajo` });
    }
    if (stock < alertas.stockMinimo) {
      alertasActivas.push({ tipo: 'warning', mensaje: `${producto.nombre}: Stock crítico` });
    }
  });

  const kpis = [
    {
      titulo: 'Ventas Hoy',
      valor: `$${formatearNumero(ventasHoyTotal.toFixed(0))}`,
      subtitulo: `${unidadesHoy} unidades`,
      icono: ShoppingCart,
      color: 'green'
    },
    {
      titulo: 'Ventas Mensuales',
      valor: `$${formatearNumero(ventasMensuales.toFixed(0))}`,
      subtitulo: `${progresoVentasMensuales.toFixed(1)}% de la meta`,
      icono: DollarSign,
      color: 'blue',
      progreso: Math.min(progresoVentasMensuales, 100)
    },
    {
      titulo: 'Utilidad Mensual',
      valor: `$${formatearNumero(utilidadMensual.toFixed(0))}`,
      subtitulo: `${ventasMensuales > 0 ? ((utilidadMensual / ventasMensuales) * 100).toFixed(1) : 0}% margen`,
      icono: TrendingUp,
      color: 'emerald'
    },
    {
      titulo: 'Tendencia 7 días',
      valor: `${Math.abs(tendencia.cambioPortentual || 0).toFixed(1)}%`,
      subtitulo: tendencia.tendencia === 'subiendo' ? 'Subiendo' : tendencia.tendencia === 'bajando' ? 'Bajando' : 'Estable',
      icono: tendencia.tendencia === 'subiendo' ? ArrowUp : tendencia.tendencia === 'bajando' ? ArrowDown : Activity,
      color: tendencia.tendencia === 'subiendo' ? 'green' : tendencia.tendencia === 'bajando' ? 'red' : 'gray'
    },
    {
      titulo: 'Alertas Activas',
      valor: alertasActivas.length.toString(),
      subtitulo: `${alertasActivas.filter(a => a.tipo === 'danger').length} críticas`,
      icono: AlertTriangle,
      color: alertasActivas.length > 0 ? 'red' : 'gray'
    }
  ];

  // Productos por categoría
  const productosPorCategoria = productos.reduce((acc, p) => {
    acc[p.categoria] = (acc[p.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icono;
          return (
            <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-6 h-6 text-${kpi.color}-500`} />
                {kpi.progreso !== undefined && (
                  <span className="text-xs text-gray-500">{kpi.progreso.toFixed(0)}%</span>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">{kpi.titulo}</p>
                <p className="text-lg font-bold text-gray-800">{kpi.valor}</p>
                <p className="text-xs text-gray-500">{kpi.subtitulo}</p>
                {kpi.progreso !== undefined && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`bg-${kpi.color}-500 h-1.5 rounded-full transition-all duration-300`}
                        style={{ width: `${Math.min(kpi.progreso, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen de Metas */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="text-blue-500" />
            Progreso de Metas
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Ventas Mensuales</span>
                <span>${formatearNumero(ventasMensuales.toFixed(0))} / ${formatearNumero(metas.ventasMensuales)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progresoVentasMensuales, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{progresoVentasMensuales.toFixed(1)}% completado</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Unidades Mensuales</span>
                <span>{ventas.filter(v => {
                  const hace30 = new Date();
                  hace30.setDate(hace30.getDate() - 30);
                  return new Date(v.fecha) >= hace30;
                }).reduce((sum, v) => sum + (v.cantidad || 0), 0)} / {metas.unidadesMensuales}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((ventas.filter(v => {
                    const hace30 = new Date();
                    hace30.setDate(hace30.getDate() - 30);
                    return new Date(v.fecha) >= hace30;
                  }).reduce((sum, v) => sum + (v.cantidad || 0), 0) / metas.unidadesMensuales) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="text-purple-500" />
            Resumen de Inventario
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Productos</span>
              <span className="font-semibold">{productos.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stock Total</span>
              <span className="font-semibold">{formatearNumero(productos.reduce((sum, p) => sum + (parseFloat(p.stock) || 0), 0))} unidades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor Inventario</span>
              <span className="font-semibold text-green-600">
                ${formatearNumero(productos.reduce((sum, p) => sum + ((parseFloat(p.stock) || 0) * (parseFloat(p.costoCompra) || 0)), 0).toFixed(0))}
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Por Categoría:</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(productosPorCategoria).map(([categoria, cantidad]) => (
                <div key={categoria} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{categoria}</span>
                  <span className="font-medium">{cantidad}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alertas Recientes */}
      {alertasActivas.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            Alertas Recientes
          </h3>
          <div className="space-y-2">
            {alertasActivas.slice(0, 5).map((alerta, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${
                  alerta.tipo === 'danger' ? 'bg-red-50 border border-red-200' :
                  alerta.tipo === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-blue-50 border border-blue-200'
                }`}
              >
                <p className={`text-sm ${
                  alerta.tipo === 'danger' ? 'text-red-700' :
                  alerta.tipo === 'warning' ? 'text-yellow-700' :
                  'text-blue-700'
                }`}>
                  {alerta.mensaje}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};