import React, { useState, useEffect } from 'react';
import { X, Receipt, Plus } from 'lucide-react';
import { Proyecto, Desembolso, CategoriaDesembolso } from '../../types/services';
import { METODOS_PAGO, ESTADOS_DESEMBOLSO } from '../../utils/servicesConstants';
import { formatearInput, formatearMoneda } from '../../utils/formatters';
import { categoriasDesembolsoService } from '../../services/servicesDatabase';

interface RegistrarDesembolsoProps {
  proyecto: Proyecto;
  onAgregar: (desembolso: Omit<Desembolso, 'id' | 'created_at'>) => Promise<void>;
  onCerrar: () => void;
}

interface DesembolsoFormData {
  categoriaId: string;
  fecha: string;
  descripcion: string;
  monto: string;
  proveedor: string;
  numeroFactura: string;
  metodoPago: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta';
  estado: 'pendiente' | 'pagado' | 'aprobado';
  aprobadoPor: string;
  notas: string;
}

const DESEMBOLSO_INICIAL: DesembolsoFormData = {
  categoriaId: '',
  fecha: new Date().toISOString().split('T')[0],
  descripcion: '',
  monto: '',
  proveedor: '',
  numeroFactura: '',
  metodoPago: 'transferencia',
  estado: 'pagado',
  aprobadoPor: '',
  notas: ''
};

