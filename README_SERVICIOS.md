# Instalación y Configuración del Sistema de Servicios 🚀

## Resumen de la Transformación

Este proyecto ha sido completamente transformado de un sistema de gestión de productos a un **sistema integral de servicios, cotizaciones y gestión de proyectos**. Todas las funcionalidades anteriores han sido adaptadas y mejoradas para el contexto de servicios profesionales.

## 🎯 Funcionalidades Implementadas

### ✅ **Gestión de Servicios**
- Catálogo completo de servicios
- Cálculo automático de precios basado en costos y márgenes
- Tipos de servicio: único, recurrente, por horas
- Seguimiento de servicios más cotizados/vendidos

### ✅ **Sistema de Cotizaciones**
- Generación automática de números de cotización (QUOTE-2024-001)
- Múltiples servicios por cotización
- Descuentos por ítem o general
- Estados de seguimiento (borrador, enviada, aprobada, rechazada)
- Conversión automática a proyecto al aprobar
- Validez temporal de cotizaciones

### ✅ **Gestión de Proyectos**
- Control completo del ciclo de vida
- Seguimiento de progreso visual
- Fechas estimadas vs reales
- Estados: activo, pausado, completado, cancelado

### ✅ **Control Financiero Completo**
- **Planes de pago flexibles**:
  - Anticipos, cuotas, pagos finales, por hitos
  - Plantillas predefinidas (50%-50%, 40%-40%-20%)
  - Configuración personalizada
- **Registro de pagos recibidos**:
  - Asociación a planes específicos
  - Múltiples métodos de pago
  - Pagos parciales
- **Control de desembolsos**:
  - Categorización de gastos
  - Asociación a proyectos específicos
  - Estados: pendiente, aprobado, pagado
- **Métricas financieras en tiempo real**:
  - Flujo de caja por proyecto
  - Rentabilidad estimada vs real
  - Análisis de ingresos/gastos

### ✅ **Gestión de Clientes**
- Base de datos completa
- Información empresarial
- Historial de proyectos

### ✅ **Dashboard Inteligente**
- Métricas financieras en tiempo real
- Alertas automáticas (pagos vencidos, proyectos retrasados)
- Top servicios más cotizados
- Actividad reciente

## 🗂️ Estructura del Proyecto

```
├── components/
│   ├── servicios/              # Gestión de servicios
│   │   ├── GestionServicios.tsx
│   │   ├── DashboardServicios.tsx
│   │   └── SistemaServicios.tsx  # Componente principal
│   ├── clientes/               # Gestión de clientes
│   │   └── GestionClientes.tsx
│   ├── cotizaciones/           # Sistema de cotizaciones
│   │   ├── GestionCotizaciones.tsx
│   │   ├── CrearCotizacion.tsx
│   │   └── VerCotizacion.tsx
│   ├── proyectos/              # Gestión de proyectos
│   │   ├── GestionProyectos.tsx
│   │   ├── VerProyecto.tsx
│   │   ├── CrearPlanPago.tsx
│   │   ├── RegistrarPago.tsx
│   │   └── RegistrarDesembolso.tsx
│   └── common/                 # Componentes reutilizables
├── contexts/
│   └── ServicesContext.tsx    # Estado global del sistema
├── services/
│   └── servicesDatabase.ts    # Servicios de base de datos
├── types/
│   └── services.ts            # Tipos TypeScript
├── utils/
│   └── servicesConstants.ts   # Constantes y configuraciones
└── sql/
    └── create_services_tables.sql  # Script de base de datos
```

## 🛠️ Instalación

### 1. **Configurar Base de Datos en Supabase**

#### Ejecutar Scripts SQL
En tu panel de Supabase, ejecuta los siguientes scripts en orden:

1. **Script principal**: `sql/create_services_tables.sql`
   ```sql
   -- Este script crea todas las tablas necesarias:
   -- - clientes
   -- - servicios
   -- - cotizaciones
   -- - items_cotizacion
   -- - proyectos
   -- - planes_pago
   -- - pagos
   -- - categorias_desembolso
   -- - desembolsos
   ```

2. **Funciones RPC**: Ejecutar las funciones al final del archivo `servicesDatabase.ts`
   ```sql
   -- Funciones para incrementar contadores
   CREATE OR REPLACE FUNCTION incrementar_veces_cotizado(servicio_id UUID)...
   CREATE OR REPLACE FUNCTION incrementar_veces_vendido(servicio_id UUID)...
   ```

#### Configurar RLS (Opcional)
Si quieres habilitar seguridad a nivel de fila:
```sql
-- Habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
-- ... (repetir para todas las tablas)

-- Crear políticas para acceso público (modo demo)
CREATE POLICY "Permitir todo en clientes" ON clientes FOR ALL USING (true);
-- ... (repetir para todas las tablas)
```

### 2. **Configurar Variables de Entorno**

