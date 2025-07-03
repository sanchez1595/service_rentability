import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  Cliente,
  Servicio,
  Cotizacion,
  Proyecto,
  PlanPago,
  Pago,
  CategoriaDesembolso,
  Desembolso,
  MetricasServicio,
  Configuracion,
  Metas,
  Alertas
} from '../types/services';
import {
  clientesService,
  serviciosService,
  cotizacionesService,
  proyectosService,
  planesPagoService,
  pagosService,
  categoriasDesembolsoService,
  desembolsosService,
  configuracionService,
  metasService,
  alertasService
} from '../services/servicesDatabase';

// Funciones reales de configuración con Supabase
const obtenerConfiguracion = async (): Promise<Configuracion> => {
  return await configuracionService.obtenerToda();
};

const obtenerMetas = async (): Promise<Metas> => {
  return await metasService.obtenerTodas();
};

const obtenerAlertas = async (): Promise<Alertas> => {
  return await alertasService.obtenerTodas();
};

const actualizarConfigDB = async (tipo: string, clave: string, valor: number): Promise<void> => {
  return await configuracionService.actualizar(tipo, clave, valor);
};

const eliminarConfigDB = async (tipo: string, clave: string): Promise<void> => {
  return await configuracionService.eliminar(tipo, clave);
};

const actualizarMetaDB = async (clave: string, valor: number): Promise<void> => {
  return await metasService.actualizar(clave, valor);
};

const actualizarAlertaDB = async (clave: string, valor: number): Promise<void> => {
  return await alertasService.actualizar(clave, valor);
};

// Estado inicial
interface ServicesState {
  clientes: Cliente[];
  servicios: Servicio[];
  cotizaciones: Cotizacion[];
  proyectos: Proyecto[];
  planesPago: PlanPago[];
  pagos: Pago[];
  categoriasDesembolso: CategoriaDesembolso[];
  desembolsos: Desembolso[];
  configuracion: Configuracion;
  metas: Metas;
  alertas: Alertas;
  metricas: MetricasServicio | null;
  loading: boolean;
  error: string | null;
}

const initialState: ServicesState = {
  clientes: [],
  servicios: [],
  cotizaciones: [],
  proyectos: [],
  planesPago: [],
  pagos: [],
  categoriasDesembolso: [],
  desembolsos: [],
  configuracion: {
    porcentajes: {
      contabilidad: 2,
      mercadeo: 5,
      ventas: 15,
      salarios: 10,
      compras: 2,
      extras: 5
    },
    costosFijos: {
      arriendo: 1000000,
      energia: 200000,
      gas: 50000,
      aseo: 800000,
      internet: 200000,
      agua: 200000,
      servidores: 110000
    },
    herramientas: {
      figma: 51600,
      chatgpt: 86000,
      correos: 51600,
      servidor: 100000,
      dominio: 120000
    },
    ventasEstimadas: 100,
    empresa: {
      nombre: 'Mi Empresa SAS',
      nit: '123456789-0',
      direccion: 'Calle 123 #45-67',
      telefono: '+57 300 123 4567',
      email: 'contacto@miempresa.com',
      ciudad: 'Bogotá, Colombia'
    },
    cotizaciones: {
      validezDias: 30,
      ivaDefecto: 19,
      terminosCondiciones: `1. Validez de la cotización: 30 días a partir de la fecha de emisión.
2. Forma de pago: 50% anticipo, 50% contra entrega.
3. Los precios no incluyen IVA.
4. Cualquier trabajo adicional será cotizado por separado.
5. El tiempo de entrega está sujeto a la aprobación de la cotización.`,
      notaPie: 'Gracias por confiar en nosotros',
      mostrarLogo: false,
      formatoNumero: 'QUOTE-{YYYY}-{###}'
    }
  },
  metas: {
    ventasMensuales: 5000000,
    unidadesMensuales: 20,
    margenPromedio: 40,
    rotacionInventario: 6
  },
  alertas: {
    margenMinimo: 25,
    stockMinimo: 5,
    diasSinVenta: 30,
    diferenciaPrecioCompetencia: 15
  },
  metricas: null,
  loading: true,
  error: null
};

