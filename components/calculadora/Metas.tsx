import React from 'react';
import { Target, TrendingUp, CheckCircle, AlertCircle, Package, DollarSign } from 'lucide-react';
import { Metas as MetasType, Producto, Venta } from '../../types';
import { formatearNumero, formatearMoneda } from '../../utils/formatters';
import { calcularIngresosReales30Dias } from '../../utils/calculations';

interface MetasProps {
  metas: MetasType;
  actualizarMetas: (metas: Partial<MetasType>) => void;
  productos: Producto[];
  ventas: Venta[];
}

export const Metas: React.FC<MetasProps> = ({ metas, actualizarMetas, productos, ventas }) => {
  // Calcular progreso actual
  const ventasMensuales = calcularIngresosReales30Dias(ventas);
  const unidadesMensuales = ventas
    .filter(venta => {
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      return new Date(venta.fecha) >= hace30Dias;
    })
    .reduce((sum, venta) => sum + (venta.cantidad || 0), 0);

  const margenPromedio = productos.length > 0 
    ? productos.reduce((sum, producto) => {
        const precio = parseFloat(producto.precioVenta) || 0;
        const costo = parseFloat(producto.costoCompra) || 0;
        return sum + (precio > 0 ? ((precio - costo) / precio) * 100 : 0);
      }, 0) / productos.length
    : 0;

  // Calcular rotación de inventario (simplificado)
  const valorInventario = productos.reduce((sum, p) => sum + ((parseFloat(p.stock) || 0) * (parseFloat(p.costoCompra) || 0)), 0);
  const costoVentasMensuales = ventas
    .filter(venta => {
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);
      return new Date(venta.fecha) >= hace30Dias;
    })
    .reduce((sum, venta) => sum + (venta.costoUnitario * venta.cantidad), 0);
  
  const rotacionInventario = valorInventario > 0 ? (costoVentasMensuales * 12) / valorInventario : 0;

  const metasData = [
    {
      nombre: 'Ventas Mensuales',
      actual: ventasMensuales,
      meta: metas.ventasMensuales,
      progreso: metas.ventasMensuales > 0 ? (ventasMensuales / metas.ventasMensuales) * 100 : 0,
      unidad: '$',
      icono: DollarSign,
      color: 'blue',
      descripcion: 'Ingresos totales del último mes'
    },
    {
      nombre: 'Unidades Mensuales',
      actual: unidadesMensuales,
      meta: metas.unidadesMensuales,
      progreso: metas.unidadesMensuales > 0 ? (unidadesMensuales / metas.unidadesMensuales) * 100 : 0,
      unidad: '',
      icono: Package,
      color: 'green',
      descripcion: 'Cantidad de productos vendidos'
    },
    {
      nombre: 'Margen Promedio',
      actual: margenPromedio,
      meta: metas.margenPromedio,
      progreso: metas.margenPromedio > 0 ? (margenPromedio / metas.margenPromedio) * 100 : 0,
      unidad: '%',
      icono: TrendingUp,
      color: 'purple',
      descripcion: 'Rentabilidad promedio de productos'
    },
    {
      nombre: 'Rotación Inventario',
      actual: rotacionInventario,
      meta: metas.rotacionInventario,
      progreso: metas.rotacionInventario > 0 ? (rotacionInventario / metas.rotacionInventario) * 100 : 0,
      unidad: 'x/año',
      icono: Target,
      color: 'orange',
      descripcion: 'Veces que rota el inventario anualmente'
    }
  ];

  const getEstadoMeta = (progreso: number) => {
    if (progreso >= 100) return { estado: 'completada', icono: CheckCircle, color: 'green' };
    if (progreso >= 80) return { estado: 'en_progreso', icono: TrendingUp, color: 'blue' };
    return { estado: 'atrasada', icono: AlertCircle, color: 'red' };
  };

  const recomendaciones = [
    {
      titulo: 'Aumentar Ventas',
      descripcion: 'Considera promociones en productos clase A para impulsar las ventas',
      aplicable: ventasMensuales < metas.ventasMensuales * 0.8
    },
    {
      titulo: 'Optimizar Inventario',
      descripcion: 'Revisa productos con baja rotación y considera reducir stock',
      aplicable: rotacionInventario < metas.rotacionInventario * 0.8
    },
    {
      titulo: 'Mejorar Márgenes',
      descripcion: 'Evalúa aumentos de precio en productos con alta demanda',
      aplicable: margenPromedio < metas.margenPromedio * 0.9
    },
    {
      titulo: 'Diversificar Productos',
      descripcion: 'Agrega productos de categorías con mejor margen',
      aplicable: unidadesMensuales < metas.unidadesMensuales * 0.8
    }
  ];

  const recomendacionesActivas = recomendaciones.filter(r => r.aplicable);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Target className="text-blue-500" />
          Metas del Negocio
        </h2>
        <div className="text-sm text-gray-600">
          {metasData.filter(m => m.progreso >= 100).length} de {metasData.length} metas completadas
        </div>
      </div>

      {/* Configuración de Metas */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurar Objetivos</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Ventas Mensuales ($)
            </label>
            <input
              type="text"
              value={formatearNumero(metas.ventasMensuales)}
              onChange={(e) => {
                const valor = e.target.value.replace(/\D/g, '');
                actualizarMetas({ ventasMensuales: parseInt(valor) || 0 });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="2,000,000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Unidades Mensuales
            </label>
            <input
              type="number"
              value={metas.unidadesMensuales}
              onChange={(e) => actualizarMetas({ unidadesMensuales: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Margen Promedio (%)
            </label>
            <input
              type="number"
              value={metas.margenPromedio}
              onChange={(e) => actualizarMetas({ margenPromedio: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="35"
              step="0.1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Rotación Inventario
            </label>
            <input
              type="number"
              value={metas.rotacionInventario}
              onChange={(e) => actualizarMetas({ rotacionInventario: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="12"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Progreso de Metas */}
      <div className="grid md:grid-cols-2 gap-6">
        {metasData.map((meta, index) => {
          const Icon = meta.icono;
          const estado = getEstadoMeta(meta.progreso);
          const EstadoIcon = estado.icono;
          
          return (
            <div key={index} className={`bg-white rounded-xl p-6 border border-gray-200 shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className={`w-6 h-6 text-${meta.color}-500`} />
                  <h3 className="text-lg font-semibold text-gray-800">{meta.nombre}</h3>
                </div>
                <EstadoIcon className={`w-5 h-5 text-${estado.color}-500`} />
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{meta.descripcion}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-gray-600">Actual</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {meta.unidad === '$' ? formatearMoneda(meta.actual.toFixed(0)) : 
                       meta.unidad === '%' ? `${meta.actual.toFixed(1)}%` :
                       meta.unidad === 'x/año' ? `${meta.actual.toFixed(1)}x` :
                       formatearNumero(meta.actual)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Meta</p>
                    <p className="text-lg font-semibold text-gray-700">
                      {meta.unidad === '$' ? formatearMoneda(meta.meta) : 
                       meta.unidad === '%' ? `${meta.meta}%` :
                       meta.unidad === 'x/año' ? `${meta.meta}x` :
                       formatearNumero(meta.meta)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progreso</span>
                    <span className={`font-medium text-${estado.color}-600`}>
                      {meta.progreso.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`bg-${meta.color}-500 h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(meta.progreso, 100)}%` }}
                    ></div>
                  </div>
                  {meta.progreso > 100 && (
                    <p className="text-xs text-green-600 mt-1">¡Meta superada!</p>
                  )}
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {meta.progreso >= 100 ? '✅ Meta completada' :
                     meta.progreso >= 80 ? '🔥 Cerca de la meta' :
                     meta.progreso >= 50 ? '⚡ En progreso' :
                     '📈 Necesita impulso'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recomendaciones */}
      {recomendacionesActivas.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-500" />
            Recomendaciones para Mejorar
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {recomendacionesActivas.map((recomendacion, index) => (
              <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">{recomendacion.titulo}</h4>
                <p className="text-sm text-blue-700">{recomendacion.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen Ejecutivo */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen Ejecutivo</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {metasData.filter(m => m.progreso >= 100).length}
            </p>
            <p className="text-sm text-gray-600">Metas Completadas</p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {(metasData.reduce((sum, m) => sum + m.progreso, 0) / metasData.length).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Progreso Promedio</p>
          </div>
          
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {recomendacionesActivas.length}
            </p>
            <p className="text-sm text-gray-600">Acciones Sugeridas</p>
          </div>
        </div>
      </div>
    </div>
  );
};