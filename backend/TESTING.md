# Guía de Testing para el Backend

Este documento proporciona información sobre cómo ejecutar los tests implementados en el backend de la aplicación.

## Tipos de Tests Implementados

1. **Tests Unitarios**: Evalúan componentes individuales (servicios, controladores) de forma aislada.
2. **Tests End-to-End (E2E)**: Prueban la aplicación desde el punto de vista del usuario, realizando solicitudes HTTP reales.

## Estructura de los Tests

Los tests en este proyecto siguen la siguiente estructura:

- Tests unitarios: Se encuentran junto a los archivos que prueban con el sufijo `.spec.ts`
  - `src/products/products.service.spec.ts`
  - `src/products/products.controller.spec.ts`
  - `src/categories/categories.service.spec.ts`
  - `src/categories/categories.controller.spec.ts`

- Tests E2E: Se encuentran en el directorio `test/` con el sufijo `.e2e-spec.ts`
  - `test/app.e2e-spec.ts`

## Cómo Ejecutar los Tests

### Requisitos Previos

Asegúrate de tener todas las dependencias instaladas:

```bash
npm install
```

### Ejecutar Tests Unitarios

Para ejecutar todos los tests unitarios:

```bash
npm test
```

Para ejecutar los tests en modo watch (re-ejecutándose automáticamente cuando hay cambios):

```bash
npm run test:watch
```

Para ejecutar los tests con cobertura:

```bash
npm run test:cov
```

### Ejecutar Tests E2E

Para ejecutar los tests end-to-end:

```bash
npm run test:e2e
```

## Cobertura de Tests

Los tests unitarios implementados cubren:

1. **Servicios**:
   - ProductsService: Métodos `create`, `findAll`, `findOne`, `update`, `remove`
   - CategoriesService: Métodos `create`, `findAll`, `findOne`, `update`, `remove`

2. **Controladores**:
   - ProductsController: Métodos `create`, `findAll`, `findOne`, `update`, `remove`, `uploadImage`
   - CategoriesController: Métodos `create`, `findAll`, `findOne`, `update`, `remove`

3. **Tests E2E**:
   - Rutas GET para productos y categorías

## Sugerencias para Ampliar los Tests

1. Añadir tests para otros módulos como:
   - Coupons
   - Transactions
   - Payment
   - Upload-image
   - Mindicador

2. Ampliar los tests E2E para incluir:
   - Operaciones POST, PUT y DELETE
   - Validación de datos de entrada
   - Pruebas de autenticación y autorización (si se implementan)

3. Implementar tests de integración para probar la interacción con la base de datos real.

## Buenas Prácticas

1. Mantener los tests actualizados cuando se modifique la funcionalidad.
2. Revisar la cobertura de código regularmente y aumentarla donde sea necesario.
3. Refactorizar los tests cuando se vuelvan difíciles de mantener.
4. Usar mocks apropiados para aislar los componentes que se están probando.
