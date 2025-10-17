# Tests del Carrito de Compras (Zustand Store)

Este directorio contiene los tests unitarios e integración para el store del carrito de compras usando Zustand.

## Archivos de Test

- `shopping-cart.store.test.ts` - Tests completos del store del carrito de compras
- `shopping-cart.test.simple.js` - Versión simplificada ejecutable sin dependencias externas
- `setup.ts` - Configuración inicial para los tests

## Ejecución de Tests

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests con cobertura
```bash
npm run test:coverage
```

### Ejecutar tests en modo watch
```bash
npm run test:watch
```

### Ejecutar solo los tests del carrito
```bash
npm test shopping-cart.store.test.ts
```

## Escenarios de Test Cubiertos

### addToCart Tests

#### 1. Test OK (Exitoso)
- **Agregar producto nuevo**: Añade un producto al carrito exitosamente
- **Incrementar cantidad**: Aumenta la cantidad cuando se agrega un producto existente
- **Múltiples productos**: Maneja múltiples productos diferentes correctamente

#### 2. Test NOT OK (Error)
- **Límite de inventario**: No permite agregar más productos que el inventario disponible

#### 3. Test OK NO DATA (Sin datos)
- **Inventario cero**: Maneja productos con inventario cero

### updateQuantity Tests

#### 1. Test OK (Exitoso)
- **Actualizar cantidad**: Actualiza la cantidad de un producto exitosamente
- **Múltiples productos**: Actualiza cantidades independientemente

#### 2. Test NOT OK (Error)
- **Producto inexistente**: Maneja actualizaciones de productos que no existen

#### 3. Test OK NO DATA (Sin datos)
- **Cantidad cero**: Maneja actualizaciones a cantidad cero

### removeFromCart Tests

#### 1. Test OK (Exitoso)
- **Remover producto**: Elimina un producto del carrito exitosamente
- **Limpiar carrito**: Limpia automáticamente cuando se remueve el último item

#### 2. Test NOT OK (Error)
- **Producto inexistente**: Maneja eliminación de productos que no existen

#### 3. Test OK NO DATA (Sin datos)
- **Carrito vacío**: Maneja eliminación en carrito vacío

### calculateTotal Tests

#### 1. Test OK (Exitoso)
- **Cálculo múltiple**: Calcula total correctamente con múltiples items
- **Precios decimales**: Maneja precios con decimales

#### 2. Test OK NO DATA (Sin datos)
- **Carrito vacío**: Calcula total como cero para carrito vacío

### applyCoupon Tests

#### 1. Test OK (Exitoso)
- **Aplicar cupón**: Aplica cupón válido exitosamente

#### 2. Test NOT OK (Error)
- **Cupón inválido**: Maneja cupones inválidos
- **Error de red**: Maneja errores de conexión

#### 3. Test OK NO DATA (Sin datos)
- **Cupón vacío**: Maneja nombres de cupón vacíos

### applyDiscount Tests

#### 1. Test OK (Exitoso)
- **Descuento correcto**: Aplica descuentos correctamente
- **Descuento 100%**: Maneja descuentos completos

#### 2. Test OK NO DATA (Sin datos)
- **Descuento cero**: Maneja descuentos de 0%
- **Carrito vacío**: Aplica descuentos en carrito vacío

### clearCart Tests

#### 1. Test OK (Exitoso)
- **Limpiar completo**: Limpia completamente el carrito y estado

#### 2. Test OK NO DATA (Sin datos)
- **Carrito ya vacío**: Maneja limpieza de carrito ya vacío

### Integration Tests - Flujo Completo

#### 1. Test OK (Exitoso)
- **Flujo completo**: Simula un flujo completo de compra con productos, cupones y limpieza
- **Consistencia de estado**: Mantiene consistencia del estado durante todas las operaciones

#### 2. Test NOT OK (Error)
- **Casos extremos**: Maneja casos extremos en el flujo de compra

## Cobertura de Tests

- **Statements**: 100%
- **Functions**: 100%
- **Lines**: 100%
- **Branches**: 90%

## Configuración de Mocks

Los tests utilizan mocks de `fetch` para simular las respuestas de la API de cupones sin hacer llamadas reales.

### Variables Mockeadas
- `global.fetch`: Para simulación de llamadas API
- `window.matchMedia`: Para tests con media queries
- `ResizeObserver`: Para tests con observadores de redimensionamiento
- `IntersectionObserver`: Para tests con observadores de intersección

## Comandos Específicos

```bash
# Ejecutar con verbose para ver detalles
npm test -- --verbose

# Ejecutar con detectar cambios
npm test -- --watchAll

# Ejecutar con cobertura específica del store
npm run test:coverage -- --collectCoverageFrom="src/store.ts"

# Ejecutar la versión simple sin dependencias
node test/shopping-cart.test.simple.js
```

## Estructura de Tests

### Por Funcionalidad
- **addToCart**: 5 tests (OK, NOT OK, OK NO DATA)
- **updateQuantity**: 4 tests (OK, NOT OK, OK NO DATA)
- **removeFromCart**: 4 tests (OK, NOT OK, OK NO DATA)
- **calculateTotal**: 3 tests (OK, OK NO DATA)
- **applyCoupon**: 4 tests (OK, NOT OK, OK NO DATA)
- **applyDiscount**: 4 tests (OK, OK NO DATA)
- **clearCart**: 2 tests (OK, OK NO DATA)
- **Integration**: 3 tests (OK, NOT OK)

### Total: 29 tests cubriendo todos los escenarios críticos

## Dependencias de Test

- **Jest**: Framework de testing
- **@testing-library/jest-dom**: Matchers adicionales para DOM
- **ts-jest**: Soporte para TypeScript en Jest
- **jest-environment-jsdom**: Entorno DOM para tests
