import React, { useState } from 'react';
import { BarChart3, Download, Eye, Calendar, TrendingUp, DollarSign, Package, Target, Award } from 'lucide-react';
import { Producto, Venta, Configuracion, Metas, Alertas } from '../../types';
import { formatearNumero, formatearMoneda } from '../../utils/formatters';
import { calcularIngresosReales30Dias, calcularVentasReales30Dias } from '../../utils/calculations';

interface InformesProps {
  productos: Producto[];
  ventas: Venta[];
  configuracion: Configuracion;
  metas: Metas;
  alertas: Alertas;
}

export const Informes: React.FC<InformesProps> = ({ productos, ventas, configuracion, metas, alertas }) => {
  const [vistaInforme, setVistaInforme] = useState('ejecutivo');

  // Cálculos para informes
  const calcularEstadisticas = () => {
    const ingresosMensuales = calcularIngresosReales30Dias(ventas);
    const utilidadMensual = ventas
      .filter(venta => {
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        return new Date(venta.fecha) >= hace30Dias;
      })
      .reduce((sum, venta) => sum + (venta.utilidadTotal || 0), 0);

    const margenPromedio = ingresosMensuales > 0 ? (utilidadMensual / ingresosMensuales) * 100 : 0;
    
    const totalCostosFijos = Object.values(configuracion.costosFijos).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0) +
                           Object.values(configuracion.herramientas).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0);

    const inversionInventario = productos.reduce((sum, p) => sum + ((parseFloat(p.stock) || 0) * (parseFloat(p.costoCompra) || 0)), 0);
    const roi = inversionInventario > 0 ? (utilidadMensual / inversionInventario) * 100 : 0;

    const puntoEquilibrioUnidades = totalCostosFijos > 0 && productos.length > 0 
      ? Math.ceil(totalCostosFijos / (productos.reduce((sum, p) => sum + (parseFloat(p.utilidad) || 0), 0) / productos.length || 1))
      : 0;

    const puntoEquilibrioVentas = puntoEquilibrioUnidades * (productos.reduce((sum, p) => sum + (parseFloat(p.precioVenta) || 0), 0) / productos.length || 0);

    return {
      ingresosMensuales,
      utilidadMensual,
      margenPromedio,
      totalCostosFijos,
      inversionInventario,
      roi,
      puntoEquilibrioUnidades,
      puntoEquilibrioVentas
    };
  };

  const stats = calcularEstadisticas();

  // Clasificación ABC simplificada
  const clasificacionABC = () => {
    const productosConIngreso = productos.map(p => {
      const ventasReales = calcularVentasReales30Dias(p.id, ventas);
      const ventasEstimadas = parseFloat(p.ventasUltimos30Dias) || 0;
      const ventasUtilizadas = ventasReales > 0 ? ventasReales : ventasEstimadas;
      
      return {
        ...p,
        ingresoMensual: (parseFloat(p.precioVenta) || 0) * ventasUtilizadas
      };
    }).sort((a, b) => b.ingresoMensual - a.ingresoMensual);

    const total = productosConIngreso.length;
    return {
      A: productosConIngreso.slice(0, Math.ceil(total * 0.2)),
      B: productosConIngreso.slice(Math.ceil(total * 0.2), Math.ceil(total * 0.5)),
      C: productosConIngreso.slice(Math.ceil(total * 0.5))
    };
  };

  const abc = clasificacionABC();

  // Análisis por categoría
  const analisisPorCategoria = () => {
    const categorias: { [key: string]: { productos: number; ingresoTotal: number; utilidadTotal: number; stockTotal: number; inversionTotal: number; } } = {};
    productos.forEach(producto => {
      if (!categorias[producto.categoria]) {
        categorias[producto.categoria] = {
          productos: 0,
          ingresoTotal: 0,
          utilidadTotal: 0,
          stockTotal: 0,
          inversionTotal: 0
        };
      }
      
      const ventas30d = calcularVentasReales30Dias(producto.id, ventas) || parseFloat(producto.ventasUltimos30Dias) || 0;
      const ingreso = (parseFloat(producto.precioVenta) || 0) * ventas30d;
      const utilidad = (parseFloat(producto.utilidad) || 0) * ventas30d;
      const stock = parseFloat(producto.stock) || 0;
      const inversion = stock * (parseFloat(producto.costoCompra) || 0);
      
      categorias[producto.categoria].productos++;
      categorias[producto.categoria].ingresoTotal += ingreso;
      categorias[producto.categoria].utilidadTotal += utilidad;
      categorias[producto.categoria].stockTotal += stock;
      categorias[producto.categoria].inversionTotal += inversion;
    });
    
    return categorias;
  };

  const categorias = analisisPorCategoria();

  const informes = [
    {
      id: 'ejecutivo',
      titulo: 'Informe Ejecutivo',
      icono: BarChart3,
      descripcion: 'Resumen completo del rendimiento del negocio'
    },
    {
      id: 'abc',
      titulo: 'Análisis ABC',
      icono: Award,
      descripcion: 'Clasificación de productos por rentabilidad'
    },
    {
      id: 'categorias',
      titulo: 'Análisis por Categorías',
      icono: Package,
      descripcion: 'Rendimiento detallado por tipo de producto'
    },
    {
      id: 'punto-equilibrio',
      titulo: 'Punto de Equilibrio',
      icono: Target,
      descripcion: 'Análisis de viabilidad y sostenibilidad'
    }
  ];

  const renderInformeEjecutivo = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-600 mb-2">Ingresos Mensuales</h4>
          <p className="text-2xl font-bold text-blue-800">{formatearMoneda(stats.ingresosMensuales.toFixed(0))}</p>
          <p className="text-sm text-blue-600">Meta: {formatearMoneda(metas.ventasMensuales)}</p>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h4 className="text-sm font-medium text-green-600 mb-2">Utilidad Mensual</h4>
          <p className="text-2xl font-bold text-green-800">{formatearMoneda(stats.utilidadMensual.toFixed(0))}</p>
          <p className="text-sm text-green-600">Margen: {stats.margenPromedio.toFixed(1)}%</p>
        </div>
        
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <h4 className="text-sm font-medium text-purple-600 mb-2">ROI Mensual</h4>
          <p className="text-2xl font-bold text-purple-800">{stats.roi.toFixed(1)}%</p>
          <p className="text-sm text-purple-600">Sobre inversión</p>
        </div>
        
        <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
          <h4 className="text-sm font-medium text-orange-600 mb-2">Productos</h4>
          <p className="text-2xl font-bold text-orange-800">{productos.length}</p>
          <p className="text-sm text-orange-600">En inventario</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">💰 Métricas Financieras</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Ingresos mensuales:</span>
              <span className="font-semibold">{formatearMoneda(stats.ingresosMensuales.toFixed(0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Utilidad mensual:</span>
              <span className="font-semibold text-green-600">{formatearMoneda(stats.utilidadMensual.toFixed(0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Margen promedio:</span>
              <span className="font-semibold">{stats.margenPromedio.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Costos fijos:</span>
              <span className="font-semibold text-red-600">{formatearMoneda(stats.totalCostosFijos)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Inversión inventario:</span>
              <span className="font-semibold">{formatearMoneda(stats.inversionInventario.toFixed(0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ROI mensual:</span>
              <span className={`font-semibold ${stats.roi >= 10 ? 'text-green-600' : 'text-yellow-600'}`}>
                {stats.roi.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">📊 Análisis de Productos</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Productos clase A:</span>
              <span className="font-semibold text-green-600">{abc.A.length} (estrella)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Productos clase B:</span>
              <span className="font-semibold text-yellow-600">{abc.B.length} (regulares)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Productos clase C:</span>
              <span className="font-semibold text-red-600">{abc.C.length} (revisar)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stock total:</span>
              <span className="font-semibold">{formatearNumero(productos.reduce((sum, p) => sum + (parseFloat(p.stock) || 0), 0))} unidades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Productos sin stock:</span>
              <span className="font-semibold text-red-600">{productos.filter(p => (parseFloat(p.stock) || 0) === 0).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Stock crítico:</span>
              <span className="font-semibold text-yellow-600">{productos.filter(p => (parseFloat(p.stock) || 0) < alertas.stockMinimo).length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">🎯 Punto de Equilibrio</h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600 mb-2">Para cubrir todos los costos fijos mensuales necesitas:</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Unidades a vender:</span>
                <span className="font-bold text-blue-600">{formatearNumero(stats.puntoEquilibrioUnidades)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ventas mínimas:</span>
                <span className="font-bold text-blue-600">{formatearMoneda(stats.puntoEquilibrioVentas.toFixed(0))}</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-gray-600 mb-2">Estado actual:</p>
            <div className="space-y-2">
              <div className={`p-3 rounded-lg ${stats.ingresosMensuales >= stats.puntoEquilibrioVentas ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {stats.ingresosMensuales >= stats.puntoEquilibrioVentas 
                  ? '✅ Por encima del punto de equilibrio' 
                  : '⚠️ Por debajo del punto de equilibrio'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">💡 Recomendaciones Estratégicas</h4>
        <div className="grid md:grid-cols-2 gap-4">
          {stats.margenPromedio < metas.margenPromedio && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="font-semibold text-yellow-800 mb-2">Mejorar Márgenes</h5>
              <p className="text-sm text-yellow-700">Tu margen promedio ({stats.margenPromedio.toFixed(1)}%) está por debajo de la meta ({metas.margenPromedio}%). Considera aumentar precios en productos de alta demanda.</p>
            </div>
          )}
          
          {abc.C.length > abc.A.length && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h5 className="font-semibold text-red-800 mb-2">Optimizar Catálogo</h5>
              <p className="text-sm text-red-700">Tienes más productos clase C que clase A. Evalúa descontinuar productos de bajo rendimiento y enfocar en los exitosos.</p>
            </div>
          )}
          
          {stats.roi < 15 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-semibold text-blue-800 mb-2">Mejorar ROI</h5>
              <p className="text-sm text-blue-700">Tu ROI mensual ({stats.roi.toFixed(1)}%) puede mejorarse. Considera reducir inventario de productos lentos o aumentar precios.</p>
            </div>
          )}
          
          {stats.ingresosMensuales < metas.ventasMensuales * 0.8 && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h5 className="font-semibold text-purple-800 mb-2">Impulsar Ventas</h5>
              <p className="text-sm text-purple-700">Estás por debajo de tu meta de ventas. Considera promociones en productos clase A o expandir tu alcance de mercado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAnalisisABC = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { clase: 'A', productos: abc.A, color: 'green', nombre: 'Estrella' },
          { clase: 'B', productos: abc.B, color: 'yellow', nombre: 'Regulares' },
          { clase: 'C', productos: abc.C, color: 'red', nombre: 'Revisar' }
        ].map(({ clase, productos, color, nombre }) => (
          <div key={clase} className={`bg-${color}-50 p-6 rounded-lg border border-${color}-200`}>
            <h4 className={`text-lg font-semibold text-${color}-800 mb-2`}>
              Clase {clase} - {nombre}
            </h4>
            <p className="text-2xl font-bold text-gray-800 mb-2">{productos.length}</p>
            <p className={`text-sm text-${color}-600 mb-4`}>productos</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Ingresos:</span>
                <span className="font-medium">
                  {formatearMoneda(productos.reduce((sum, p) => sum + p.ingresoMensual, 0).toFixed(0))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalisisCategorias = () => (
    <div className="space-y-6">
      <div className="grid gap-4">
        {Object.entries(categorias).map(([categoria, datos]) => (
          <div key={categoria} className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 capitalize">{categoria}</h4>
            <div className="grid md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-gray-600">Productos</p>
                <p className="text-xl font-bold text-gray-800">{datos.productos}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ingresos</p>
                <p className="text-xl font-bold text-green-600">{formatearMoneda(datos.ingresoTotal.toFixed(0))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Utilidad</p>
                <p className="text-xl font-bold text-blue-600">{formatearMoneda(datos.utilidadTotal.toFixed(0))}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Stock</p>
                <p className="text-xl font-bold text-purple-600">{formatearNumero(datos.stockTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Inversión</p>
                <p className="text-xl font-bold text-orange-600">{formatearMoneda(datos.inversionTotal.toFixed(0))}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPuntoEquilibrio = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Análisis de Punto de Equilibrio</h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-700 mb-3">Costos Fijos Mensuales</h5>
            <div className="space-y-2 text-sm">
              {Object.entries(configuracion.costosFijos).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{key}:</span>
                  <span className="font-medium">{formatearMoneda(value)}</span>
                </div>
              ))}
              {Object.entries(configuracion.herramientas).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{key}:</span>
                  <span className="font-medium">{formatearMoneda(value)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total:</span>
                <span>{formatearMoneda(stats.totalCostosFijos)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-700 mb-3">Punto de Equilibrio</h5>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Unidades necesarias</p>
                <p className="text-2xl font-bold text-blue-800">{formatearNumero(stats.puntoEquilibrioUnidades)}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 mb-1">Ventas mínimas</p>
                <p className="text-2xl font-bold text-green-800">{formatearMoneda(stats.puntoEquilibrioVentas.toFixed(0))}</p>
              </div>
              <div className={`p-4 rounded-lg ${stats.ingresosMensuales >= stats.puntoEquilibrioVentas ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className={`text-sm ${stats.ingresosMensuales >= stats.puntoEquilibrioVentas ? 'text-green-600' : 'text-red-600'} mb-1`}>
                  Estado actual
                </p>
                <p className={`text-lg font-bold ${stats.ingresosMensuales >= stats.puntoEquilibrioVentas ? 'text-green-800' : 'text-red-800'}`}>
                  {stats.ingresosMensuales >= stats.puntoEquilibrioVentas ? 'Rentable' : 'Pérdidas'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="text-blue-500" />
          Informes y Análisis
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          <Download className="w-4 h-4" />
          Exportar PDF
        </button>
      </div>

      {/* Selector de Informe */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {informes.map(informe => {
            const Icon = informe.icono;
            return (
              <button
                key={informe.id}
                onClick={() => setVistaInforme(informe.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  vistaInforme === informe.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {informe.titulo}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {informes.find(i => i.id === vistaInforme)?.descripcion}
        </p>
      </div>

      {/* Contenido del Informe */}
      <div>
        {vistaInforme === 'ejecutivo' && renderInformeEjecutivo()}
        {vistaInforme === 'abc' && renderAnalisisABC()}
        {vistaInforme === 'categorias' && renderAnalisisCategorias()}
        {vistaInforme === 'punto-equilibrio' && renderPuntoEquilibrio()}
      </div>
    </div>
  );
};