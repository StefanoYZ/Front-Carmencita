import { expect, test } from '@playwright/test';

const users = {
  admin: {
    username: 'qa_admin',
    full_name: 'TEST QA ADMIN',
    roles: ['ADMINISTRADOR'],
    permissions: ['users.read', 'encomiendas.read', 'encomiendas.write'],
  },
};

async function mockLogin(page, user) {
  await page.route('**/api/v1/auth/login', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      access_token: `TEST_TOKEN_${user.username}`,
      token_type: 'bearer',
      user,
    }),
  }));
}

test('administrador entra al dashboard y no ve optimizacion', async ({ page }) => {
  await mockLogin(page, users.admin);
  await page.route('**/api/v1/encomiendas', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Usuario o correo').fill('qa_admin');
  await page.getByLabel('Contrasena').fill('QaPassword123');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page).toHaveURL(/admin\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard' }).first()).toBeVisible();
  await page.goto('/admin/optimizacion-carga', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/admin\/dashboard/);
});

test('una pestaña nueva no reutiliza sessionStorage', async ({ page, context }) => {
  await mockLogin(page, users.admin);
  await page.route('**/api/v1/encomiendas', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Usuario o correo').fill('qa_admin');
  await page.getByLabel('Contrasena').fill('QaPassword123');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/admin\/dashboard/);

  const secondPage = await context.newPage();
  await secondPage.goto('/admin', { waitUntil: 'domcontentloaded' });
  await expect(secondPage).toHaveURL(/login/);
});
