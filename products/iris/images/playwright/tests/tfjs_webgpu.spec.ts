import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Disabled due to https://github.com/microsoft/playwright/issues/11627
test.skip('Should use the WebGL (GPU) backend and perform tensor operations', async ({ page }) => {
  const tfjsWebGpuHtmlPath = path.resolve(__dirname, 'tfjs_webgpu.html');
  await page.goto(`file://${tfjsWebGpuHtmlPath}`);

   // Wait for the content to be updated
   await page.waitForSelector('body:has-text("Using WebGPU (modern GPU) backend.")');

   // Verify the content
   const content = await page.content();
   expect(content).toContain('Using WebGPU (modern GPU) backend.');
   expect(content).toContain('Result:');
});
