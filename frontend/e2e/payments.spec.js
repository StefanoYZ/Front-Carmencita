import { expect, test } from '@playwright/test';
import { fillShipmentForm, mockCommonApi } from './helpers.js';

async function installMercadoPagoStub(page) {
  await page.addInitScript(() => {
    window.MercadoPago = class MercadoPagoStub {
      bricks() {
        return {
          create: async (_type, containerId, config) => {
            const container = document.getElementById(containerId);
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = 'Simular pago tarjeta QA';
            button.onclick = () => config.callbacks.onSubmit({
              formData: {
                token: 'TEST_QA_CARD_TOKEN',
                transaction_amount: config.initialization.amount,
                installments: 1,
                payment_method_id: 'master',
                payer: {
                  email: config.initialization.payer.email,
                  identification: { type: 'DNI', number: '12345678' },
                },
              },
            });
            container.appendChild(button);
            config.callbacks.onReady();
            return { unmount: () => container.replaceChildren() };
          },
        };
      }

      yape() {
        return {
          create: async () => ({ id: 'TEST_QA_YAPE_TOKEN' }),
        };
      }
    };
  });
}

test.beforeEach(async ({ page }) => {
  await mockCommonApi(page);
  await installMercadoPagoStub(page);
  await page.route('**/api/v1/payments/public-key', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ publicKey: 'TEST-QA-PUBLIC-KEY' }),
  }));
});

test('pago aprobado con tarjeta crea encomienda y habilita etiqueta', async ({ page }) => {
  let shipmentCalls = 0;
  await page.route('**/api/v1/payments/process-payment', async (route) => {
    expect(route.request().postDataJSON().token).toBe('TEST_QA_CARD_TOKEN');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        api_status: 201,
        payment_status: 'approved',
        id: 'TEST_QA_CARD_PAYMENT',
        response: { status: 'approved' },
      }),
    });
  });
  await page.route('**/api/v1/encomiendas', async (route) => {
    shipmentCalls += 1;
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 601,
        codigo_encomienda: 'J000000601',
        estado: 'REGISTRADA',
      }),
    });
  });

  await page.goto('/registrar-envio', { waitUntil: 'domcontentloaded' });
  await fillShipmentForm(page);
  await page.getByRole('button', { name: /tarjeta debito\/credito/i }).click();
  await page.getByRole('button', { name: 'Simular pago tarjeta QA' }).click();

  await expect(page).toHaveURL(/registro-exitoso/);
  await expect(page.getByText('J000000601')).toBeVisible();
  await expect(page.getByRole('button', { name: /imprimir etiqueta con qr/i })).toBeVisible();
  expect(shipmentCalls).toBe(1);
});

test('pago rechazado con tarjeta no crea encomienda', async ({ page }) => {
  let shipmentCalls = 0;
  await page.route('**/api/v1/payments/process-payment', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      api_status: 201,
      payment_status: 'rejected',
      id: 'TEST_QA_REJECTED',
      response: { status: 'rejected' },
    }),
  }));
  await page.route('**/api/v1/encomiendas', (route) => {
    shipmentCalls += 1;
    return route.abort();
  });

  await page.goto('/registrar-envio', { waitUntil: 'domcontentloaded' });
  await fillShipmentForm(page);
  await page.getByRole('button', { name: /tarjeta debito\/credito/i }).click();
  await page.getByRole('button', { name: 'Simular pago tarjeta QA' }).click();

  await expect(page.getByText('Pago con tarjeta rechazado.')).toBeVisible();
  expect(shipmentCalls).toBe(0);
});

test('pago aprobado con Yape crea una sola encomienda', async ({ page }) => {
  let shipmentCalls = 0;
  await page.route('**/api/v1/yape/process-payment', async (route) => {
    expect(route.request().postDataJSON().token).toBe('TEST_QA_YAPE_TOKEN');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'approved',
        id: 'TEST_QA_YAPE_PAYMENT',
        payment_method_id: 'yape',
      }),
    });
  });
  await page.route('**/api/v1/encomiendas', async (route) => {
    shipmentCalls += 1;
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 602,
        codigo_encomienda: 'J000000602',
        estado: 'REGISTRADA',
      }),
    });
  });

  await page.goto('/registrar-envio', { waitUntil: 'domcontentloaded' });
  await fillShipmentForm(page);
  await page.getByRole('button', { name: /^Yape/i }).click();
  await page.getByPlaceholder('Ej: Ingresa tu numero Yape').fill('987654321');
  await page.getByPlaceholder('Ej: 123456').fill('123456');
  await page.getByRole('button', { name: 'Pagar con Yape' }).click();

  await expect(page).toHaveURL(/registro-exitoso/);
  await expect(page.getByText('J000000602')).toBeVisible();
  expect(shipmentCalls).toBe(1);
});
