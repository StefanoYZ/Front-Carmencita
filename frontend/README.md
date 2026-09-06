# Carmencita Smart System - Frontend

Frontend inicial para el sistema web de Carmencita Express Cargo. La aplicacion esta construida con React, Vite, Tailwind CSS, React Router DOM y Axios.

## Requisitos

- Node.js 18 o superior
- npm

## Instalacion

```bash
npm install
```

## Ejecucion local

```bash
npm run dev
```

Por defecto Vite levantara la aplicacion en `http://localhost:5173`.

## Variables de entorno

Copia `.env.example` a `.env` y ajusta la URL del backend cuando FastAPI este disponible.

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

En produccion, el frontend llama directamente a la URL publica de Cloud Run. No depende de un proxy de Firebase Hosting.

## Despliegue en Firebase Hosting

El workflow `.github/workflows/deploy.yml` ejecuta las pruebas unitarias, construye `frontend/dist` y despliega exactamente ese artefacto en cada push a `main`. La autenticacion con Google Cloud usa Workload Identity Federation y credenciales temporales; no se almacena una clave JSON.

Configura estas variables del repositorio en GitHub Actions:

- `BACKEND_API_BASE_URL`: URL publica completa de la API en Cloud Run, incluido `/api/v1`.
- `GCP_PROJECT_ID`: ID del proyecto que contiene Firebase Hosting.
- `GCP_WORKLOAD_IDENTITY_PROVIDER`: nombre completo del proveedor, por ejemplo `projects/123456789/locations/global/workloadIdentityPools/github-actions/providers/github`.
- `GCP_DEPLOY_SERVICE_ACCOUNT`: correo de la cuenta de servicio autorizada para desplegar Hosting.

El proveedor debe confiar en este repositorio y la cuenta de servicio debe permitir la suplantacion desde el proveedor y tener permisos para desplegar Firebase Hosting. El backend debe incluir el origen de Firebase, por ejemplo `https://<project-id>.web.app`, en su configuracion CORS. Agrega tambien `https://<project-id>.firebaseapp.com` y cualquier dominio personalizado que se utilice.

`firebase.json` publica `frontend/dist`, aplica cache a los recursos estaticos y reescribe las rutas de la SPA a `index.html`. No contiene rewrites hacia Cloud Run.

## Estructura

- `src/components`: componentes reutilizables y layout principal.
- `src/pages`: pantallas funcionales con datos simulados.
- `src/services`: capa preparada para conectar con FastAPI mediante Axios.
- `src/data`: datos mock usados por la maqueta.
- `src/routes`: definicion centralizada de rutas.

La autenticacion no esta implementada todavia. La estructura queda lista para agregar una futura carpeta `auth`.
