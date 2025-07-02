# Sistema de Autenticación - Rentability

## 🔐 Configuración de Autenticación con Supabase

Este sistema incluye autenticación completa con **Supabase** que permite:

- ✅ Registro de usuarios con email y contraseña
- ✅ Inicio de sesión
- ✅ Recuperación de contraseña
- ✅ Protección de rutas
- ✅ Datos aislados por usuario (RLS - Row Level Security)
- ✅ Cerrar sesión

## 🚀 Configuración Inicial

### 1. Configurar Autenticación en Supabase

1. **Accede a tu proyecto en [Supabase](https://supabase.com)**

2. **Ve a Authentication > Settings**

3. **Configura las URLs del sitio:**
   - Site URL: `http://localhost:3000` (desarrollo) / `https://tu-dominio.com` (producción)
   - Redirect URLs: 
     - `http://localhost:3000/reset-password` (desarrollo)
     - `https://tu-dominio.com/reset-password` (producción)

4. **Habilita los proveedores de autenticación:**
   - ✅ Email (habilitado por defecto)
   - Opcionalmente: Google, GitHub, etc.

5. **Configurar plantillas de email (opcional):**
   - Ve a Authentication > Email Templates
   - Personaliza los emails de confirmación y recuperación

### 2. Ejecutar Scripts SQL

Ejecuta el siguiente script en el **SQL Editor** de Supabase para configurar la seguridad a nivel de fila:

```sql
-- Ejecutar el contenido de sql/add_rls_auth.sql
```

Este script:
- Agrega la columna `user_id` a todas las tablas
- Habilita Row Level Security (RLS)
- Crea políticas para que cada usuario solo vea sus propios datos
- Configura triggers automáticos para asignar el user_id

### 3. Variables de Entorno

Asegúrate de que tu archivo `.env.local` contenga:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## 🎯 Funcionalidades Implementadas

### Páginas de Autenticación

- **`/auth`** - Página principal de autenticación (login/registro)
- **`/reset-password`** - Página para restablecer contraseña

### Componentes

- **`AuthContext`** - Contexto global de autenticación
- **`ProtectedRoute`** - Componente para proteger rutas
- **`LoginForm`** - Formulario de inicio de sesión
- **`RegisterForm`** - Formulario de registro
- **`ForgotPasswordForm`** - Formulario de recuperación de contraseña

### Header Actualizado

- Muestra información del usuario autenticado
- Menú desplegable con opciones
- Botón de cerrar sesión

## 🔒 Seguridad

### Row Level Security (RLS)

Todas las tablas implementan RLS para asegurar que:

- Cada usuario solo puede ver/editar sus propios datos
- No hay acceso cruzado entre usuarios
- Los datos se aíslan automáticamente

### Protección de Rutas

- La página principal (`/`) está protegida
- Los usuarios no autenticados son redirigidos a `/auth`
- Los usuarios autenticados no pueden acceder a `/auth`

## 📱 Flujo de Usuario

### Registro de Nuevo Usuario

1. Usuario va a `/auth`
2. Hace clic en "Regístrate aquí"
3. Completa el formulario con:
   - Nombre completo
   - Email
   - Contraseña (con validación de fortaleza)
   - Confirmación de contraseña
4. Se crea la cuenta en Supabase
5. Se envía email de confirmación (opcional)
6. Usuario puede iniciar sesión

### Inicio de Sesión

1. Usuario va a `/auth`
2. Ingresa email y contraseña
3. Si es exitoso, es redirigido al dashboard principal
4. Sus datos se cargan automáticamente

### Recuperación de Contraseña

1. Usuario hace clic en "¿Olvidaste tu contraseña?"
2. Ingresa su email
3. Recibe un email con enlace de recuperación
4. Hace clic en el enlace (va a `/reset-password`)
5. Ingresa nueva contraseña
6. Es redirigido al login

## 🛠️ Desarrollo

### Verificar Autenticación

```typescript
import { useAuth } from '../contexts/AuthContext';

function MiComponente() {
  const { user, loading, signOut } = useAuth();
  
  if (loading) return <div>Cargando...</div>;
  if (!user) return <div>No autenticado</div>;
  
  return (
    <div>
      <p>Hola, {user.email}!</p>
      <button onClick={signOut}>Cerrar Sesión</button>
    </div>
  );
}
```

### Proteger una Página

```typescript
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export default function MiPagina() {
  return (
    <ProtectedRoute>
      <div>Contenido protegido</div>
    </ProtectedRoute>
  );
}
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Error: "Invalid login credentials"**
   - Verificar que el email y contraseña sean correctos
   - Asegurar que la cuenta esté confirmada

2. **Error: "Email not confirmed"**
   - El usuario debe confirmar su email antes de iniciar sesión
   - Verificar configuración de emails en Supabase

3. **Los datos no se cargan**
   - Verificar que RLS esté configurado correctamente
   - Revisar que las políticas estén activas

4. **Redireccionamiento no funciona**
   - Verificar las URLs configuradas en Supabase
   - Asegurar que las rutas estén correctas

### Logs Útiles

```typescript
// Ver el usuario actual
console.log('Usuario actual:', user);

// Ver errores de autenticación
console.log('Error:', error);

// Ver estado de carga
console.log('Cargando:', loading);
```

## 📊 Próximos Pasos

- [ ] Integrar autenticación con Google/GitHub
- [ ] Implementar roles de usuario
- [ ] Agregar confirmación de email obligatoria
- [ ] Implementar autenticación de dos factores
- [ ] Agregar logs de actividad de usuario

## 🤝 Soporte

Si tienes problemas con la autenticación:

1. Revisa los logs de la consola del navegador
2. Verifica la configuración en Supabase
3. Asegúrate de que los scripts SQL se ejecutaron correctamente
4. Revisa que las variables de entorno estén configuradas

---

¡Ahora tu aplicación tiene autenticación completa y segura! 🎉 