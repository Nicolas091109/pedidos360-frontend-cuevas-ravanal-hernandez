# Pedidos360 — Frontend

Aplicación web de **Pedidos360**, desarrollada con **Angular 22** y TypeScript para gestionar pedidos de cafeterías y panaderías. Incluye inicio de sesión mediante **Microsoft Entra ID** (MSAL), consulta y actualización de pedidos, y visualización de notificaciones.

> **Estado del proyecto:** la pantalla de inicio es pública; las páginas de pedidos y notificaciones requieren autenticación. Estas dos páginas **sí consumen servicios del backend**. En la versión revisada no existe una página de administración de productos o categorías.

## Tecnologías

| Tecnología | Uso |
| --- | --- |
| Angular 22 | Framework frontend con componentes standalone |
| TypeScript 6 | Desarrollo de la aplicación |
| Microsoft Authentication Library (`@azure/msal-angular` y `@azure/msal-browser`) | Autenticación con Microsoft Entra ID |
| Angular `HttpClient` | Comunicación HTTP con el backend |
| RxJS | Operaciones asíncronas |
| Vitest | Pruebas unitarias |
| Docker y Nginx | Compilación y publicación de la aplicación |

Las versiones exactas y los scripts se encuentran en [`package.json`](package.json).

## Requisitos previos

Para ejecutarlo localmente necesitas:

- **Node.js 24** en una versión compatible con Angular 22, y npm. El `Dockerfile` también utiliza Node 24 para compilar.
- Acceso a una terminal, como PowerShell o la terminal de VS Code.
- Una cuenta con acceso al **tenant de Microsoft Entra ID** configurado, si necesitas iniciar sesión.
- Para consultar pedidos y notificaciones, el **API Gateway/backend de Pedidos360** accesible desde el navegador.

Comprueba las versiones instaladas:

```bash
node --version
npm --version
```

> El proyecto declara `npm@11.13.0` en `package.json`. Si aparece un error de compatibilidad, revisa la versión de Node y npm utilizada.

## Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/Nicolas091109/pedidos360-frontend-cuevas-ravanal-hernandez.git
cd pedidos360-frontend-cuevas-ravanal-hernandez
```

Si ya descargaste o descomprimiste el proyecto, simplemente abre su carpeta raíz (donde está `package.json`) en VS Code y abre una terminal.

### 2. Instalar dependencias

```bash
npm ci
```

Se recomienda `npm ci` porque el repositorio incluye `package-lock.json`. Como alternativa, se puede usar `npm install` si necesitas actualizar el archivo de bloqueo.

### 3. Revisar la configuración del backend y de autenticación

Abre [`src/app/auth-config.ts`](src/app/auth-config.ts). En el código entregado aparecen estas configuraciones:

```ts
// URL base del gateway/backend:
export const apiBaseUrl = 'http://localhost:8080/';

// En msalConfig.auth:
redirectUri: 'http://localhost:4200',
postLogoutRedirectUri: 'http://localhost:4200',
```

La URL de `apiBaseUrl` debe apuntar al **gateway que sirve `/api/orders` y `/api/notify`**, no directamente al microservicio de catálogo. Si el backend está en otro host, puerto o API Gateway de AWS, cambia esta dirección por su URL pública correspondiente. Conserva la barra final (`/`) porque las rutas se concatenan directamente.

La autenticación utiliza también `TENANT_ID`, `CLIENT_ID` y `apiScope` definidos en ese mismo archivo. Para que el inicio de sesión funcione, la aplicación registrada en Entra ID debe admitir la URI de redirección configurada y conceder el scope solicitado.

> **Importante:** el archivo de configuración contiene identificadores públicos de la aplicación, **no** una contraseña. No agregues secretos de cliente, contraseñas ni claves privadas al código del frontend.

### 4. Iniciar Angular

```bash
npm start
```

Equivale a `ng serve` y utiliza el servidor de desarrollo definido en `angular.json`.

Abre en el navegador:

**http://localhost:4200/**

Angular recargará la aplicación cuando guardes cambios.

> **Autenticación:** la URI de redirección actual es `http://localhost:4200`. Si cambias el puerto de Angular, también debes actualizar `redirectUri` y `postLogoutRedirectUri`, y registrar la nueva URI en Microsoft Entra ID. De lo contrario, el inicio de sesión puede fallar.

## Funciones y rutas