Crea un archivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica_aqui
```

### 3. **Actualizar el Punto de Entrada**

En `pages/index.tsx`, reemplaza el componente principal:

```tsx
import { ServicesProvider } from '../contexts/ServicesContext';
import { SistemaServicios } from '../components/servicios/SistemaServicios';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export default function Home() {
  return (
    <ProtectedRoute>
      <ServicesProvider>
        <SistemaServicios />
      </ServicesProvider>
    </ProtectedRoute>
  );
}
```

### 4. **Instalar y Ejecutar**

```bash
# Instalar dependencias (ya están)
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
npm start
```

## 🔧 Configuración Inicial

### 1. **Configurar Costos y Márgenes**
1. Ve a **Configuración**
2. Ajusta los costos fijos mensuales
3. Define los porcentajes operativos
4. Establece las metas financieras

### 2. **Crear Servicios**
1. Ve a **Servicios** 
2. Agrega tu catálogo de servicios
3. Los precios se calcularán automáticamente

### 3. **Registrar Clientes**
1. Ve a **Clientes**
2. Agrega la información de tus clientes
3. Incluye datos de contacto y empresariales

## 📊 Flujo de Trabajo

### Proceso Completo
```
1. SERVICIO → 2. CLIENTE → 3. COTIZACIÓN → 4. APROBACIÓN → 5. PROYECTO → 6. PLAN DE PAGO → 7. SEGUIMIENTO
```

### 1. **Crear Cotización**
- Seleccionar cliente
- Agregar servicios necesarios
- Configurar descuentos si aplica
- Enviar al cliente

### 2. **Gestionar Aprobación**
- Marcar como aprobada cuando el cliente acepta
- Se crea automáticamente un proyecto
- Se puede rechazar con motivo

### 3. **Configurar Financiación**
- Crear plan de pagos usando plantillas o personalizado
- Definir fechas y montos
- Establecer tipos de pago (anticipo, cuotas, etc.)

### 4. **Seguimiento del Proyecto**
- Actualizar progreso regularmente
- Registrar pagos recibidos
- Controlar gastos y desembolsos
- Monitorear rentabilidad en tiempo real

## 🎨 Personalización

### Categorías de Servicios
Edita `utils/servicesConstants.ts`:
```typescript
export const CATEGORIAS_SERVICIO = [
  { value: 'desarrollo', label: 'Desarrollo', color: 'blue' },
  { value: 'diseño', label: 'Diseño', color: 'purple' },
  // Agregar más categorías...
];
```

### Plantillas de Planes de Pago
Modifica las plantillas predefinidas:
```typescript
export const PLANTILLAS_PLANES_PAGO = [
  {
    nombre: '50% - 50%',
    descripcion: 'Anticipo del 50% y pago final del 50%',
    // ...
  }
  // Agregar más plantillas...
];
```

## 🚨 Características Importantes

### ✅ **Mantenimiento de Funcionalidades Originales**
- Sistema de autenticación con Supabase ✅
- Configuración dinámica de costos ✅
- Sistema de metas y alertas ✅
- Análisis y reportes ✅
- Diseño UI/UX moderno ✅

### ✅ **Nuevas Funcionalidades**
- Gestión completa de clientes ✅
- Sistema de cotizaciones profesional ✅
- Control financiero integral ✅
- Seguimiento de proyectos ✅
- Métricas de rentabilidad ✅

### ✅ **Mejoras Técnicas**
- Arquitectura escalable ✅
- Tipos TypeScript completos ✅
- Servicios de base de datos robustos ✅
- Manejo de estados optimizado ✅

## 🔍 Próximos Pasos Opcionales

### Funcionalidades Avanzadas
- [ ] Generación de PDF para cotizaciones
- [ ] Integración con pasarelas de pago
- [ ] Sistema de notificaciones por email
- [ ] Reportes avanzados y exportación
- [ ] Integración con calendarios
- [ ] Sistema de facturación

### Mejoras de UI/UX
- [ ] Tema oscuro
- [ ] Personalización de colores
- [ ] Vistas adicionales de reportes
- [ ] Filtros avanzados

## 🆘 Soporte

### Problemas Comunes

**Error de conexión a Supabase:**
- Verifica las variables de entorno
- Confirma que las tablas están creadas
- Revisa las políticas RLS

**Cálculos de precios incorrectos:**
- Verifica la configuración de costos fijos
- Revisa los porcentajes operativos
- Confirma los márgenes de servicio

**Problemas de permisos:**
- Revisa las políticas RLS en Supabase
- Confirma la autenticación del usuario

### Logs y Debugging
Todos los errores se registran en la consola del navegador. Para debugging:

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Los errores de base de datos aparecerán con prefijo "Error..."

---

**🎉 ¡Sistema de Servicios Completo e Instalado!**

Tu sistema está listo para gestionar servicios, cotizaciones, proyectos y toda la parte financiera de tu negocio de manera profesional y eficiente.