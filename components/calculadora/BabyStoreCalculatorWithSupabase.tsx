import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Package, DollarSign, BarChart3, Edit2, Trash2, Save, Settings, Plus, X, AlertTriangle, Target, TrendingDown, Calendar, Zap, Award, ShoppingCart, Activity, Eye, CheckCircle, Clock, Minus, Bell, Menu, Home, Store, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
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
import { ProductoActual, VentaActual } from '../../types';
import { PRODUCTO_INICIAL, VENTA_INICIAL } from '../../utils/constants';
import { calcularPrecios } from '../../utils/calculations';
import { useNumericInput } from '../../hooks/useNumericInput';

export const BabyStoreCalculatorWithSupabase = () => {
  const {
    productos,
    ventas,
    configuracion,
    metas,
    alertas,
    loading,
    error,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    registrarVenta,
    eliminarVenta,
    actualizarConfiguracion,
    eliminarConfiguracion,
    actualizarMeta,
    actualizarAlerta
  } = useApp();

  const { manejarCambioNumerico } = useNumericInput();

  const [vistaActiva, setVistaActiva] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productoActual, setProductoActual] = useState<ProductoActual>(PRODUCTO_INICIAL);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [ventaActual, setVentaActual] = useState<VentaActual>(VENTA_INICIAL);

  // Calcular precios cuando cambian los valores
  useEffect(() => {
    if (productoActual.costoCompra || productoActual.margenDeseado) {
      const { precioVenta, utilidad, costoUnitario } = calcularPrecios(productoActual, configuracion);
      setProductoActual(prev => ({
        ...prev,
        precioVenta: precioVenta.toString(),
        utilidad: utilidad.toString(),
        costoUnitario: costoUnitario.toString()
      }));
    }
  }, [productoActual.costoCompra, productoActual.gastosFijos, productoActual.margenDeseado, productoActual.esPaquete, productoActual.unidadesPorPaquete, configuracion]);

  const manejarCambioInput = (campo: keyof ProductoActual, valor: string) => {
    // Para campos numéricos, usamos el hook especializado
    const camposNumericos = ['costoCompra', 'gastosFijos', 'stock', 'ventasUltimos30Dias', 'precioCompetencia', 'unidadesPorPaquete'];
    
    if (camposNumericos.includes(campo)) {
      manejarCambioNumerico(valor, (valorLimpio) => {
        setProductoActual(prev => ({
          ...prev,
          [campo]: valorLimpio,
          // Si es unidadesPorPaquete y es un paquete, actualizar el stock automáticamente
          ...(campo === 'unidadesPorPaquete' && prev.esPaquete ? { stock: valorLimpio } : {})
        }));
      });
    } else if (campo === 'esPaquete') {
      // Manejar el campo booleano
      const esTrue = valor === 'true';
      setProductoActual(prev => ({
        ...prev,
        [campo]: esTrue,
        // Si se desactiva el paquete, resetear unidades a 1 y stock a 0
        // Si se activa el paquete, establecer stock a las unidades por paquete
        unidadesPorPaquete: esTrue ? prev.unidadesPorPaquete : '1',
        stock: esTrue ? prev.unidadesPorPaquete || '1' : '0'
      }));
    } else {
      setProductoActual(prev => ({
        ...prev,
        [campo]: valor
      }));
    }
  };

  const calcularPreciosProducto = () => {
    const { precioVenta, utilidad } = calcularPrecios(productoActual, configuracion);
    setProductoActual(prev => ({
      ...prev,
      precioVenta: precioVenta.toString(),
      utilidad: utilidad.toString()
    }));
  };

  const agregarProductoHandler = async () => {
    if (!productoActual.nombre || !productoActual.costoCompra) return;
    
    try {
      await agregarProducto(productoActual);
      setProductoActual(PRODUCTO_INICIAL);
    } catch (error) {
      console.error('Error agregando producto:', error);
      alert('Error al agregar el producto');
    }
  };

  const editarProductoHandler = (id: string) => {
    const producto = productos.find(p => p.id === id);
    if (producto) {
      setProductoActual(producto);
      setEditandoId(id);
    }
  };

  const guardarEdicionHandler = async () => {
    if (!editandoId) return;
    
    try {
      await actualizarProducto(editandoId, productoActual);
      setProductoActual(PRODUCTO_INICIAL);
      setEditandoId(null);
    } catch (error) {
      console.error('Error actualizando producto:', error);
      alert('Error al actualizar el producto');
    }
  };

  const eliminarProductoHandler = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await eliminarProducto(id);
      } catch (error) {
        console.error('Error eliminando producto:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const cancelarEdicion = () => {
    setProductoActual(PRODUCTO_INICIAL);
    setEditandoId(null);
  };

  const actualizarVentaActual = (campo: keyof VentaActual, valor: string) => {
    // Para campos numéricos en ventas, también usamos el hook especializado
    const camposNumericos = ['cantidad', 'precioVenta'];
    
    if (camposNumericos.includes(campo)) {
      manejarCambioNumerico(valor, (valorLimpio) => {
        setVentaActual(prev => ({
          ...prev,
          [campo]: valorLimpio
        }));
      });
    } else {
      setVentaActual(prev => ({
        ...prev,
        [campo]: valor
      }));
    }
  };

  const registrarVentaHandler = async () => {
    const producto = productos.find(p => p.id === ventaActual.productoId);
    if (!producto || !ventaActual.cantidad) return;
    
    const cantidad = parseFloat(ventaActual.cantidad) || 0;
    const stockActual = parseFloat(producto.stock) || 0;
    
    if (cantidad > stockActual) {
      alert('No hay suficiente stock para esta venta');
      return;
    }
    
    try {
      await registrarVenta({
        productoId: ventaActual.productoId,
        productoNombre: producto.nombre,
        cantidad: cantidad,
        precioVenta: parseFloat(ventaActual.precioVenta) || parseFloat(producto.precioVenta) || 0,
        costoUnitario: parseFloat(producto.costoCompra) || 0,
        fecha: ventaActual.fecha,
        cliente: ventaActual.cliente || 'Cliente general',
        metodoPago: ventaActual.metodoPago,
        utilidadTotal: ((parseFloat(ventaActual.precioVenta) || parseFloat(producto.precioVenta) || 0) - (parseFloat(producto.costoCompra) || 0)) * cantidad,
        ingresoTotal: (parseFloat(ventaActual.precioVenta) || parseFloat(producto.precioVenta) || 0) * cantidad,
        tipoVenta: ventaActual.tipoVenta || 'unidad'
      });
      
      setVentaActual(VENTA_INICIAL);
    } catch (error) {
      console.error('Error registrando venta:', error);
      alert('Error al registrar la venta');
    }
  };

  const actualizarConfiguracionHandler = async (config: Partial<typeof configuracion>) => {
    try {
      // Actualizar porcentajes
      if (config.porcentajes) {
        // Eliminar porcentajes que ya no están en la nueva configuración
        for (const claveExistente of Object.keys(configuracion.porcentajes)) {
          if (!(claveExistente in config.porcentajes)) {
            await eliminarConfiguracion('porcentaje', claveExistente);
          }
        }
        // Actualizar/agregar porcentajes nuevos
        for (const [clave, valor] of Object.entries(config.porcentajes)) {
          await actualizarConfiguracion('porcentaje', clave, valor);
        }
      }
      
      // Actualizar costos fijos
      if (config.costosFijos) {
        // Eliminar costos que ya no están en la nueva configuración
        for (const claveExistente of Object.keys(configuracion.costosFijos)) {
          if (!(claveExistente in config.costosFijos)) {
            await eliminarConfiguracion('costo_fijo', claveExistente);
          }
        }
        // Actualizar/agregar costos nuevos
        for (const [clave, valor] of Object.entries(config.costosFijos)) {
          await actualizarConfiguracion('costo_fijo', clave, valor);
        }
      }
      
      // Actualizar herramientas
      if (config.herramientas) {
        // Eliminar herramientas que ya no están en la nueva configuración
        for (const claveExistente of Object.keys(configuracion.herramientas)) {
          if (!(claveExistente in config.herramientas)) {
            await eliminarConfiguracion('herramienta', claveExistente);
          }
        }
        // Actualizar/agregar herramientas nuevas
        for (const [clave, valor] of Object.entries(config.herramientas)) {
          await actualizarConfiguracion('herramienta', clave, valor);
        }
      }
      
      // Actualizar ventas estimadas
      if (config.ventasEstimadas !== undefined) {
        await actualizarConfiguracion('general', 'ventas_estimadas', config.ventasEstimadas);
      }
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      alert('Error al actualizar la configuración');
    }
  };

  const actualizarMetasHandler = async (metasActualizadas: Partial<typeof metas>) => {
    try {
      if (metasActualizadas.ventasMensuales !== undefined) {
        await actualizarMeta('ventas_mensuales', metasActualizadas.ventasMensuales);
      }
      if (metasActualizadas.unidadesMensuales !== undefined) {
        await actualizarMeta('unidades_mensuales', metasActualizadas.unidadesMensuales);
      }
      if (metasActualizadas.margenPromedio !== undefined) {
        await actualizarMeta('margen_promedio', metasActualizadas.margenPromedio);
      }
      if (metasActualizadas.rotacionInventario !== undefined) {
        await actualizarMeta('rotacion_inventario', metasActualizadas.rotacionInventario);
      }
    } catch (error) {
      console.error('Error actualizando metas:', error);
      alert('Error al actualizar las metas');
    }
  };

  const actualizarAlertasHandler = async (alertasActualizadas: Partial<typeof alertas>) => {
    try {
      if (alertasActualizadas.margenMinimo !== undefined) {
        await actualizarAlerta('margen_minimo', alertasActualizadas.margenMinimo);
      }
      if (alertasActualizadas.stockMinimo !== undefined) {
        await actualizarAlerta('stock_minimo', alertasActualizadas.stockMinimo);
      }
      if (alertasActualizadas.diasSinVenta !== undefined) {
        await actualizarAlerta('dias_sin_venta', alertasActualizadas.diasSinVenta);
      }
      if (alertasActualizadas.diferenciaPrecioCompetencia !== undefined) {
        await actualizarAlerta('diferencia_precio_competencia', alertasActualizadas.diferenciaPrecioCompetencia);
      }
    } catch (error) {
      console.error('Error actualizando alertas:', error);
      alert('Error al actualizar las alertas');
    }
  };

  const actualizarTodosLosPrecios = async () => {
    try {
      const productosActualizados = productos.map(producto => {
        const { precioVenta, utilidad, costoUnitario } = calcularPrecios({
          ...producto,
          costoCompra: producto.costoCompra,
          margenDeseado: producto.margenDeseado,
          esPaquete: producto.esPaquete,
          unidadesPorPaquete: producto.unidadesPorPaquete,
          cantidadPaquetes: producto.cantidadPaquetes
        }, configuracion);

        return {
          ...producto,
          precioVenta,
          utilidad,
          costoUnitario,
          gastosFijos: ((Object.values(configuracion.costosFijos).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0) + 
                       Object.values(configuracion.herramientas).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0)) / 
                       (configuracion.ventasEstimadas || 1)).toFixed(0)
        };
      });

      // Actualizar todos los productos en lote
      await Promise.all(
        productosActualizados.map(producto => 
          actualizarProducto(producto.id, {
            precioVenta: producto.precioVenta,
            utilidad: producto.utilidad,
            gastosFijos: producto.gastosFijos,
            costoUnitario: producto.costoUnitario
          })
        )
      );
    } catch (error) {
      console.error('Error actualizando precios:', error);
      throw error;
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
            onRegistrarVenta={registrarVentaHandler}
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
            onAgregarProducto={agregarProductoHandler}
            onEditarProducto={editarProductoHandler}
            onGuardarEdicion={guardarEdicionHandler}
            onEliminarProducto={eliminarProductoHandler}
            onCancelarEdicion={cancelarEdicion}
            configuracion={configuracion}
          />
        );
      
      case 'inventario':
        return <Inventario 
          productos={productos} 
          onEditarProducto={(producto) => {
            editarProductoHandler(producto.id);
            setVistaActiva('calculadora');
          }} 
          onEliminarProducto={eliminarProductoHandler} 
          ventas={ventas} 
        />;
      
      case 'alertas':
        return <Alertas productos={productos} alertas={alertas} actualizarAlertas={actualizarAlertasHandler} ventas={ventas} />;
      
      case 'abc':
        return <AnalisisABC productos={productos} ventas={ventas} configuracion={configuracion} />;
      
      case 'simulador':
        return <Simulador productos={productos} configuracion={configuracion} />;
      
      case 'metas':
        return <Metas metas={metas} actualizarMetas={actualizarMetasHandler} productos={productos} ventas={ventas} />;
      
      case 'informes':
        return <Informes productos={productos} ventas={ventas} configuracion={configuracion} metas={metas} alertas={alertas} />;
      
      case 'configuracion':
        return (
          <ConfiguracionComponent
            configuracion={configuracion}
            metas={metas}
            alertas={alertas}
            onActualizarConfiguracion={actualizarConfiguracionHandler}
            onActualizarMetas={actualizarMetasHandler}
            onActualizarAlertas={actualizarAlertasHandler}
            onActualizarTodosLosPrecios={actualizarTodosLosPrecios}
          />
        );
      
      default:
        return <Dashboard productos={productos} ventas={ventas} metas={metas} alertas={alertas} configuracion={configuracion} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-slate-800 font-semibold mb-2">Error al cargar los datos</p>
          <p className="text-slate-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

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