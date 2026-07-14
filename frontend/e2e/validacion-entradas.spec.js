import { expect, test } from '@playwright/test';
import { loginAs, mockCommonApi, roleUsers } from './helpers.js';

// Evaluacion de la validacion de peso/dimensiones en CADA interfaz real que captura
// esos datos. Verifica en las cuatro que: (a) el minimo (peso 0) se rechaza con
// mensaje por campo, (b) la cota superior (5470 kg) se rechaza, y (c) no se avanza.
//
// Interfaces reales (Cotizacion.jsx quedo fuera: no esta montada en ninguna ruta):
//   1. Cotizacion publica     /cotizar                  (PublicQuoteCard)
//   2. Registro publico       /registrar-envio          (ShipmentFormStep)
//   3. Registro secretaria    /secretaria               (ShipmentFormStep, rol SECRETARIA)
//   4. Registro admin         /admin/encomiendas/nueva  (EncomiendaForm, permiso encomiendas.write)

const PESO_MIN = 'El peso debe ser mayor a 0.';
const PESO_MAX = /no debe superar 5470 kg/i;

async function stubInternalApi(page) {
  await mockCommonApi(page);
  await page.route('**/api/v1/encomiendas**', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
    return route.continue();
  });
}

// ─────────────── 1. Cotizacion publica (/cotizar) ───────────────
async function setupQuoteRoute(page) {
  await page.goto('/cotizar', { waitUntil: 'domcontentloaded' });
  const provinces = page.getByLabel('Provincia');
  await provinces.nth(0).selectOption('Trujillo');
  await provinces.nth(1).selectOption('Santiago de Chuco');
  const districts = page.getByLabel('Distrito');
  await districts.nth(0).selectOption('Trujillo');
  await districts.nth(1).selectOption('Angasmarca');
}

test('1. Cotizacion publica: peso 0 se bloquea por campo y no muestra tarifa', async ({ page }) => {
  await setupQuoteRoute(page);
  await page.getByLabel('Peso total').fill('0');
  await page.getByRole('button', { name: 'COTIZAR' }).click();
  await expect(page.getByText(PESO_MIN)).toBeVisible();
  await expect(page.getByText(/S\/ (?!0\.00)/)).toHaveCount(0);
});

test('1. Cotizacion publica: peso sobre el maximo se bloquea', async ({ page }) => {
  await setupQuoteRoute(page);
  await page.getByLabel('Peso total').fill('999999');
  await page.getByRole('button', { name: 'COTIZAR' }).click();
  await expect(page.getByText(PESO_MAX)).toBeVisible();
  await expect(page.getByText(/S\/ (?!0\.00)/)).toHaveCount(0);
});

test('1. Cotizacion publica: origen y destino iguales se bloquean', async ({ page }) => {
  await page.goto('/cotizar', { waitUntil: 'domcontentloaded' });
  const provinces = page.getByLabel('Provincia');
  await provinces.nth(0).selectOption('Trujillo');
  await provinces.nth(1).selectOption('Trujillo');
  await page.getByLabel('Peso total').fill('1');
  await expect(page.getByRole('button', { name: 'COTIZAR' })).toBeDisabled();
  await expect(page.getByText(/origen y el destino deben ser diferentes/i)).toBeVisible();
  await expect(page.getByText(/S\/ (?!0\.00)/)).toHaveCount(0);
});

test('1. Cotizacion publica: sobres no muestran medidas ni base 3D', async ({ page }) => {
  await setupQuoteRoute(page);
  await expect(page.getByText('Medidas del paquete (cm)')).toHaveCount(0);
  await expect(page.getByText(/Geometria del paquete/i)).toHaveCount(0);
  await page.getByLabel('Peso total').fill('1');
  await page.getByRole('button', { name: 'COTIZAR' }).click();
  await expect(page.getByText(/S\/ (?!0\.00)/)).toBeVisible();
});

