# Rentability Pro 💼

Sistema completo de gestión de servicios, cotizaciones y proyectos, desarrollado con Next.js, React y TypeScript.

## 🚀 Funcionalidades

- **Dashboard**: Visualización de métricas y estadísticas financieras clave
- **Gestión de Servicios**: Catálogo completo con cálculo automático de precios
- **Sistema de Cotizaciones**: Generación, envío y seguimiento de cotizaciones
- **Gestión de Proyectos**: Control completo del ciclo de vida de proyectos
- **Planes de Pago**: Configuración flexible de esquemas de pago
- **Control Financiero**: Registro de pagos recibidos y desembolsos realizados
- **Gestión de Clientes**: Base de datos completa de clientes y su historial
- **Análisis de Rentabilidad**: Métricas en tiempo real de rentabilidad por proyecto

## 🛠️ Tecnologías

- **Next.js 14** - Framework de React
- **TypeScript** - Tipado estático
- **Supabase** - Base de datos PostgreSQL y autenticación
- **Tailwind CSS** - Estilos utilitarios
- **Lucide React** - Iconos
- **React Context** - Gestión de estado global

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <tu-repositorio>

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## 🌐 Despliegue

Este proyecto está optimizado para ser desplegado en Vercel:

1. Conecta tu repositorio con Vercel
2. Las configuraciones se detectan automáticamente
3. El despliegue se realiza automáticamente

## 📁 Estructura del Proyecto

```
├── components/
│   ├── servicios/            # Componentes de gestión de servicios
│   ├── cotizaciones/         # Componentes de cotizaciones
│   ├── proyectos/            # Componentes de proyectos
│   ├── pagos/                # Componentes de pagos y desembolsos
│   ├── clientes/             # Componentes de gestión de clientes
│   ├── common/               # Componentes reutilizables
│   └── ui/                   # Componentes de UI
├── contexts/                 # Contextos de React (estado global)
├── services/                 # Servicios de base de datos
├── types/                    # Definiciones de TypeScript
├── utils/                    # Utilidades y funciones helper
├── sql/                      # Scripts de base de datos
├── pages/                    # Páginas de Next.js
└── styles/                   # Estilos globales
```

## 🔧 Configuración

El proyecto incluye configuraciones para:
- Costos fijos mensuales del negocio
- Porcentajes operativos
- Metas financieras y de proyectos
- Alertas automáticas para pagos y proyectos

## 🎯 Uso

1. **Configuración inicial**: Define tus costos fijos y porcentajes operativos
2. **Gestión de clientes**: Registra tu base de datos de clientes
3. **Catálogo de servicios**: Crea tu portafolio de servicios con precios automáticos
4. **Generar cotizaciones**: Crea cotizaciones profesionales para tus clientes
5. **Gestionar proyectos**: Convierte cotizaciones aprobadas en proyectos activos
6. **Control financiero**: Registra pagos recibidos y gastos del proyecto
7. **Análisis de rentabilidad**: Monitorea métricas y rentabilidad en tiempo real

## 🗃️ Base de Datos

El sistema utiliza Supabase con PostgreSQL. Para configurar:

1. Ejecuta el script `sql/create_services_tables.sql` en tu panel de Supabase
2. Opcionalmente ejecuta `sql/create_tables.sql` si necesitas compatibilidad con el sistema anterior
3. Configura las variables de entorno en `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publica
   ```

## 📊 Funcionalidades Principales

### Gestión de Servicios
- Catálogo completo de servicios
- Cálculo automático de precios basado en costos y márgenes
- Categorización por tipo de servicio
- Seguimiento de servicios más cotizados/vendidos

### Sistema de Cotizaciones
- Generación automática de números de cotización
- Múltiples servicios por cotización
- Descuentos por ítem o general
- Estados de seguimiento (borrador, enviada, aprobada, rechazada)
- Conversión automática a proyecto al aprobar

### Gestión de Proyectos
- Control completo del ciclo de vida
- Seguimiento de progreso
- Fechas estimadas vs reales
- Cálculo de rentabilidad en tiempo real

### Control Financiero
- Planes de pago flexibles (anticipos, cuotas, hitos)
- Registro de pagos recibidos
- Control de desembolsos por categoría
- Flujo de caja por proyecto
- Alertas de pagos vencidos

---

Desarrollado con ❤️ para optimizar la gestión y rentabilidad de tu empresa de servicios