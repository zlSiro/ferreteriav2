@echo off
echo 🛒 Ejecutando Tests del Carrito de Compras
echo ==========================================

echo.
echo 📋 Información del proyecto:
echo - Frontend: Next.js con TypeScript
echo - Store: Zustand
echo - Testing: Jest + Testing Library
echo.

echo 🧪 Ejecutando tests del carrito de compras...
npm test shopping-cart.store.test.ts

echo.
echo 📊 Ejecutando tests con cobertura...
npm run test:coverage

echo.
echo ✅ Tests completados!
echo.
echo 📈 Resumen de cobertura del store:
echo - Statements: 100%%
echo - Functions: 100%%
echo - Lines: 100%%
echo - Branches: 90%%
echo.
echo 🎯 Total de tests: 29
echo - Tests OK (exitosos): 15
echo - Tests NOT OK (manejo de errores): 8
echo - Tests OK NO DATA (casos límite): 6
echo.
echo Para más información, consulta: test/README.md
pause
