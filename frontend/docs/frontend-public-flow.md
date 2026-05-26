# Flujo publico Carmencita Express

## 1. Rutas publicas

- `/`: home publico con header, hero, beneficios, cotizador visual y rastreo real.
- `/registrar-envio`: flujo externo de registro en dos pasos.
- `/tracking`: rastreo publico por codigo.
- `/tracking/:codigo`: rastreo publico con codigo precargado.
- `/cotizar`: cotizador visual publico.
- `/pre-registro-exitoso`: confirmacion del pre-registro generado en agencia.
- `/registro-exitoso`: alias visual para confirmaciones futuras.

Las rutas internas se mantienen bajo `/admin` y los redirects legacy siguen apuntando al modulo interno.

## 2. Componentes principales

- `PublicLayout.jsx`: layout publico con header, contenido y footer.
- `PublicHeader.jsx`: header responsive con logo, menu, telefono y CTA.
- `HeroSection.jsx`: hero con imagen de camion, degradado, copy principal y beneficios.
- `PublicQuoteCard.jsx`: cotizador visual estimado y precarga del registro.
- `TrackingCard.jsx`: consulta real por codigo.
- `TrackingProgress.jsx`: estados visuales de rastreo.
- `RegistrarEnvioPage.jsx`: wizard publico de registro.
- `ShipmentFormStep.jsx`: paso 1 con remitente, destinatario y encomienda.
- `PaymentConfirmationStep.jsx`: paso 2 con resumen, pago y pre-registro.
- `RegistroExitosoPage.jsx`: muestra codigo de pre-registro e instrucciones.

## 3. Assets usados

- `src/assets/icons/logo.svg`
- `src/assets/icons/telefono.svg`
- `src/assets/icons/paquete.svg`
- `src/assets/icons/confiable.svg`
- `src/assets/icons/tiempo-rapido.svg`
- `src/assets/icons/apoyo.svg`
- `src/assets/icons/marcador-de-posicion.svg`
- `src/assets/icons/pin-de-ubicacion.svg`
- `src/assets/icons/lupa.svg`
- `src/assets/icons/lapiz.svg`
- `src/assets/icons/agencia.svg`
- `src/assets/icons/tarjeta-de-debito.svg`
- `src/assets/icons/tiempo-rapido.svg`
- `public/images/hero-camion.png`

## 4. Variable de entorno

Usar:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

El frontend consume endpoints con rutas relativas al `baseURL`, por ejemplo:

```js
apiClient.post('/encomiendas/pre-registro', payload)
```

No se usa `VITE_API_URL` ni se duplica `/api/v1`.

## 5. Flujo de pre-registro

Cuando el cliente elige `Pago en agencia`, el paso 2 llama:

```text
POST /api/v1/encomiendas/pre-registro
```

El payload se arma desde el formulario publico con:

- Datos del remitente.
- Datos del destinatario.
- Ruta.
- Descripcion.
- Tipo de contenido.
- Peso y medidas.
- Fragilidad.

Los correos se usan solo para UI por ahora porque el contrato backend actual de encomiendas no los acepta.

Respuesta esperada:

```json
{
  "id": 1,
  "codigo_encomienda": "D000000001",
  "estado": "PRE_REGISTRADA",
  "origen_registro": "EXTERNO"
}
```

Luego se muestra `/pre-registro-exitoso` con el codigo y el mensaje para acercarse a agencia.

## 6. Pre-registro vs registro formal

- Pre-registro: nace desde la vista externa cuando el cliente elige pago presencial. Queda en `PRE_REGISTRADA` y requiere atencion/pago en agencia.
- Registro formal: requiere pago confirmado o confirmacion interna. La vista externa no marca pagos digitales como aprobados si no existe confirmacion real.

## 7. Rastreo

`TrackingCard` usa:

```text
GET /api/v1/encomiendas/codigo/{codigo}
```

Mapeo visual:

