import { expect, test } from '@playwright/test';

// E2E full-stack: el frontend habla con el backend real (BD carmencita_e2e).
// Solo se stubea RENIEC (identidad de terceros, fuera del alcance E2E).
//
// Notas de UI (comportamiento intencional):
// - Cotizador público: arranca en tipo "Sobres" (solo pide peso). Para "Paquetes"
//   pide además fragilidad, medidas y elegir la base en un canvas 3D (Three.js).
// - Registro: con tipo de contenido DOCUMENTOS se ocultan fragilidad, medidas y
//   el selector 3D de base (un sobre no se cubica). Para probar un paquete real
//   habría que clickear el canvas WebGL (ver camino B / codegen).
const API = 'http://127.0.0.1:8000/api/v1';
const CODE_RE = /[A-Z]\d{9}/;

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/reniec/*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ nombres: 'TEST QA', apellidoPaterno: 'PERSONA', apellidoMaterno: 'PRUEBA' }),
  }));
});

async function fillEnvelopeShipmentForm(page) {
  const documentInputs = page.getByLabel('Numero de documento');
  await documentInputs.nth(0).fill('70123456');
  await documentInputs.nth(0).blur();
  await documentInputs.nth(1).fill('70876543');
  await documentInputs.nth(1).blur();

  const names = page.getByLabel('Nombre completo');
  await names.nth(0).fill('TEST QA REMITENTE');
  await names.nth(1).fill('TEST QA DESTINATARIO');

  const phones = page.getByLabel('Telefono');
  await phones.nth(0).fill('987654321');
  await phones.nth(1).fill('976543210');

  const emails = page.getByLabel('Correo electronico');
  await emails.nth(0).fill('remitente.qa@test.local');
  await emails.nth(1).fill('destinatario.qa@test.local');

  const addresses = page.getByLabel('Direccion');
  await addresses.nth(0).fill('Av. Pruebas 100');
  await addresses.nth(1).fill('Jr. Destino 200');

  const origin = page.getByRole('group', { name: 'Origen' });
  await origin.getByLabel('Provincia').selectOption('Trujillo');
  await origin.getByLabel('Distrito').selectOption('Trujillo');

  const destination = page.getByRole('group', { name: 'Destino' });
  await destination.getByLabel('Provincia').selectOption('Santiago de Chuco');
  await destination.getByLabel('Distrito').selectOption('Angasmarca');

  // DOCUMENTOS = sobre: la UI oculta fragilidad/medidas/base 3D a propósito.
  await page.getByLabel('Tipo de contenido').selectOption('DOCUMENTOS');
  await page.getByLabel('Peso total (kg)').fill('1');
  await page.getByLabel('Descripcion').fill('Documentos de prueba E2E');

  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Detalle de pago')).toBeVisible();
}

test('landing navega, cotiza un sobre y habilita registro', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /enviamos lo que/i })).toBeVisible();
  const servicesLink = page.getByRole('link', { name: 'Servicios' });
  if (await servicesLink.isVisible()) {
    await servicesLink.click();
  } else {
    await page.locator('#servicios').scrollIntoViewIfNeeded();
  }
  await expect(page.locator('#servicios')).toBeInViewport();
  await page.goto('/cotizar', { waitUntil: 'domcontentloaded' });

  const provinces = page.getByLabel('Provincia');
  await provinces.nth(0).selectOption('Trujillo');
  await provinces.nth(1).selectOption('Santiago de Chuco');
  const districts = page.getByLabel('Distrito');
  await districts.nth(0).selectOption('Trujillo');
  await districts.nth(1).selectOption('Angasmarca');

  // Tipo por defecto: "Sobres" (solo peso).
  await page.getByLabel('Peso total').fill('1');
  await page.getByRole('button', { name: 'COTIZAR' }).click();

  await expect(page.getByText(/S\/ (?!0\.00)/)).toBeVisible();
  await expect(page.getByRole('link', { name: /registro de envio/i }).last()).toBeVisible();
});

test('registro por pago en agencia crea un pre-registro real', async ({ page }) => {
  await page.goto('/registrar-envio', { waitUntil: 'domcontentloaded' });
  await fillEnvelopeShipmentForm(page);
  await page.getByRole('button', { name: 'Crear pre-registro' }).click();

  await expect(page.getByText('Tu pre-registro fue generado correctamente.')).toBeVisible();
  // El código lo genera el backend real (no viene hardcodeado).
  await expect(page.getByText(CODE_RE).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /imprimir etiqueta/i })).toHaveCount(0);
});

test('validaciones bloquean el avance y mantienen el layout', async ({ page }) => {
  await page.goto('/registrar-envio', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Revisa los campos marcados antes de continuar.')).toBeVisible();
  await expect(page.getByText('Confirmacion y pago')).toBeVisible();
  await expect(page.getByText('Detalle de pago')).toHaveCount(0);
});

test('tracking consulta un codigo real y muestra estado', async ({ page, request }) => {
  // Se crea una encomienda real vía API y luego se rastrea por la UI.
  const resp = await request.post(`${API}/encomiendas/pre-registro`, {
    data: {
      remitente_tipo_documento: 'DNI',
      remitente_numero_documento: '70123456',
      remitente_nombre: 'E2E REMITENTE',
      remitente_telefono: '987654321',
      destinatario_nombre: 'E2E DESTINATARIO',
      origen: 'Trujillo',
      destino: 'Angasmarca',
      descripcion: 'documento e2e tracking',
      tipo_contenido: 'DOCUMENTOS',
      peso_kg: 1,
      largo_cm: 0,
      ancho_cm: 0,
      alto_cm: 0,
      fragilidad: 'BAJA',
    },
  });
  expect(resp.ok()).toBeTruthy();
  const codigo = (await resp.json()).codigo_encomienda;

  // Flujo real de usuario: abrir la página de tracking, escribir el código y buscar.
  await page.goto('/tracking', { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder(/Ejemplo:/i).fill(codigo);
  await page.getByRole('button', { name: 'Rastrear' }).click();
  await expect(page.getByText(/PRE.?REGISTRADA/i).first()).toBeVisible();
});
