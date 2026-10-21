# Pedidos360 – Frontend

Frontend de **Pedidos360**, una plataforma para gestionar pedidos de cafeterías y panaderías. Está hecho con **Angular 22** (componentes standalone) y usa **Microsoft Entra ID (Azure AD)** con **MSAL** para iniciar sesión.

---

## Tabla de contenidos

1. [Tecnologías](#tecnologías)
2. [Requisitos previos](#requisitos-previos)
3. [Instalación y ejecución](#instalación-y-ejecución)
4. [Autenticación con Azure (MSAL)](#autenticación-con-azure-msal)
5. [Rutas de la aplicación](#rutas-de-la-aplicación)
6. [Estructura del proyecto](#estructura-del-proyecto)
7. [Scripts disponibles](#scripts-disponibles)
8. [Pruebas](#pruebas)
9. [Build de producción](#build-de-producción)
10. [Solución de problemas](#solución-de-problemas)

---

## Tecnologías

| Herramienta | Versión | Uso |
|---|---|---|
| Angular | 22.x | Framework del frontend |
| @azure/msal-angular | 6.x | Integración de MSAL con Angular (guard e interceptor) |
| @azure/msal-browser | 5.x | Cliente de autenticación con Microsoft Entra ID |
| RxJS | 7.8 | Programación reactiva |
| TypeScript | 6.0 | Lenguaje |
| Vitest + jsdom | 4.x | Pruebas unitarias |
| Prettier | 3.x | Formato de código |

---

## Requisitos previos

- **Node.js**: una versión compatible con Angular 22: `^22.22.3`, `^24.15.0` o `>=26.0.0`.
  Para revisar la tuya:
  ```bash
  node -v
  ```
- **npm** 11 o superior (el proyecto declara `npm@11.13.0`).
- **Angular CLI** (opcional; también se puede usar con `npx`):
  ```bash
  npm install -g @angular/cli
  ```
- Una **cuenta de Microsoft** del tenant de Azure configurado, para poder iniciar sesión.
- *(Opcional)* El **backend** de Pedidos360 corriendo en `http://localhost:8080/`. Por ahora el frontend no hace llamadas al backend, así que no es necesario para ver las pantallas.

---

## Instalación y ejecución

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Nicolas091109/pedidos360-frontend-cuevas-ravanal-hernandez.git
   cd pedidos360-frontend-cuevas-ravanal-hernandez
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Levantar el servidor de desarrollo**
   ```bash
   npm start
   ```
   (equivale a `ng serve`).

4. **Abrir el navegador** en:
   ```
   http://localhost:4200/
   ```

> ⚠️ **Hay que usar el puerto 4200.** La URL de redirección de Azure está configurada como `http://localhost:4200`. Si la app corre en otro puerto (por ejemplo, `ng serve --port 4300`), el login va a fallar con un error de *redirect URI mismatch*.

La aplicación se recarga sola cada vez que se guarda un archivo dentro de `src/`.

---

## Autenticación con Azure (MSAL)

La configuración de autenticación está en [`src/app/auth-config.ts`](src/app/auth-config.ts):

| Parámetro | Valor actual | Descripción |
|---|---|---|
| `TENANT_ID` | `8d6f1b21-2f45-42ed-a451-025b1954fc47` | Tenant de Microsoft Entra ID |
| `CLIENT_ID` | `238dfb81-d629-4f98-a61b-acaa009c3f47` | App registration del frontend (SPA) |
| `apiScope` | `api://d8ff5f57-bec7-4301-bfb0-d897468198de/access-all` | Scope expuesto por la API del backend |
| `redirectUri` / `postLogoutRedirectUri` | `http://localhost:4200` | A dónde vuelve el usuario después de iniciar o cerrar sesión |
| `apiBaseUrl` | `http://localhost:8080/` | URL base del backend |
| `cacheLocation` | `LocalStorage` | Dónde guarda MSAL los tokens |

### Cómo funciona
