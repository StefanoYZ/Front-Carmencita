import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
// El backend (FastAPI) vive en el repo hermano CarmencitaExpress.
const backendDir = path.resolve(currentDir, '../../CarmencitaExpress');
const isWin = process.platform === 'win32';
const backendPython = isWin ? '.venv\\Scripts\\python.exe' : '.venv/bin/python';
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // Full-stack: se levanta el backend real (contra la BD E2E carmencita_e2e) y el
  // frontend apuntando a ese backend. Ambos se reutilizan si ya están arriba.
  webServer: [
    {
      command: `${backendPython} -m scripts.e2e_backend`,
      cwd: backendDir,
      url: 'http://127.0.0.1:8000/health',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      // Build de producción + preview: estable para E2E (el dev server de Vite
      // compila bajo demanda y produce ERR_CONNECTION_RESET intermitentes).
      command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: false,
      timeout: 180_000,
      env: { VITE_API_BASE_URL: API_BASE_URL },
    },
  ],
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
