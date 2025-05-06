import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Should use the WebGL (GPU) backend and perform tensor operations', async ({ page }) => {
  const tfjsWebGLHtmlPath = path.resolve(__dirname, 'tfjs_webgl.html');
  await page.goto(`file://${tfjsWebGLHtmlPath}`);

   // Wait for the content to be updated
   await page.waitForSelector('body:has-text("Using WebGL (GPU) backend.")');

   // Verify the content
   const content = await page.content();
   expect(content).toContain('Using WebGL (GPU) backend.');
   expect(content).toContain('Result:');
});
