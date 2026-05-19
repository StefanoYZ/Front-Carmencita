# Vista publica Carmencita Express

## Rutas creadas

- `/`: landing publica para cliente externo.
- `/registrar-envio`: vista publica preparada para registro externo.
- `/tracking`: rastreo publico por codigo.
- `/tracking/:codigo`: rastreo publico con codigo precargado.
- `/cotizar`: cotizador visual publico.

## Rutas internas/admin

Las vistas internas quedan bajo `AdminLayout` en:

- `/admin`
- `/admin/clientes`
- `/admin/encomiendas`
- `/admin/encomiendas/nueva`
- `/admin/encomiendas/buscar`
- `/admin/encomiendas/:id`
- `/admin/encomiendas/:id/editar`
- `/admin/cotizaciones`
- `/admin/sunat/boletas`
- `/admin/reniec`
- `/admin/payments`
- `/admin/yape`
- `/admin/tracking`
- `/admin/optimizacion-carga`

## Redirects de compatibilidad

Se agregaron redirects temporales desde rutas internas antiguas:

- `/clientes` -> `/admin/clientes`
- `/encomiendas` -> `/admin/encomiendas`
- `/encomiendas/nueva` -> `/admin/encomiendas/nueva`
- `/encomiendas/buscar` -> `/admin/encomiendas/buscar`
- `/encomiendas/:id` -> `/admin/encomiendas/:id`
- `/encomiendas/:id/editar` -> `/admin/encomiendas/:id/editar`
- `/cotizacion` y `/cotizaciones` -> `/admin/cotizaciones`
- `/sunat`, `/sunat-boletas` y `/sunat/boletas` -> `/admin/sunat/boletas`
- `/reniec` -> `/admin/reniec`
- `/payments` -> `/admin/payments`
- `/yape` -> `/admin/yape`
- `/optimizacion-carga` -> `/admin/optimizacion-carga`

## Layouts

- `src/layouts/PublicLayout.jsx`: header publico, contenido publico y footer simple.
- `src/layouts/AdminLayout.jsx`: reutiliza `MainLayout` interno existente.

## Imagen del camion

La imagen del hero debe estar en:

```text
public/images/hero-camion.png
```

La landing la usa como background con:

```text
url('/images/hero-camion.png')
```

## SVG usados

Los componentes publicos usan SVG desde:

```text
src/assets/icons/
```

Iconos usados: `logo.svg`, `telefono.svg`, `paquete.svg`, `confiable.svg`, `tiempo-rapido.svg`, `apoyo.svg`, `camion.svg`, `marcador-de-posicion.svg`, `pin-de-ubicacion.svg`, `peso.svg`, `fragil.svg` y `lupa.svg`.

## Backend y variable de entorno

Configurar:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

El tracking publico usa el servicio existente:

```text
src/services/encomiendasService.js
```

Funcion:

```text
getEncomiendaByCodigo(codigo)
```

Endpoint consumido:

```text
GET ${VITE_API_BASE_URL}/encomiendas/codigo/{codigo}
```

No se modifico backend.

## Cotizador publico

El cotizador publico es visual por ahora. No calcula una tarifa real porque el endpoint actual de cotizacion interna trabaja con `encomienda_id`. Queda listo para conectarse a un endpoint publico de cotizacion cuando exista.

## Como levantar frontend

```powershell
cd C:\Users\angel\Desktop\Front-Carmencita\frontend
npm install
npm run dev
```

## Pruebas manuales sugeridas

1. Abrir `/` y validar landing publica, header, hero, beneficios, cotizador y tracking.
2. Abrir `/tracking/D000000001` y confirmar que consulta el backend.
3. Probar un codigo inexistente y validar el mensaje de no encontrado.
4. Apagar backend y validar el mensaje de conexion.
5. Abrir `/admin` y confirmar dashboard interno.
6. Abrir `/admin/encomiendas` y confirmar CRUD/listado interno.
7. Abrir `/admin/sunat/boletas`, `/admin/reniec`, `/admin/cotizaciones`, `/admin/payments` y `/admin/yape`.
8. Probar desktop, tablet y movil sin scroll horizontal.

## Confirmacion

- Backend intacto.
- Vistas internas no fueron eliminadas.
- Rutas internas antiguas tienen redirects de compatibilidad.
- Pagos, Yape, RENIEC backend y SUNAT backend no fueron modificados.
