# Reporte de ejecución QA

Fecha: 19 de junio de 2026

## Resultado general

La lógica principal de registro, pagos controlados, encomiendas, clientes, roles, optimización, etiquetas y persistencia fue validada. No se dejaron registros `TEST_QA` en PostgreSQL.

## Ejecuciones

| Comando o comprobación | Resultado |
|---|---|
| `pytest -q --cov=app` | 29 aprobadas, 0 fallidas, cobertura total 68% |
| `python -m compileall -q app` | Aprobado |
| `npm test` | 5 archivos, 12 pruebas aprobadas |
| `npm run lint` | 0 errores, 86 advertencias |
| `npm run build` | Aprobado |
| Playwright escritorio | 10 escenarios aprobados en ejecución estable |
| Playwright móvil | 10 escenarios aprobados en ejecuciones estables |
| `docker build` backend | Aprobado |
| `docker build` frontend | Aprobado después de corregir Rollup para Alpine |
| PostgreSQL mediante SQLAlchemy | Encomienda, dos clientes y log persistidos y verificados |
| Rollback QA PostgreSQL | Encomienda y log eliminados; base sin contaminación |
| Lycet beta | Bloqueado por `ConnectionError` |

## Cobertura implementada

Backend:

- Validaciones Pydantic.
- Repositorios y servicios de clientes y encomiendas.
- Creación, confirmación, actualización, anulación y entrega.
- Etiqueta PDF y QR.
- Registro de logs de cobro.
- Pagos con respuestas aprobadas y fallidas controladas.
- SUNAT mock/beta a nivel de contrato.
- Roles, permisos y rutas de optimización.
- Restricciones geométricas y capacidad de carga.

Frontend:

- Validación de formularios.
- Jerarquía de ubicaciones.
- Acceso por rol y sesión por pestaña.
- Confirmación, tracking y etiqueta.
- Flujos de agencia, tarjeta y Yape.
- Navegación pública y administrativa.
- Optimización 3D, cámaras y carga progresiva.
- Escritorio y viewport móvil.

## Persistencia PostgreSQL

Se ejecutó una transacción real con SQLAlchemy sobre la base configurada:

1. Se creó una encomienda QA.
2. Se verificó el alta o actualización de remitente y destinatario.
3. Se creó un registro en `logs_de_cobro` con tiempo en milisegundos.
4. Se consultaron los cuatro registros dentro de la transacción.
5. Se ejecutó rollback.
6. Se comprobó que la encomienda y el log ya no existían.

Resultado: persistencia y rollback aprobados.

## Incidencias detectadas

### Playwright agregado

Una repetición que intentó ejecutar todos los escenarios con servidor Vite y WebGL en una sola invocación quedó abierta hasta timeout. Las mismas pruebas aprobaron al ejecutarse en lotes estables por viewport. La incidencia corresponde al cierre del runner/Chromium, no a una aserción funcional.

### Dependencia Rollup en Docker

El lockfile creado en Windows no incluía `@rollup/rollup-linux-x64-musl`. El Dockerfile ahora instala el binario en la etapa Alpine antes de compilar.

### Advertencias técnicas

- ESLint reporta 86 advertencias, principalmente imports `React` no usados y variables de excepciones.
- Vite genera un chunk JavaScript de aproximadamente 1.31 MB por React Three Fiber/Three.js.
- FastAPI advierte que `on_event("startup")` está deprecado y recomienda lifespan.
- `npm audit` informa 13 vulnerabilidades: 1 baja, 4 moderadas, 7 altas y 1 crítica. No se aplicó `--force` porque podría introducir cambios incompatibles.

## Servicios externos

Mercado Pago:

- Las credenciales configuradas son de prueba.
- Los estados aprobado, pendiente, rechazado y error están cubiertos con respuestas controladas.
- La ejecución real completa del Brick contra sandbox queda pendiente de una sesión interactiva estable.

SUNAT/Lycet:

- El entorno configurado es `beta`.
- La emisión real está deshabilitada por configuración.
- El host Lycet no respondió durante esta ejecución.
- PDF/XML y contrato de emisión están cubiertos por pytest.

## Alembic y SQLAlchemy

- SQLAlchemy permanece como ORM y capa de persistencia.
- Alembic fue retirado del repositorio y del Dockerfile.
- No se ejecutaron migraciones Alembic.

## Criterio de cierre

El sistema queda con pruebas automatizadas reproducibles y documentación QA. Antes de una liberación productiva deben resolverse las vulnerabilidades npm, repetir Mercado Pago sandbox sin mocks y validar Lycet beta disponible.
