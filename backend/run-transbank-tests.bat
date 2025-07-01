@echo off
echo 🚀 Ejecutando Tests de Integración de Transbank
echo ==============================================
echo.

echo 📋 Tests disponibles:
echo 1. Test OK (Exitoso)
echo 2. Test NOT OK (Error)  
echo 3. Test OK NO DATA (Sin datos)
echo.

echo 🧪 Ejecutando todos los tests de integración...
echo.

REM Ejecutar tests de integración de Transbank
npm run test:transbank

echo.
echo ✅ Tests completados
echo.

echo 📊 Para ejecutar con cobertura:
echo npm run test:transbank:cov
echo.

echo 👀 Para ejecutar en modo watch:
echo npm run test:transbank:watch
echo.

echo 🔍 Para ejecutar tests específicos:
echo npm test payment.service.integration.spec.ts
echo npm test payment.controller.integration.spec.ts

pause
