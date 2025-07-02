import React, { useState } from 'react';
import { Calculator, TrendingUp, Package, DollarSign, BarChart3, Edit2, Trash2, Save, Settings, Plus, X, AlertTriangle, Target, TrendingDown, Calendar, Zap, Award, ShoppingCart, Activity, Eye, CheckCircle, Clock, Minus, Bell, Menu, Home, Store, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

import { useProductos } from '../../hooks/useProductos';
import { useVentas } from '../../hooks/useVentas';
import { useConfiguracion } from '../../hooks/useConfiguracion';

import { Dashboard } from './Dashboard';
import { GestionProductos } from './GestionProductos';
import { GestionVentas } from './GestionVentas';
import { ConfiguracionComponent } from './Configuracion';
import { Alertas } from './Alertas';
import { AnalisisABC } from './AnalisisABC';
import { Simulador } from './Simulador';
import { Metas } from './Metas';
import { Informes } from './Informes';
import { Inventario } from './Inventario';

export const BabyStoreCalculator = () => {
  const [vistaActiva, setVistaActiva] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { configuracion, metas, alertas, actualizarConfiguracion, actualizarMetas, actualizarAlertas } = useConfiguracion();
  
  const {
    productos,
    productoActual,
    editandoId,
    manejarCambioInput,
    calcularPreciosProducto,
    agregarProducto,
    editarProducto,
    guardarEdicion,
    eliminarProducto,
    cancelarEdicion,
    setProductos
  } = useProductos(configuracion);

  const {
    ventas,
    ventaActual,
    registrarVenta: registrarVentaBase,
    actualizarVentaActual,
    eliminarVenta,
    setVentas
  } = useVentas();

  const registrarVenta = () => {
    const exito = registrarVentaBase(productos);
    if (exito) {
      setProductos(prev => 
        prev.map(p => 
          p.id === ventaActual.productoId 
            ? { ...p, stock: (parseFloat(p.stock) - parseFloat(ventaActual.cantidad)).toString(), fechaUltimaVenta: ventaActual.fecha }
            : p
        )
      );
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { id: 'ventas', label: 'Ventas', icon: ShoppingCart, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { id: 'calculadora', label: 'Calculadora', icon: Calculator, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'inventario', label: 'Inventario', icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'alertas', label: 'Alertas', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' },
    { id: 'abc', label: 'Análisis ABC', icon: Award, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { id: 'simulador', label: 'Simulador', icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { id: 'metas', label: 'Metas', icon: Target, color: 'text-teal-600', bgColor: 'bg-teal-50' },
    { id: 'informes', label: 'Informes', icon: BarChart3, color: 'text-pink-600', bgColor: 'bg-pink-50' },
    { id: 'configuracion', label: 'Configuración', icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-50' }
  ];

  const currentNavItem = navigationItems.find(item => item.id === vistaActiva);

  const renderVistaActiva = () => {
    switch (vistaActiva) {
      case 'dashboard':
        return <Dashboard productos={productos} ventas={ventas} metas={metas} alertas={alertas} configuracion={configuracion} />;
      
      case 'ventas':
        return (
          <GestionVentas
            productos={productos}
            ventas={ventas}
            ventaActual={ventaActual}
            onActualizarVenta={actualizarVentaActual}
            onRegistrarVenta={registrarVenta}
            onEliminarVenta={eliminarVenta}
            setVistaActiva={setVistaActiva}
          />
        );
      
      case 'calculadora':
        return (
          <GestionProductos
            productos={productos}
            productoActual={productoActual}
            editandoId={editandoId}
            onCambioInput={manejarCambioInput}
            onCalcularPrecios={calcularPreciosProducto}
            onAgregarProducto={agregarProducto}
            onEditarProducto={editarProducto}
            onGuardarEdicion={guardarEdicion}
            onEliminarProducto={eliminarProducto}
            onCancelarEdicion={cancelarEdicion}
            configuracion={configuracion}
          />
        );
      
      case 'inventario':
        return <Inventario 
          productos={productos} 
          onEditarProducto={(producto) => {
            editarProducto(producto.id);
            setVistaActiva('calculadora');
          }} 
          onEliminarProducto={(id) => eliminarProducto(id)} 
          ventas={ventas} 
        />;
      
      case 'alertas':
        return <Alertas productos={productos} alertas={alertas} actualizarAlertas={actualizarAlertas} ventas={ventas} />;
      
      case 'abc':
        return <AnalisisABC productos={productos} ventas={ventas} configuracion={configuracion} />;
      
      case 'simulador':
        return <Simulador productos={productos} configuracion={configuracion} />;
      
      case 'metas':
        return <Metas metas={metas} actualizarMetas={actualizarMetas} productos={productos} ventas={ventas} />;
      
      case 'informes':
        return <Informes productos={productos} ventas={ventas} configuracion={configuracion} metas={metas} alertas={alertas} />;
      
      case 'configuracion':
        return (
          <ConfiguracionComponent
            configuracion={configuracion}
            metas={metas}
            alertas={alertas}
            onActualizarConfiguracion={actualizarConfiguracion}
            onActualizarMetas={actualizarMetas}
            onActualizarAlertas={actualizarAlertas}
          />
        );
      
      default:
        return <Dashboard productos={productos} ventas={ventas} metas={metas} alertas={alertas} configuracion={configuracion} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-violet-500 rounded-lg flex items-center justify-center shadow-lg">
              <Store className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Rentability
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static top-0 left-0 z-50 lg:z-auto w-72 h-full lg:h-screen bg-white/90 backdrop-blur-sm border-r border-slate-200 transition-transform duration-300 ease-in-out`}>
          {/* Logo */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Rentability
                </h1>
                <p className="text-xs text-slate-500">Gestión Inteligente</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = vistaActiva === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setVistaActiva(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? `${item.bgColor} ${item.color} shadow-md scale-105`
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 text-sm text-slate-500 mb-2">
                <Home size={16} />
                <ChevronRight size={16} />
                <span className="capitalize">{currentNavItem?.label}</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                {currentNavItem?.label}
              </h1>
            </div>

            {/* Content */}
            <div className="space-y-8">
              {renderVistaActiva()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};