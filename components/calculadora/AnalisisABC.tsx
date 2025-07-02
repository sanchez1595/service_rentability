import React from 'react';
import { Award, TrendingUp, Package, DollarSign } from 'lucide-react';
import { Producto, Venta, Configuracion } from '../../types';
import { formatearNumero, formatearMoneda } from '../../utils/formatters';
import { calcularVentasReales30Dias } from '../../utils/calculations';

interface AnalisisABCProps {
  productos: Producto[];
  ventas: Venta[];
  configuracion: Configuracion;
}

export const AnalisisABC: React.FC<AnalisisABCProps> = ({ productos, ventas, configuracion }) => {
  // Clasificación ABC de productos
  const clasificacionABC = () => {
    if (productos.length === 0) return { A: [] as any[], B: [] as any[], C: [] as any[] };
    
    const productosConIngreso = productos.map(p => {
      const ventasReales = calcularVentasReales30Dias(p.id, ventas);
      const ventasEstimadas = parseFloat(p.ventasUltimos30Dias) || 0;
      const ventasUtilizadas = ventasReales > 0 ? ventasReales : ventasEstimadas;
      
      return {
        ...p,
        ingresoMensual: (parseFloat(p.precioVenta) || 0) * ventasUtilizadas,
        ventasUtilizadas,
        porcentajeAcumulado: 0
      };
    }).sort((a, b) => b.ingresoMensual - a.ingresoMensual);
    
    const totalIngresos = productosConIngreso.reduce((sum, p) => sum + p.ingresoMensual, 0);
    let acumulado = 0;
    const clasificados = { A: [] as any[], B: [] as any[], C: [] as any[] };
    
    productosConIngreso.forEach(producto => {
      acumulado += producto.ingresoMensual;
      const porcentajeAcumulado = totalIngresos > 0 ? (acumulado / totalIngresos) * 100 : 0;
      producto.porcentajeAcumulado = porcentajeAcumulado;
      
      if (porcentajeAcumulado <= 80) {
        clasificados.A.push(producto);
      } else if (porcentajeAcumulado <= 95) {
        clasificados.B.push(producto);
      } else {
        clasificados.C.push(producto);
      }
    });
    
    return clasificados;
  };

  const calcularPuntoEquilibrio = (producto: any) => {
    const costoUnitario = (parseFloat(producto.costoCompra) || 0) + (parseFloat(producto.gastosFijos) || 0);
    const precioVenta = parseFloat(producto.precioVenta) || 0;
    const contribucionUnitaria = precioVenta - costoUnitario;
    
    if (contribucionUnitaria <= 0) return 'No rentable';
    
    const totalCostosFijos = Object.values(configuracion.costosFijos).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0) +
                           Object.values(configuracion.herramientas).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0);
    
    const unidadesEquilibrio = Math.ceil(totalCostosFijos / contribucionUnitaria);
    return unidadesEquilibrio;
  };

  const clasificados = clasificacionABC();
  const totalIngresos = productos.reduce((sum, p) => {
    const ventasReales = calcularVentasReales30Dias(p.id, ventas);
    const ventasEstimadas = parseFloat(p.ventasUltimos30Dias) || 0;
    const ventasUtilizadas = ventasReales > 0 ? ventasReales : ventasEstimadas;
    return sum + ((parseFloat(p.precioVenta) || 0) * ventasUtilizadas);
  }, 0);

  const resumenClases = [
    {
      clase: 'A',
      nombre: 'Productos Estrella',
      productos: clasificados.A,
      color: 'green',
      descripcion: '80% de los ingresos',
      icono: Award
    },
    {
      clase: 'B',
      nombre: 'Productos Regulares',
      productos: clasificados.B,
      color: 'yellow',
      descripcion: '15% de los ingresos',
      icono: Package
    },
    {
      clase: 'C',
      nombre: 'Productos a Revisar',
      productos: clasificados.C,
      color: 'red',
      descripcion: '5% de los ingresos',
      icono: TrendingUp
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Award className="text-yellow-500" />
          Análisis ABC
        </h2>
        <div className="text-sm text-gray-600">
          Clasificación por rentabilidad
        </div>
      </div>

      {/* Explicación del Análisis ABC */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">¿Qué es el Análisis ABC?</h3>
        <p className="text-blue-700 mb-4">
          El análisis ABC clasifica tus productos según su contribución a los ingresos totales, 
          ayudándote a enfocar tus esfuerzos en los productos más rentables.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-green-100 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">🏆 Clase A (80%)</h4>
            <p className="text-sm text-green-700">
              Productos estrella que generan la mayor parte de tus ingresos. 
              Prioriza su disponibilidad y promoción.
            </p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">📦 Clase B (15%)</h4>
            <p className="text-sm text-yellow-700">
              Productos con rendimiento moderado. Evalúa oportunidades de mejora 
              o considera moverlos a clase A.
            </p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">🔍 Clase C (5%)</h4>
            <p className="text-sm text-red-700">
              Productos de bajo rendimiento. Evalúa si vale la pena mantenerlos 
              o si necesitan estrategias especiales.
            </p>
          </div>
        </div>
      </div>

      {/* Resumen por Clase */}
      <div className="grid md:grid-cols-3 gap-6">
        {resumenClases.map((clase) => {
          const Icon = clase.icono;
          const ingresoClase = clase.productos.reduce((sum, p) => sum + p.ingresoMensual, 0);
          const porcentajeIngreso = totalIngresos > 0 ? (ingresoClase / totalIngresos) * 100 : 0;
          
          return (
            <div key={clase.clase} className={`bg-white rounded-xl p-6 border border-${clase.color}-200 shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className={`w-6 h-6 text-${clase.color}-500`} />
                  <h3 className={`text-lg font-semibold text-${clase.color}-800`}>
                    Clase {clase.clase}
                  </h3>
                </div>
                <span className={`text-2xl font-bold text-${clase.color}-600`}>
                  {clase.productos.length}
                </span>
              </div>
              
              <h4 className={`font-medium text-${clase.color}-700 mb-2`}>{clase.nombre}</h4>
              <p className={`text-sm text-${clase.color}-600 mb-4`}>{clase.descripcion}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ingresos:</span>
                  <span className="font-medium">${formatearNumero(ingresoClase.toFixed(0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">% del total:</span>
                  <span className="font-medium">{porcentajeIngreso.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Productos:</span>
                  <span className="font-medium">{clase.productos.length}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className={`w-full bg-${clase.color}-100 rounded-full h-2`}>
                  <div 
                    className={`bg-${clase.color}-500 h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(porcentajeIngreso, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tablas Detalladas por Clase */}
      {resumenClases.map((clase) => (
        clase.productos.length > 0 && (
          <div key={clase.clase} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className={`bg-${clase.color}-50 px-6 py-4 border-b border-${clase.color}-200`}>
              <h3 className={`text-xl font-semibold text-${clase.color}-800 flex items-center gap-2`}>
                <clase.icono className={`w-5 h-5 text-${clase.color}-500`} />
                Clase {clase.clase} - {clase.nombre} ({clase.productos.length} productos)
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ventas 30d</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Acumulado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilidad</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Punto Equilibrio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clase.productos.map((producto, index) => {
                    const puntoEquilibrio = calcularPuntoEquilibrio(producto);
                    return (
                      <tr key={producto.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                            <div className="text-sm text-gray-500 capitalize">{producto.categoria}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {formatearNumero(producto.ventasUtilizadas)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          ${formatearNumero(parseFloat(producto.precioVenta) || 0)}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-green-600">
                          ${formatearNumero(producto.ingresoMensual.toFixed(0))}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 mr-2">
                              {producto.porcentajeAcumulado.toFixed(1)}%
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`bg-${clase.color}-500 h-2 rounded-full`}
                                style={{ width: `${Math.min(producto.porcentajeAcumulado, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-green-600 font-medium">
                          ${formatearNumero(parseFloat(producto.utilidad) || 0)}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {typeof puntoEquilibrio === 'number' ? formatearNumero(puntoEquilibrio) : puntoEquilibrio}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ))}

      {productos.length === 0 && (
        <div className="text-center py-12">
          <Award className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-xl text-gray-500 mb-2">No hay productos para analizar</p>
          <p className="text-gray-400">Agrega productos a tu inventario para ver el análisis ABC</p>
        </div>
      )}
    </div>
  );
};