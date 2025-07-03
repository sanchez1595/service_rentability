import React, { useState } from 'react';
import { ArrowLeft, Download, Check, X, Edit2, Calendar, User, Building, Mail, FileText, Clock } from 'lucide-react';
import { Cotizacion, Cliente, Servicio, Configuracion } from '../../types/services';
import { ESTADOS_COTIZACION } from '../../utils/servicesConstants';
import { formatearMoneda } from '../../utils/formatters';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface VerCotizacionProps {
  cotizacion: Cotizacion;
  clientes: Cliente[];
  servicios: Servicio[];
  configuracion: Configuracion;
  onVolver: () => void;
  onAprobar: (id: string) => Promise<void>;
  onRechazar: (id: string, motivo: string) => Promise<void>;
  onActualizar: (id: string, cotizacion: Partial<Cotizacion>) => Promise<void>;
}

export const VerCotizacion: React.FC<VerCotizacionProps> = ({
  cotizacion,
  clientes,
  servicios,
  configuracion,
  onVolver,
  onAprobar,
  onRechazar,
  onActualizar
}) => {
  const [mostrandoRechazo, setMostrandoRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const cliente = clientes.find(c => c.id === cotizacion.clienteId);
  
  const obtenerColorEstado = (estado: string) => {
    const estadoConfig = ESTADOS_COTIZACION.find(e => e.value === estado);
    return estadoConfig?.color || 'gray';
  };

  const obtenerLabelEstado = (estado: string) => {
    const estadoConfig = ESTADOS_COTIZACION.find(e => e.value === estado);
    return estadoConfig?.label || estado;
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calcularDiasVencimiento = (fechaValidez: string) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaValidez);
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const manejarAprobar = async () => {
    if (confirm('¿Confirmas la aprobación de esta cotización? Se creará automáticamente un proyecto.')) {
      await onAprobar(cotizacion.id);
    }
  };

  const manejarRechazar = async () => {
    if (!motivoRechazo.trim()) {
      alert('Debe proporcionar un motivo del rechazo');
      return;
    }
    
    await onRechazar(cotizacion.id, motivoRechazo);
    setMostrandoRechazo(false);
    setMotivoRechazo('');
  };

  const generarPDF = () => {
    const doc = new jsPDF();
    
    // Configurar fuente
    doc.setFont('helvetica');
    
    // Header de la empresa
    doc.setFontSize(20);
    doc.setTextColor(51, 51, 51);
    doc.text('COTIZACIÓN', 20, 25);
    
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text(cotizacion.numero, 20, 35);
    
    // Información de la empresa desde configuración
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(configuracion.empresa?.nombre || 'Mi Empresa SAS', 140, 25);
    doc.text(`NIT: ${configuracion.empresa?.nit || '123456789-0'}`, 140, 30);
    doc.text(configuracion.empresa?.email || 'contacto@miempresa.com', 140, 35);
    doc.text(configuracion.empresa?.telefono || '+57 300 123 4567', 140, 40);
    if (configuracion.empresa?.direccion) {
      doc.text(configuracion.empresa.direccion, 140, 45);
    }
    if (configuracion.empresa?.ciudad) {
      doc.text(configuracion.empresa.ciudad, 140, 50);
    }
    
    // Información del cliente
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text('INFORMACIÓN DEL CLIENTE', 20, 55);
    
    let yPosition = 65;
    doc.setFontSize(10);
    
    if (cliente) {
      doc.text(`Nombre: ${cliente.nombre}`, 20, yPosition);
      yPosition += 5;
      
      if (cliente.empresa) {
        doc.text(`Empresa: ${cliente.empresa}`, 20, yPosition);
        yPosition += 5;
      }
      
      if (cliente.nit) {
        doc.text(`NIT/Cédula: ${cliente.nit}`, 20, yPosition);
        yPosition += 5;
      }
      
      if (cliente.email) {
        doc.text(`Email: ${cliente.email}`, 20, yPosition);
        yPosition += 5;
      }
      
      if (cliente.telefono) {
        doc.text(`Teléfono: ${cliente.telefono}`, 20, yPosition);
        yPosition += 5;
      }
    }
    
    // Fechas
    yPosition += 10;
    doc.setFontSize(12);
    doc.text('FECHAS', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${formatearFecha(cotizacion.fecha)}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Válida hasta: ${formatearFecha(cotizacion.fechaValidez)}`, 20, yPosition);
    yPosition += 15;
    
    // Tabla de servicios
    const serviciosData = cotizacion.items?.map((item: any) => {
      const servicio = servicios.find(s => s.id === item.servicio_id);
      return [
        servicio?.nombre || 'Servicio',
        item.cantidad.toString(),
        formatearMoneda(item.precio_unitario),
        item.descuento_porcentaje ? `${item.descuento_porcentaje}%` : '0%',
        formatearMoneda(item.subtotal)
      ];
    }) || [];
    
    autoTable(doc, {
      head: [['Servicio', 'Cant.', 'Precio Unit.', 'Desc.', 'Subtotal']],
      body: serviciosData,
      startY: yPosition,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 30, halign: 'right' }
      }
    });
    
    // Totales
    const finalY = (doc as any).lastAutoTable?.finalY || yPosition + (serviciosData.length * 10) + 20;
    
    doc.setFontSize(10);
    const totalesX = 140;
    
    doc.text(`Subtotal: ${formatearMoneda(cotizacion.subtotal)}`, totalesX, finalY);
    
    if (cotizacion.descuentoValor > 0) {
      doc.text(`Descuento (${cotizacion.descuentoPorcentaje}%): -${formatearMoneda(cotizacion.descuentoValor)}`, totalesX, finalY + 5);
    }
    
    doc.text(`IVA: ${formatearMoneda(cotizacion.iva)}`, totalesX, finalY + (cotizacion.descuentoValor > 0 ? 10 : 5));
    
    // Total final
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: ${formatearMoneda(cotizacion.total)}`, totalesX, finalY + (cotizacion.descuentoValor > 0 ? 18 : 13));
    
    // Términos y condiciones
    const terminosAUsar = cotizacion.terminosCondiciones || configuracion.cotizaciones?.terminosCondiciones || '';
    if (terminosAUsar) {
      let terminosY = finalY + 30;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TÉRMINOS Y CONDICIONES', 20, terminosY);
      
      terminosY += 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      const terminos = terminosAUsar.split('\n');
      terminos.forEach(linea => {
        if (terminosY > 270) { // Si está cerca del final de la página
          doc.addPage();
          terminosY = 20;
        }
        doc.text(linea, 20, terminosY);
        terminosY += 4;
      });
    }
    
    // Notas
    if (cotizacion.notas) {
      let notasY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 50 : 200;
      
      if (notasY > 250) {
        doc.addPage();
        notasY = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('NOTAS', 20, notasY);
      
      notasY += 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      const notas = cotizacion.notas.split('\n');
      notas.forEach(linea => {
        if (notasY > 270) {
          doc.addPage();
          notasY = 20;
        }
        doc.text(linea, 20, notasY);
        notasY += 4;
      });
    }
    
    // Nota al pie
    if (configuracion.cotizaciones?.notaPie) {
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text(configuracion.cotizaciones.notaPie, 20, pageHeight - 15);
    }
    
    // Guardar el PDF
    const nombreArchivo = `cotizacion-${cotizacion.numero.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
    doc.save(nombreArchivo);
  };

  const diasVencimiento = calcularDiasVencimiento(cotizacion.fechaValidez);
  const estaVencida = diasVencimiento < 0 && cotizacion.estado === 'enviada';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onVolver}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-800">{cotizacion.numero}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${obtenerColorEstado(cotizacion.estado)}-100 text-${obtenerColorEstado(cotizacion.estado)}-700`}>
                  {obtenerLabelEstado(cotizacion.estado)}
                </span>
                {estaVencida && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                    Vencida
                  </span>
                )}
              </div>
              <p className="text-slate-600">
                Valor total: <span className="font-bold text-emerald-600 text-xl">{formatearMoneda(cotizacion.total)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={generarPDF}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Descargar PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            
            {cotizacion.estado === 'borrador' && (
              <button
                onClick={() => onActualizar(cotizacion.id, { estado: 'enviada' })}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>Enviar al Cliente</span>
              </button>
            )}
            
            {cotizacion.estado === 'enviada' && (
              <>
                <button
                  onClick={manejarAprobar}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Aprobar</span>
                </button>
                
                <button
                  onClick={() => setMostrandoRechazo(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Rechazar</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Información básica */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-slate-500 text-sm">Fecha de emisión</p>
              <p className="font-medium">{formatearFecha(cotizacion.fecha)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-slate-500" />
            <div>
              <p className="text-slate-500 text-sm">Válida hasta</p>
              <p className={`font-medium ${estaVencida ? 'text-red-600' : ''}`}>
                {formatearFecha(cotizacion.fechaValidez)}
                {cotizacion.estado === 'enviada' && (
                  <span className={`ml-2 text-xs ${diasVencimiento <= 3 ? 'text-red-600' : 'text-slate-500'}`}>
                    ({diasVencimiento > 0 ? `${diasVencimiento} días restantes` : 'Vencida'})
                  </span>
                )}
              </p>
            </div>
          </div>

          {cotizacion.fechaAprobacion && (
            <div className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-slate-500 text-sm">Fecha de aprobación</p>
                <p className="font-medium text-emerald-600">{formatearFecha(cotizacion.fechaAprobacion)}</p>
              </div>
            </div>
          )}

          {cotizacion.fechaRechazo && (
            <div className="flex items-center space-x-3">
              <X className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-slate-500 text-sm">Fecha de rechazo</p>
                <p className="font-medium text-red-600">{formatearFecha(cotizacion.fechaRechazo)}</p>
              </div>
            </div>
          )}
        </div>

        {cotizacion.motivoRechazo && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800 font-medium mb-1">Motivo del rechazo:</p>
            <p className="text-red-700">{cotizacion.motivoRechazo}</p>
          </div>
        )}
      </div>

      {/* Información del cliente */}
      {cliente && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-purple-50 rounded-xl">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Información del Cliente</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-slate-500 text-sm mb-1">Nombre</p>
              <p className="font-semibold text-slate-800">{cliente.nombre}</p>
            </div>

            {cliente.empresa && (
              <div>
                <p className="text-slate-500 text-sm mb-1">Empresa</p>
                <div className="flex items-center space-x-2">
                  <Building className="w-4 h-4 text-slate-500" />
                  <p className="font-medium text-slate-800">{cliente.empresa}</p>
                </div>
              </div>
            )}

            {cliente.nit && (
              <div>
                <p className="text-slate-500 text-sm mb-1">NIT/Cédula</p>
                <p className="font-medium text-slate-800">{cliente.nit}</p>
              </div>
            )}

            {cliente.email && (
              <div>
                <p className="text-slate-500 text-sm mb-1">Email</p>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <p className="text-slate-800">{cliente.email}</p>
                </div>
              </div>
            )}

            {cliente.telefono && (
              <div>
                <p className="text-slate-500 text-sm mb-1">Teléfono</p>
                <p className="text-slate-800">{cliente.telefono}</p>
              </div>
            )}

            {cliente.ciudad && (
              <div>
                <p className="text-slate-500 text-sm mb-1">Ciudad</p>
                <p className="text-slate-800">{cliente.ciudad}</p>
              </div>
            )}
          </div>

          {cliente.direccion && (
            <div className="mt-4">
              <p className="text-slate-500 text-sm mb-1">Dirección</p>
              <p className="text-slate-800">{cliente.direccion}</p>
            </div>
          )}
        </div>
      )}

      {/* Servicios */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-50 rounded-xl">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Servicios Cotizados</h2>
        </div>

        <div className="space-y-4">
          {cotizacion.items?.map((item: any, index: number) => {
            const servicio = servicios.find(s => s.id === item.servicio_id);
            
            return (
              <div key={index} className="border border-slate-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800 mb-2">
                      {servicio?.nombre || 'Servicio no encontrado'}
                    </h3>
                    <p className="text-slate-600 text-sm mb-3">{item.descripcion}</p>
                  </div>
                  
                  <div className="text-right ml-6">
                    <p className="text-slate-500 text-sm">Subtotal</p>
                    <p className="font-bold text-emerald-600 text-lg">{formatearMoneda(item.subtotal)}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Cantidad</p>
                    <p className="font-medium">{item.cantidad}</p>
                  </div>
                  
                  <div>
                    <p className="text-slate-500">Precio Unitario</p>
                    <p className="font-medium">{formatearMoneda(item.precio_unitario)}</p>
                  </div>
                  
                  {item.descuento_porcentaje > 0 && (
                    <div>
                      <p className="text-slate-500">Descuento</p>
                      <p className="font-medium text-red-600">{item.descuento_porcentaje}%</p>
                    </div>
                  )}
                </div>

                {item.notas && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-slate-600 text-sm">{item.notas}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Resumen de totales */}
        <div className="border-t border-slate-200 mt-8 pt-6">
          <div className="max-w-md ml-auto space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-medium">{formatearMoneda(cotizacion.subtotal)}</span>
            </div>
            
            {cotizacion.descuentoValor > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Descuento ({cotizacion.descuentoPorcentaje}%):</span>
                <span className="text-red-600">-{formatearMoneda(cotizacion.descuentoValor)}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">IVA:</span>
              <span className="font-medium">{formatearMoneda(cotizacion.iva)}</span>
            </div>
            
            <div className="border-t border-slate-300 pt-3 flex justify-between">
              <span className="font-bold text-slate-800 text-lg">Total:</span>
              <span className="font-bold text-emerald-600 text-xl">{formatearMoneda(cotizacion.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notas y términos */}
      {(cotizacion.notas || cotizacion.terminosCondiciones) && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Información Adicional</h2>
          
          {cotizacion.notas && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-700 mb-2">Notas</h3>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-slate-700 whitespace-pre-wrap">{cotizacion.notas}</p>
              </div>
            </div>
          )}
          
          {cotizacion.terminosCondiciones && (
            <div>
              <h3 className="font-semibold text-slate-700 mb-2">Términos y Condiciones</h3>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-slate-700 whitespace-pre-wrap">{cotizacion.terminosCondiciones}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de rechazo */}
      {mostrandoRechazo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Rechazar Cotización</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Motivo del rechazo
              </label>
              <textarea
                value={motivoRechazo}
                onChange={(e) => setMotivoRechazo(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                placeholder="Explica el motivo del rechazo..."
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={manejarRechazar}
                disabled={!motivoRechazo.trim()}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                Rechazar
              </button>
              <button
                onClick={() => {
                  setMostrandoRechazo(false);
                  setMotivoRechazo('');
                }}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};