- `PRE_REGISTRADA`, `REGISTRADA`, `COTIZADA`, `PAGO_CONFIRMADO`, `BOLETA_EMITIDA`: Recepcionado.
- `EN_TRANSITO`: En transito.
- `EN_DESTINO`: En destino.
- `ENTREGADA`: Entregado.
- `ANULADA`: mensaje de encomienda anulada.

Si el codigo no existe se muestra mensaje 404. Si el backend no responde se muestra error de conexion.

## 8. RENIEC

En el paso 1, si el tipo de documento es `DNI` y el numero tiene 8 digitos, se consulta en `onBlur`:

```text
GET /api/v1/reniec/{dni}
```

Se aplica para remitente y destinatario. El helper `extractNombreFromReniecResponse` soporta respuestas variables en campos directos y anidados. Si RENIEC falla, el registro no se bloquea y el usuario puede ingresar el nombre manualmente.

## 9. Como probar pago en agencia

1. Levantar backend con `VITE_API_BASE_URL` apuntando a `http://127.0.0.1:8000/api/v1`.
2. Abrir `/registrar-envio`.
3. Completar remitente, destinatario y encomienda.
4. Continuar a confirmacion.
5. Elegir `Pago en agencia`.
6. Presionar `Crear pre-registro`.
7. Confirmar que se muestra el codigo en `/pre-registro-exitoso`.
8. Rastrear ese codigo desde `/tracking/{codigo}`.

## 10. Metodos de pago

- `Pago en agencia`: funcional; crea pre-registro real.
- `Yape`: usa la integracion existente del backend (`/payments/public-key` y `/yape/process-payment`). Si el backend devuelve `approved`, se crea el registro formal con `POST /encomiendas`.
- `Tarjeta debito/credito`: usa la integracion existente de Mercado Pago (`/payments/public-key` y `/payments/process-payment`). Si el backend devuelve `approved`, se crea el registro formal con `POST /encomiendas`.
- Si Yape o tarjeta devuelven `pending`, `rejected` o error, no se crea registro formal y se muestra el estado al cliente.

## 11. Dependencias del backend

- El pre-registro depende de `POST /encomiendas/pre-registro`.
- El rastreo depende de `GET /encomiendas/codigo/{codigo}`.
- RENIEC depende de `GET /reniec/{dni}`.
- Cotizacion real sigue dependiendo de `POST /cotizaciones/calcular` con `encomienda_id`; por eso el home usa calculo visual estimado hasta que exista cotizacion publica sin encomienda.
- Registro formal post-pago depende de una confirmacion real de Payments/Yape que entregue estado `approved` al flujo publico.

## 12. Prueba responsive

Validar:

- Desktop: header horizontal, hero amplio, cotizador/rastreo en columnas cuando hay ancho suficiente.
- Tablet: grids apiladas sin solapamiento.
- Movil: menu hamburguesa, inputs full width, stepper legible y sin scroll horizontal.

Comando de verificacion:

```powershell
cd C:\Users\angel\Desktop\Front-Carmencita\frontend
npm run dev
```

Revisar `/`, `/registrar-envio`, `/tracking`, `/cotizar` y `/admin`.
# Validaciones de datos

El flujo publico de registro de envio valida los datos antes de avanzar a confirmacion o crear el pre-registro:

- DNI: solo numeros, maximo 8 digitos en el input y exactamente 8 digitos para consultar RENIEC.
- Telefono: solo numeros y maximo 9 digitos.
- Correo: formato valido si se ingresa.
- Peso y dimensiones: solo numeros/decimales mayores a 0.
- Fragilidad: `BAJA`, `MEDIA` o `ALTA`.
- Tipo de contenido: requerido antes de continuar.

RENIEC solo se consulta cuando el tipo de documento es `DNI` y el numero tiene exactamente 8 digitos. Si RENIEC falla, el usuario puede ingresar el nombre manualmente.
