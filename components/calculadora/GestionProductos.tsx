import React from 'react';
import { Edit2, Trash2, Save, X, Calculator, Plus, TrendingUp } from 'lucide-react';
import { Producto, ProductoActual, Configuracion } from '../../types';
import { CATEGORIAS } from '../../utils/constants';
import { formatearInput, formatearMoneda } from '../../utils/formatters';

interface GestionProductosProps {
  productos: Producto[];
  productoActual: ProductoActual;
  editandoId: string | null;
  onCambioInput: (campo: keyof ProductoActual, valor: string) => void;
  onCalcularPrecios: () => void;
  onAgregarProducto: () => void;
  onEditarProducto: (id: string) => void;
  onGuardarEdicion: () => void;
  onEliminarProducto: (id: string) => void;
  onCancelarEdicion: () => void;
  configuracion: Configuracion;
}

export const GestionProductos: React.FC<GestionProductosProps> = ({
  productos,
  productoActual,
  editandoId,
  onCambioInput,
  onCalcularPrecios,
  onAgregarProducto,
  onEditarProducto,
  onGuardarEdicion,
  onEliminarProducto,
  onCancelarEdicion,
  configuracion
}) => {
  const formatearNumero = (numero: number | string) => {
    return new Intl.NumberFormat('es-CO').format(Number(numero));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {editandoId ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <p className="text-slate-600">Calcula precios óptimos automáticamente</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nombre del Producto
            </label>
            <input
              type="text"
              value={productoActual.nombre}
              onChange={(e) => onCambioInput('nombre', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Ej: Pañales Huggies Talla M"
            />
          </div>

          {/* Configuración de Paquetes - Movido aquí para mejor flujo */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-amber-800 mb-3">Configuración de Paquetes</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="esPaquete"
                  checked={productoActual.esPaquete}
                  onChange={(e) => onCambioInput('esPaquete', e.target.checked.toString())}
                  className="w-5 h-5 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                />
                <label htmlFor="esPaquete" className="text-sm font-medium text-amber-700">
                  Este producto viene en paquete (voy a venderlo por unidades)
                </label>
              </div>
              
              {productoActual.esPaquete && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-amber-700 mb-2">
                        Cantidad de Paquetes
                      </label>
                      <input
                        type="text"
                        value={formatearInput(productoActual.cantidadPaquetes)}
                        onChange={(e) => onCambioInput('cantidadPaquetes', e.target.value)}
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                        placeholder="Ej: 2 paquetes"
                      />
                      <p className="text-xs text-amber-600 mt-1">
                        ¿Cuántos paquetes compraste?
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-amber-700 mb-2">
                        Unidades por Paquete
                      </label>
                      <input
                        type="text"
                        value={formatearInput(productoActual.unidadesPorPaquete)}
                        onChange={(e) => onCambioInput('unidadesPorPaquete', e.target.value)}
                        className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                        placeholder="Ej: 6 pares"
                      />
                      <p className="text-xs text-amber-600 mt-1">
                        ¿Cuántas unidades vienen en cada paquete que compras?
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-amber-100 border border-amber-300 rounded-lg p-3">
                    <div className="text-sm font-medium text-amber-700 mb-1">
                      Resumen de unidades
                    </div>
                    <div className="text-amber-800">
                      <span className="font-bold">
                        {(() => {
                          const paquetes = parseFloat(productoActual.cantidadPaquetes) || 0;
                          const unidades = parseFloat(productoActual.unidadesPorPaquete) || 0;
                          return formatearInput((paquetes * unidades).toString());
                        })()}
                      </span> unidades totales
                    </div>
                    <div className="text-xs text-amber-600 mt-1">
                      {productoActual.cantidadPaquetes || '0'} paquetes × {productoActual.unidadesPorPaquete || '0'} unidades
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-amber-700 mb-2">
                      Costo por Unidad Individual
                    </label>
                    <div className="px-3 py-2 bg-amber-100 border border-amber-300 rounded-lg text-amber-800 font-medium">
                      {productoActual.costoUnitario && parseFloat(productoActual.costoUnitario) > 0
                        ? `$${formatearInput(productoActual.costoUnitario)}`
                        : 'Calculado automáticamente'}
                    </div>
                    <p className="text-xs text-amber-600 mt-1">
                      Se calcula dividiendo el costo total entre todas las unidades
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Categoría
              </label>
              <select
                value={productoActual.categoria}
                onChange={(e) => onCambioInput('categoria', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {CATEGORIAS.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Stock {productoActual.esPaquete ? '(calculado automáticamente)' : ''}
              </label>
              {productoActual.esPaquete ? (
                <div className="px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-medium">
                  {(() => {
                    const paquetes = parseFloat(productoActual.cantidadPaquetes) || 0;
                    const unidades = parseFloat(productoActual.unidadesPorPaquete) || 0;
                    const total = paquetes * unidades;
                    return total > 0 ? formatearInput(total.toString()) + ' unidades' : '0 unidades';
                  })()}
                </div>
              ) : (
                <input
                  type="text"
                  value={formatearInput(productoActual.stock)}
                  onChange={(e) => onCambioInput('stock', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              )}
              {productoActual.esPaquete && (
                <p className="text-xs text-slate-500 mt-1">
                  Stock total calculado: {productoActual.cantidadPaquetes || '0'} paquetes × {productoActual.unidadesPorPaquete || '0'} unidades
                </p>
              )}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Costo de Compra Total ($)
              </label>
              <input
                type="text"
                value={formatearInput(productoActual.costoCompra)}
                onChange={(e) => onCambioInput('costoCompra', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="0"
              />
              {productoActual.esPaquete && productoActual.cantidadPaquetes && parseFloat(productoActual.cantidadPaquetes) > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Costo total por {productoActual.cantidadPaquetes} paquete{parseFloat(productoActual.cantidadPaquetes) > 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Gastos Fijos Asignados ($)
              </label>
              <input
                type="text"
                value={formatearInput(productoActual.gastosFijos)}
                onChange={(e) => onCambioInput('gastosFijos', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="0"
              />
            </div>
          </div>


          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ventas Estimadas (30 días)
              </label>
              <input
                type="text"
                value={formatearInput(productoActual.ventasUltimos30Dias)}
                onChange={(e) => onCambioInput('ventasUltimos30Dias', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Precio Competencia ($)
              </label>
              <input
                type="text"
                value={formatearInput(productoActual.precioCompetencia)}
                onChange={(e) => onCambioInput('precioCompetencia', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Margen de Ganancia Deseado (%)
            </label>
            <input
              type="number"
              step="1"
              value={productoActual.margenDeseado}
              onChange={(e) => onCambioInput('margenDeseado', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="30"
            />
          </div>
          
          <button
            onClick={editandoId ? onGuardarEdicion : onAgregarProducto}
            disabled={!productoActual.nombre || !productoActual.costoCompra || productoActual.costoCompra === ''}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
          >
            <Save size={20} />
            <span>{editandoId ? 'Actualizar Producto' : 'Agregar Producto'}</span>
          </button>
        </div>
      </div>
      
      {/* Resultados */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Resultados del Cálculo</h2>
            <p className="text-slate-600">Análisis de precios y rentabilidad</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Información de Paquete */}
          {productoActual.esPaquete && productoActual.unidadesPorPaquete && parseFloat(productoActual.unidadesPorPaquete) > 1 && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <div className="text-sm font-medium text-amber-700 mb-2">Análisis de Costos por Paquete</div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-amber-600">Cantidad de paquetes:</span>
                    <div className="font-bold text-amber-800">
                      {productoActual.cantidadPaquetes || '0'} paquete{parseFloat(productoActual.cantidadPaquetes || '0') !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div>
                    <span className="text-amber-600">Unidades por paquete:</span>
                    <div className="font-bold text-amber-800">
                      {formatearInput(productoActual.unidadesPorPaquete)} unidades
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-amber-300 pt-3">
                  <div className="text-amber-600 text-sm mb-1">Costo total de la compra:</div>
                  <div className="font-bold text-amber-800 text-lg">
                    {productoActual.costoCompra && parseFloat(productoActual.costoCompra) > 0
                      ? `$${formatearNumero(parseFloat(productoActual.costoCompra).toFixed(0))}`
                      : '-'}
                  </div>
                  {productoActual.cantidadPaquetes && parseFloat(productoActual.cantidadPaquetes) > 0 && (
                    <div className="text-xs text-amber-600 mt-1">
                      Por {productoActual.cantidadPaquetes} paquete{parseFloat(productoActual.cantidadPaquetes) > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                
                <div className="border-t border-amber-300 pt-3">
                  <div className="text-amber-600 text-sm mb-1">Costo por unidad individual:</div>
                  <div className="font-bold text-amber-800 text-xl">
                    {productoActual.costoUnitario && parseFloat(productoActual.costoUnitario) > 0
                      ? `$${formatearNumero(parseFloat(productoActual.costoUnitario).toFixed(0))}`
                      : '-'}
                  </div>
                  <div className="text-xs text-amber-600 mt-1">
                    Total unidades: {(() => {
                      const paquetes = parseFloat(productoActual.cantidadPaquetes) || 0;
                      const unidades = parseFloat(productoActual.unidadesPorPaquete) || 0;
                      return paquetes * unidades;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-sm font-medium text-slate-600">
              {productoActual.esPaquete ? 'Costo Base por Unidad' : 'Costo Base del Producto'}
            </div>
            <div className="text-xl font-bold text-slate-800">
              {productoActual.esPaquete && productoActual.costoUnitario && parseFloat(productoActual.costoUnitario) > 0
                ? `$${formatearNumero(parseFloat(productoActual.costoUnitario).toFixed(0))}`
                : productoActual.costoCompra && parseFloat(productoActual.costoCompra) > 0
                ? `$${formatearNumero(parseFloat(productoActual.costoCompra).toFixed(0))}`
                : '-'}
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <div className="text-sm font-medium text-orange-700">Costo Fijo Distribuido</div>
            <div className="text-xl font-bold text-orange-800">
              {(() => {
                const totalCostosFijos = Object.values(configuracion.costosFijos).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0);
                const totalHerramientas = Object.values(configuracion.herramientas).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0);
                const total = totalCostosFijos + totalHerramientas;
                return total > 0 ? `$${formatearNumero(((totalCostosFijos + totalHerramientas) / (configuracion.ventasEstimadas || 1)).toFixed(0))}` : '-';
              })()}
            </div>
            <div className="text-xs text-orange-600 mt-1">Arriendo, servicios, herramientas</div>
          </div>
          
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="text-sm font-medium text-purple-700">
              Gastos Operativos ({Object.values(configuracion.porcentajes).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0).toFixed(1)}%)
            </div>
            <div className="text-xl font-bold text-purple-800">
              {(() => {
                const costo = parseFloat(productoActual.costoCompra) || 0;
                const gastos = parseFloat(productoActual.gastosFijos) || 0;
                const totalCostosFijos = Object.values(configuracion.costosFijos).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0);
                const totalHerramientas = Object.values(configuracion.herramientas).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0);
                const costoFijoPorProducto = (totalCostosFijos + totalHerramientas) / (configuracion.ventasEstimadas || 1);
                const totalPorcentajes = Object.values(configuracion.porcentajes).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0);
                const costoBase = costo + gastos + costoFijoPorProducto;
                
                if (costoBase === 0 || totalPorcentajes === 0) return '-';
                
                const precioConPorcentajes = costoBase / (1 - (totalPorcentajes / 100));
                const gastosOperativos = precioConPorcentajes - costoBase;
                return `$${formatearNumero(gastosOperativos.toFixed(0))}`;
              })()}
            </div>
            <div className="text-xs text-purple-600 mt-1">Contabilidad, mercadeo, ventas, etc.</div>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="text-sm font-medium text-blue-700">Precio de Venta Final</div>
            <div className="text-3xl font-bold text-blue-800">
              {productoActual.precioVenta && parseFloat(productoActual.precioVenta) > 0 
                ? `$${formatearNumero(parseFloat(productoActual.precioVenta).toFixed(0))}` 
                : '-'}
            </div>
          </div>
          
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <div className="text-sm font-medium text-emerald-700">Utilidad Neta por Unidad</div>
            <div className="text-3xl font-bold text-emerald-800">
              {productoActual.utilidad && parseFloat(productoActual.utilidad) > 0 
                ? `$${formatearNumero(parseFloat(productoActual.utilidad).toFixed(0))}` 
                : '-'}
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <div className="text-sm font-medium text-yellow-700">Margen de Ganancia</div>
            <div className="text-2xl font-bold text-yellow-800">
              {productoActual.margenDeseado && parseFloat(productoActual.margenDeseado) > 0 
                ? `${productoActual.margenDeseado}%` 
                : '-'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};