// Tipos de acciones
type ServicesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CLIENTES'; payload: Cliente[] }
  | { type: 'ADD_CLIENTE'; payload: Cliente }
  | { type: 'UPDATE_CLIENTE'; payload: { id: string; cliente: Cliente } }
  | { type: 'REMOVE_CLIENTE'; payload: string }
  | { type: 'SET_SERVICIOS'; payload: Servicio[] }
  | { type: 'ADD_SERVICIO'; payload: Servicio }
  | { type: 'UPDATE_SERVICIO'; payload: { id: string; servicio: Servicio } }
  | { type: 'REMOVE_SERVICIO'; payload: string }
  | { type: 'SET_COTIZACIONES'; payload: Cotizacion[] }
  | { type: 'ADD_COTIZACION'; payload: Cotizacion }
  | { type: 'UPDATE_COTIZACION'; payload: { id: string; cotizacion: Cotizacion } }
  | { type: 'REMOVE_COTIZACION'; payload: string }
  | { type: 'SET_PROYECTOS'; payload: Proyecto[] }
  | { type: 'ADD_PROYECTO'; payload: Proyecto }
  | { type: 'UPDATE_PROYECTO'; payload: { id: string; proyecto: Proyecto } }
  | { type: 'SET_PLANES_PAGO'; payload: PlanPago[] }
  | { type: 'ADD_PLAN_PAGO'; payload: PlanPago }
  | { type: 'UPDATE_PLAN_PAGO'; payload: { id: string; plan: PlanPago } }
  | { type: 'SET_PAGOS'; payload: Pago[] }
  | { type: 'ADD_PAGO'; payload: Pago }
  | { type: 'REMOVE_PAGO'; payload: string }
  | { type: 'SET_CATEGORIAS_DESEMBOLSO'; payload: CategoriaDesembolso[] }
  | { type: 'ADD_CATEGORIA_DESEMBOLSO'; payload: CategoriaDesembolso }
  | { type: 'SET_DESEMBOLSOS'; payload: Desembolso[] }
  | { type: 'ADD_DESEMBOLSO'; payload: Desembolso }
  | { type: 'UPDATE_DESEMBOLSO'; payload: { id: string; desembolso: Desembolso } }
  | { type: 'REMOVE_DESEMBOLSO'; payload: string }
  | { type: 'SET_CONFIGURACION'; payload: Configuracion }
  | { type: 'SET_METAS'; payload: Metas }
  | { type: 'SET_ALERTAS'; payload: Alertas }
  | { type: 'SET_METRICAS'; payload: MetricasServicio };

