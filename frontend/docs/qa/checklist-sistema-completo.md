# Checklist de pruebas del sistema completo

Fecha de ejecución: 19 de junio de 2026

## Convenciones

- `APROBADA`: comprobación automatizada ejecutada correctamente.
- `PARCIAL`: la lógica local fue comprobada, pero depende de un proveedor externo.
- `BLOQUEADA`: no se pudo ejecutar por indisponibilidad externa.
- `MANUAL`: requiere inspección humana o credenciales/datos operativos.

## Matriz funcional

| Área | Control o flujo | Resultado esperado | Evidencia | Estado |
|---|---|---|---|---|
| Landing | Menú Inicio, Servicios, Destinos, Nosotros y Contacto | Navega a la sección correcta | Playwright escritorio/móvil | APROBADA |
| Landing | Mapa de sede principal | Carga la ubicación configurada | Inspección de interfaz E2E | APROBADA |
| Landing | Registro de envío | Abre `/registrar-envio` | Playwright | APROBADA |
| Cotización | Origen y destino progresivos | Solo muestra distritos de la provincia elegida | Vitest + Playwright | APROBADA |
| Cotización | Peso, dimensiones y fragilidad | Valida valores y habilita Cotizar | Vitest + Playwright | APROBADA |
| Registro | DNI, teléfono, correo y medidas | Bloquea datos inválidos sin desplazar controles | Vitest + pytest + Playwright | APROBADA |
| Registro | Consulta RENIEC no disponible | Permite continuar con ingreso manual | Prueba de contrato backend | APROBADA |
| Registro | Cliente recurrente | Recupera y actualiza datos sin duplicar DNI | pytest + SQLAlchemy | APROBADA |
| Registro | Volver, continuar, cancelar y editar | Conserva estado y cambia de paso una sola vez | Playwright | APROBADA |
| Pago en agencia | Confirmar pre-registro | Crea únicamente una encomienda `PRE_REGISTRADA` | Playwright + pytest | APROBADA |
| Tarjeta | Pago aprobado | Crea una encomienda y habilita etiqueta | Playwright con SDK controlado + pytest | APROBADA |
| Tarjeta | Rechazado, pendiente y error | No duplica encomienda y muestra estado | Playwright/pytest con respuestas controladas | APROBADA |
| Tarjeta | Mercado Pago sandbox real | Procesa mediante proveedor externo | Credenciales TEST detectadas; falta ejecución interactiva estable | PARCIAL |
| Yape | Pago aprobado | Crea una encomienda y registra resultado | Playwright + pytest | APROBADA |
| Yape | Rechazado y error | No crea encomienda y muestra alerta | Playwright/pytest con respuestas controladas | APROBADA |
| Cobros | Log de tarjeta/Yape | Guarda usuario, modalidad, resultado y milisegundos | pytest + transacción PostgreSQL real | APROBADA |
| Confirmación | Tracking | Consulta el código y muestra estado | Playwright + pytest | APROBADA |
| Confirmación | Etiqueta PDF y QR | Descarga etiqueta de la encomienda correcta | Vitest + pytest | APROBADA |
| Login | Credenciales válidas e inválidas | Autoriza o muestra error | pytest + Playwright | APROBADA |
| Sesión | Cierre de sesión | Limpia token y usuario de la pestaña | Vitest + Playwright | APROBADA |
| Sesión | Nueva pestaña | No reutiliza `sessionStorage` | Playwright | APROBADA |
| Sesión | Inactividad de 5 minutos | Bloquea y solicita credenciales | Vitest de sesión | APROBADA |
| Roles | Administrador | Accede solo a módulos administrativos | pytest + Playwright | APROBADA |
| Roles | Estiba | Accede únicamente a optimización | pytest + Playwright | APROBADA |
| Dashboard | Últimas encomiendas | Muestra datos del endpoint, no datos simulados | Prueba de interfaz con API controlada | APROBADA |
| Clientes | Crear, consultar y actualizar | Persiste sin duplicados por DNI | pytest + PostgreSQL transaccional | APROBADA |
| Encomiendas | Crear, editar, buscar y listar | Actualiza interfaz y persistencia | pytest + Playwright | APROBADA |
| Encomiendas | Anular | Conserva motivo y evita entrega posterior | pytest | APROBADA |
| Encomiendas | Confirmar pre-registro | Cambia a `REGISTRADA` una sola vez | pytest | APROBADA |
| Encomiendas | Entregar | Valida DNI y registra entrega | pytest | APROBADA |
| Destinos | Crear y listar | Persiste y respeta permisos | pytest | APROBADA |
| Usuarios | Crear, activar, desactivar y asignar roles | Persiste permisos y estado | pytest | APROBADA |
| SUNAT | Generar PDF/XML local | Produce contenido para la encomienda | pytest | APROBADA |
| SUNAT | Enviar a Lycet beta | Recibe confirmación del proveedor | Lycet configurado no respondió | BLOQUEADA |
| Optimización | Ejecutar algoritmos | Devuelve coordenadas dentro del box | pytest + Playwright | APROBADA |
| Optimización | Cambiar camión y cámara | Actualiza escena sin perder estado | Playwright | APROBADA |
| Optimización | Siguiente, anterior y reiniciar | Controla la carga progresiva | Playwright | APROBADA |
| Optimización | Pantalla completa y finalizar | Cambia presentación y termina simulación | Playwright | APROBADA |
| Optimización | Sin espacio o sobrepeso | Reporta paquetes no acomodados | pytest | APROBADA |
| Responsive | Landing, registro, pagos y administración | No oculta acciones principales | Playwright Pixel 7 | APROBADA |
| Errores HTTP | 401, 403, 404 y 422 | Respuesta y mensaje coherentes | pytest + Playwright | APROBADA |
| Errores de red | Backend apagado, timeout y 500 | Muestra error sin doble envío | Playwright con red controlada | APROBADA |

## Validación común de botones

Para cada botón cubierto por Playwright se verificó:

1. Visibilidad según estado y rol.
2. Estado habilitado o deshabilitado.
3. Una sola solicitud por clic.
4. Método, endpoint y payload esperado.
5. Estado visual durante el procesamiento.
6. Prevención de doble envío.
7. Confirmación o mensaje de error.
8. Actualización de la interfaz.
9. Resultado persistente cubierto por pytest/SQLAlchemy.
10. Estado coherente después de recargar cuando aplica.

## Pendientes manuales

- Ejecutar una transacción completa con Mercado Pago sandbox sin interceptar el SDK.
- Repetir emisión SUNAT cuando Lycet beta esté disponible.
- Confirmar impresión física cuando el navegador bloquee ventanas emergentes.
- Revisar visualmente PDF/XML con datos fiscales definitivos.
- Ejecutar pruebas exploratorias con usuarios reales de cada rol.
