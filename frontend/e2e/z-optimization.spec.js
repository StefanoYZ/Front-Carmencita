import { expect, test } from '@playwright/test';

test('estibador ejecuta simulacion y controla vistas y avance', async ({ page }) => {
  const user = {
    username: 'qa_estiba',
    full_name: 'TEST QA ESTIBA',
    roles: ['ESTIBA'],
    permissions: ['optimization.read', 'optimization.run'],
  };
  await page.route('**/api/v1/auth/login', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      access_token: 'TEST_TOKEN_QA_ESTIBA',
      token_type: 'bearer',
      user,
    }),
  }));
  const scenario = {
    packages: [
      { id: 1, codigo: 'D000000001', descripcion: 'QA 1', destino: 'Orocullay', orden_entrega: 19, prioridad: 1, largo_cm: 40, ancho_cm: 30, alto_cm: 20, fragilidad: 'BAJA', peso_kg: 10, permite_rotacion: true },
      { id: 2, codigo: 'D000000002', descripcion: 'QA 2', destino: 'Angasmarca', orden_entrega: 12, prioridad: 1, largo_cm: 30, ancho_cm: 20, alto_cm: 15, fragilidad: 'MEDIA', peso_kg: 8, permite_rotacion: true },
    ],
    trucks: [{ id: 'CAMION_A', nombre: 'Camion A', largo_cm: 491, ancho_cm: 210, alto_cm: 220, capacidad_peso_kg: 5470 }],
    coordinate_system: {},
  };
  await page.route('**/api/v1/optimization/poc/scenario**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(scenario),
  }));
  await page.route('**/api/v1/optimization/poc/**/run', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      simulation_id: 'TEST_QA_SIM',
      algorithm: 'FIRST_FIT_3D',
      strategy: null,
      truck: scenario.trucks[0],
      input_count: 2,
      ordered_packages: scenario.packages,
      placements: [
        { package_id: 1, codigo: 'D000000001', loading_sequence: 1, delivery_order: 19, x: 0, y: 0, z: 0, width: 30, height: 20, depth: 40, orientation: 'WHD', destination: 'Orocullay', fragility: 'BAJA', peso_kg: 10, descripcion: 'QA 1', supported_weight: 0, stacking_capacity: 15, support_ratio: 1 },
        { package_id: 2, codigo: 'D000000002', loading_sequence: 2, delivery_order: 12, x: 30, y: 0, z: 0, width: 20, height: 15, depth: 30, orientation: 'WHD', destination: 'Angasmarca', fragility: 'MEDIA', peso_kg: 8, descripcion: 'QA 2', supported_weight: 0, stacking_capacity: 4, support_ratio: 1 },
      ],
      unplaced_packages: [],
      metrics: { execution_ms: 5, truck_volume_cm3: 22684200, used_volume_cm3: 33000, utilization_percent: 0.15, placed_count: 2, unplaced_count: 0, total_weight_kg: 18, overlap_violations: 0, boundary_violations: 0, delivery_order_penalty: 0, rotation_count: 0, average_delivery_distance_cm: 0 },
    }),
  }));

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Usuario o correo').fill('qa_estiba');
  await page.getByLabel('Contrasena').fill('QaPassword123');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page).toHaveURL(/admin\/optimizacion-carga/);

  await page.getByRole('button', { name: 'Ordenar' }).click();
  const progressPanel = page.getByRole('complementary');
  await expect(progressPanel.getByText('D000000001')).toBeVisible();
  await page.getByRole('button', { name: 'Superior' }).first().click();
  await page.getByRole('button', { name: 'Frontal' }).first().click();
  await page.getByRole('button', { name: 'Siguiente' }).first().click();
  await expect(progressPanel.getByText('D000000002')).toBeVisible();
  await page.getByRole('button', { name: 'Anterior' }).first().click();
  await page.getByRole('button', { name: 'Restablecer' }).click();
  await expect(page.getByRole('button', { name: 'Finalizar' })).toBeDisabled();
});