export const RegistrarDesembolso: React.FC<RegistrarDesembolsoProps> = ({
  proyecto,
  onAgregar,
  onCerrar
}) => {
  const [desembolso, setDesembolso] = useState<DesembolsoFormData>(DESEMBOLSO_INICIAL);
  const [categorias, setCategorias] = useState<CategoriaDesembolso[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [mostrandoNuevaCategoria, setMostrandoNuevaCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: '', descripcion: '', tipo: 'variable' as 'fijo' | 'variable' });

  // Cargar categorías al montar el componente
  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const categoriasData = await categoriasDesembolsoService.obtenerTodas();
      setCategorias(categoriasData);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const manejarCambioCampo = (campo: keyof DesembolsoFormData, valor: string) => {
    setDesembolso(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const manejarCrearCategoria = async () => {
    if (!nuevaCategoria.nombre.trim()) {
      alert('El nombre de la categoría es obligatorio');
      return;
    }

    try {
      await categoriasDesembolsoService.crear({
        nombre: nuevaCategoria.nombre,
        descripcion: nuevaCategoria.descripcion || undefined,
        tipo: nuevaCategoria.tipo
      });
      
      await cargarCategorias();
      setMostrandoNuevaCategoria(false);
      setNuevaCategoria({ nombre: '', descripcion: '', tipo: 'variable' });
    } catch (error) {
      console.error('Error al crear categoría:', error);
      alert('Error al crear la categoría');
    }
  };

  const manejarGuardar = async () => {
    // Validaciones básicas
    if (!desembolso.categoriaId || !desembolso.descripcion || !desembolso.monto || !desembolso.fecha) {
      alert('Los campos categoría, descripción, monto y fecha son obligatorios');
      return;
    }

    const montoNumerico = parseFloat(desembolso.monto.replace(/[^\d]/g, '')) || 0;
    if (montoNumerico <= 0) {
      alert('El monto debe ser mayor a cero');
      return;
    }

    setGuardando(true);
    try {
      await onAgregar({
        proyectoId: proyecto.id,
        categoriaId: desembolso.categoriaId,
        fecha: desembolso.fecha,
        descripcion: desembolso.descripcion,
        monto: montoNumerico,
        proveedor: desembolso.proveedor || undefined,
        numeroFactura: desembolso.numeroFactura || undefined,
        metodoPago: desembolso.metodoPago,
        estado: desembolso.estado,
        aprobadoPor: desembolso.aprobadoPor || undefined,
        notas: desembolso.notas || undefined
      });
      
      onCerrar();
    } catch (error) {
      console.error('Error al registrar desembolso:', error);
      alert('Error al registrar el desembolso');
    } finally {
      setGuardando(false);
    }
  };

  const categoriaSeleccionada = categorias.find(c => c.id === desembolso.categoriaId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Registrar Desembolso</h2>
              <p className="text-slate-600">Proyecto: {proyecto.nombre}</p>
            </div>
            <button
              onClick={onCerrar}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Categoría */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Categoría *
                </label>
                <button
                  onClick={() => setMostrandoNuevaCategoria(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  + Nueva categoría
                </button>
              </div>
              <select
                value={desembolso.categoriaId}
                onChange={(e) => manejarCambioCampo('categoriaId', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              >
                <option value="">Seleccionar categoría...</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
              {categoriaSeleccionada?.descripcion && (
                <p className="text-xs text-slate-500 mt-1">{categoriaSeleccionada.descripcion}</p>
              )}
            </div>

            {/* Modal para nueva categoría */}
            {mostrandoNuevaCategoria && (
              <div className="border border-indigo-200 bg-indigo-50 rounded-xl p-4">
                <h4 className="font-semibold text-indigo-800 mb-3">Nueva Categoría</h4>
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={nuevaCategoria.nombre}
                      onChange={(e) => setNuevaCategoria(prev => ({ ...prev, nombre: e.target.value }))}
                      className="px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Nombre de la categoría"
                    />
                    <select
                      value={nuevaCategoria.tipo}
                      onChange={(e) => setNuevaCategoria(prev => ({ ...prev, tipo: e.target.value as 'fijo' | 'variable' }))}
                      className="px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="variable">Variable</option>
                      <option value="fijo">Fijo</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    value={nuevaCategoria.descripcion}
                    onChange={(e) => setNuevaCategoria(prev => ({ ...prev, descripcion: e.target.value }))}
                    className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Descripción (opcional)"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={manejarCrearCategoria}
                      className="bg-indigo-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-indigo-600 transition-colors"
                    >
                      Crear
                    </button>
                    <button
                      onClick={() => setMostrandoNuevaCategoria(false)}
                      className="border border-indigo-300 text-indigo-700 px-3 py-1 rounded-lg text-sm hover:bg-indigo-100 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Información básica */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={desembolso.fecha}
                  onChange={(e) => manejarCambioCampo('fecha', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Monto *
                </label>
                <input
                  type="text"
                  value={formatearInput(desembolso.monto)}
                  onChange={(e) => manejarCambioCampo('monto', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="150000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Descripción *
              </label>
              <input
                type="text"
                value={desembolso.descripcion}
                onChange={(e) => manejarCambioCampo('descripcion', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                placeholder="Ej: Compra de materiales para el proyecto"
              />
            </div>

            {/* Información del proveedor */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Proveedor
                </label>
                <input
                  type="text"
                  value={desembolso.proveedor}
                  onChange={(e) => manejarCambioCampo('proveedor', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Nombre del proveedor"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Número de Factura
                </label>
                <input
                  type="text"
                  value={desembolso.numeroFactura}
                  onChange={(e) => manejarCambioCampo('numeroFactura', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="F-001234"
                />
              </div>
            </div>

            {/* Método de pago y estado */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Método de Pago
                </label>
                <select
                  value={desembolso.metodoPago}
                  onChange={(e) => manejarCambioCampo('metodoPago', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                >
                  {METODOS_PAGO.map((metodo) => (
                    <option key={metodo.value} value={metodo.value}>
                      {metodo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Estado
                </label>
                <select
                  value={desembolso.estado}
                  onChange={(e) => manejarCambioCampo('estado', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                >
                  {ESTADOS_DESEMBOLSO.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Aprobado por (solo si el estado es aprobado) */}
            {desembolso.estado === 'aprobado' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Aprobado por
                </label>
                <input
                  type="text"
                  value={desembolso.aprobadoPor}
                  onChange={(e) => manejarCambioCampo('aprobadoPor', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Nombre de quien aprueba el gasto"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Notas
              </label>
              <textarea
                value={desembolso.notas}
                onChange={(e) => manejarCambioCampo('notas', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                placeholder="Información adicional sobre el gasto..."
              />
            </div>

            {/* Resumen */}
            {desembolso.monto && desembolso.descripcion && (
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-800 mb-3">Resumen del Desembolso</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Descripción:</span>
                    <span className="font-medium">{desembolso.descripcion}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monto:</span>
                    <span className="font-bold text-red-600">
                      {formatearMoneda(parseFloat(desembolso.monto.replace(/[^\d]/g, '')) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Categoría:</span>
                    <span className="font-medium">{categoriaSeleccionada?.nombre}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Estado:</span>
                    <span className={`font-medium ${
                      desembolso.estado === 'pagado' ? 'text-emerald-600' :
                      desembolso.estado === 'aprobado' ? 'text-blue-600' : 'text-orange-600'
                    }`}>
                      {ESTADOS_DESEMBOLSO.find(e => e.value === desembolso.estado)?.label}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex space-x-4 pt-4">
              <button
                onClick={manejarGuardar}
                disabled={guardando || !desembolso.categoriaId || !desembolso.descripcion || !desembolso.monto || !desembolso.fecha}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Receipt className="w-5 h-5" />
                <span>{guardando ? 'Registrando...' : 'Registrar Desembolso'}</span>
              </button>
              
              <button
                onClick={onCerrar}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};