// Reducer
function servicesReducer(state: ServicesState, action: ServicesAction): ServicesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_CLIENTES':
      return { ...state, clientes: action.payload };
    
    case 'ADD_CLIENTE':
      return { ...state, clientes: [...state.clientes, action.payload] };
    
    case 'UPDATE_CLIENTE':
      return {
        ...state,
        clientes: state.clientes.map(c => 
          c.id === action.payload.id ? action.payload.cliente : c
        )
      };
    
    case 'REMOVE_CLIENTE':
      return {
        ...state,
        clientes: state.clientes.filter(c => c.id !== action.payload)
      };
    
    case 'SET_SERVICIOS':
      return { ...state, servicios: action.payload };
    
    case 'ADD_SERVICIO':
      return { ...state, servicios: [...state.servicios, action.payload] };
    
    case 'UPDATE_SERVICIO':
      return {
        ...state,
        servicios: state.servicios.map(s => 
          s.id === action.payload.id ? action.payload.servicio : s
        )
      };
    
    case 'REMOVE_SERVICIO':
      return {
        ...state,
        servicios: state.servicios.filter(s => s.id !== action.payload)
      };
    
    case 'SET_COTIZACIONES':
      return { ...state, cotizaciones: action.payload };
    
    case 'ADD_COTIZACION':
      return { ...state, cotizaciones: [action.payload, ...state.cotizaciones] };
    
    case 'UPDATE_COTIZACION':
      return {
        ...state,
        cotizaciones: state.cotizaciones.map(c => 
          c.id === action.payload.id ? action.payload.cotizacion : c
        )
      };
    
    case 'REMOVE_COTIZACION':
      return {
        ...state,
        cotizaciones: state.cotizaciones.filter(c => c.id !== action.payload)
      };
    
    case 'SET_PROYECTOS':
      return { ...state, proyectos: action.payload };
    
    case 'ADD_PROYECTO':
      return { ...state, proyectos: [action.payload, ...state.proyectos] };
    
    case 'UPDATE_PROYECTO':
      return {
        ...state,
        proyectos: state.proyectos.map(p => 
          p.id === action.payload.id ? action.payload.proyecto : p
        )
      };
    
    case 'SET_PLANES_PAGO':
      return { ...state, planesPago: action.payload };
    
    case 'ADD_PLAN_PAGO':
      return { ...state, planesPago: [...state.planesPago, action.payload] };
    
    case 'UPDATE_PLAN_PAGO':
      return {
        ...state,
        planesPago: state.planesPago.map(p => 
          p.id === action.payload.id ? action.payload.plan : p
        )
      };
    
    case 'SET_PAGOS':
      return { ...state, pagos: action.payload };
    
    case 'ADD_PAGO':
      return { ...state, pagos: [action.payload, ...state.pagos] };
    
    case 'REMOVE_PAGO':
      return {
        ...state,
        pagos: state.pagos.filter(p => p.id !== action.payload)
      };
    
    case 'SET_CATEGORIAS_DESEMBOLSO':
      return { ...state, categoriasDesembolso: action.payload };
    
    case 'ADD_CATEGORIA_DESEMBOLSO':
      return { ...state, categoriasDesembolso: [...state.categoriasDesembolso, action.payload] };
    
    case 'SET_DESEMBOLSOS':
      return { ...state, desembolsos: action.payload };
    
    case 'ADD_DESEMBOLSO':
      return { ...state, desembolsos: [action.payload, ...state.desembolsos] };
    
    case 'UPDATE_DESEMBOLSO':
      return {
        ...state,
        desembolsos: state.desembolsos.map(d => 
          d.id === action.payload.id ? action.payload.desembolso : d
        )
      };
    
    case 'REMOVE_DESEMBOLSO':
      return {
        ...state,
        desembolsos: state.desembolsos.filter(d => d.id !== action.payload)
      };
    
    case 'SET_CONFIGURACION':
      return { ...state, configuracion: action.payload };
    
    case 'SET_METAS':
      return { ...state, metas: action.payload };
    
    case 'SET_ALERTAS':
      return { ...state, alertas: action.payload };
    
    case 'SET_METRICAS':
      return { ...state, metricas: action.payload };
    
    default:
      return state;
  }
}

