import { supabase } from '../lib/supabase';
import { 
  Cliente, 
  Servicio, 
  Cotizacion, 
  ItemCotizacion, 
  Proyecto,
  PlanPago,
  Pago,
  CategoriaDesembolso,
  Desembolso
} from '../types/services';

// ==================== CLIENTES ====================
export const clientesService = {
  async obtenerTodos() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nombre');
    
    if (error) throw error;
    
    return (data || []).map(cliente => ({
      ...cliente,
      created_at: cliente.created_at,
      updated_at: cliente.updated_at
    }));
  },

  async obtenerPorId(id: string) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async crear(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('clientes')
      .insert([cliente])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async actualizar(id: string, cliente: Partial<Cliente>) {
    const { data, error } = await supabase
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async eliminar(id: string) {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ==================== SERVICIOS ====================
export const serviciosService = {
  async obtenerTodos() {
    const { data, error } = await supabase
      .from('servicios')
      .select('*')
      .eq('activo', true)
      .order('categoria')
      .order('nombre');
    
    if (error) throw error;
    
    return (data || []).map(servicio => ({
      ...servicio,
      costoBase: servicio.costo_base?.toString() || '0',
      gastosFijos: servicio.gastos_fijos?.toString() || '0',
      margenDeseado: servicio.margen_deseado?.toString() || '30',
      precioSugerido: servicio.precio_sugerido?.toString() || '0',
      duracionEstimada: servicio.duracion_estimada || 1,
      tipoServicio: servicio.tipo_servicio || 'unico',
      precioPorHora: servicio.precio_por_hora?.toString() || '0',
      recursosNecesarios: servicio.recursos_necesarios,
      vecesCotizado: servicio.veces_cotizado || 0,
      vecesVendido: servicio.veces_vendido || 0
    }));
  },

  async crear(servicio: Omit<Servicio, 'id' | 'created_at' | 'updated_at' | 'vecesCotizado' | 'vecesVendido'>) {
    const { data, error } = await supabase
      .from('servicios')
      .insert([{
        nombre: servicio.nombre,
        categoria: servicio.categoria,
        descripcion: servicio.descripcion,
        costo_base: parseFloat(servicio.costoBase) || 0,
        gastos_fijos: parseFloat(servicio.gastosFijos) || 0,
        margen_deseado: parseFloat(servicio.margenDeseado) || 30,
        precio_sugerido: parseFloat(servicio.precioSugerido) || 0,
        duracion_estimada: servicio.duracionEstimada,
        tipo_servicio: servicio.tipoServicio,
        precio_por_hora: servicio.precioPorHora ? parseFloat(servicio.precioPorHora) : null,
        recursos_necesarios: servicio.recursosNecesarios,
        activo: servicio.activo
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async actualizar(id: string, servicio: Partial<Servicio>) {
    const updateData: any = {};
    
    if (servicio.nombre !== undefined) updateData.nombre = servicio.nombre;
    if (servicio.categoria !== undefined) updateData.categoria = servicio.categoria;
    if (servicio.descripcion !== undefined) updateData.descripcion = servicio.descripcion;
    if (servicio.costoBase !== undefined) updateData.costo_base = parseFloat(servicio.costoBase);
    if (servicio.gastosFijos !== undefined) updateData.gastos_fijos = parseFloat(servicio.gastosFijos);
    if (servicio.margenDeseado !== undefined) updateData.margen_deseado = parseFloat(servicio.margenDeseado);
    if (servicio.precioSugerido !== undefined) updateData.precio_sugerido = parseFloat(servicio.precioSugerido);
    if (servicio.duracionEstimada !== undefined) updateData.duracion_estimada = servicio.duracionEstimada;
    if (servicio.tipoServicio !== undefined) updateData.tipo_servicio = servicio.tipoServicio;
    if (servicio.precioPorHora !== undefined) updateData.precio_por_hora = parseFloat(servicio.precioPorHora);
    if (servicio.recursosNecesarios !== undefined) updateData.recursos_necesarios = servicio.recursosNecesarios;
    if (servicio.activo !== undefined) updateData.activo = servicio.activo;

    const { data, error } = await supabase
      .from('servicios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async eliminar(id: string) {
    // Soft delete - solo marcamos como inactivo
    const { error } = await supabase
      .from('servicios')
      .update({ activo: false })
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ==================== COTIZACIONES ====================
export const cotizacionesService = {
  async obtenerTodas() {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select(`
        *,
        cliente:clientes(nombre, empresa),
        items:items_cotizacion(
          *,
          servicio:servicios(nombre)
        )
      `)
      .order('fecha', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(cotizacion => ({
      ...cotizacion,
      clienteNombre: cotizacion.cliente?.nombre || '',
      clienteEmpresa: cotizacion.cliente?.empresa || '',
      items: cotizacion.items?.map((item: any) => ({
        ...item,
        servicioNombre: item.servicio?.nombre || ''
      }))
    }));
  },

  async obtenerPorId(id: string) {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select(`
        *,
        cliente:clientes(*),
        items:items_cotizacion(
          *,
          servicio:servicios(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async generarNumero(): Promise<string> {
    const year = new Date().getFullYear();
    
    // Obtener el último número de cotización del año
    const { data, error } = await supabase
      .from('cotizaciones')
      .select('numero')
      .like('numero', `QUOTE-${year}-%`)
      .order('numero', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastNumber = data[0].numero.split('-').pop();
      nextNumber = parseInt(lastNumber) + 1;
    }
    
    return `QUOTE-${year}-${nextNumber.toString().padStart(3, '0')}`;
  },

  async crear(cotizacion: Omit<Cotizacion, 'id' | 'created_at' | 'updated_at' | 'numero'>, items: ItemCotizacion[]) {
    const numero = await this.generarNumero();
    
    // Crear cotización
    const { data: cotizacionData, error: cotizacionError } = await supabase
      .from('cotizaciones')
      .insert([{
        numero,
        cliente_id: cotizacion.clienteId,
        fecha: cotizacion.fecha,
        fecha_validez: cotizacion.fechaValidez,
        estado: cotizacion.estado,
        subtotal: cotizacion.subtotal,
        descuento_porcentaje: cotizacion.descuentoPorcentaje,
        descuento_valor: cotizacion.descuentoValor,
        iva: cotizacion.iva,
        total: cotizacion.total,
        notas: cotizacion.notas,
        terminos_condiciones: cotizacion.terminosCondiciones
      }])
      .select()
      .single();
    
    if (cotizacionError) throw cotizacionError;
    
    // Crear items
    if (items.length > 0) {
      const itemsData = items.map((item, index) => ({
        cotizacion_id: cotizacionData.id,
        servicio_id: item.servicioId,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        precio_unitario: item.precioUnitario,
        descuento_porcentaje: item.descuentoPorcentaje || 0,
        subtotal: item.subtotal,
        notas: item.notas,
        orden: index
      }));
      
      const { error: itemsError } = await supabase
        .from('items_cotizacion')
        .insert(itemsData);
      
      if (itemsError) throw itemsError;
      
      // Actualizar contador de veces cotizado en servicios
      const servicioIds = [...new Set(items.map(item => item.servicioId))];
      for (const servicioId of servicioIds) {
        await supabase.rpc('incrementar_veces_cotizado', { servicio_id: servicioId });
      }
    }
    
    return cotizacionData;
  },

  async actualizar(id: string, cotizacion: Partial<Cotizacion>) {
    const updateData: any = {};
    
    if (cotizacion.estado !== undefined) updateData.estado = cotizacion.estado;
    if (cotizacion.notas !== undefined) updateData.notas = cotizacion.notas;
    if (cotizacion.fechaAprobacion !== undefined) updateData.fecha_aprobacion = cotizacion.fechaAprobacion;
    if (cotizacion.fechaRechazo !== undefined) updateData.fecha_rechazo = cotizacion.fechaRechazo;
    if (cotizacion.motivoRechazo !== undefined) updateData.motivo_rechazo = cotizacion.motivoRechazo;

    const { data, error } = await supabase
      .from('cotizaciones')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async aprobar(id: string): Promise<Proyecto> {
    // Obtener cotización con todos sus datos
    const cotizacion = await this.obtenerPorId(id);
    if (!cotizacion) throw new Error('Cotización no encontrada');
    
    // Actualizar estado de cotización
    await this.actualizar(id, {
      estado: 'aprobada',
      fechaAprobacion: new Date().toISOString().split('T')[0]
    });
    
    // Crear proyecto
    const proyecto = await proyectosService.crearDesdeCoizacion(cotizacion);
    
    // Actualizar contador de veces vendido en servicios
    if (cotizacion.items) {
      const servicioIds = [...new Set(cotizacion.items.map((item: any) => item.servicio_id))];
      for (const servicioId of servicioIds) {
        await supabase.rpc('incrementar_veces_vendido', { servicio_id: servicioId });
      }
    }
    
    return proyecto;
  },

  async rechazar(id: string, motivo: string) {
    return this.actualizar(id, {
      estado: 'rechazada',
      fechaRechazo: new Date().toISOString().split('T')[0],
      motivoRechazo: motivo
    });
  }
};

// ==================== PROYECTOS ====================
export const proyectosService = {
  async obtenerTodos() {
    const { data, error } = await supabase
      .from('proyectos')
      .select(`
        *,
        cliente:clientes(nombre, empresa),
        cotizacion:cotizaciones(numero),
        planes_pago(*)
      `)
      .order('fecha_inicio', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(proyecto => ({
      ...proyecto,
      clienteNombre: proyecto.cliente?.nombre || '',
      cotizacionNumero: proyecto.cotizacion?.numero || ''
    }));
  },

  async obtenerPorId(id: string) {
    const { data, error } = await supabase
      .from('proyectos')
      .select(`
        *,
        cliente:clientes(*),
        cotizacion:cotizaciones(*),
        planes_pago(*),
        pagos(*),
        desembolsos(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async crearDesdeCoizacion(cotizacion: any): Promise<Proyecto> {
    const { data, error } = await supabase
      .from('proyectos')
      .insert([{
        cotizacion_id: cotizacion.id,
        cliente_id: cotizacion.cliente_id,
        nombre: `Proyecto ${cotizacion.numero}`,
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin_estimada: this.calcularFechaFin(cotizacion),
        estado: 'activo',
        valor_total: cotizacion.total,
        costo_estimado: this.calcularCostoEstimado(cotizacion),
        rentabilidad_estimada: cotizacion.total - this.calcularCostoEstimado(cotizacion)
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  calcularFechaFin(cotizacion: any): string {
    // Calcular fecha fin basada en la duración de los servicios
    let maxDuracion = 30; // Por defecto 30 días
    
    if (cotizacion.items) {
      const duraciones = cotizacion.items
        .filter((item: any) => item.servicio?.duracion_estimada)
        .map((item: any) => item.servicio.duracion_estimada);
      
      if (duraciones.length > 0) {
        maxDuracion = Math.max(...duraciones);
      }
    }
    
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + maxDuracion);
    return fechaFin.toISOString().split('T')[0];
  },

  calcularCostoEstimado(cotizacion: any): number {
    let costoTotal = 0;
    
    if (cotizacion.items) {
      cotizacion.items.forEach((item: any) => {
        if (item.servicio) {
          const costoBase = parseFloat(item.servicio.costo_base) || 0;
          const gastosFijos = parseFloat(item.servicio.gastos_fijos) || 0;
          costoTotal += (costoBase + gastosFijos) * item.cantidad;
        }
      });
    }
    
    return costoTotal;
  },

  async actualizar(id: string, proyecto: Partial<Proyecto>) {
    const updateData: any = {};
    
    if (proyecto.nombre !== undefined) updateData.nombre = proyecto.nombre;
    if (proyecto.fechaFinReal !== undefined) updateData.fecha_fin_real = proyecto.fechaFinReal;
    if (proyecto.estado !== undefined) updateData.estado = proyecto.estado;
    if (proyecto.progreso !== undefined) updateData.progreso = proyecto.progreso;
    if (proyecto.costoReal !== undefined) updateData.costo_real = proyecto.costoReal;
    if (proyecto.rentabilidadReal !== undefined) updateData.rentabilidad_real = proyecto.rentabilidadReal;
    if (proyecto.notas !== undefined) updateData.notas = proyecto.notas;

    const { data, error } = await supabase
      .from('proyectos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async actualizarProgreso(id: string, progreso: number) {
    return this.actualizar(id, { progreso });
  },

  async completar(id: string) {
    const proyecto = await this.obtenerPorId(id);
    if (!proyecto) throw new Error('Proyecto no encontrado');
    
    // Calcular rentabilidad real
    const pagosRecibidos = proyecto.pagos?.reduce((sum: number, pago: any) => sum + pago.monto, 0) || 0;
    const desembolsosRealizados = proyecto.desembolsos?.reduce((sum: number, desembolso: any) => sum + desembolso.monto, 0) || 0;
    const rentabilidadReal = pagosRecibidos - desembolsosRealizados;
    
    return this.actualizar(id, {
      estado: 'completado',
      fechaFinReal: new Date().toISOString().split('T')[0],
      progreso: 100,
      costoReal: desembolsosRealizados,
      rentabilidadReal
    });
  }
};

// ==================== PLANES DE PAGO ====================
export const planesPagoService = {
  async obtenerPorProyecto(proyectoId: string) {
    const { data, error } = await supabase
      .from('planes_pago')
      .select('*')
      .eq('proyecto_id', proyectoId)
      .order('numero_cuota');
    
    if (error) throw error;
    return data || [];
  },

  async crear(plan: Omit<PlanPago, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('planes_pago')
      .insert([{
        proyecto_id: plan.proyectoId,
        numero_cuota: plan.numeroCuota,
        descripcion: plan.descripcion,
        fecha_vencimiento: plan.fechaVencimiento,
        monto: plan.monto,
        tipo: plan.tipo,
        porcentaje_proyecto: plan.porcentajeProyecto,
        estado: plan.estado
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async crearMultiples(planes: Omit<PlanPago, 'id' | 'created_at' | 'updated_at'>[]) {
    const planesData = planes.map(plan => ({
      proyecto_id: plan.proyectoId,
      numero_cuota: plan.numeroCuota,
      descripcion: plan.descripcion,
      fecha_vencimiento: plan.fechaVencimiento,
      monto: plan.monto,
      tipo: plan.tipo,
      porcentaje_proyecto: plan.porcentajeProyecto,
      estado: plan.estado
    }));

    const { data, error } = await supabase
      .from('planes_pago')
      .insert(planesData)
      .select();
    
    if (error) throw error;
    return data;
  },

  async actualizar(id: string, plan: Partial<PlanPago>) {
    const updateData: any = {};
    
    if (plan.fechaVencimiento !== undefined) updateData.fecha_vencimiento = plan.fechaVencimiento;
    if (plan.monto !== undefined) updateData.monto = plan.monto;
    if (plan.estado !== undefined) updateData.estado = plan.estado;

    const { data, error } = await supabase
      .from('planes_pago')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async marcarComoPagado(id: string) {
    return this.actualizar(id, { estado: 'pagado' });
  },

  async verificarVencimientos() {
    const hoy = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('planes_pago')
      .update({ estado: 'vencido' })
      .eq('estado', 'pendiente')
      .lt('fecha_vencimiento', hoy)
      .select();
    
    if (error) throw error;
    return data;
  }
};

// ==================== PAGOS ====================
export const pagosService = {
  async obtenerPorProyecto(proyectoId: string) {
    const { data, error } = await supabase
      .from('pagos')
      .select(`
        *,
        plan_pago:planes_pago(descripcion, numero_cuota)
      `)
      .eq('proyecto_id', proyectoId)
      .order('fecha', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async crear(pago: Omit<Pago, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('pagos')
      .insert([{
        proyecto_id: pago.proyectoId,
        plan_pago_id: pago.planPagoId,
        fecha: pago.fecha,
        monto: pago.monto,
        metodo_pago: pago.metodoPago,
        numero_referencia: pago.numeroReferencia,
        notas: pago.notas
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Si está asociado a un plan de pago, actualizar su estado
    if (pago.planPagoId) {
      await this.actualizarEstadoPlanPago(pago.planPagoId);
    }
    
    return data;
  },

  async actualizarEstadoPlanPago(planPagoId: string) {
    // Obtener el plan de pago
    const { data: planPago, error: planError } = await supabase
      .from('planes_pago')
      .select('monto')
      .eq('id', planPagoId)
      .single();
    
    if (planError) throw planError;
    
    // Obtener todos los pagos asociados a este plan
    const { data: pagos, error: pagosError } = await supabase
      .from('pagos')
      .select('monto')
      .eq('plan_pago_id', planPagoId);
    
    if (pagosError) throw pagosError;
    
    const totalPagado = pagos?.reduce((sum, pago) => sum + pago.monto, 0) || 0;
    
    let nuevoEstado = 'pendiente';
    if (totalPagado >= planPago.monto) {
      nuevoEstado = 'pagado';
    } else if (totalPagado > 0) {
      nuevoEstado = 'parcial';
    }
    
    await planesPagoService.actualizar(planPagoId, { estado: nuevoEstado as any });
  },

  async eliminar(id: string) {
    // Obtener el pago antes de eliminarlo
    const { data: pago, error: getError } = await supabase
      .from('pagos')
      .select('plan_pago_id')
      .eq('id', id)
      .single();
    
    if (getError) throw getError;
    
    // Eliminar el pago
    const { error } = await supabase
      .from('pagos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Actualizar el estado del plan de pago si corresponde
    if (pago.plan_pago_id) {
      await this.actualizarEstadoPlanPago(pago.plan_pago_id);
    }
  }
};

// ==================== CATEGORÍAS DE DESEMBOLSO ====================
export const categoriasDesembolsoService = {
  async obtenerTodas() {
    const { data, error } = await supabase
      .from('categorias_desembolso')
      .select('*')
      .order('nombre');
    
    if (error) throw error;
    return data || [];
  },

  async crear(categoria: Omit<CategoriaDesembolso, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('categorias_desembolso')
      .insert([categoria])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ==================== DESEMBOLSOS ====================
export const desembolsosService = {
  async obtenerPorProyecto(proyectoId: string) {
    const { data, error } = await supabase
      .from('desembolsos')
      .select(`
        *,
        categoria:categorias_desembolso(nombre)
      `)
      .eq('proyecto_id', proyectoId)
      .order('fecha', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(desembolso => ({
      ...desembolso,
      categoriaNombre: desembolso.categoria?.nombre || ''
    }));
  },

  async obtenerTodos() {
    const { data, error } = await supabase
      .from('desembolsos')
      .select(`
        *,
        categoria:categorias_desembolso(nombre),
        proyecto:proyectos(nombre)
      `)
      .order('fecha', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(desembolso => ({
      ...desembolso,
      categoriaNombre: desembolso.categoria?.nombre || '',
      proyectoNombre: desembolso.proyecto?.nombre || 'Gasto general'
    }));
  },

  async crear(desembolso: Omit<Desembolso, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('desembolsos')
      .insert([{
        proyecto_id: desembolso.proyectoId,
        categoria_id: desembolso.categoriaId,
        fecha: desembolso.fecha,
        descripcion: desembolso.descripcion,
        monto: desembolso.monto,
        proveedor: desembolso.proveedor,
        numero_factura: desembolso.numeroFactura,
        metodo_pago: desembolso.metodoPago,
        estado: desembolso.estado,
        aprobado_por: desembolso.aprobadoPor,
        notas: desembolso.notas
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Actualizar costo real del proyecto si corresponde
    if (desembolso.proyectoId && desembolso.estado === 'pagado') {
      await this.actualizarCostoProyecto(desembolso.proyectoId);
    }
    
    return data;
  },

  async actualizarCostoProyecto(proyectoId: string) {
    // Obtener todos los desembolsos pagados del proyecto
    const { data: desembolsos, error } = await supabase
      .from('desembolsos')
      .select('monto')
      .eq('proyecto_id', proyectoId)
      .eq('estado', 'pagado');
    
    if (error) throw error;
    
    const costoReal = desembolsos?.reduce((sum, d) => sum + d.monto, 0) || 0;
    
    // Actualizar costo real del proyecto
    await proyectosService.actualizar(proyectoId, { costoReal });
  },

  async actualizar(id: string, desembolso: Partial<Desembolso>) {
    const updateData: any = {};
    
    if (desembolso.estado !== undefined) updateData.estado = desembolso.estado;
    if (desembolso.aprobadoPor !== undefined) updateData.aprobado_por = desembolso.aprobadoPor;
    if (desembolso.notas !== undefined) updateData.notas = desembolso.notas;

    const { data, error } = await supabase
      .from('desembolsos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Si cambió el estado y hay un proyecto asociado, actualizar costo
    if (desembolso.estado && data.proyecto_id) {
      await this.actualizarCostoProyecto(data.proyecto_id);
    }
    
    return data;
  },

  async eliminar(id: string) {
    // Obtener el desembolso antes de eliminarlo
    const { data: desembolso, error: getError } = await supabase
      .from('desembolsos')
      .select('proyecto_id')
      .eq('id', id)
      .single();
    
    if (getError) throw getError;
    
    // Eliminar el desembolso
    const { error } = await supabase
      .from('desembolsos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Actualizar costo del proyecto si corresponde
    if (desembolso.proyecto_id) {
      await this.actualizarCostoProyecto(desembolso.proyecto_id);
    }
  }
};

// Crear funciones RPC necesarias en Supabase
export const createRPCFunctions = `
-- Función para incrementar veces cotizado
CREATE OR REPLACE FUNCTION incrementar_veces_cotizado(servicio_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE servicios 
  SET veces_cotizado = veces_cotizado + 1
  WHERE id = servicio_id;
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar veces vendido
CREATE OR REPLACE FUNCTION incrementar_veces_vendido(servicio_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE servicios 
  SET veces_vendido = veces_vendido + 1
  WHERE id = servicio_id;
END;
$$ LANGUAGE plpgsql;
`;