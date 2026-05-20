# Frontend CRUD de Encomiendas

## Variable de entorno

El frontend consume el backend con:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

El CRUD de encomiendas debe leer siempre `VITE_API_BASE_URL`.

## Levantar frontend

```bash
cd C:\Users\angel\Desktop\Front-Carmencita\frontend
npm install
npm run dev
```

## Levantar backend

```bash
cd C:\Users\angel\Desktop\CarmencitaExpress
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

## Listado

Abrir `/encomiendas`.

Consume:

```http
GET /api/v1/encomiendas
```

La tabla muestra codigo, remitente, destinatario, ruta, descripcion, peso, fragilidad, estado y acciones.

## Crear encomienda

Abrir `/encomiendas/nueva`.

Consume:

```http
POST /api/v1/encomiendas
```

La creacion guarda en PostgreSQL mediante el backend. Si el backend falla, no se simula exito.

## Autocompletado RENIEC

En crear y editar, si el tipo de documento es `DNI` y el campo tiene 8 digitos, al salir del campo se consulta:

```http
GET /api/v1/reniec/{dni}
```

Se autocompleta:

- `remitente_nombre`
- `destinatario_nombre`

Si RENIEC falla o no encuentra datos, se muestra aviso y se permite ingresar el nombre manualmente.

## Editar encomienda

Abrir `/encomiendas/{id}/editar`.

Consume:

```http
GET /api/v1/encomiendas/{id}
PUT /api/v1/encomiendas/{id}
```

El formulario no permite editar `codigo_encomienda`. En el payload de actualizacion no se envia `id`, `codigo_encomienda`, `created_at` ni `updated_at`.

La actualizacion impacta PostgreSQL mediante backend.

## Anular encomienda

Desde listado o detalle, usar `Anular`.

Consume:

```http
DELETE /api/v1/encomiendas/{id}
```

Antes de llamar al backend se pide confirmacion. Si el backend responde correctamente, el estado cambia a `ANULADA`. No se elimina visualmente sin respuesta exitosa.

Backend realiza DELETE logico en PostgreSQL.

## Buscar por codigo

Abrir `/encomiendas/buscar`.

Consume:

```http
GET /api/v1/encomiendas/codigo/{codigo}
```

## Cotizacion desde encomienda

Desde listado o detalle se consume:

```http
POST /api/v1/cotizaciones/calcular
```

Body:

```json
{
  "encomienda_id": 1
}
```

Si la encomienda esta `ANULADA`, el frontend no permite cotizar.

## SUNAT desde encomienda

Desde listado o detalle se consume:

```http
POST /api/v1/sunat/boletas/emitir-desde-encomienda
```

Body:

```json
{
  "encomienda_id": 1,
  "confirmar_pago": true
}
```

Si la respuesta mock trae `pdf_url`, se descarga el PDF mock. En beta se usa:

```http
POST /api/v1/sunat/boletas/beta/pdf-desde-encomienda
POST /api/v1/sunat/boletas/beta/xml-desde-encomienda
```

Si la encomienda esta `ANULADA`, el frontend no permite emitir boleta.

## Comprobacion en PostgreSQL

- Crear debe insertar una fila en `encomiendas`.
- Editar debe actualizar la fila correspondiente.
- Anular debe cambiar `estado` a `ANULADA`.

## Modulos no modificados

Esta tarea no modifica:

- Backend
- Payments / Mercado Pago
- Yape
- Logica interna SUNAT
