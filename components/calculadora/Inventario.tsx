import React from 'react';
import { Edit2, Trash2, Package, Package2 } from 'lucide-react';
import { Producto, Venta } from '../../types';
import { formatearNumero } from '../../utils/formatters';

interface InventarioProps {
  productos: Producto[];
  onEditarProducto: (producto: Producto) => void;
  onEliminarProducto: (id: string) => void;
  ventas: Venta[];
}

export const Inventario: React.FC<InventarioProps> = ({ productos, onEditarProducto, onEliminarProducto, ventas }) => {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-purple-500" />
          Gestión de Inventario
        </h2>
        <div className="text-sm text-gray-600">
          Total: {productos.length} productos
        </div>
      </div>

      {/* Resumen del Inventario - Movido aquí arriba */}
      <div className="grid md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Valor Total Inventario</h4>
          <p className="text-2xl font-bold text-gray-800">
            ${formatearNumero(productos.reduce((sum, p) => sum + ((parseFloat(p.stock) || 0) * (parseFloat(p.costoCompra) || 0)), 0).toFixed(0))}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Productos con Stock Bajo</h4>
          <p className="text-2xl font-bold text-yellow-600">
            {productos.filter(p => (parseFloat(p.stock) || 0) < 5).length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Sin Stock</h4>
          <p className="text-2xl font-bold text-red-600">
            {productos.filter(p => (parseFloat(p.stock) || 0) === 0).length}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Productos en Paquete</h4>
          <p className="text-2xl font-bold text-amber-600">
            {productos.filter(p => p.esPaquete).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            de {productos.length} total
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Margen Promedio</h4>
          <p className="text-2xl font-bold text-green-600">
            {productos.length > 0 ? (productos.reduce((sum, p) => {
              const precio = parseFloat(p.precioVenta) || 0;
              const costoReal = p.esPaquete && p.costoUnitario 
                ? parseFloat(p.costoUnitario) 
                : parseFloat(p.costoCompra) || 0;
              return sum + (precio > 0 ? ((precio - costoReal) / precio) * 100 : 0);
            }, 0) / productos.length).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {productos.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto text-gray-400 mb-4" size={64} />
          <p className="text-xl text-gray-500 mb-2">No hay productos en el inventario</p>
          <p className="text-gray-400">Agrega productos desde la calculadora para comenzar</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo Unit.
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo Paq.
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilidad
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margen %
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productos.map((producto) => {
                  const stock = parseFloat(producto.stock) || 0;
                  // Para paquetes, usar el costo unitario real, no el costo del paquete completo
                  const costoReal = producto.esPaquete && producto.costoUnitario 
                    ? parseFloat(producto.costoUnitario) 
                    : parseFloat(producto.costoCompra) || 0;
                  const precio = parseFloat(producto.precioVenta) || 0;
                  const utilidad = parseFloat(producto.utilidad) || 0;
                  const margen = precio > 0 ? ((precio - costoReal) / precio) * 100 : 0;
                  
                  const getEstadoStock = () => {
                    if (stock === 0) return { texto: 'Sin stock', color: 'red' };
                    if (stock < 5) return { texto: 'Stock bajo', color: 'yellow' };
                    if (stock < 10) return { texto: 'Stock medio', color: 'blue' };
                    return { texto: 'Stock bueno', color: 'green' };
                  };
                  
                  const estadoStock = getEstadoStock();
                  
                  return (
                    <tr key={producto.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-start space-x-2">
                          <div className="flex-shrink-0 mt-0.5">
                            {producto.esPaquete ? (
                              <Package2 className="w-4 h-4 text-amber-600" />
                            ) : (
                              <Package className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">{producto.nombre}</span>
                              {producto.esPaquete && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                  Paquete x{producto.unidadesPorPaquete || 1}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">#{producto.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {producto.categoria}
                        </span>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">{formatearNumero(stock)}</div>
                        <div className={`text-xs ${
                          estadoStock.color === 'red' ? 'text-red-600' :
                          estadoStock.color === 'yellow' ? 'text-yellow-600' :
                          estadoStock.color === 'blue' ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {estadoStock.texto}
                        </div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900">
                        ${formatearNumero(costoReal)}
                        {producto.esPaquete && (
                          <div className="text-xs text-gray-500">
                            Por unidad
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900">
                        {producto.esPaquete && producto.unidadesPorPaquete ? (
                          <div>
                            <div className="font-medium text-amber-600">
                              ${formatearNumero((costoReal * parseFloat(producto.unidadesPorPaquete)).toFixed(0))}
                            </div>
                            <div className="text-xs text-gray-500">
                              x{producto.unidadesPorPaquete} unid.
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                        ${formatearNumero(precio)}
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          ${formatearNumero(utilidad)}
                        </div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <div className={`text-sm font-bold ${margen >= 30 ? 'text-green-600' : margen >= 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {margen.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            margen >= 30 ? 'bg-green-100 text-green-800' :
                            margen >= 20 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {margen >= 30 ? 'Excelente' : margen >= 20 ? 'Bueno' : 'Revisar'}
                          </span>
                          {producto.rotacion && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              producto.rotacion === 'alta' ? 'bg-blue-100 text-blue-800' :
                              producto.rotacion === 'media' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              Rot. {producto.rotacion}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => onEditarProducto(producto)}
                            className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                            title="Editar producto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de eliminar ${producto.nombre}?`)) {
                                onEliminarProducto(producto.id);
                              }
                            }}
                            className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};