@echo off
echo ===========================================
echo      TESTS DEL SISTEMA DE LOGIN
echo ===========================================
echo.
echo Ejecutando tests de autenticación...
echo.

echo [1/3] Tests del AuthContext...
call npx jest test/auth.context.test.tsx --verbose --silent

echo.
echo [2/3] Tests de integración del Login...
call npx jest test/login.integration.test.tsx --verbose --silent

echo.
echo [3/3] Resumen de cobertura...
call npx jest test/auth.context.test.tsx test/login.integration.test.tsx --coverage --silent

echo.
echo ===========================================
echo     TESTS DE LOGIN COMPLETADOS
echo ===========================================
pause
