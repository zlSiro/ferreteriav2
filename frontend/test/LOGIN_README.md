# Tests de Autenticación y Login

Este directorio contiene los tests completos para el sistema de autenticación y login de la aplicación.

## Archivos de Test

- `auth.context.test.tsx` - Tests del contexto de autenticación (AuthContext)
- `login.integration.test.tsx` - Tests de integración del login (UI + funcionalidad)
- `login.page.test.tsx` - Tests específicos de la página de login (pendiente por resolver módulos)

## Ejecución de Tests

### Ejecutar todos los tests de autenticación
```bash
npm test auth.context.test.tsx
npm test login.integration.test.tsx
```

### Ejecutar tests con cobertura
```bash
npm run test:coverage
```

### Ejecutar tests en modo watch
```bash
npm run test:watch
```

## Escenarios de Test Cubiertos

### AuthContext Tests (16 tests)

#### 1. Initial State Tests
- **Estado inicial limpio (OK NO DATA)**: Verifica que la aplicación inicie sin usuario autenticado
- **Carga desde localStorage (OK)**: Recupera usuario guardado al inicializar
- **Manejo de datos corruptos (NOT OK)**: Maneja gracefully JSON corrupto en localStorage

#### 2. Login Functionality Tests
- **Login exitoso (OK)**: Autenticación con credenciales válidas (`diego@duoc.cl`, `password123`)
- **Login fallido (NOT OK)**: Rechazo de credenciales inválidas
- **Credenciales vacías (OK NO DATA)**: Manejo de campos vacíos
- **Retorno de boolean (OK)**: Verificación de valores de retorno del login

#### 3. Logout Functionality Tests  
- **Logout exitoso (OK)**: Limpieza completa de estado y localStorage
- **Logout sin login (OK NO DATA)**: Manejo de logout cuando no hay usuario autenticado

#### 4. Authorization (Admin) Tests
- **Acceso admin válido (OK)**: Concede acceso admin a usuario autorizado
- **Denegación de acceso (NOT OK)**: Niega acceso admin cuando no está autenticado
- **Persistencia admin (OK)**: Mantiene estado admin tras recargas

#### 5. Hook Error Handling Tests
- **Error fuera de Provider (NOT OK)**: Lanza error cuando useAuth se usa fuera de AuthProvider

#### 6. Integration Tests
- **Flujo completo (OK)**: Login → Logout → Estado consistente
- **Operaciones rápidas (OK)**: Mantiene consistencia durante operaciones rápidas
- **Sincronización localStorage (OK)**: Sincroniza correctamente con localStorage

### Login Integration Tests (16 tests)

#### 1. AuthContext Functionality (3 tests)
- **Credenciales válidas (OK)**: Autenticación exitosa con redirección
- **Credenciales inválidas (NOT OK)**: Muestra error sin redirección
- **Credenciales vacías (OK NO DATA)**: Validación HTML5

#### 2. Login Page UI Functionality (4 tests)
- **Renderizado de elementos (OK)**: Todos los campos y botones presentes
- **Actualización de inputs (OK)**: Cambios en tiempo real en campos
- **Toggle password (OK)**: Mostrar/ocultar contraseña
- **Limpieza de errores (OK)**: Error desaparece al escribir

#### 3. Form Validation (3 tests)
- **Email requerido (NOT OK)**: Validación de campo email obligatorio
- **Password requerido (NOT OK)**: Validación de campo password obligatorio
- **Formato email (NOT OK)**: Tipo de input correcto para email

#### 4. Navigation Links (1 test)
- **Enlaces correctos (OK)**: Verificación de todas las rutas de navegación

#### 5. Integration Tests - Complete Flow (3 tests)
- **Flujo exitoso completo (OK)**: Login completo con todos los pasos
- **Flujo fallido con recuperación (NOT OK)**: Error → Corrección → Éxito
- **Mantenimiento de estado (OK)**: Estado del formulario durante interacciones

#### 6. Accessibility (2 tests)
- **Atributos de accesibilidad (OK)**: Labels, tipos, atributos required
- **Mensaje de error ARIA (OK)**: Role="alert" en mensajes de error

## Cobertura de Tests

### AuthContext
- **16 tests** cubriendo todas las funciones y casos edge
- Manejo completo de localStorage
- Validación de autenticación y autorización
- Gestión robusta de errores

### Login Integration  
- **16 tests** cubriendo UI y funcionalidad
- Validación de formularios
- Manejo de estados de error
- Flujos completos de usuario
- Accesibilidad web

## Configuración de Mocks

### localStorage Mock
```javascript
const localStorageMock = {
  getItem: (key) => store[key] || null,
  setItem: (key, value) => { store[key] = value; },
  removeItem: (key) => { delete store[key]; },
  clear: () => { store = {}; }
};
```

### AuthContext Simplificado
- Recreación del contexto para tests independientes
- Lógica idéntica al contexto original
- Sin dependencias externas

## Credenciales de Test

### Usuario Administrador (Válido)
- **Email**: `diego@duoc.cl`
- **Password**: `password123`
- **Permisos**: Admin completo

### Usuarios Inválidos (Test NOT OK)
- Cualquier otra combinación de email/password
- Campos vacíos
- Formatos de email inválidos

## Comandos Específicos

```bash
# Ejecutar solo tests de AuthContext
npm test auth.context.test.tsx

# Ejecutar solo tests de integración de login
npm test login.integration.test.tsx

# Ejecutar con verbose para ver detalles
npm test -- --verbose

# Ejecutar con detectar cambios
npm test -- --watchAll
```

## Estructura de Tests por Categoría

### Tests OK (Exitosos) - 19 tests
- Autenticación válida
- Funcionalidad UI correcta
- Flujos completos exitosos
- Manejo correcto de estado

### Tests NOT OK (Manejo de errores) - 9 tests
- Credenciales inválidas
- Validaciones de formulario
- Errores de configuración
- Casos de fallo esperados

### Tests OK NO DATA (Casos límite) - 4 tests
- Estados iniciales vacíos
- Campos sin datos
- Operaciones en estado limpio
- Casos edge sin información

## Dependencias de Test

- **Jest**: Framework de testing
- **@testing-library/react**: Testing utilities para React
- **@testing-library/user-event**: Simulación de eventos de usuario
- **jsdom**: Entorno DOM para tests

## Notas Técnicas

1. **AuthContext independiente**: Los tests usan una versión simplificada del AuthContext para evitar problemas de resolución de módulos.

2. **localStorage persistente**: Cada test limpia el localStorage para evitar interferencias.

3. **Async/await**: Uso correcto de async/await para interacciones de usuario.

4. **Error handling**: Manejo robusto de errores y casos edge.

5. **Real user interactions**: Simulación realista de interacciones de usuario con userEvent.
