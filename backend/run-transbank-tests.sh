#!/bin/bash

# Script para ejecutar los tests de integración de Transbank

echo "🚀 Ejecutando Tests de Integración de Transbank"
echo "=============================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Tests disponibles:${NC}"
echo "1. Test OK (Exitoso)"
echo "2. Test NOT OK (Error)"
echo "3. Test OK NO DATA (Sin datos)"
echo ""

echo -e "${YELLOW}🧪 Ejecutando todos los tests de integración...${NC}"
echo ""

# Ejecutar tests de integración de Transbank
npm run test:transbank

echo ""
echo -e "${GREEN}✅ Tests completados${NC}"
echo ""

echo -e "${BLUE}📊 Para ejecutar con cobertura:${NC}"
echo "npm run test:transbank:cov"
echo ""

echo -e "${BLUE}👀 Para ejecutar en modo watch:${NC}"
echo "npm run test:transbank:watch"
echo ""

echo -e "${BLUE}🔍 Para ejecutar tests específicos:${NC}"
echo "npm test payment.service.integration.spec.ts"
echo "npm test payment.controller.integration.spec.ts"