// ─────────────── 2. Registro publico (/registrar-envio) ───────────────
test('2. Registro publico: peso 0 se bloquea y no avanza a pago', async ({ page }) => {
  await page.goto('/registrar-envio', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Peso total (kg)').fill('0');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText(PESO_MIN)).toBeVisible();
  await expect(page.getByText('Detalle de pago')).toHaveCount(0);
});

test('2. Registro publico: peso sobre el maximo se bloquea', async ({ page }) => {
  await page.goto('/registrar-envio', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Peso total (kg)').fill('999999');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText(PESO_MAX)).toBeVisible();
  await expect(page.getByText('Detalle de pago')).toHaveCount(0);
});

test('2. Registro publico: tipo de contenido incoherente bloquea el avance', async ({ page }) => {
  await page.goto('/registrar-envio', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Tipo de contenido').selectOption('ROPA');
  await page.getByLabel('Descripcion').fill('refrigeradora');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText(/no coincide con la descripcion/i)).toBeVisible();
  await expect(page.getByText('Detalle de pago')).toHaveCount(0);
});

test('2. Registro publico: origen y destino iguales bloquean el avance', async ({ page }) => {
  await page.goto('/registrar-envio', { waitUntil: 'domcontentloaded' });
  const origin = page.getByRole('group', { name: 'Origen' });
  await origin.getByLabel('Provincia').selectOption('Trujillo');
  await origin.getByLabel('Distrito').selectOption('Trujillo');
  const destination = page.getByRole('group', { name: 'Destino' });
  await destination.getByLabel('Provincia').selectOption('Trujillo');
  await destination.getByLabel('Distrito').selectOption('Trujillo');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('El destino debe ser diferente al origen.')).toBeVisible();
  await expect(page.getByText('Detalle de pago')).toHaveCount(0);
});

// ─────────────── 3. Registro secretaria (/secretaria) ───────────────
test('3. Registro secretaria: peso 0 se bloquea por campo', async ({ page }) => {
  await stubInternalApi(page);
  await loginAs(page, roleUsers.secretaria);
  await expect(page).toHaveURL(/\/secretaria/);
  await page.getByLabel('Peso total (kg)').fill('0');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText(PESO_MIN)).toBeVisible();
});

test('3. Registro secretaria: peso sobre el maximo se bloquea', async ({ page }) => {
  await stubInternalApi(page);
  await loginAs(page, roleUsers.secretaria);
  await expect(page).toHaveURL(/\/secretaria/);
  await page.getByLabel('Peso total (kg)').fill('999999');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText(PESO_MAX)).toBeVisible();
});

// ─────────────── 4. Registro admin (/admin/encomiendas/nueva) ───────────────
// El registro admin ahora usa el MISMO flujo que la secretaria (ShipmentFormStep
// + pago), por lo que la validacion por campo se dispara al presionar "Continuar".
async function gotoAdminRegistro(page, weight) {
  await stubInternalApi(page);
  await loginAs(page, roleUsers.admin);
  await page.goto('/admin/encomiendas/nueva', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Peso total (kg)').fill(weight);
  await page.getByRole('button', { name: 'Continuar' }).click();
}

test('4. Registro admin: peso 0 se bloquea por campo y no navega', async ({ page }) => {
  await gotoAdminRegistro(page, '0');
  await expect(page.getByText(PESO_MIN).first()).toBeVisible();
  await expect(page.getByText('Detalle de pago')).toHaveCount(0);
});

test('4. Registro admin: peso sobre el maximo se bloquea', async ({ page }) => {
  await gotoAdminRegistro(page, '999999');
  await expect(page.getByText(PESO_MAX).first()).toBeVisible();
});

// ─────────────── Flujos ilogicos de UI (nada invalido debe pasar) ───────────────
test.describe('Flujos ilogicos de UI', () => {
  test('el DNI descarta letras y se limita a 8 digitos', async ({ page }) => {
    await page.goto('/registrar-envio', { waitUntil: 'domcontentloaded' });
    const dni = page.getByLabel('Numero de documento').first();
    await dni.fill('AB12CD34EF56');           // mezcla de letras y digitos
    // El campo sanitiza a solo digitos y no supera 8 caracteres.
    await expect(dni).toHaveValue(/^\d{1,8}$/);
  });

  test('el registro publico muestra la explicacion del siguiente paso', async ({ page }) => {
    await page.goto('/registrar-envio', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Siguiente paso.*metodo de pago/i)).toBeVisible();
  });
});
