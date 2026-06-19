import { expect } from '@playwright/test';

export const destinations = [
  'Trujillo', 'Shorey', 'Huaycatan', 'Santiago de Chuco', 'Chacomas',
  'Cachicadan', 'Santa Cruz', 'Cochapampa', 'Ugallama', 'Villacruz',
  'Las Manzanas', 'Angasmarca', 'Tambo Pampamarca Alta', 'Psicochaca',
  'Santa Clara de Tulpo', 'La Yeguada', 'Mollebamba', 'Cochamarca',
  'Orocullay',
];

export async function mockCommonApi(page) {
  await page.route('**/api/v1/destinos**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(destinations.map((nombre, index) => ({
        id: index + 1,
        nombre,
        activo: true,
      }))),
    });
  });
  await page.route('**/api/v1/clientes/*', (route) => route.fulfill({
    status: 404,
    contentType: 'application/json',
    body: JSON.stringify({ detail: 'Cliente no encontrado en base local.' }),
  }));
  await page.route('**/api/v1/reniec/*', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      nombres: 'TEST QA',
      apellidoPaterno: 'PERSONA',
      apellidoMaterno: 'PRUEBA',
    }),
  }));
}

export async function fillShipmentForm(page) {
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

  await page.getByLabel('Tipo de contenido').selectOption('DOCUMENTOS');
  await page.getByLabel('Fragilidad').selectOption('MEDIA');
  await page.getByLabel('Peso total (kg)').fill('10');
  await page.getByLabel('Largo (cm)').fill('40');
  await page.getByLabel('Ancho (cm)').fill('30');
  await page.getByLabel('Alto (cm)').fill('20');
  await page.getByLabel('Descripcion').fill('Paquete funcional TEST QA');

  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Detalle de pago')).toBeVisible();
}
