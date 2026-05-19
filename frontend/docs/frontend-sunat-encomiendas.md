# Frontend SUNAT y Encomiendas

## Variables de entorno

El frontend usa:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Si el backend corre en `8002`, cambiar a:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8002/api/v1
```

## Levantar frontend

```bash
cd C:\Users\angel\Desktop\Front-Carmencita\frontend
npm install
npm run dev
```

## Levantar backend

```bash
cd C:\Users\angel\Desktop\CarmencitaExpress
uvicorn app.main:app --reload --port 8000
```

Si el puerto `8000` esta ocupado:

```bash
uvicorn app.main:app --reload --port 8002
```

Luego actualizar `VITE_API_BASE_URL` en el frontend.

## Probar /health

Abrir `Conexion backend` en el menu y presionar `Validar conexion`.

La pantalla prueba:

- `GET /health`
- fallback `GET /`
- `GET /api/v1/encomiendas`
- disponibilidad de ruta SUNAT PDF mock sin emitir boletas automaticamente

No llama RENIEC, payments ni Yape.

## Listado de encomiendas

Abrir `/encomiendas`.

Consume:

```http
GET /api/v1/encomiendas
```

Si aparece vacio, confirmar que existan encomiendas persistidas en PostgreSQL.

## Crear encomienda

Abrir `/encomiendas/nueva` y usar un payload como:

```json
{
  "remitente_tipo_documento": "DNI",
  "remitente_numero_documento": "76619947",
  "remitente_nombre": "Stefano Yepez Zapata",
  "remitente_direccion": "Trujillo",
  "remitente_telefono": "999999999",
  "destinatario_tipo_documento": "DNI",
  "destinatario_numero_documento": "87654321",
  "destinatario_nombre": "Vania Melissa Ramos Cotrina",
  "destinatario_direccion": "Angasmarca",
  "destinatario_telefono": "988888888",
  "origen": "Trujillo",
  "destino": "Angasmarca",
  "descripcion": "Caja mediana con documentos",
  "peso_kg": 3.5,
  "largo_cm": 40,
  "ancho_cm": 30,
  "alto_cm": 25,
  "fragilidad": "MEDIA"
}
```

Consume:

```http
POST /api/v1/encomiendas
```

El codigo de encomienda lo genera el backend. No se escribe manualmente.

## Buscar por codigo

Abrir `/encomiendas/buscar` y buscar un codigo devuelto por el backend.

Consume:

```http
GET /api/v1/encomiendas/codigo/{codigo_encomienda}
```

## Calcular cotizacion

Desde `/cotizacion` o desde acciones de encomienda, ingresar `encomienda_id`.

Consume:

```http
POST /api/v1/cotizaciones/calcular
```

Body:

```json
{
  "encomienda_id": 1
}
```

## Emitir boleta SUNAT desde encomienda

Abrir `/sunat/boletas`, ingresar `encomienda_id` y presionar `Emitir boleta`.

Consume:

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

## Abrir PDF mock

Despues de emitir en ambiente mock, usar `Abrir / descargar PDF mock`.

Consume:

```http
GET /api/v1/sunat/boletas/mock/{serie}/{numero}/pdf
```

## Probar PDF beta

Con backend en `SUNAT_ENV=beta` y Lycet levantado, usar `Generar PDF beta`.

Consume:

```http
POST /api/v1/sunat/boletas/beta/pdf-desde-encomienda
```

## Probar XML beta

Con backend en `SUNAT_ENV=beta` y Lycet levantado, usar `Generar XML beta`.

Consume:

```http
POST /api/v1/sunat/boletas/beta/xml-desde-encomienda
```

## Si Lycet no responde

La UI muestra un error claro de Lycet no disponible. Revisar que el servicio de Lycet este levantado y que la configuracion del backend apunte a la URL correcta.

## Si hay CORS

Verificar la configuracion de origenes permitidos en FastAPI y que el frontend este usando el host/puerto correcto.

## Si el CRUD de encomiendas aun no tiene logica completa

El backend actual debe tener CRUD persistente en PostgreSQL:

- `POST /api/v1/encomiendas` crea y guarda en PostgreSQL.
- `GET /api/v1/encomiendas` lista desde PostgreSQL.
- `GET /api/v1/encomiendas/{id}` busca en PostgreSQL.
- `GET /api/v1/encomiendas/codigo/{codigo}` busca en PostgreSQL.
- `PUT /api/v1/encomiendas/{id}` actualiza en PostgreSQL.
- `DELETE /api/v1/encomiendas/{id}` anula logicamente en PostgreSQL.

DELETE no borra fisicamente la fila: cambia el estado a `ANULADA`.

## Modulos no tocados

Esta integracion no modifica ni llama:

- RENIEC
- payments / Mercado Pago
- Yape
