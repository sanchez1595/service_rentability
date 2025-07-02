# Configuración de Supabase para Rentability

## Pasos para configurar la base de datos

### 1. Ejecutar el script SQL
Ve a tu panel de Supabase y ejecuta el archivo `sql/create_tables.sql` en el SQL Editor para crear todas las tablas necesarias.

### 2. Configuración RLS (Row Level Security)
Las tablas están configuradas sin RLS por defecto. Si quieres habilitar seguridad a nivel de fila, ejecuta estos comandos:

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir acceso público (modo demo)
CREATE POLICY "Permitir todo en productos" ON productos FOR ALL USING (true);
CREATE POLICY "Permitir todo en ventas" ON ventas FOR ALL USING (true);
CREATE POLICY "Permitir todo en configuracion" ON configuracion FOR ALL USING (true);
CREATE POLICY "Permitir todo en metas" ON metas FOR ALL USING (true);
CREATE POLICY "Permitir todo en alertas" ON alertas FOR ALL USING (true);
```

### 3. Estructura de las tablas

#### Productos
- id (UUID, Primary Key)
- nombre (VARCHAR)
- categoria (VARCHAR)
- costo_compra (DECIMAL)
- gastos_fijos (DECIMAL)
- margen_deseado (DECIMAL)
- precio_venta (DECIMAL)
- utilidad (DECIMAL)
- stock (INTEGER)
- ventas_ultimos_30_dias (INTEGER)
- precio_competencia (DECIMAL)
- fecha_ultima_venta (TIMESTAMP)
- rotacion (VARCHAR)
- created_at, updated_at (TIMESTAMP)

#### Ventas
- id (UUID, Primary Key)
- producto_id (UUID, Foreign Key)
- producto_nombre (VARCHAR)
- cantidad (INTEGER)
- precio_venta (DECIMAL)
- costo_unitario (DECIMAL)
- fecha (DATE)
- cliente (VARCHAR)
- metodo_pago (VARCHAR)
- utilidad_total (DECIMAL)
- ingreso_total (DECIMAL)
- created_at (TIMESTAMP)

#### Configuración
- id (UUID, Primary Key)
- tipo (VARCHAR) - 'porcentaje', 'costo_fijo', 'herramienta', 'general'
- clave (VARCHAR)
- valor (DECIMAL)
- created_at, updated_at (TIMESTAMP)

#### Metas
- id (UUID, Primary Key)
- clave (VARCHAR)
- valor (DECIMAL)
- created_at, updated_at (TIMESTAMP)

#### Alertas
- id (UUID, Primary Key)
- clave (VARCHAR)
- valor (DECIMAL)
- created_at, updated_at (TIMESTAMP)

### 4. Funcionalidades implementadas

✅ **Gestión de Productos**
- Crear, editar, eliminar productos
- Cálculo automático de precios
- Gestión de stock

✅ **Gestión de Ventas**
- Registrar ventas
- Actualización automática de stock
- Historial de ventas

✅ **Configuración Dinámica**
- Agregar/eliminar costos fijos
- Agregar/eliminar herramientas
- Agregar/eliminar porcentajes operativos

✅ **Metas y Alertas**
- Configuración de metas de negocio
- Configuración de parámetros de alertas

✅ **Persistencia en Tiempo Real**
- Todos los datos se guardan automáticamente en Supabase
- Carga automática al iniciar la aplicación

### 5. Arquitectura de la aplicación

```
/contexts/AppContext.tsx - Manejo global del estado con Supabase
/services/database.ts - Servicios para interactuar con Supabase
/lib/supabase.ts - Configuración del cliente Supabase
/components/calculadora/BabyStoreCalculatorWithSupabase.tsx - Componente principal
```

### 6. Próximos pasos (opcional)

- Implementar autenticación de usuarios
- Agregar vistas para múltiples tiendas
- Implementar reportes avanzados
- Agregar notificaciones push para alertas

### 7. Comandos útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar servidor de producción
npm start
```

### 8. Variables de entorno (opcional)

Puedes mover las credenciales de Supabase a variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lkpiyhdyiipgwyeojvep.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_aqui
```

Y actualizar `/lib/supabase.ts`:

```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
```