// Context
interface ServicesContextType extends ServicesState {
  // Clientes
  agregarCliente: (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  actualizarCliente: (id: string, cliente: Partial<Cliente>) => Promise<void>;
  eliminarCliente: (id: string) => Promise<void>;
  
  // Servicios
  agregarServicio: (servicio: any) => Promise<void>;
  actualizarServicio: (id: string, servicio: any) => Promise<void>;
  eliminarServicio: (id: string) => Promise<void>;
  
  // Cotizaciones
  agregarCotizacion: (cotizacion: any, items: any[]) => Promise<void>;
  actualizarCotizacion: (id: string, cotizacion: Partial<Cotizacion>) => Promise<void>;
  aprobarCotizacion: (id: string) => Promise<void>;
  rechazarCotizacion: (id: string, motivo: string) => Promise<void>;
  eliminarCotizacion: (id: string) => Promise<void>;
  
  // Proyectos
  actualizarProyecto: (id: string, proyecto: Partial<Proyecto>) => Promise<void>;
  completarProyecto: (id: string) => Promise<void>;
  
  // Planes de pago
  crearPlanPago: (plan: Omit<PlanPago, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  crearPlanesPago: (planes: Omit<PlanPago, 'id' | 'created_at' | 'updated_at'>[]) => Promise<void>;
  actualizarPlanPago: (id: string, plan: Partial<PlanPago>) => Promise<void>;
  
  // Pagos
  registrarPago: (pago: Omit<Pago, 'id' | 'created_at'>) => Promise<void>;
  eliminarPago: (id: string) => Promise<void>;
  
  // Categorías de desembolso
  agregarCategoriaDesembolso: (categoria: Omit<CategoriaDesembolso, 'id' | 'created_at'>) => Promise<void>;
  
  // Desembolsos
  agregarDesembolso: (desembolso: Omit<Desembolso, 'id' | 'created_at'>) => Promise<void>;
  actualizarDesembolso: (id: string, desembolso: Partial<Desembolso>) => Promise<void>;
  eliminarDesembolso: (id: string) => Promise<void>;
  
  // Configuración
  actualizarConfiguracion: (tipo: string, clave: string, valor: number) => Promise<void>;
  actualizarConfiguracionCompleta: (config: Partial<Configuracion>) => Promise<void>;
  eliminarConfiguracion: (tipo: string, clave: string) => Promise<void>;
  
  // Metas y alertas
  actualizarMeta: (clave: string, valor: number) => Promise<void>;
  actualizarAlerta: (clave: string, valor: number) => Promise<void>;
  
  // Utilidades
  cargarDatos: () => Promise<void>;
  calcularMetricas: () => void;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

// Provider
interface ServicesProviderProps {
  children: ReactNode;
}

export function ServicesProvider({ children }: ServicesProviderProps) {
  const [state, dispatch] = useReducer(servicesReducer, initialState);

  // Funciones para calcular métricas
  const calcularMetricas = () => {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    
    // Cotizaciones del mes
    const cotizacionesMes = state.cotizaciones.filter(c => 
      new Date(c.fecha) >= inicioMes
    );
    
    const cotizacionesEnviadas = cotizacionesMes.filter(c => 
      ['enviada', 'aprobada'].includes(c.estado)
    ).length;
    
    const cotizacionesAprobadas = cotizacionesMes.filter(c => 
      c.estado === 'aprobada'
    ).length;
    
    const tasaConversion = cotizacionesEnviadas > 0 
      ? (cotizacionesAprobadas / cotizacionesEnviadas) * 100 
      : 0;
    
    // Ingresos del mes (pagos recibidos)
    const pagosMes = state.pagos.filter(p => 
      new Date(p.fecha) >= inicioMes
    );
    
    const ingresosMes = pagosMes.reduce((sum, p) => sum + p.monto, 0);
    
    // Gastos del mes (desembolsos)
    const desembolsosMes = state.desembolsos.filter(d => 
      new Date(d.fecha) >= inicioMes && d.estado === 'pagado'
    );
    
    const gastosMes = desembolsosMes.reduce((sum, d) => sum + d.monto, 0);
    
    // Utilidad del mes
    const utilidadMes = ingresosMes - gastosMes;
    
    // Proyectos activos
    const proyectosActivos = state.proyectos.filter(p => 
      p.estado === 'activo'
    ).length;
    
    // Pagos vencidos
    const hoy = new Date().toISOString().split('T')[0];
    const pagosVencidos = state.planesPago.filter(p => 
      p.estado === 'pendiente' && p.fechaVencimiento < hoy
    ).length;
    
    // Flujo de efectivo (diferencia entre ingresos y gastos)
    const flujoEfectivo = utilidadMes;
    
    const metricas: MetricasServicio = {
      cotizacionesEnviadas,
      cotizacionesAprobadas,
      tasaConversion,
      ingresosMes,
      gastosMes,
      utilidadMes,
      proyectosActivos,
      pagosVencidos,
      flujoEfectivo
    };
    
    dispatch({ type: 'SET_METRICAS', payload: metricas });
  };

  // Cargar todos los datos
  const cargarDatos = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Cargar datos en paralelo
      const [
        clientes,
        servicios,
        cotizaciones,
        proyectos,
        categoriasDesembolso,
        desembolsos,
        configuracion,
        metas,
        alertas
      ] = await Promise.all([
        clientesService.obtenerTodos(),
        serviciosService.obtenerTodos(),
        cotizacionesService.obtenerTodas(),
        proyectosService.obtenerTodos(),
        categoriasDesembolsoService.obtenerTodas(),
        desembolsosService.obtenerTodos(),
        obtenerConfiguracion(),
        obtenerMetas(),
        obtenerAlertas()
      ]);
      
      dispatch({ type: 'SET_CLIENTES', payload: clientes });
      dispatch({ type: 'SET_SERVICIOS', payload: servicios });
      dispatch({ type: 'SET_COTIZACIONES', payload: cotizaciones });
      dispatch({ type: 'SET_PROYECTOS', payload: proyectos });
      dispatch({ type: 'SET_CATEGORIAS_DESEMBOLSO', payload: categoriasDesembolso });
      dispatch({ type: 'SET_DESEMBOLSOS', payload: desembolsos });
      dispatch({ type: 'SET_CONFIGURACION', payload: configuracion });
      dispatch({ type: 'SET_METAS', payload: metas });
      dispatch({ type: 'SET_ALERTAS', payload: alertas });
      
      // Cargar planes de pago y pagos para todos los proyectos
      if (proyectos.length > 0) {
        const todosPlanesPago = [];
        const todosPagos = [];
        
        for (const proyecto of proyectos) {
          const [planes, pagos] = await Promise.all([
            planesPagoService.obtenerPorProyecto(proyecto.id),
            pagosService.obtenerPorProyecto(proyecto.id)
          ]);
          
          todosPlanesPago.push(...planes);
          todosPagos.push(...pagos);
        }
        
        dispatch({ type: 'SET_PLANES_PAGO', payload: todosPlanesPago });
        dispatch({ type: 'SET_PAGOS', payload: todosPagos });
      }
      
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      console.error('Error cargando datos:', error);
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Efectos
  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (!state.loading) {
      calcularMetricas();
    }
  }, [state.cotizaciones, state.pagos, state.desembolsos, state.proyectos, state.planesPago, state.loading]);

  // Funciones de clientes
  const agregarCliente = async (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
    const nuevoCliente = await clientesService.crear(cliente);
    dispatch({ type: 'ADD_CLIENTE', payload: nuevoCliente });
  };

  const actualizarCliente = async (id: string, cliente: Partial<Cliente>) => {
    const clienteActualizado = await clientesService.actualizar(id, cliente);
    dispatch({ type: 'UPDATE_CLIENTE', payload: { id, cliente: clienteActualizado } });
  };

  const eliminarCliente = async (id: string) => {
    await clientesService.eliminar(id);
    dispatch({ type: 'REMOVE_CLIENTE', payload: id });
  };

  // Funciones de servicios
  const agregarServicio = async (servicio: any) => {
    const nuevoServicio = await serviciosService.crear(servicio);
    dispatch({ type: 'ADD_SERVICIO', payload: nuevoServicio });
  };

  const actualizarServicio = async (id: string, servicio: any) => {
    const servicioActualizado = await serviciosService.actualizar(id, servicio);
    dispatch({ type: 'UPDATE_SERVICIO', payload: { id, servicio: servicioActualizado } });
  };

  const eliminarServicio = async (id: string) => {
    await serviciosService.eliminar(id);
    dispatch({ type: 'REMOVE_SERVICIO', payload: id });
  };

  // Funciones de cotizaciones
  const agregarCotizacion = async (cotizacion: any, items: any[]) => {
    const nuevaCotizacion = await cotizacionesService.crear(cotizacion, items);
    dispatch({ type: 'ADD_COTIZACION', payload: nuevaCotizacion });
  };

  const actualizarCotizacion = async (id: string, cotizacion: Partial<Cotizacion>) => {
    const cotizacionActualizada = await cotizacionesService.actualizar(id, cotizacion);
    dispatch({ type: 'UPDATE_COTIZACION', payload: { id, cotizacion: cotizacionActualizada } });
  };

  const aprobarCotizacion = async (id: string) => {
    const proyecto = await cotizacionesService.aprobar(id);
    dispatch({ type: 'ADD_PROYECTO', payload: proyecto });
    
    // Actualizar estado de cotización
    const cotizacion = state.cotizaciones.find(c => c.id === id);
    if (cotizacion) {
      dispatch({ 
        type: 'UPDATE_COTIZACION', 
        payload: { 
          id, 
          cotizacion: { 
            ...cotizacion, 
            estado: 'aprobada',
            fechaAprobacion: new Date().toISOString().split('T')[0]
          } 
        } 
      });
    }
  };

  const rechazarCotizacion = async (id: string, motivo: string) => {
    await cotizacionesService.rechazar(id, motivo);
    
    const cotizacion = state.cotizaciones.find(c => c.id === id);
    if (cotizacion) {
      dispatch({ 
        type: 'UPDATE_COTIZACION', 
        payload: { 
          id, 
          cotizacion: { 
            ...cotizacion, 
            estado: 'rechazada',
            fechaRechazo: new Date().toISOString().split('T')[0],
            motivoRechazo: motivo
          } 
        } 
      });
    }
  };

  const eliminarCotizacion = async (id: string) => {
    await cotizacionesService.eliminar(id);
    dispatch({ type: 'REMOVE_COTIZACION', payload: id });
  };

  // Funciones de proyectos
  const actualizarProyecto = async (id: string, proyecto: Partial<Proyecto>) => {
    const proyectoActualizado = await proyectosService.actualizar(id, proyecto);
    dispatch({ type: 'UPDATE_PROYECTO', payload: { id, proyecto: proyectoActualizado } });
  };

  const completarProyecto = async (id: string) => {
    const proyectoCompletado = await proyectosService.completar(id);
    dispatch({ type: 'UPDATE_PROYECTO', payload: { id, proyecto: proyectoCompletado } });
  };

  // Funciones de planes de pago
  const crearPlanPago = async (plan: Omit<PlanPago, 'id' | 'created_at' | 'updated_at'>) => {
    const nuevoPlan = await planesPagoService.crear(plan);
    dispatch({ type: 'ADD_PLAN_PAGO', payload: nuevoPlan });
  };

  const crearPlanesPago = async (planes: Omit<PlanPago, 'id' | 'created_at' | 'updated_at'>[]) => {
    const nuevosPlanes = await planesPagoService.crearMultiples(planes);
    nuevosPlanes.forEach(plan => {
      dispatch({ type: 'ADD_PLAN_PAGO', payload: plan });
    });
  };

  const actualizarPlanPago = async (id: string, plan: Partial<PlanPago>) => {
    const planActualizado = await planesPagoService.actualizar(id, plan);
    dispatch({ type: 'UPDATE_PLAN_PAGO', payload: { id, plan: planActualizado } });
  };

  // Funciones de pagos
  const registrarPago = async (pago: Omit<Pago, 'id' | 'created_at'>) => {
    const nuevoPago = await pagosService.crear(pago);
    dispatch({ type: 'ADD_PAGO', payload: nuevoPago });
  };

  const eliminarPago = async (id: string) => {
    await pagosService.eliminar(id);
    dispatch({ type: 'REMOVE_PAGO', payload: id });
  };

  // Funciones de categorías de desembolso
  const agregarCategoriaDesembolso = async (categoria: Omit<CategoriaDesembolso, 'id' | 'created_at'>) => {
    const nuevaCategoria = await categoriasDesembolsoService.crear(categoria);
    dispatch({ type: 'ADD_CATEGORIA_DESEMBOLSO', payload: nuevaCategoria });
  };

  // Funciones de desembolsos
  const agregarDesembolso = async (desembolso: Omit<Desembolso, 'id' | 'created_at'>) => {
    const nuevoDesembolso = await desembolsosService.crear(desembolso);
    dispatch({ type: 'ADD_DESEMBOLSO', payload: nuevoDesembolso });
  };

  const actualizarDesembolso = async (id: string, desembolso: Partial<Desembolso>) => {
    const desembolsoActualizado = await desembolsosService.actualizar(id, desembolso);
    dispatch({ type: 'UPDATE_DESEMBOLSO', payload: { id, desembolso: desembolsoActualizado } });
  };

  const eliminarDesembolso = async (id: string) => {
    await desembolsosService.eliminar(id);
    dispatch({ type: 'REMOVE_DESEMBOLSO', payload: id });
  };

  // Funciones de configuración
  const actualizarConfiguracion = async (tipo: string, clave: string, valor: number) => {
    await actualizarConfigDB(tipo, clave, valor);
    const nuevaConfiguracion = await obtenerConfiguracion();
    dispatch({ type: 'SET_CONFIGURACION', payload: nuevaConfiguracion });
  };

  const actualizarConfiguracionCompleta = async (config: Partial<Configuracion>) => {
    await configuracionService.actualizarCompleta(config);
    const nuevaConfiguracion = await obtenerConfiguracion();
    dispatch({ type: 'SET_CONFIGURACION', payload: nuevaConfiguracion });
  };

  const eliminarConfiguracion = async (tipo: string, clave: string) => {
    await eliminarConfigDB(tipo, clave);
    const nuevaConfiguracion = await obtenerConfiguracion();
    dispatch({ type: 'SET_CONFIGURACION', payload: nuevaConfiguracion });
  };

  // Funciones de metas y alertas
  const actualizarMeta = async (clave: string, valor: number) => {
    await actualizarMetaDB(clave, valor);
    const nuevasMetas = await obtenerMetas();
    dispatch({ type: 'SET_METAS', payload: nuevasMetas });
  };

  const actualizarAlerta = async (clave: string, valor: number) => {
    await actualizarAlertaDB(clave, valor);
    const nuevasAlertas = await obtenerAlertas();
    dispatch({ type: 'SET_ALERTAS', payload: nuevasAlertas });
  };

  const value: ServicesContextType = {
    ...state,
    agregarCliente,
    actualizarCliente,
    eliminarCliente,
    agregarServicio,
    actualizarServicio,
    eliminarServicio,
    agregarCotizacion,
    actualizarCotizacion,
    aprobarCotizacion,
    rechazarCotizacion,
    eliminarCotizacion,
    actualizarProyecto,
    completarProyecto,
    crearPlanPago,
    crearPlanesPago,
    actualizarPlanPago,
    registrarPago,
    eliminarPago,
    agregarCategoriaDesembolso,
    agregarDesembolso,
    actualizarDesembolso,
    eliminarDesembolso,
    actualizarConfiguracion,
    actualizarConfiguracionCompleta,
    eliminarConfiguracion,
    actualizarMeta,
    actualizarAlerta,
    cargarDatos,
    calcularMetricas
  };

  return (
    <ServicesContext.Provider value={value}>
      {children}
    </ServicesContext.Provider>
  );
}

// Hook personalizado
export function useServices() {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices debe usarse dentro de ServicesProvider');
  }
  return context;
}