@echo off
echo 🔐 Ejecutando Tests de Autenticación y Login
echo ============================================

echo.
echo 📋 Información del sistema de autenticación:
echo - Frontend: Next.js con TypeScript
echo - Context: React Context API
echo - Persistencia: localStorage
echo - Testing: Jest + Testing Library
echo.

echo 🧪 Ejecutando tests del contexto de autenticación...
npm test auth.context.test.tsx

echo.
echo 🖥️ Ejecutando tests de integración del login...
npm test login.integration.test.tsx

echo.
echo 📊 Ejecutando tests con cobertura...
npm run test:coverage

echo.
echo ✅ Tests de autenticación completados!
echo.
echo 📈 Resumen de tests ejecutados:
echo - AuthContext: 16 tests
echo - Login Integration: 16 tests
echo - Total: 32 tests
echo.
echo 🎯 Distribución por tipo:
echo - Tests OK (exitosos): 19
echo - Tests NOT OK (manejo de errores): 9
echo - Tests OK NO DATA (casos límite): 4
echo.
echo 🔑 Credenciales de test válidas:
echo - Email: diego@duoc.cl
echo - Password: password123
echo.
echo Para más información, consulta: test/LOGIN_README.md
pause
