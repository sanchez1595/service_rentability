import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lkpiyhdyiipgwyeojvep.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrcGl5aGR5aWlwZ3d5ZW9qdmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MjU0NDcsImV4cCI6MjA2NjMwMTQ0N30.VUvm81C7f0noSmQ_6vWbTgQvyY6yL5d-39QcMUJqIYc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para las tablas de Supabase
export interface ProductoDB {
  id: string;
  nombre: string;
  categoria: string;
  costo_compra: number;
  gastos_fijos: number;
  margen_deseado: number;
  precio_venta: number;
  utilidad: number;
  stock: number;
  ventas_ultimos_30_dias: number;
  precio_competencia: number;
  fecha_ultima_venta: string | null;
  rotacion: string;
  es_paquete?: boolean;
  unidades_por_paquete?: number;
  costo_unitario?: number;
  cantidad_paquetes?: number;
  created_at?: string;
  updated_at?: string;
}

export interface VentaDB {
  id: string;
  producto_id: string;
  producto_nombre: string;
  cantidad: number;
  precio_venta: number;
  costo_unitario: number;
  fecha: string;
  cliente: string;
  metodo_pago: string;
  utilidad_total: number;
  ingreso_total: number;
  tipo_venta?: string;
  created_at?: string;
}

export interface ConfiguracionDB {
  id: string;
  tipo: 'porcentaje' | 'costo_fijo' | 'herramienta' | 'general';
  clave: string;
  valor: number;
  created_at?: string;
  updated_at?: string;
}

export interface MetaDB {
  id: string;
  clave: string;
  valor: number;
  created_at?: string;
  updated_at?: string;
}

export interface AlertaDB {
  id: string;
  clave: string;
  valor: number;
  created_at?: string;
  updated_at?: string;
}