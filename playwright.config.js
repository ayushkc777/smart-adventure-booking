import { defineConfig } from '@playwright/test'

export default defineConfig({
  expect: {
    timeout: 10000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  testDir: './e2e',
  timeout: 90000,
  use: {
    baseURL: 'http://localhost:5173',
    channel: 'chrome',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    viewport: { height: 900, width: 1440 },
  },
  webServer: [
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5173',
      env: {
        ...process.env,
        VITE_API_URL: 'http://127.0.0.1:5050',
      },
      reuseExistingServer: true,
      timeout: 120000,
      url: 'http://localhost:5173',
    },
    {
      command: 'npm run dev',
      cwd: '../smart-adventure-api',
      env: {
        ...process.env,
        PORT: '5050',
      },
      reuseExistingServer: true,
      timeout: 120000,
      url: 'http://127.0.0.1:5050/api/health',
    },
  ],
})
