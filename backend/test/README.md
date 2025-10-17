# Tests de Integración de Transbank

Este directorio contiene los tests de integración para las funciones de Transbank.

## Archivos de Test

- `payment.service.integration.spec.ts` - Tests del servicio de pago
- `payment.controller.integration.spec.ts` - Tests del controlador de pago

## Ejecución de Tests

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar solo los tests de integración de Transbank
```bash
npm test -- --testPathPattern=".*integration.*"
```

### Ejecutar tests con cobertura
```bash
npm run test:cov
```

### Ejecutar tests en modo watch
```bash
npm run test:watch
```

## Escenarios de Test

### PaymentService Tests

#### 1. Test OK (Exitoso)
- **createTransaction**: Crea una transacción exitosamente
- **commitTransaction**: Confirma una transacción exitosamente
- Retorna datos válidos de Transbank

#### 2. Test NOT OK (Error)
- **createTransaction**: Maneja errores de la API de Transbank
- **commitTransaction**: Maneja tokens inválidos o expirados
- Propaga errores con mensajes descriptivos

#### 3. Test OK NO DATA (Sin datos)
- **createTransaction**: Maneja parámetros vacíos o nulos
- **commitTransaction**: Maneja tokens vacíos
- Retorna respuestas con datos nulos pero sin errores

### PaymentController Tests

#### 1. Test OK (Exitoso)
- **createPayment**: Endpoint crea pago exitosamente
- **confirmPayment**: Endpoint confirma pago exitosamente
- Flujo completo de pago funciona correctamente

#### 2. Test NOT OK (Error)
- **createPayment**: Maneja errores del servicio
- **confirmPayment**: Maneja errores de confirmación
- Retorna respuestas de error apropiadas

#### 3. Test OK NO DATA (Sin datos)
- **createPayment**: Maneja datos mínimos o vacíos
- **confirmPayment**: Maneja tokens vacíos
- Responde adecuadamente con datos mínimos

## Configuración de Mocks

Los tests utilizan mocks de `transbank-sdk` para simular las respuestas de la API sin hacer llamadas reales a Transbank.

### Variables de Entorno de Test
- `TRANSBANK_COMMERCE_CODE`: Código de comercio de prueba
- `TRANSBANK_API_KEY`: Clave API de prueba  
- `TRANSBANK_ENV`: Ambiente de integración

## Comandos Específicos

```bash
# Ejecutar solo tests del servicio de pago
npm test payment.service.integration.spec.ts

# Ejecutar solo tests del controlador de pago
npm test payment.controller.integration.spec.ts

# Ejecutar con verbose para ver detalles
npm test -- --verbose

# Ejecutar con detectar cambios
npm test -- --watchAll
```
