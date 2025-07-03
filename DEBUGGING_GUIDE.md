# 🔍 Guía de Debugging - Sistema de Servicios

## Funcionalidades Implementadas ✅

### 1. **Configuración de Cotizaciones**
- **Ubicación**: Configuración → Pestaña "Cotizaciones"
- **Características**: Datos de empresa, IVA, términos, plantillas de email

### 2. **Descarga PDF de Cotizaciones**
- **Ubicación**: Ver cotización → Botón de descarga (icono ↓)
- **Funciona**: Genera PDF completo con empresa, cliente, servicios y totales

### 3. **Eliminar Cotizaciones**
- **Ubicación**: Lista de cotizaciones → Botón papelera (solo en Borrador/Rechazadas)
- **Funciona**: Elimina cotización e items relacionados

### 4. **Aprobación de Cotizaciones**
- **Ubicación**: Ver cotización → Botón verde "Aprobar" (solo en Enviadas)
- **Funciona**: Aprueba cotización y crea proyecto automáticamente

### 5. **Sistema de Planes de Pago**
- **Ubicación**: Ver proyecto → Botón "+" en Planes de Pago
- **Características**: Plantillas predefinidas, split personalizado, cálculo automático

## 🔧 Cómo Verificar las Funcionalidades

### Paso 1: Verificar Configuración
1. Ir a "Configuración" en el menú lateral
2. Verificar que existan dos pestañas: "Sistema" y "Cotizaciones"
3. Si no aparece la pestaña "Cotizaciones", hay un error de implementación

### Paso 2: Probar PDF en Cotizaciones
1. Ir a "Cotizaciones"
2. Crear o abrir una cotización existente
3. En la vista detallada, buscar el botón de descarga (icono ↓)
4. Hacer clic debe descargar un PDF

### Paso 3: Probar Eliminación
1. En la lista de cotizaciones, buscar cotizaciones en estado "Borrador"
2. Debe aparecer un botón de papelera roja
3. Al hacer clic debe pedir confirmación

### Paso 4: Probar Aprobación → Proyecto
1. Crear una cotización en estado "Enviada"
2. Abrirla en vista detallada
3. Hacer clic en "Aprobar"
4. Verificar que se cree un proyecto automáticamente

### Paso 5: Probar Planes de Pago
1. Ir a "Proyectos"
2. Abrir un proyecto
3. En la sección "Planes de Pago", hacer clic en el botón "+"
4. Debe abrirse un modal para crear planes

## 🚨 Posibles Problemas

### Error 1: No veo las pestañas en Configuración
**Causa**: Componente no actualizado
**Solución**: Recargar página con Ctrl+F5

### Error 2: Error al hacer clic en PDF
**Causa**: jsPDF no cargado
**Solución**: Verificar consola del navegador

### Error 3: Botones no aparecen
**Causa**: Estados incorrectos o permisos
**Solución**: Verificar estado de las cotizaciones

### Error 4: Error al aprobar cotización
**Causa**: Problemas de base de datos
**Solución**: Verificar consola y conexión a Supabase

## 🔍 Debugging en Consola

Abrir consola del navegador (F12) y ejecutar:

```javascript
// Verificar que el contexto esté funcionando
console.log('Services Context:', window.servicesContext);

// Verificar datos cargados
console.log('Cotizaciones:', window.cotizaciones);
console.log('Proyectos:', window.proyectos);

// Verificar funciones
console.log('Funciones disponibles:', Object.keys(window.servicesFunctions || {}));
```

## 📋 Checklist de Verificación

- [ ] Pestañas en Configuración aparecen
- [ ] PDF se descarga correctamente
- [ ] Botón de eliminar aparece en borradores
- [ ] Aprobación crea proyecto automáticamente
- [ ] Planes de pago se pueden crear
- [ ] Pagos se pueden registrar
- [ ] Desembolsos se pueden agregar
- [ ] Métricas se actualizan en tiempo real

## 🛠️ Si Nada Funciona

1. **Limpiar caché**: Ctrl+Shift+R
2. **Verificar errores**: F12 → Console
3. **Reiniciar servidor**: Ctrl+C y `npm run dev`
4. **Verificar env**: Revisar conexión a Supabase