| Ruta de Angular | Acceso | Funcionalidad |
| --- | --- | --- |
| `/` | Público | Inicio, presentación del proyecto y carrusel de imágenes |
| `/pedidos` | Requiere inicio de sesión (`MsalGuard`) | Listar, buscar, filtrar y cambiar el estado de pedidos |
| `/notificaciones` | Requiere inicio de sesión (`MsalGuard`) | Listar, buscar y filtrar notificaciones |

Las rutas están definidas en [`src/app/app.routes.ts`](src/app/app.routes.ts).

### Comunicación con los microservicios

El frontend **sí realiza llamadas al backend** mediante Angular `HttpClient`:

| Método | Endpoint (relativo a `apiBaseUrl`) | Uso |
| --- | --- | --- |
| `GET` | `api/orders` | Obtener pedidos |
| `PATCH` | `api/orders/{id}/estado?nuevoEstado={estado}` | Actualizar el estado de un pedido |
| `GET` | `api/notify` | Consultar notificaciones |

Por ejemplo, con el valor actual `apiBaseUrl = 'http://localhost:8080/'`, la consulta de pedidos se dirige a:

```text
http://localhost:8080/api/orders
```

Estas operaciones requieren que las rutas correspondientes estén disponibles en el gateway y, según la configuración del backend, que el usuario tenga permisos y envíe un token válido.

**MSAL** está configurado para adjuntar tokens de acceso a las solicitudes que coincidan con la URL protegida (`protectedResourceMap` en `src/app/app.config.ts`). Si cambias el destino de la API, revisa también que la configuración del scope y de autorización siga siendo válida.

> Las rutas de **catálogo (productos y categorías)** pertenecen al backend, pero la versión de este frontend revisada aquí **no contiene componentes ni llamadas HTTP para gestionarlas**.

## Autenticación con Microsoft Entra ID

Los archivos relacionados con autenticación son:

- [`src/app/auth-config.ts`](src/app/auth-config.ts): configuración de MSAL, tenant, client ID, scope, redirecciones y URL del backend.
- [`src/app/app.config.ts`](src/app/app.config.ts): inicialización de MSAL, `MsalGuard`, `MsalInterceptor` y `HttpClient`.
- [`src/app/app.routes.ts`](src/app/app.routes.ts): protección de `/pedidos` y `/notificaciones`.

**Flujo esperado:** el usuario selecciona **Iniciar sesión con Microsoft**, Microsoft Entra ID procesa el inicio de sesión y lo devuelve a la URI configurada. Luego puede entrar en las páginas protegidas y el interceptor MSAL gestiona el token de las solicitudes HTTP protegidas.

**Si aparece una pantalla solicitando aprobación de un administrador**, verifica la configuración del tenant, los permisos de la aplicación y el consentimiento requerido para `apiScope`. No es un problema que se resuelva solamente reiniciando Angular.

## Ejecución con Docker

El repositorio incluye un [`Dockerfile`](Dockerfile) multietapa:

1. Compila Angular usando una imagen de **Node 24 Alpine**.
2. Copia los archivos generados a **Nginx Alpine**.
3. Sirve la aplicación en el **puerto 8080 dentro del contenedor**.

### 1. Construir la imagen

Desde la raíz del proyecto:

```bash
docker build -t pedidos360-frontend .
```

### 2. Ejecutar el contenedor

Si el puerto `8080` de tu computador está libre:

```bash
docker run --rm --name pedidos360-frontend -p 8080:8080 pedidos360-frontend
```

Abre **http://localhost:8080/**.

Si **tu backend o gateway ya ocupa `localhost:8080`**, utiliza otro puerto para el frontend:

```bash
docker run --rm --name pedidos360-frontend -p 8081:8080 pedidos360-frontend
```

Abre **http://localhost:8081/**.

**Consideraciones importantes para Docker:**

- El `Dockerfile` configura Nginx para reenviar solicitudes recibidas en `/api/` hacia `http://host.docker.internal:8080`. Es necesario que ese destino sea accesible desde el contenedor. En Docker Desktop suele estar disponible; en Linux puede requerir configurar explícitamente el host.
- El frontend compilado **sigue teniendo** `apiBaseUrl = 'http://localhost:8080/'`, porque esa constante se establece en el código Angular durante la compilación. Por tanto, las solicitudes actuales no utilizan automáticamente el proxy Nginx si se hacen con esa URL absoluta. En el navegador `localhost` se refiere al computador del usuario.
- Con el mismo puerto `8080` **no pueden coexistir** el gateway del host y el frontend publicado en el host. Ajusta los puertos y la configuración según tu despliegue.
- Para iniciar sesión desde `http://localhost:8080` o `http://localhost:8081`, debes actualizar las URI de redirección en el código, registrar las URI correspondientes en Entra ID y **reconstruir la imagen**. La configuración actual (`http://localhost:4200`) está preparada para el servidor local de Angular.

