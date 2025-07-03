import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText, 
  Calendar,
  Download,
  Filter,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  Cliente, 
  Servicio, 
  Cotizacion, 
  Proyecto, 
  Pago, 
  Desembolso, 
  MetricasServicio 
} from '../../types/services';
import { formatearMoneda } from '../../utils/formatters';

interface ReportesServiciosProps {
  clientes: Cliente[];
  servicios: Servicio[];
  cotizaciones: Cotizacion[];
  proyectos: Proyecto[];
  pagos: Pago[];
  desembolsos: Desembolso[];
  metricas: MetricasServicio | null;
}

type TipoReporte = 'rentabilidad' | 'servicios' | 'clientes' | 'flujo' | 'proyectos' | 'tendencias';

interface FiltroFecha {
  desde: string;
  hasta: string;
}

const COLORES_GRAFICOS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export const ReportesServicios: React.FC<ReportesServiciosProps> = ({
  clientes,
  servicios,
  cotizaciones,
  proyectos,
  pagos,
  desembolsos,
  metricas
}) => {
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('rentabilidad');
  const [filtroFecha, setFiltroFecha] = useState<FiltroFecha>({
    desde: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    hasta: new Date().toISOString().split('T')[0]
  });

  // Datos procesados para reportes
  const datosRentabilidad = useMemo(() => {
    return proyectos.map(proyecto => ({
      nombre: proyecto.nombre.length > 20 ? proyecto.nombre.substring(0, 20) + '...' : proyecto.nombre,
      valorTotal: proyecto.valorTotal,
      costoReal: proyecto.costoReal || 0,
      rentabilidad: proyecto.valorTotal - (proyecto.costoReal || 0),
      rentabilidadPorcentaje: proyecto.valorTotal > 0 ? 
        ((proyecto.valorTotal - (proyecto.costoReal || 0)) / proyecto.valorTotal * 100) : 0
    }));
  }, [proyectos]);

  const datosServicios = useMemo(() => {
    const serviciosConDatos = servicios.map(servicio => {
      const cotizacionesServicio = cotizaciones.filter(c => 
        c.items?.some(item => item.servicioId === servicio.id)
      ).length;
      
      return {
        nombre: servicio.nombre,
        categoria: servicio.categoria,
        vecesCotizado: servicio.vecesCotizado || 0,
        vecesVendido: servicio.vecesVendido || 0,
        precio: parseFloat(servicio.precioSugerido),
        ingresoTotal: (servicio.vecesVendido || 0) * parseFloat(servicio.precioSugerido)
      };
    });

    return serviciosConDatos.sort((a, b) => b.ingresoTotal - a.ingresoTotal);
  }, [servicios, cotizaciones]);

  const datosClientes = useMemo(() => {
    return clientes.map(cliente => {
      const proyectosCliente = proyectos.filter(p => p.clienteId === cliente.id);
      const valorTotal = proyectosCliente.reduce((sum, p) => sum + p.valorTotal, 0);
      const pagosCliente = pagos.filter(p => 
        proyectosCliente.some(pr => pr.id === p.proyectoId)
      );
      const totalPagado = pagosCliente.reduce((sum, p) => sum + p.monto, 0);

      return {
        nombre: cliente.nombre,
        empresa: cliente.empresa || 'Sin empresa',
        proyectos: proyectosCliente.length,
        valorTotal,
        totalPagado,
        pendiente: valorTotal - totalPagado
      };
    }).sort((a, b) => b.valorTotal - a.valorTotal);
  }, [clientes, proyectos, pagos]);

  const datosFlujo = useMemo(() => {
    const ultimosMeses = [];
    for (let i = 5; i >= 0; i--) {
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() - i);
      const mesAno = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      const pagosDelMes = pagos.filter(p => p.fecha.startsWith(mesAno));
      const desembolsosDelMes = desembolsos.filter(d => d.fecha.startsWith(mesAno));
      
      const ingresos = pagosDelMes.reduce((sum, p) => sum + p.monto, 0);
      const gastos = desembolsosDelMes.reduce((sum, d) => sum + d.monto, 0);
      
      ultimosMeses.push({
        mes: fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        ingresos,
        gastos,
        flujo: ingresos - gastos
      });
    }
    return ultimosMeses;
  }, [pagos, desembolsos]);

  const datosProyectos = useMemo(() => {
    const estados = ['activo', 'pausado', 'completado', 'cancelado'];
    return estados.map(estado => ({
      estado: estado.charAt(0).toUpperCase() + estado.slice(1),
      cantidad: proyectos.filter(p => p.estado === estado).length,
      valor: proyectos.filter(p => p.estado === estado).reduce((sum, p) => sum + p.valorTotal, 0)
    }));
  }, [proyectos]);

  const datosTendencias = useMemo(() => {
    const ultimosMeses = [];
    for (let i = 11; i >= 0; i--) {
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() - i);
      const mesAno = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      const cotizacionesDelMes = cotizaciones.filter(c => c.fecha.startsWith(mesAno));
      const aprobadas = cotizacionesDelMes.filter(c => c.estado === 'aprobada').length;
      const enviadas = cotizacionesDelMes.length;
      
      ultimosMeses.push({
        mes: fecha.toLocaleDateString('es-ES', { month: 'short' }),
        cotizaciones: enviadas,
        aprobadas,
        conversion: enviadas > 0 ? (aprobadas / enviadas * 100) : 0
      });
    }
    return ultimosMeses;
  }, [cotizaciones]);

  const exportarPDF = () => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString('es-ES');
    
    // Encabezado
    doc.setFontSize(18);
    doc.text('Reporte de Servicios - Rentability Pro', 20, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${fecha}`, 20, 30);
    doc.text(`Tipo: ${tipoReporte.charAt(0).toUpperCase() + tipoReporte.slice(1)}`, 20, 40);

    let yPosition = 60;

    switch (tipoReporte) {
      case 'rentabilidad':
        doc.text('Rentabilidad por Proyecto', 20, 50);
        const tablaRentabilidad = datosRentabilidad.map(item => [
          item.nombre,
          formatearMoneda(item.valorTotal),
          formatearMoneda(item.costoReal),
          formatearMoneda(item.rentabilidad),
          `${item.rentabilidadPorcentaje.toFixed(1)}%`
        ]);
        (doc as any).autoTable({
          head: [['Proyecto', 'Valor Total', 'Costo Real', 'Rentabilidad', '%']],
          body: tablaRentabilidad,
          startY: yPosition
        });
        break;

      case 'servicios':
        doc.text('Análisis de Servicios', 20, 50);
        const tablaServicios = datosServicios.slice(0, 10).map(item => [
          item.nombre,
          item.categoria,
          item.vecesCotizado.toString(),
          item.vecesVendido.toString(),
          formatearMoneda(item.ingresoTotal)
        ]);
        (doc as any).autoTable({
          head: [['Servicio', 'Categoría', 'Cotizaciones', 'Ventas', 'Ingresos']],
          body: tablaServicios,
          startY: yPosition
        });
        break;

      case 'clientes':
        doc.text('Análisis de Clientes', 20, 50);
        const tablaClientes = datosClientes.slice(0, 10).map(item => [
          item.nombre,
          item.empresa,
          item.proyectos.toString(),
          formatearMoneda(item.valorTotal),
          formatearMoneda(item.totalPagado)
        ]);
        (doc as any).autoTable({
          head: [['Cliente', 'Empresa', 'Proyectos', 'Valor Total', 'Pagado']],
          body: tablaClientes,
          startY: yPosition
        });
        break;
    }

    doc.save(`reporte-${tipoReporte}-${fecha.replace(/\//g, '-')}.pdf`);
  };

  const renderGrafico = () => {
    switch (tipoReporte) {
      case 'rentabilidad':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={datosRentabilidad.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
              <YAxis tickFormatter={(value) => formatearMoneda(value)} />
              <Tooltip formatter={(value) => formatearMoneda(Number(value))} />
              <Bar dataKey="valorTotal" fill="#3B82F6" name="Valor Total" />
              <Bar dataKey="costoReal" fill="#EF4444" name="Costo Real" />
              <Bar dataKey="rentabilidad" fill="#10B981" name="Rentabilidad" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'servicios':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={datosServicios.slice(0, 8)}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="ingresoTotal"
                nameKey="nombre"
              >
                {datosServicios.slice(0, 8).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORES_GRAFICOS[index % COLORES_GRAFICOS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatearMoneda(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'clientes':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={datosClientes.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
              <YAxis tickFormatter={(value) => formatearMoneda(value)} />
              <Tooltip formatter={(value) => formatearMoneda(Number(value))} />
              <Bar dataKey="valorTotal" fill="#8B5CF6" name="Valor Total" />
              <Bar dataKey="totalPagado" fill="#10B981" name="Total Pagado" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'flujo':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={datosFlujo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(value) => formatearMoneda(value)} />
              <Tooltip formatter={(value) => formatearMoneda(Number(value))} />
              <Area type="monotone" dataKey="ingresos" stackId="1" stroke="#10B981" fill="#10B981" name="Ingresos" />
              <Area type="monotone" dataKey="gastos" stackId="2" stroke="#EF4444" fill="#EF4444" name="Gastos" />
              <Line type="monotone" dataKey="flujo" stroke="#3B82F6" strokeWidth={3} name="Flujo Neto" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'proyectos':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={datosProyectos}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="cantidad"
                nameKey="estado"
              >
                {datosProyectos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORES_GRAFICOS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'tendencias':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={datosTendencias}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="cotizaciones" fill="#3B82F6" name="Cotizaciones" />
              <Bar yAxisId="left" dataKey="aprobadas" fill="#10B981" name="Aprobadas" />
              <Line yAxisId="right" type="monotone" dataKey="conversion" stroke="#F59E0B" strokeWidth={3} name="% Conversión" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Selecciona un tipo de reporte</div>;
    }
  };

  const opcionesReporte = [
    { id: 'rentabilidad', label: 'Rentabilidad', icon: DollarSign, color: 'text-emerald-600' },
    { id: 'servicios', label: 'Servicios', icon: BarChart3, color: 'text-blue-600' },
    { id: 'clientes', label: 'Clientes', icon: Users, color: 'text-purple-600' },
    { id: 'flujo', label: 'Flujo de Caja', icon: TrendingUp, color: 'text-indigo-600' },
    { id: 'proyectos', label: 'Proyectos', icon: FileText, color: 'text-orange-600' },
    { id: 'tendencias', label: 'Tendencias', icon: Activity, color: 'text-pink-600' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Reportes y Análisis</h1>
              <p className="text-slate-600">Insights detallados de tu negocio de servicios</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={filtroFecha.desde}
                onChange={(e) => setFiltroFecha(prev => ({ ...prev, desde: e.target.value }))}
                className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <span className="text-slate-500">-</span>
              <input
                type="date"
                value={filtroFecha.hasta}
                onChange={(e) => setFiltroFecha(prev => ({ ...prev, hasta: e.target.value }))}
                className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={exportarPDF}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* Selector de tipo de reporte */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {opcionesReporte.map((opcion) => {
            const Icon = opcion.icon;
            const isActive = tipoReporte === opcion.id;
            
            return (
              <button
                key={opcion.id}
                onClick={() => setTipoReporte(opcion.id as TipoReporte)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-105'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${isActive ? 'text-indigo-600' : opcion.color}`} />
                <p className={`text-sm font-medium ${isActive ? 'text-indigo-800' : 'text-slate-700'}`}>
                  {opcion.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Total Proyectos</p>
              <p className="text-2xl font-bold text-slate-800">{proyectos.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Servicios Activos</p>
              <p className="text-2xl font-bold text-slate-800">{servicios.filter(s => s.activo).length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Clientes Registrados</p>
              <p className="text-2xl font-bold text-slate-800">{clientes.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-slate-800">
                {metricas ? formatearMoneda(metricas.ingresosMes) : formatearMoneda(0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico principal */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {opcionesReporte.find(o => o.id === tipoReporte)?.label} - Análisis Visual
          </h2>
          <p className="text-slate-600">
            Visualización interactiva de datos de {tipoReporte}
          </p>
        </div>
        
        <div className="w-full">
          {renderGrafico()}
        </div>
      </div>

    </div>
  );
};