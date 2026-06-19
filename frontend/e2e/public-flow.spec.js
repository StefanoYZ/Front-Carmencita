import { expect, test } from '@playwright/test';
import { fillShipmentForm, mockCommonApi } from './helpers.js';

test.beforeEach(async ({ page }) => {
  await mockCommonApi(page);
});

test('landing navega, cotiza y habilita registro', async ({ page }) => {
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
  await page.getByLabel('Peso total').fill('10');
  await page.getByLabel('Fragilidad').selectOption('MEDIA');
  await page.getByLabel('Largo').fill('40');
  await page.getByLabel('Ancho').fill('30');
  await page.getByLabel('Alto').fill('20');
  await page.getByRole('button', { name: 'COTIZAR' }).click();

  await expect(page.getByText(/S\/ (?!0\.00)/)).toBeVisible();
  await expect(page.getByRole('article').getByRole('link', { name: /registro de envio/i })).toBeEnabled();
});

test('registro por pago en agencia crea solo pre-registro', async ({ page }) => {
  await page.route('**/api/v1/encomiendas/pre-registro', async (route) => {
    expect(route.request().method()).toBe('POST');
    const payload = route.request().postDataJSON();
    expect(payload.remitente_numero_documento).toBe('70123456');
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 501,
        codigo_encomienda: 'J000000501',
        estado: 'PRE_REGISTRADA',
        origen_registro: 'EXTERNO',
        mensaje: 'Pre-registro generado correctamente',
      }),
    });
  });
  await page.goto('/registrar-envio', { waitUntil: 'domcontentloaded' });
  await fillShipmentForm(page);
  await page.getByRole('button', { name: 'Crear pre-registro' }).click();

  await expect(page.getByText('Tu pre-registro fue generado correctamente.')).toBeVisible();
  await expect(page.getByText('J000000501')).toBeVisible();
  await expect(page.getByRole('button', { name: /imprimir etiqueta/i })).toHaveCount(0);
});

test('validaciones bloquean el avance y mantienen el layout', async ({ page }) => {
  await page.goto('/registrar-envio', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Revisa los campos marcados antes de continuar.')).toBeVisible();
  await expect(page.getByText('Confirmacion y pago')).toBeVisible();
  await expect(page.getByText('Detalle de pago')).toHaveCount(0);
});

test('tracking consulta un codigo y muestra estado', async ({ page }) => {
  await page.route('**/api/v1/encomiendas/codigo/*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      id: 501,
      codigo_encomienda: 'J000000501',
      estado: 'REGISTRADA',
      origen: 'Trujillo',
      destino: 'Angasmarca',
      destinatario_nombre: 'TEST QA DESTINATARIO',
    }),
  }));
  await page.goto('/tracking/J000000501', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('J000000501')).toBeVisible();
  await expect(page.getByText('REGISTRADA')).toBeVisible();
});
