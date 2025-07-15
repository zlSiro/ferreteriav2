# Plan de Pruebas - Sistema de Ferretería
**Versión:** 1.0  
**Fecha:** 3 de Julio, 2025  
**Proyecto:** Sistema de Gestión de Ferretería  

## 📋 Tabla de Contenidos
1. [Información General](#información-general)
2. [Alcance de las Pruebas](#alcance-de-las-pruebas)
3. [Estrategia de Pruebas](#estrategia-de-pruebas)
4. [Casos de Prueba](#casos-de-prueba)
5. [Criterios de Aceptación](#criterios-de-aceptación)
6. [Entorno de Pruebas](#entorno-de-pruebas)
7. [Cronograma](#cronograma)
8. [Recursos](#recursos)

---

## 1. Información General

### 1.1 Objetivo del Plan
Definir la estrategia, alcance, cronograma y recursos necesarios para realizar las pruebas del sistema de ferretería, garantizando la calidad y funcionalidad de todos los componentes desarrollados.

### 1.2 Aplicaciones a Probar
- **Frontend**: Aplicación Next.js con React
- **Backend**: API REST con NestJS
- **Base de Datos**: PostgreSQL
- **Pagos**: Integración con Transbank
- **Autenticación**: Sistema de login/logout

### 1.3 Responsables
- **Tester Principal**: Jeremy Perez
- **Desarrollador**: Juan Pablo Valdebenito
- **Revisor**: Diana Guerrero

---

## 2. Alcance de las Pruebas

### 2.1 Funcionalidades Incluidas ✅
- **Autenticación de usuarios**
- **Gestión de productos (CRUD)**
- **Carrito de compras**
- **Procesamiento de pagos con Transbank**
- **Gestión de categorías**
- **Panel de administración**
- **Navegación y UI/UX**

### 2.2 Funcionalidades Excluidas ❌
- **Integración con sistemas externos** (excepto Transbank)
- **Pruebas de rendimiento de alto volumen**
- **Pruebas de seguridad avanzadas**

---

## 3. Estrategia de Pruebas

### 3.1 Tipos de Pruebas

#### 3.1.1 Pruebas Unitarias 🔧
- **Objetivo**: Verificar componentes individuales
- **Herramientas**: Jest, React Testing Library
- **Cobertura mínima**: 80%

#### 3.1.2 Pruebas de Integración 🔗
- **Objetivo**: Verificar interacción entre módulos
- **Enfoque**: API endpoints, flujos completos
- **Herramientas**: Supertest, Jest

#### 3.1.3 Pruebas de Sistema 🌐
- **Objetivo**: Verificar el sistema completo
- **Enfoque**: Flujos end-to-end críticos
- **Herramientas**: Cypress (recomendado)

#### 3.1.4 Pruebas de Aceptación ✅
- **Objetivo**: Validar requisitos del usuario
- **Enfoque**: Casos de uso reales
- **Método**: Pruebas manuales guiadas

### 3.2 Niveles de Prioridad
- **Crítico (P1)**: Funcionalidades esenciales del negocio
- **Alto (P2)**: Funcionalidades importantes
- **Medio (P3)**: Funcionalidades secundarias
- **Bajo (P4)**: Funcionalidades opcionales

---

## 4. Casos de Prueba

### 4.1 Módulo de Autenticación 🔐

#### CP-AUTH-001: Login Exitoso (P1)
**Objetivo**: Verificar que un usuario admin puede iniciar sesión correctamente

**Prerrequisitos**: 
- Sistema iniciado
- Credenciales válidas disponibles

**Datos de Prueba**:
```
Email: diego@duoc.cl
Password: password123
```

**Pasos**:
1. Navegar a `/login`
2. Ingresar email válido
3. Ingresar contraseña válida
4. Hacer clic en "Iniciar Sesión"

**Resultado Esperado**:
- Redirección a página principal
- Panel de administración visible
- Botón "Cerrar Sesión" visible
- Mensaje de bienvenida (opcional)

**Criterios de Aceptación**:
- [ ] Login exitoso en <3 segundos
- [ ] Redirección automática
- [ ] Persistencia de sesión
- [ ] UI actualizada correctamente

---

#### CP-AUTH-002: Login Fallido (P1)
**Objetivo**: Verificar manejo de credenciales incorrectas

**Datos de Prueba**:
```
Email: usuario@incorrecto.com
Password: password_malo
```

**Pasos**:
1. Navegar a `/login`
2. Ingresar email inválido
3. Ingresar contraseña inválida
4. Hacer clic en "Iniciar Sesión"

**Resultado Esperado**:
- Permanecer en página de login
- Mostrar mensaje: "Credenciales incorrectas"
- Campos de formulario limpiarse
- Sin redirección

**Criterios de Aceptación**:
- [ ] Mensaje de error claro
- [ ] Sin redirección no deseada
- [ ] Formulario listo para reintento
- [ ] Seguridad mantenida

---

#### CP-AUTH-003: Logout (P1)
**Objetivo**: Verificar que el logout funciona correctamente

**Prerrequisitos**: Usuario autenticado

**Pasos**:
1. Estar logueado como admin
2. Hacer clic en "Cerrar Sesión"
3. Confirmar acción (si aplica)

**Resultado Esperado**:
- Sesión cerrada completamente
- Redirección a página de login
- Panel de administración oculto
- Botón "Iniciar Sesión" visible

**Criterios de Aceptación**:
- [ ] Limpieza completa de sesión
- [ ] localStorage limpio
- [ ] UI actualizada
- [ ] Sin acceso a funciones admin

---

### 4.2 Módulo de Carrito de Compras 🛒

#### CP-CART-001: Agregar Producto al Carrito (P1)
**Objetivo**: Verificar que se pueden agregar productos al carrito

**Prerrequisitos**: 
- Productos disponibles en inventario
- Página de productos cargada

**Pasos**:
1. Navegar a la tienda
2. Seleccionar un producto con inventario > 0
3. Hacer clic en "Agregar al Carrito"
4. Verificar en el panel lateral

**Resultado Esperado**:
- Producto aparece en carrito
- Cantidad inicial = 1
- Total actualizado correctamente
- Contador de productos actualizado

**Criterios de Aceptación**:
- [ ] Producto visible en carrito
- [ ] Cálculo correcto de totales
- [ ] Interfaz responsiva
- [ ] Inventario actualizado

---

#### CP-CART-002: Modificar Cantidad en Carrito (P2)
**Objetivo**: Verificar que se puede cambiar la cantidad de productos

**Prerrequisitos**: Al menos un producto en el carrito

**Pasos**:
1. Tener producto en carrito
2. Usar botones +/- para cambiar cantidad
3. Verificar límites de inventario
4. Verificar cálculos

**Resultado Esperado**:
- Cantidad se actualiza en tiempo real
- Total recalculado automáticamente
- Respeta límites de inventario
- Botones deshabilitados cuando corresponde

**Criterios de Aceptación**:
- [ ] Actualización en tiempo real
- [ ] Validación de inventario
- [ ] Cálculos precisos
- [ ] UX intuitiva

---

#### CP-CART-003: Remover Producto del Carrito (P2)
**Objetivo**: Verificar eliminación de productos del carrito

**Prerrequisitos**: Al menos un producto en el carrito

**Pasos**:
1. Tener productos en carrito
2. Hacer clic en botón "Eliminar" de un producto
3. Confirmar acción (si aplica)
4. Verificar actualización

**Resultado Esperado**:
- Producto removido completamente
- Total recalculado
- Lista de productos actualizada
- Mensaje de confirmación (opcional)

**Criterios de Aceptación**:
- [ ] Eliminación inmediata
- [ ] Totales correctos
- [ ] Sin productos fantasma
- [ ] Confirmación clara

---

#### CP-CART-004: Carrito Vacío (P3)
**Objetivo**: Verificar comportamiento con carrito vacío

**Pasos**:
1. Vaciar completamente el carrito
2. Verificar mensaje de carrito vacío
3. Intentar proceder al checkout
4. Verificar funcionalidades disponibles

**Resultado Esperado**:
- Mensaje: "El carrito está vacío"
- Checkout deshabilitado
- Total = $0
- Invitación a seguir comprando

**Criterios de Aceptación**:
- [ ] Mensaje claro mostrado
- [ ] Funciones apropiadas deshabilitadas
- [ ] Navegación a productos disponible
- [ ] Sin errores de cálculo

---

### 4.3 Módulo de Pagos con Transbank 💳

#### CP-PAY-001: Crear Transacción Exitosa (P1)
**Objetivo**: Verificar creación exitosa de transacción en Transbank

**Prerrequisitos**: 
- Carrito con productos
- Conexión a Transbank configurada

**Datos de Prueba**:
```
Monto: $50000
Orden: ORD-001
Sesión: SES-001
```

**Pasos**:
1. Tener productos en carrito
2. Proceder al checkout
3. Iniciar proceso de pago
4. Verificar respuesta de Transbank

**Resultado Esperado**:
- Token de transacción generado
- URL de redirección recibida
- Estado "INITIALIZED"
- Log de transacción creado

**Criterios de Aceptación**:
- [ ] Token válido recibido
- [ ] URL de redirección válida
- [ ] Datos guardados correctamente
- [ ] Sin errores en logs

---

#### CP-PAY-002: Confirmar Transacción Exitosa (P1)
**Objetivo**: Verificar confirmación exitosa de pago

**Prerrequisitos**: Transacción iniciada con token válido

**Datos de Prueba**:
```
Token: [token_valido_de_prueba]
```

**Pasos**:
1. Usar token de transacción válido
2. Simular respuesta exitosa de Transbank
3. Confirmar la transacción
4. Verificar actualización de estado

**Resultado Esperado**:
- Estado "AUTHORIZED"
- Código de autorización recibido
- Carrito limpiado
- Confirmación al usuario

**Criterios de Aceptación**:
- [ ] Estado actualizado correctamente
- [ ] Código de autorización válido
- [ ] Proceso completo sin errores
- [ ] Usuario notificado del éxito

---

#### CP-PAY-003: Manejo de Error en Pago (P1)
**Objetivo**: Verificar manejo de errores en el proceso de pago

**Datos de Prueba**:
```
Token: token_invalido_o_expirado
```

**Pasos**:
1. Intentar confirmar con token inválido
2. Simular error de Transbank
3. Verificar manejo del error
4. Comprobar estado del carrito

**Resultado Esperado**:
- Error capturado y manejado
- Mensaje claro al usuario
- Carrito mantenido intacto
- Opción de reintentar

**Criterios de Aceptación**:
- [ ] Error manejado gracefully
- [ ] Mensaje de error claro
- [ ] Carrito no se pierde
- [ ] Logs de error generados

---

### 4.4 Módulo de Productos y Administración 📦

#### CP-PROD-001: Visualizar Productos (P1)
**Objetivo**: Verificar que los productos se muestran correctamente

**Pasos**:
1. Navegar a la página principal
2. Verificar carga de productos
3. Comprobar información mostrada
4. Verificar responsive design

**Resultado Esperado**:
- Lista de productos cargada
- Imágenes, precios, inventario visible
- Categorías funcionando
- Diseño responsive

**Criterios de Aceptación**:
- [ ] Productos cargan en <5 segundos
- [ ] Información completa y precisa
- [ ] Imágenes se cargan correctamente
- [ ] Funciona en móvil y desktop

---

#### CP-PROD-002: Filtrar por Categoría (P2)
**Objetivo**: Verificar filtrado de productos por categoría

**Prerrequisitos**: Múltiples categorías disponibles

**Pasos**:
1. Estar en página de productos
2. Seleccionar una categoría específica
3. Verificar filtrado
4. Probar cambio de categoría

**Resultado Esperado**:
- Solo productos de categoría seleccionada
- URL actualizada correctamente
- Navegación funcional
- Contador de productos correcto

**Criterios de Aceptación**:
- [ ] Filtrado preciso
- [ ] URL amigable
- [ ] Navegación intuitiva
- [ ] Performance adecuada

---

#### CP-PROD-003: Producto Agotado (P2)
**Objetivo**: Verificar manejo de productos sin inventario

**Prerrequisitos**: Producto con inventario = 0

**Pasos**:
1. Localizar producto agotado
2. Verificar indicación visual
3. Intentar agregarlo al carrito
4. Verificar comportamiento

**Resultado Esperado**:
- Producto marcado como "Agotado"
- Botón "Agregar" deshabilitado
- Opacidad reducida en imagen
- Mensaje claro de estado

**Criterios de Aceptación**:
- [ ] Indicación visual clara
- [ ] Botón apropiadamente deshabilitado
- [ ] No se puede agregar al carrito
- [ ] Mensaje de estado visible

---

### 4.5 Módulo de Navegación y UI 🎨

#### CP-NAV-001: Navegación Principal (P2)
**Objetivo**: Verificar funcionamiento de la navegación principal

**Pasos**:
1. Probar todos los enlaces del header
2. Verificar logo clickeable
3. Comprobar navegación móvil
4. Verificar estados activos

**Resultado Esperado**:
- Todos los enlaces funcionan
- Logo redirige a inicio
- Menú móvil responsivo
- Estados visuales correctos

**Criterios de Aceptación**:
- [ ] Enlaces funcionan sin errores
- [ ] Navegación móvil intuitiva
- [ ] Estados visuales claros
- [ ] Performance fluida

---

#### CP-NAV-002: Estados de Autenticación en UI (P2)
**Objetivo**: Verificar cambios en UI según estado de autenticación

**Pasos**:
1. Verificar UI sin autenticar
2. Hacer login
3. Verificar cambios en UI
4. Hacer logout y verificar

**Resultado Esperado**:
- UI se actualiza dinámicamente
- Botones apropiados mostrados/ocultos
- Funcionalidades admin disponibles
- Transiciones suaves

**Criterios de Aceptación**:
- [ ] Actualización en tiempo real
- [ ] Botones correctos mostrados
- [ ] Acceso apropiado a funciones
- [ ] UX consistente

---

## 5. Criterios de Aceptación

### 5.1 Criterios Funcionales
- ✅ Todos los casos de prueba P1 deben pasar al 100%
- ✅ Al menos 95% de casos P2 deben pasar
- ✅ Al menos 80% de casos P3 deben pasar
- ✅ Sin errores críticos en funcionalidades principales

### 5.2 Criterios de Performance
- ✅ Tiempo de carga inicial < 5 segundos
- ✅ Tiempo de respuesta de API < 2 segundos
- ✅ Tiempo de autenticación < 3 segundos
- ✅ Operaciones de carrito < 1 segundo

### 5.3 Criterios de Usabilidad
- ✅ Interfaz intuitiva y fácil de usar
- ✅ Mensajes de error claros y útiles
- ✅ Responsive design funcional
- ✅ Accesibilidad básica implementada

### 5.4 Criterios de Seguridad
- ✅ Autenticación segura
- ✅ Manejo apropiado de sesiones
- ✅ Validación de datos de entrada
- ✅ Protección de rutas admin

---

## 6. Entorno de Pruebas

### 6.1 Hardware
- **CPU**: Mínimo dual-core 2.0GHz
- **RAM**: Mínimo 8GB
- **Disco**: 10GB espacio libre
- **Red**: Conexión estable a internet

### 6.2 Software
- **OS**: Windows 10/11, macOS, o Linux
- **Browser**: Chrome (última versión), Firefox, Safari
- **Node.js**: v18 o superior
- **npm**: v8 o superior

### 6.3 Configuración
```bash
# Variables de entorno requeridas
DATABASE_URL=postgresql://...
API_URL=http://localhost:4000
TRANSBANK_COMMERCE_CODE=597055555532
TRANSBANK_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
TRANSBANK_ENV=integration
```

### 6.4 Datos de Prueba
```json
{
  "admin_user": {
    "email": "diego@duoc.cl",
    "password": "password123"
  },
  "products": [
    {
      "id": 1,
      "name": "Martillo",
      "price": 15000,
      "inventory": 10
    }
  ],
  "transbank": {
    "test_commerce_code": "597055555532",
    "test_amounts": [1000, 5000, 50000]
  }
}
```

---

## 7. Cronograma

### Fase 1: Preparación (1 día)
- ✅ Configuración de entorno
- ✅ Instalación de dependencias
- ✅ Verificación de datos de prueba

### Fase 2: Pruebas Unitarias (2 días)
- ✅ Tests de AuthContext (Completado)
- ✅ Tests de Store/Carrito (Completado)
- ✅ Tests de utilidades

### Fase 3: Pruebas de Integración (2 días)
- ✅ Tests de Transbank (Completado)
- ✅ Tests de API endpoints
- ✅ Tests de flujos completos

### Fase 4: Pruebas de Sistema (2 días)
- 🔄 Tests end-to-end críticos
- 🔄 Tests de navegación
- 🔄 Tests de responsive design

### Fase 5: Pruebas de Aceptación (1 día)
- 🔄 Validación con casos de uso reales
- 🔄 Verificación de criterios de aceptación
- 🔄 Documentación de resultados

### Fase 6: Reporte Final (1 día)
- 🔄 Compilación de resultados
- 🔄 Análisis de métricas
- 🔄 Recomendaciones

**Total estimado**: 9 días laborales

---

## 8. Recursos

### 8.1 Humanos
- **Tester Principal**: Responsable de ejecución
- **Desarrollador**: Soporte técnico y correcciones
- **Stakeholder**: Validación de criterios de aceptación

### 8.2 Herramientas de Testing
- **Jest**: Framework de testing principal
- **React Testing Library**: Testing de componentes
- **Supertest**: Testing de APIs
- **Cypress** (recomendado): E2E testing
- **Postman/Insomnia**: Testing manual de APIs

### 8.3 Documentación
- **Plan de Pruebas**: Este documento
- **Casos de Prueba**: Documentos detallados por módulo
- **Reportes de Ejecución**: Resultados por fase
- **Registro de Defectos**: Issues encontrados

---

## 9. Comandos de Ejecución

### 9.1 Frontend Tests
```bash
# Todos los tests
npm test

# Tests específicos
npm test auth.context.test.tsx
npm test shopping-cart.store.test.tsx
npm test login.integration.test.tsx

# Con cobertura
npm run test:coverage

# Tests de login
.\test-login.bat
```

### 9.2 Backend Tests
```bash
# Tests de Transbank
npm run test:transbank

# Tests con cobertura
npm run test:transbank:cov

# Tests específicos
npm test payment.service.integration.spec.ts
npm test payment.controller.integration.spec.ts
```

### 9.3 Tests de Carrito
```bash
# Tests del carrito
npm test shopping-cart.store.test.ts

# Script automatizado
.\run-cart-tests.bat
```

---

## 10. Contactos y Responsabilidades

| Rol | Nombre | Email | Responsabilidades |
|-----|--------|-------|-------------------|
| **Tester Principal** | Jeremy Perez | Ejecución, reporte, coordinación |
| **Desarrollador** | Juan Pablo Valdebenito |  Soporte técnico, correcciones |
| **Revisor** | Diana Guerrero | Validación, aprobación final |

---

## 11. Anexos

### Anexo A: Checklist de Ejecución
- [ ] Entorno configurado y funcionando
- [ ] Datos de prueba cargados
- [ ] Tests unitarios ejecutados (✅ Completado)
- [ ] Tests de integración ejecutados (✅ Completado)
- [ ] Tests de sistema ejecutados
- [ ] Tests de aceptación ejecutados
- [ ] Reporte final generado

### Anexo B: Plantilla de Reporte de Bug
```
ID: BUG-[número]
Título: [descripción breve]
Severidad: [Crítica/Alta/Media/Baja]
Prioridad: [P1/P2/P3/P4]
Módulo: [módulo afectado]
Descripción: [descripción detallada]
Pasos para reproducir: [pasos específicos]
Resultado esperado: [qué debería pasar]
Resultado actual: [qué pasa realmente]
Evidencia: [screenshots, logs, etc.]
Ambiente: [detalles del entorno]
Asignado a: [desarrollador responsable]
Estado: [Abierto/En progreso/Resuelto/Cerrado]
```

---

**Documento elaborado por**: Jeremy Perez   
**Fecha de creación**: 1 de Julio, 2025  
**Última actualización**: 1 de Julio, 2025  
**Versión**: 1.0
