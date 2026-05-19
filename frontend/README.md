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

## Estructura

- `src/components`: componentes reutilizables y layout principal.
- `src/pages`: pantallas funcionales con datos simulados.
- `src/services`: capa preparada para conectar con FastAPI mediante Axios.
- `src/data`: datos mock usados por la maqueta.
- `src/routes`: definicion centralizada de rutas.

La autenticacion no esta implementada todavia. La estructura queda lista para agregar una futura carpeta `auth`.
