import { expect, test } from '@playwright/test';
import { loginAs, mockCommonApi, roleUsers } from './helpers.js';

// Verificacion masiva de extremo a extremo: las TRES interfaces que reutilizan el
// registro (publica, secretaria y admin) deben rechazar los MISMOS datos ilogicos.
// Se parametriza la misma bateria sobre cada interfaz para garantizar consistencia.

const PESO_MIN = 'El peso debe ser mayor a 0.';
const PESO_MAX = /no debe superar 5470 kg/i;

async function stubReniec(page) {
  await page.route('**/api/v1/reniec/*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ nombres: 'TEST QA', apellidoPaterno: 'PERSONA', apellidoMaterno: 'PRUEBA' }),
  }));
}

async function stubInternalGet(page) {
  await mockCommonApi(page);
  await page.route('**/api/v1/encomiendas**', (route) => (
    route.request().method() === 'GET'
      ? route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
      : route.continue()
  ));
}

// Cada interfaz expone la MISMA vista de registro (ShipmentFormStep) en su ruta.
const INTERFACES = [
  {
    name: 'publica',
    async open(page) {
      await stubReniec(page);
      await page.goto('/registrar-envio', { waitUntil: 'domcontentloaded' });
    },
  },
  {
    name: 'secretaria',
    async open(page) {
      await stubInternalGet(page);
      await loginAs(page, roleUsers.secretaria);
      await expect(page).toHaveURL(/\/secretaria/);
    },
  },
  {
    name: 'admin',
    async open(page) {
      await stubInternalGet(page);
      await loginAs(page, roleUsers.admin);
      await page.goto('/admin/encomiendas/nueva', { waitUntil: 'domcontentloaded' });
    },
  },
];

// Llena un sobre (DOCUMENTOS) valido y aplica overrides para forzar casos ilogicos.
async function fillEnvelope(page, overrides = {}) {
  const v = {
    remDoc: '70123456', desDoc: '70876543',
    remNombre: 'TEST QA REMITENTE', desNombre: 'TEST QA DESTINATARIO',
    remTel: '987654321', desTel: '976543210',
    peso: '1', descripcion: 'documentos qa',
    destProvincia: 'Santiago de Chuco', destDistrito: 'Angasmarca',
    ...overrides,
  };
  const docs = page.getByLabel('Numero de documento');
  await docs.nth(0).fill(v.remDoc);
  await docs.nth(0).blur();
  await docs.nth(1).fill(v.desDoc);
  const nombres = page.getByLabel('Nombre completo');
  await nombres.nth(0).fill(v.remNombre);
  await nombres.nth(1).fill(v.desNombre);
  const tels = page.getByLabel('Telefono');
  if (v.remTel) await tels.nth(0).fill(v.remTel);
  if (v.desTel) await tels.nth(1).fill(v.desTel);

  const origen = page.getByRole('group', { name: 'Origen' });
  await origen.getByLabel('Provincia').selectOption('Trujillo');
  await origen.getByLabel('Distrito').selectOption('Trujillo');
  const destino = page.getByRole('group', { name: 'Destino' });
  await destino.getByLabel('Provincia').selectOption(v.destProvincia);
  await destino.getByLabel('Distrito').selectOption(v.destDistrito);

  await page.getByLabel('Tipo de contenido').selectOption('DOCUMENTOS');
  await page.getByLabel('Peso total (kg)').fill(v.peso);
  await page.getByLabel('Descripcion').fill(v.descripcion);
}

async function continuarYBloqueado(page, mensaje) {
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText(mensaje).first()).toBeVisible();
  // Sigue en el formulario: el boton Continuar continua visible (no avanzo).
  await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible();
}

for (const iface of INTERFACES) {
  test.describe(`Datos ilogicos bloqueados — interfaz ${iface.name}`, () => {
    test('peso 0 se bloquea', async ({ page }) => {
      await iface.open(page);
      await fillEnvelope(page, { peso: '0' });
      await continuarYBloqueado(page, PESO_MIN);
    });

    test('peso sobre el maximo se bloquea', async ({ page }) => {
      await iface.open(page);
      await fillEnvelope(page, { peso: '999999' });
      await continuarYBloqueado(page, PESO_MAX);
    });

    test('mismo celular con DNI distinto se bloquea', async ({ page }) => {
      await iface.open(page);
      await fillEnvelope(page, { desTel: '987654321' }); // = remitente, DNI distinto
      await continuarYBloqueado(page, /mismo celular/i);
    });

    test('origen igual a destino se bloquea', async ({ page }) => {
      await iface.open(page);
      await fillEnvelope(page, { destProvincia: 'Trujillo', destDistrito: 'Trujillo' });
      await continuarYBloqueado(page, /destino debe ser diferente al origen/i);
    });
  });
}

// Regla de negocio: misma persona (mismo DNI) SI puede compartir celular -> avanza.
test('misma persona (mismo DNI) permite mismo celular y avanza a pago — publica', async ({ page }) => {
  await stubReniec(page);
  await page.goto('/registrar-envio', { waitUntil: 'domcontentloaded' });
  await fillEnvelope(page, { desDoc: '70123456', desTel: '987654321' });
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText(/mismo celular/i)).toHaveCount(0);
  await expect(page.getByText('Detalle de pago')).toBeVisible();
});
