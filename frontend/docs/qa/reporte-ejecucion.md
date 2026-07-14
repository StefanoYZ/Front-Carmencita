# Reporte de ejecucion QA

Fecha: 7 de julio de 2026

## Resultado general

Se reviso el tooling existente antes de agregar pruebas. El proyecto ya tenia cobertura con Vitest, Playwright y pytest, por lo que se agregaron escenarios nuevos sobre brechas concretas: coherencia entre tipo de contenido y descripcion, sobres sin cubicaje, base/orientacion de paquetes, origen y destino iguales, y validaciones equivalentes en backend.

## Cambios de cobertura agregados

Frontend:

- 30 escenarios unitarios de coherencia tipo/descripcion con casos validos e invalidos.
- Casos unitarios para sobres que ignoran dimensiones, fragilidad y orientacion residual.
- Casos unitarios para paquetes que exigen orientacion/base y bloquean electrodomesticos mal orientados.
- Casos E2E de caja negra para cotizacion publica con origen/destino iguales.
- Casos E2E de caja negra para cotizacion de sobres sin medidas ni selector 3D.
- Casos E2E de caja negra para registro publico con origen/destino iguales.
- Casos E2E de caja negra para registro publico con tipo de contenido incoherente.
- Se corrigio una brecha real detectada por las pruebas: `conservas`, `galletas`, `fideos`, `huevos` y otros plurales de alimentos no se inferian como alimentos.

Backend:

- Casos de schema para rechazar dimensiones 0 en paquetes no documentarios.
- Caso de schema para rechazar paquetes sin `orientacion_base`.
- Caso de schema para normalizar `orientacion_base` a `None` en documentos/sobres.
- Casos de schema para rechazar o aceptar orientacion de electrodomesticos segun la base seleccionada.

## Ejecuciones realizadas

| Comando | Resultado |
|---|---|
| `npm run test -- shipmentValidation publicShipment` | 49 pruebas aprobadas |
| `npm run test` | 65 pruebas aprobadas |
| `npm run test:e2e -- validacion-entradas.spec.js` | 12 escenarios aprobados |
| `npm run test:e2e` | 30 escenarios aprobados |
| `npm run build` | Aprobado |
| `npm run lint` | 0 errores, 104 advertencias preexistentes |
| `compileall` sobre archivos backend tocados | Aprobado |
| `pytest app/tests/test_validations.py app/tests/test_optimization_restrictions.py` | Bloqueado por venv backend rota |

## Bloqueos tecnicos

La ejecucion de pytest backend no pudo completarse porque la venv de `C:\Users\angel\Desktop\CarmencitaExpress` apunta a:

```text
C:\Users\angel\AppData\Local\Programs\Python\Python311\python.exe
```

Ese ejecutable no esta disponible en esta sesion. Tambien fallo `python` en PATH y el launcher `py` no encontro versiones instaladas. Para validar sintaxis se ejecuto `compileall` con el Python empaquetado de Codex.

## Observaciones

- Playwright levanto y ejecuto el flujo de validaciones correctamente.
- Vite build conserva la advertencia de chunk grande por Three.js/React Three Fiber.
- ESLint no arrojo errores; las advertencias son principalmente imports `React` no usados y variables `error` no usadas ya existentes.
- No se tocaron pagos, Yape, RENIEC, SUNAT ni Lycet en esta pasada QA.

## Pendientes recomendados

- Reparar o recrear la venv backend con Python 3.11 para ejecutar `pytest` completo.
- Ejecutar `pytest` backend completo cuando la venv este disponible.
- Ejecutar Playwright completo si se necesita certificacion total de flujo, no solo validaciones.
- Revisar advertencias ESLint en una tarea separada para no mezclar QA con refactor de estilo.
