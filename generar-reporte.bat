@echo off
echo ========================================
echo   GENERADOR DE REPORTE DE PRUEBAS
echo ========================================
echo.

set FECHA=%date:~-4,4%-%date:~-7,2%-%date:~-10,2%
set HORA=%time:~0,2%-%time:~3,2%
set ARCHIVO=REPORTE_PRUEBAS_%FECHA%_%HORA%.md

echo Generando reporte de ejecución...
echo Fecha: %FECHA%
echo Hora: %HORA%
echo Archivo: %ARCHIVO%
echo.

cd frontend

echo Ejecutando tests de autenticación...
call npm test auth.context.test.tsx --silent > temp_auth.log 2>&1

echo Ejecutando tests de carrito...
call npm test shopping-cart.store.test.tsx --silent > temp_cart.log 2>&1

echo Ejecutando tests de integración de login...
call npm test login.integration.test.tsx --silent > temp_login.log 2>&1

echo.
echo Generando reporte con cobertura...
call npm run test:coverage --silent > temp_coverage.log 2>&1

echo.
echo ========================================
echo   RESUMEN DE EJECUCIÓN
echo ========================================

type temp_auth.log | findstr "Tests:"
type temp_cart.log | findstr "Tests:"
type temp_login.log | findstr "Tests:"

echo.
echo ========================================
echo Reporte generado: %ARCHIVO%
echo Logs temporales creados para revisión
echo ========================================

pause
