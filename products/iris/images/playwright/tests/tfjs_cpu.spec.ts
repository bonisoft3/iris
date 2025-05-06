import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Should use the WebGL (CPU) backend and perform tensor operations', async ({ page }) => {
  const tfjsGpuHtmlPath = path.resolve(__dirname, 'tfjs_cpu.html');
  await page.goto(`file://${tfjsGpuHtmlPath}`);

   // Wait for the content to be updated
   await page.waitForSelector('body:has-text("Using CPU backend.")');

   // Verify the content
   const content = await page.content();
   expect(content).toContain('Using CPU backend.');
   expect(content).toContain('Result:');
});
