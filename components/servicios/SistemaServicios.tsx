import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  FileText, 
  Briefcase, 
  CreditCard, 
  Receipt, 
  BarChart3, 
  Settings, 
  Menu,
  ChevronRight,
  Building2
} from 'lucide-react';
import { useServices } from '../../contexts/ServicesContext';
import { useNumericInput } from '../../hooks/useNumericInput';
import { 
  ServicioActual, 
  CotizacionActual, 
  VistaServicio 
} from '../../types/services';
import { 
  SERVICIO_INICIAL, 
  COTIZACION_INICIAL,
  calcularPrecioServicio
} from '../../utils/servicesConstants';

// Componentes
import { DashboardServicios } from './DashboardServicios';
import { GestionServicios } from './GestionServicios';
import { GestionClientes } from '../clientes/GestionClientes';
import { GestionCotizaciones } from '../cotizaciones/GestionCotizaciones';
import { GestionProyectos } from '../proyectos/GestionProyectos';
import { ConfiguracionServicios } from './ConfiguracionServicios';
import { ReportesServicios } from './ReportesServicios';
import { SystemStatus } from '../debug/SystemStatus';

export const SistemaServicios: React.FC = () => {
  const {
    clientes,
    servicios,
    cotizaciones,
    proyectos,
    planesPago,
    pagos,
    categoriasDesembolso,
    desembolsos,
    configuracion,
    metas,
    alertas,
    metricas,
    loading,
    error,
    // Clientes
    agregarCliente,
    actualizarCliente,
    eliminarCliente,
    // Servicios
    agregarServicio,
    actualizarServicio,
    eliminarServicio,
    // Cotizaciones
    agregarCotizacion,
    actualizarCotizacion,
    aprobarCotizacion,
    rechazarCotizacion,
    eliminarCotizacion,
    // Proyectos
    actualizarProyecto,
    completarProyecto,
    // Planes de pago
    crearPlanPago,
    crearPlanesPago,
    actualizarPlanPago,
    // Pagos
    registrarPago,
    eliminarPago,
    // Categorías y desembolsos
    agregarCategoriaDesembolso,
    agregarDesembolso,
    actualizarDesembolso,
    eliminarDesembolso,
    // Configuración
    actualizarConfiguracion,
    actualizarConfiguracionCompleta,
    eliminarConfiguracion,
    actualizarMeta,
    actualizarAlerta
  } = useServices();

  const { manejarCambioNumerico } = useNumericInput();

  // Estados locales
  const [vistaActiva, setVistaActiva] = useState<VistaServicio>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicioActual, setServicioActual] = useState<ServicioActual>(SERVICIO_INICIAL);
  const [editandoServicioId, setEditandoServicioId] = useState<string | null>(null);

  // Navegación
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { id: 'clientes', label: 'Clientes', icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'servicios', label: 'Servicios', icon: Building2, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'cotizaciones', label: 'Cotizaciones', icon: FileText, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { id: 'proyectos', label: 'Proyectos', icon: Briefcase, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { id: 'reportes', label: 'Reportes', icon: BarChart3, color: 'text-pink-600', bgColor: 'bg-pink-50' },
    { id: 'configuracion', label: 'Configuración', icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-50' },
    { id: 'debug', label: '🔍 Debug Sistema', icon: Settings, color: 'text-red-600', bgColor: 'bg-red-50' }
  ];

  const currentNavItem = navigationItems.find(item => item.id === vistaActiva);

  // Handlers para servicios
  const manejarCambioInputServicio = (campo: keyof ServicioActual, valor: string) => {
    const camposNumericos = ['costoBase', 'gastosFijos', 'duracionEstimada', 'precioPorHora'];
    
    if (camposNumericos.includes(campo)) {
      manejarCambioNumerico(valor, (valorLimpio) => {
        setServicioActual(prev => ({
          ...prev,
          [campo]: valorLimpio
        }));
      });
    } else if (campo === 'activo') {
      setServicioActual(prev => ({
        ...prev,
        [campo]: valor === 'true'
      }));
    } else {
      setServicioActual(prev => ({
        ...prev,
        [campo]: valor
      }));
    }
  };

  const calcularPreciosServicio = () => {
    if (servicioActual.tipoServicio === 'por_horas') return;
    
    const costoBase = parseFloat(servicioActual.costoBase) || 0;
    const gastosFijos = parseFloat(servicioActual.gastosFijos) || 0;
    const margen = parseFloat(servicioActual.margenDeseado) || 35;
    
    const precioCalculado = calcularPrecioServicio(costoBase, gastosFijos, margen, configuracion);
    
    setServicioActual(prev => ({
      ...prev,
      precioSugerido: precioCalculado.toString()
    }));
  };

  const agregarServicioHandler = async () => {
    if (!servicioActual.nombre || (!servicioActual.costoBase && servicioActual.tipoServicio !== 'por_horas')) return;
    
    try {
      await agregarServicio(servicioActual);
      setServicioActual(SERVICIO_INICIAL);
    } catch (error) {
      console.error('Error agregando servicio:', error);
      alert('Error al agregar el servicio');
    }
  };

  const editarServicioHandler = (id: string) => {
    const servicio = servicios.find(s => s.id === id);
    if (servicio) {
      setServicioActual({
        nombre: servicio.nombre,
        categoria: servicio.categoria,
        descripcion: servicio.descripcion || '',
        costoBase: servicio.costoBase,
        gastosFijos: servicio.gastosFijos,
        margenDeseado: servicio.margenDeseado,
        precioSugerido: servicio.precioSugerido,
        duracionEstimada: servicio.duracionEstimada.toString(),
        tipoServicio: servicio.tipoServicio,
        precioPorHora: servicio.precioPorHora || '',
        recursosNecesarios: servicio.recursosNecesarios || '',
        activo: servicio.activo
      });
      setEditandoServicioId(id);
    }
  };

  const guardarEdicionServicioHandler = async () => {
    if (!editandoServicioId) return;
    
    try {
      await actualizarServicio(editandoServicioId, servicioActual);
      setServicioActual(SERVICIO_INICIAL);
      setEditandoServicioId(null);
    } catch (error) {
      console.error('Error actualizando servicio:', error);
      alert('Error al actualizar el servicio');
    }
  };

  const eliminarServicioHandler = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      try {
        await eliminarServicio(id);
      } catch (error) {
        console.error('Error eliminando servicio:', error);
        alert('Error al eliminar el servicio');
      }
    }
  };

  const cancelarEdicionServicio = () => {
    setServicioActual(SERVICIO_INICIAL);
    setEditandoServicioId(null);
  };

  // Handlers para configuración (reutilizando del sistema anterior)
  const actualizarConfiguracionHandler = async (config: Partial<typeof configuracion>) => {
    try {
      if (config.porcentajes) {
        for (const claveExistente of Object.keys(configuracion.porcentajes)) {
          if (!(claveExistente in config.porcentajes)) {
            await eliminarConfiguracion('porcentaje', claveExistente);
          }
        }
        for (const [clave, valor] of Object.entries(config.porcentajes)) {
          await actualizarConfiguracion('porcentaje', clave, valor);
        }
      }
      
      if (config.costosFijos) {
        for (const claveExistente of Object.keys(configuracion.costosFijos)) {
          if (!(claveExistente in config.costosFijos)) {
            await eliminarConfiguracion('costo_fijo', claveExistente);
          }
        }
        for (const [clave, valor] of Object.entries(config.costosFijos)) {
          await actualizarConfiguracion('costo_fijo', clave, valor);
        }
      }
      
      if (config.herramientas) {
        for (const claveExistente of Object.keys(configuracion.herramientas)) {
          if (!(claveExistente in config.herramientas)) {
            await eliminarConfiguracion('herramienta', claveExistente);
          }
        }
        for (const [clave, valor] of Object.entries(config.herramientas)) {
          await actualizarConfiguracion('herramienta', clave, valor);
        }
      }
      
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

  // Renderizar vista activa
  const renderVistaActiva = () => {
    switch (vistaActiva) {
      case 'dashboard':
        return (
          <DashboardServicios
            clientes={clientes}
            servicios={servicios}
            cotizaciones={cotizaciones}
            proyectos={proyectos}
            planesPago={planesPago}
            pagos={pagos}
            desembolsos={desembolsos}
            metricas={metricas}
            configuracion={configuracion}
            metas={metas}
            alertas={alertas}
          />
        );
      
      case 'clientes':
        return (
          <GestionClientes
            clientes={clientes}
            onAgregarCliente={agregarCliente}
            onActualizarCliente={actualizarCliente}
            onEliminarCliente={eliminarCliente}
          />
        );
      
      case 'servicios':
        return (
          <GestionServicios
            servicios={servicios}
            servicioActual={servicioActual}
            editandoId={editandoServicioId}
            onCambioInput={manejarCambioInputServicio}
            onCalcularPrecios={calcularPreciosServicio}
            onAgregarServicio={agregarServicioHandler}
            onEditarServicio={editarServicioHandler}
            onGuardarEdicion={guardarEdicionServicioHandler}
            onEliminarServicio={eliminarServicioHandler}
            onCancelarEdicion={cancelarEdicionServicio}
            configuracion={configuracion}
          />
        );
      
      case 'cotizaciones':
        return (
          <GestionCotizaciones
            cotizaciones={cotizaciones}
            clientes={clientes}
            servicios={servicios}
            configuracion={configuracion}
            onCrearCotizacion={agregarCotizacion}
            onActualizarCotizacion={actualizarCotizacion}
            onAprobarCotizacion={aprobarCotizacion}
            onRechazarCotizacion={rechazarCotizacion}
            onEliminarCotizacion={eliminarCotizacion}
          />
        );
      
      case 'proyectos':
        return (
          <GestionProyectos
            proyectos={proyectos}
            clientes={clientes}
            planesPago={planesPago}
            pagos={pagos}
            desembolsos={desembolsos}
            onActualizarProyecto={actualizarProyecto}
            onCompletarProyecto={completarProyecto}
            onCrearPlanPago={crearPlanPago}
            onRegistrarPago={registrarPago}
            onAgregarDesembolso={agregarDesembolso}
          />
        );
      
      case 'configuracion':
        return (
          <ConfiguracionServicios
            configuracion={configuracion}
            metas={metas}
            alertas={alertas}
            onActualizarConfiguracion={actualizarConfiguracionHandler}
            onActualizarConfiguracionCompleta={actualizarConfiguracionCompleta}
            onActualizarMetas={actualizarMetasHandler}
            onActualizarAlertas={actualizarAlertasHandler}
          />
        );
      
      case 'reportes':
        return (
          <ReportesServicios
            clientes={clientes}
            servicios={servicios}
            cotizaciones={cotizaciones}
            proyectos={proyectos}
            pagos={pagos}
            desembolsos={desembolsos}
            metricas={metricas}
          />
        );
      
      case 'debug':
        return <SystemStatus />;
      
      default:
        return (
          <DashboardServicios
            clientes={clientes}
            servicios={servicios}
            cotizaciones={cotizaciones}
            proyectos={proyectos}
            planesPago={planesPago}
            pagos={pagos}
            desembolsos={desembolsos}
            metricas={metricas}
            configuracion={configuracion}
            metas={metas}
            alertas={alertas}
          />
        );
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando sistema de servicios...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Building2 className="w-12 h-12 mx-auto" />
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
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Rentability Pro
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
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Rentability Pro
                </h1>
                <p className="text-xs text-slate-500">Sistema de Servicios</p>
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
                    setVistaActiva(item.id as VistaServicio);
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