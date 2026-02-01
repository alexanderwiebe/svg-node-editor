import { defineConfig } from '@playwright/test';

const skipServer = process.env.SKIP_SERVER === 'true';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  ...(skipServer ? {} : {
    webServer: [
      {
        command: 'bun run --filter @ai-document/frontend start',
        url: 'http://localhost:4200',
        reuseExistingServer: !process.env.CI,
        cwd: '../..',
      },
      {
        command: 'bun run --filter @ai-document/backend start:dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        cwd: '../..',
      },
    ],
  }),
});
