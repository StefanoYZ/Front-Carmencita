# Checklist de pruebas del sistema completo

Fecha de revision: 7 de julio de 2026

## Convenciones

- `APROBADA`: prueba automatizada ejecutada correctamente en esta pasada o cubierta por suite existente.
- `PARCIAL`: existe cobertura local/controlada, pero falta proveedor externo o entorno real.
- `BLOQUEADA`: no se pudo ejecutar por entorno.
- `MANUAL`: requiere revision humana, credenciales o dispositivo fisico.

## Frontend

| Area | Escenario | Evidencia | Estado |
|---|---|---|---|
| Landing | Navegacion por menu y CTA de registro | Playwright existente | APROBADA |
| Landing | Mapa y seccion contacto | Checklist funcional | MANUAL |
| Cotizacion publica | Peso 0 | `validacion-entradas.spec.js` | APROBADA |
| Cotizacion publica | Peso mayor a 5470 kg | `validacion-entradas.spec.js` | APROBADA |
| Cotizacion publica | Origen y destino iguales | `validacion-entradas.spec.js` | APROBADA |
| Cotizacion publica | Sobres sin dimensiones ni base 3D | `validacion-entradas.spec.js` | APROBADA |
| Registro publico | Peso 0 | `validacion-entradas.spec.js` | APROBADA |
| Registro publico | Peso mayor a 5470 kg | `validacion-entradas.spec.js` | APROBADA |
| Registro publico | Origen y destino iguales | `validacion-entradas.spec.js` | APROBADA |
| Registro publico | Tipo/descripcion incoherente | `validacion-entradas.spec.js` + Vitest | APROBADA |
| Registro publico | DNI, telefono, correo | Vitest `shipmentValidation` | APROBADA |
| Registro publico | Sobres ignoran dimensiones/base residual | Vitest `publicShipment` | APROBADA |
| Registro publico | Paquetes exigen base/orientacion | Vitest `publicShipment` | APROBADA |
| Registro publico | Electrodomestico con base insegura | Vitest `publicShipment` | APROBADA |
| Registro exitoso | Etiqueta PDF para encomienda formal | Vitest existente | APROBADA |
| Registro exitoso | Boleta Lycet para encomienda formal | Vitest existente | APROBADA |
| Registro exitoso | Pre-registro no imprime etiqueta | Vitest existente | APROBADA |
| Pagos | Mercado Pago Brick solo tarjeta | Vitest existente | APROBADA |
| Pagos | Pago sandbox real tarjeta | Requiere proveedor externo | PARCIAL |
| Yape | Flujo controlado aprobado/rechazado | Playwright/pytest existentes | PARCIAL |
| Admin/Secretaria | Peso 0 y maximo | `validacion-entradas.spec.js` | APROBADA |
| Roles | Admin/secretaria/estiba | Playwright existente | APROBADA |
| Optimizacion | Render 3D y avance | Playwright existente | APROBADA |
| Responsive | Escritorio y movil | Pendiente de pasada completa | MANUAL |

## Backend

| Area | Escenario | Evidencia | Estado |
|---|---|---|---|
| Schemas encomiendas | DNI, telefono, correo, fragilidad, limites | pytest existente | APROBADA |
| Schemas encomiendas | Paquete no-documento rechaza dimension 0 | Test agregado | BLOQUEADA por venv |
| Schemas encomiendas | Paquete exige `orientacion_base` | Test agregado | BLOQUEADA por venv |
| Schemas encomiendas | Documento normaliza `orientacion_base` | Test agregado | BLOQUEADA por venv |
| Schemas encomiendas | Electrodomestico rechaza base insegura | Test agregado | BLOQUEADA por venv |
| Clientes | Upsert sin duplicados | pytest existente | BLOQUEADA por venv |
| Pagos | Logs de cobro aprobados/fallidos | pytest existente | BLOQUEADA por venv |
| SUNAT/Lycet | PDF/XML/CDR mock/beta | pytest existente + proveedor | PARCIAL |
| Asistente | Intenciones y wizards principales | pytest existente | BLOQUEADA por venv |
| Optimizacion | Restricciones de electrodomesticos | pytest existente | BLOQUEADA por venv |
| Accesos | 401/403 por rol | pytest existente | BLOQUEADA por venv |

## Ejecucion de esta pasada

| Comando | Estado |
|---|---|
| `npm run test` | APROBADA, 65/65 |
| `npm run test:e2e -- validacion-entradas.spec.js` | APROBADA, 12/12 |
| `npm run test:e2e` | APROBADA, 30/30 |
| `npm run build` | APROBADA |
| `npm run lint` | APROBADA con 104 warnings, 0 errores |
| `compileall` backend focalizado | APROBADA |
| `pytest` backend focalizado | BLOQUEADA por Python 3.11 no disponible en la venv |

## Checklist manual recomendado

- [ ] Flujo completo con pago en agencia desde cliente hasta secretaria.
- [ ] Flujo completo con tarjeta sandbox real.
- [ ] Flujo completo con Yape sandbox/controlado.
- [ ] Emision Lycet beta contra servicio desplegado.
- [ ] Impresion real de etiqueta con QR.
- [ ] Impresion real de boleta.
- [ ] Registro de paquete electrodomestico con seleccion manual de base.
- [ ] Optimizacion con paquetes reales del dia.
- [ ] Vista de estiba en pantalla completa.
- [ ] Login y logout por cada rol.
- [ ] Busqueda de encomienda por DNI/nombre/codigo en secretaria.
- [ ] Entrega solo para encomiendas en destino.
- [ ] Exportacion de reportes.
- [ ] Validacion visual en movil.
