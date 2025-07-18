<h1 align="center">Ferreteria Ferramas</h1>
<h2 align="center">Tu ferreteria de confianza</h2>

<p><img align="right" height="250" width="250" src="https://raw.githubusercontent.com/SubhadeepZilong/SubhadeepZilong/main/icons/animation_500_kxa883sd.gif" alt="SubhadeepZilong" /></p>

&emsp;
<h3 align="left">Hola 👋, instructivo de como instalar y acceder al proyecto.</h3>
&emsp;
<br/>
<br/>
<br/>

# Tabla de Contenido Proyecto Ferreteria Ferramas
- [Instalación](#Instalación)
- [Tech Stack](#Tech_stack)
- [Development](#Development)
- [Testing](#Testing)
- [Version Controll & Tools](#Version_controll_-tools)

## INSTALACION

### :one: . Instalar los paquetes de NodeJS en ambas carpetas

En la carpeta del proyecto usando PowerShell usar el siguiente comando:

 ```bash
cd backend
npm install
cd..

cd frontend
npm install
cd..
```

### :two: . Iniciar los servidores del backend y frontend. 

En la carpeta del proyecto usando PowerShell usar los siguientes comandos:

 ```bash
cd backend
npm run start:dev
```

En otra terminal ejecutar el siguiente comando

 ```bash
cd frontend
npm run dev
```
### :three: . Vista de la pagina

Escribir en el navegador http://127.0.0.1:3001/ para ver la aplicacion.

## 🧪 Testing

El proyecto incluye tests completos para las funcionalidades críticas:

### Tests del Backend (Transbank)
```bash
cd backend
npm test -- --testPathPattern=".*integration.*"
```

### Tests del Frontend

#### Carrito de Compras (Zustand Store)
```bash
cd frontend
npm test shopping-cart.store.test.ts
npm run test:coverage
```

#### Autenticación y Login  
```bash
cd frontend
npm test auth.context.test.tsx
npm test login.integration.test.tsx
```

#### Cobertura de Tests
- **Carrito de Compras**: 29 tests (100% statements, 90% branches)
- **Autenticación**: 32 tests (AuthContext + Login UI)
- **Transbank**: Tests de integración (OK, NOT OK, OK NO DATA)

#### Escenarios Cubiertos
- ✅ **OK**: Tests exitosos 
- ❌ **NOT OK**: Manejo de errores  
- 📝 **OK NO DATA**: Casos límite y sin datos

Para más información sobre los tests:
- Backend: `backend/test/README.md`
- Frontend Carrito: `frontend/test/README.md`
- Frontend Login: `frontend/test/LOGIN_README.md`

## 🛠 &nbsp;Tech Stack

![TypeScript](https://img.shields.io/badge/typescript-3670A0?style=for-the-badge&logo=typescript&logoColor=ffdd54)&nbsp;
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)&nbsp;
![TailWind](https://img.shields.io/badge/tailwindcss-%23563D7C.svg?style=for-the-badge&logo=tailwindcdd&logoColor=white)&nbsp;
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)&nbsp;
![React](https://img.shields.io/badge/react-%231572B6.svg?style=for-the-badge&logo=react&logoColor=white)&nbsp;


## ⚙️ Development
![NestJS](https://img.shields.io/badge/NextJS-092E20?style=flat&logo=next.js&logoColor=white)&nbsp;
![NextJS](https://img.shields.io/badge/NestJS-092E20?style=flat&logo=nestjs&logoColor=white)&nbsp;


## 🧰 &nbsp;Version Controll & Tools 

![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)&nbsp;
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)&nbsp;
![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)&nbsp;

## Autores

[<sub>Juan Pablo Valdebenito</sub>](https://github.com/zlSirodev)<br>
[<sub>Diana Guerrero</sub>](https://github.com/DiaGuerrero)<br>
[<sub>Jeremy Perez</sub>]()<br>
[<sub>Paulina Muñoz</sub>]()<br>
[<sub>Jeremy Perez</sub>]()<br>
<br/>
Copyright © 2025. Integracion de Plataformas.