> **Recomendación:** para desarrollar y probar funcionalidades con MSAL, utiliza primero `npm start` en el puerto `4200`. Usa Docker cuando hayas definido las direcciones finales del frontend, del backend y de la redirección de autenticación.

## Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `npm ci` | Instala las dependencias a partir del archivo de bloqueo |
| `npm start` | Ejecuta la aplicación en modo desarrollo |
| `npm run build` | Genera la compilación de producción |
| `npm run watch` | Compila automáticamente en modo desarrollo al detectar cambios |
| `npm test` | Ejecuta el sistema de pruebas configurado por Angular |

La salida de producción se configura mediante `angular.json`; el `Dockerfile` espera los archivos estáticos en `dist/frontend-pedidos/browser`.

### Pruebas

```bash
npm test
```

El repositorio contiene pruebas en archivos `*.spec.ts`. **No se garantiza que todas pasen sin cambios**: por ejemplo, `src/app/app.spec.ts` todavía contiene una comprobación de texto del proyecto inicial generado por Angular. Conviene actualizarla para reflejar el contenido actual antes de utilizar las pruebas como validación de entrega.

## Estructura principal

```text
pedidos360-frontend-cuevas-ravanal-hernandez/
├── public/
│   └── images/                  # Imágenes del carrusel de inicio
├── src/
│   ├── app/
│   │   ├── paginas/
│   │   │   ├── home/             # Página de inicio
│   │   │   ├── pedidos/          # Consulta y cambio de estado de pedidos
│   │   │   └── notificaciones/   # Consulta y filtrado de notificaciones
│   │   ├── app.config.ts        # Proveedores de Angular y MSAL
│   │   ├── app.routes.ts        # Rutas protegidas y públicas
│   │   ├── app.ts               # Componente principal
│   │   └── auth-config.ts       # Autenticación y URL del backend
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── angular.json
├── Dockerfile
├── package.json
├── package-lock.json
└── README.md
```

## Problemas frecuentes

| Síntoma | Qué revisar |
| --- | --- |
| `npm` no se reconoce | Instalar Node.js, reiniciar la terminal y verificar `node --version` / `npm --version`. |
| Error al instalar dependencias | Revisar compatibilidad de Node y npm; ejecutar `npm ci` desde la carpeta con `package.json`. |
| No se puede iniciar sesión o aparece `redirect_uri_mismatch` | Confirmar que la URI usada en el navegador coincida con `redirectUri` y con la registrada en Microsoft Entra ID. |
| Microsoft solicita consentimiento de administrador | Revisar permisos de la aplicación, scope y políticas del tenant con el administrador. |
| Pedidos o notificaciones muestran error | Confirmar que el gateway y los microservicios estén activos, que `apiBaseUrl` sea correcta, y revisar el error HTTP en las herramientas de desarrollo. |
| Respuesta `401` o `403` | Revisar sesión, token, audiencia, scope y autorizaciones del backend. |
| Error de CORS | Autorizar el origen del frontend en el gateway/backend, incluidos métodos y encabezados necesarios. |
| En Docker aparece la página predeterminada de Nginx | Verificar que la imagen se haya reconstruido a partir del `Dockerfile` del proyecto y que el contenedor correcto esté publicado. |
| Error al acceder a `/pedidos` o `/notificaciones` tras recargar | Verificar el fallback de Nginx (`try_files ... /index.html`), que está incluido en el `Dockerfile`. |

## Notas para el repositorio

- **No subas `node_modules/`, `dist/` ni `.angular/cache/`**. El `.gitignore` del proyecto ya contempla estas carpetas.
- Conviene agregar un archivo `.dockerignore` para evitar enviar `node_modules/`, `.git/`, `.angular/` y `dist/` al contexto de compilación de Docker.
- Las URLs de los servicios y de las redirecciones deben revisarse al pasar de desarrollo local a AWS u otro entorno.
- Este documento se basa en el código y los archivos de configuración entregados. No certifica que el acceso al tenant de Entra ID o a los endpoints del backend esté operativo en el entorno donde se ejecute.
