import React, { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Save, X, Building, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { Cliente } from '../../types/services';

interface ClienteFormData {
  nombre: string;
  empresa: string;
  nit: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  notas: string;
}

interface GestionClientesProps {
  clientes: Cliente[];
  onAgregarCliente: (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onActualizarCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  onEliminarCliente: (id: string) => Promise<void>;
}

const CLIENTE_INICIAL: ClienteFormData = {
  nombre: '',
  empresa: '',
  nit: '',
  email: '',
  telefono: '',
  direccion: '',
  ciudad: '',
  notas: ''
};

export const GestionClientes: React.FC<GestionClientesProps> = ({
  clientes,
  onAgregarCliente,
  onActualizarCliente,
  onEliminarCliente
}) => {
  const [clienteActual, setClienteActual] = useState<ClienteFormData>(CLIENTE_INICIAL);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');

  const limpiarFormulario = () => {
    setClienteActual(CLIENTE_INICIAL);
    setEditandoId(null);
  };

  const manejarCambioInput = (campo: keyof ClienteFormData, valor: string) => {
    setClienteActual(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const manejarSubmit = async () => {
    if (!clienteActual.nombre) return;

    try {
      if (editandoId) {
        await onActualizarCliente(editandoId, clienteActual);
      } else {
        await onAgregarCliente(clienteActual);
      }
      limpiarFormulario();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      alert('Error al guardar el cliente');
    }
  };

  const manejarEditar = (cliente: Cliente) => {
    setClienteActual({
      nombre: cliente.nombre,
      empresa: cliente.empresa || '',
      nit: cliente.nit || '',
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      direccion: cliente.direccion || '',
      ciudad: cliente.ciudad || '',
      notas: cliente.notas || ''
    });
    setEditandoId(cliente.id);
  };

  const manejarEliminar = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
      try {
        await onEliminarCliente(id);
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert('Error al eliminar el cliente');
      }
    }
  };

  // Filtrar clientes por búsqueda
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    cliente.empresa?.toLowerCase().includes(busqueda.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-purple-50 rounded-xl">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {editandoId ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <p className="text-slate-600">Gestiona tu base de datos de clientes</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Información básica */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={clienteActual.nombre}
                onChange={(e) => manejarCambioInput('nombre', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Empresa
              </label>
              <input
                type="text"
                value={clienteActual.empresa}
                onChange={(e) => manejarCambioInput('empresa', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Empresa S.A.S."
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                NIT/Cédula
              </label>
              <input
                type="text"
                value={clienteActual.nit}
                onChange={(e) => manejarCambioInput('nit', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="900123456-1"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={clienteActual.email}
                onChange={(e) => manejarCambioInput('email', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="cliente@empresa.com"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={clienteActual.telefono}
                onChange={(e) => manejarCambioInput('telefono', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="+57 300 123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                value={clienteActual.ciudad}
                onChange={(e) => manejarCambioInput('ciudad', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Bogotá"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={clienteActual.direccion}
              onChange={(e) => manejarCambioInput('direccion', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Cra. 7 # 71-21, Torre A, Oficina 401"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Notas
            </label>
            <textarea
              value={clienteActual.notas}
              onChange={(e) => manejarCambioInput('notas', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              placeholder="Información adicional sobre el cliente..."
            />
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3 pt-4 border-t border-slate-200">
            {editandoId ? (
              <>
                <button
                  onClick={manejarSubmit}
                  className="flex-1 bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Guardar Cambios</span>
                </button>
                <button
                  onClick={limpiarFormulario}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
              </>
            ) : (
              <button
                onClick={manejarSubmit}
                disabled={!clienteActual.nombre}
                className="flex-1 bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar Cliente</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Base de Clientes</h2>
              <p className="text-slate-600">{clientes.length} clientes registrados</p>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Buscar por nombre, empresa o email..."
          />
        </div>

        {clientesFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 mb-2">
              {busqueda ? 'No se encontraron clientes' : 'No hay clientes registrados'}
            </p>
            <p className="text-slate-500 text-sm">
              {busqueda ? 'Intenta con otros términos de búsqueda' : 'Agrega tu primer cliente para comenzar'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {clientesFiltrados.map((cliente) => (
              <div
                key={cliente.id}
                className={`border rounded-xl p-4 transition-all hover:shadow-md ${
                  editandoId === cliente.id 
                    ? 'border-purple-300 bg-purple-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {cliente.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{cliente.nombre}</h3>
                        {cliente.empresa && (
                          <div className="flex items-center space-x-1">
                            <Building className="w-3 h-3 text-slate-500" />
                            <span className="text-slate-600 text-sm">{cliente.empresa}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      {cliente.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-600">{cliente.email}</span>
                        </div>
                      )}

                      {cliente.telefono && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-600">{cliente.telefono}</span>
                        </div>
                      )}

                      {cliente.ciudad && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-600">{cliente.ciudad}</span>
                        </div>
                      )}

                      {cliente.nit && (
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-600">{cliente.nit}</span>
                        </div>
                      )}
                    </div>

                    {cliente.notas && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                        <p className="text-slate-600 text-sm">{cliente.notas}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => manejarEditar(cliente)}
                      className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Editar cliente"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => manejarEliminar(cliente.id)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};