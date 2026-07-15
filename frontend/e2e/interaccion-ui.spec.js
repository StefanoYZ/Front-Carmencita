import { expect, test } from '@playwright/test';
import { loginAs, mockLoginResponse, roleUsers } from './helpers.js';

// E2E de interacción de UI: automatiza lo que antes se ejecutaba MANUALMENTE
// (navegación por rol, teclado, rutas protegidas). El login se mockea a nivel de
// /auth/login para ejercitar el enrutamiento y los guards reales del frontend
// (getRoleHomePath + ProtectedRoute) sin depender del backend de auth, que ya
// está cubierto por las pruebas de backend.

test.describe('Aterrizaje por rol tras iniciar sesión', () => {
  test('E2E-UI-01 · SECRETARIA aterriza en su panel /secretaria', async ({ page }) => {
    await loginAs(page, roleUsers.secretaria);
    await expect(page).toHaveURL(/\/secretaria/);
  });

  test('E2E-UI-02 · ESTIBA aterriza en optimización de carga', async ({ page }) => {
    await loginAs(page, roleUsers.estiba);
    await expect(page).toHaveURL(/\/admin\/optimizacion-carga/);
  });

  test('E2E-UI-03 · ADMINISTRADOR aterriza en el dashboard', async ({ page }) => {
    await page.route('**/api/v1/encomiendas', (route) => route.fulfill({
      status: 200, contentType: 'application/json', body: '[]',
    }));
    await loginAs(page, roleUsers.admin);
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });
});

test('E2E-UI-04 · la tecla Enter envía el formulario de login', async ({ page }) => {
  // Antes era un caso manual ("probar Enter en el formulario"). Aquí se automatiza:
  // con foco en el campo de contraseña, Enter debe disparar el submit y redirigir.
  await page.route('**/api/v1/encomiendas', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: '[]',
  }));
  await loginAs(page, roleUsers.admin, { submitWithEnter: true });
  await expect(page).toHaveURL(/\/admin\/dashboard/);
});

test.describe('Rutas protegidas sin sesión', () => {
  for (const ruta of ['/secretaria', '/admin/dashboard', '/admin/optimizacion-carga']) {
    test(`E2E-UI-05 · ${ruta} sin sesión redirige a /login`, async ({ page }) => {
      await page.goto(ruta, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/login/);
    });
  }
});

test('E2E-UI-06 · credenciales inválidas no inician sesión ni redirigen', async ({ page }) => {
  await page.route('**/api/v1/auth/login', (route) => route.fulfill({
    status: 401,
    contentType: 'application/json',
    body: JSON.stringify({ detail: 'Credenciales invalidas' }),
  }));
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('input[name="username"]').fill('qa_admin');
  await page.locator('input[name="password"]').fill('clave-incorrecta');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  // No hubo navegación: seguimos en /login con el botón disponible para reintentar.
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();
});
