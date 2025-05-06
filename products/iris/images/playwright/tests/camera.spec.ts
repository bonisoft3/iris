import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Camera Test', async ({ page }) => {
    const context = page.context();
    // await context.grantPermissions(['camera']);

    const cameraHtmlPath = path.resolve(__dirname, 'camera.html');
    await page.goto(`file://${cameraHtmlPath}`);

    try {
        await page.waitForFunction(() => {
            const video = document.getElementById('video') as HTMLVideoElement;
            return !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
        }, { timeout: 10000 }); // Adjust the timeout as needed

        expect(true).toBeTruthy()
    } catch (error) {
        expect(false).toBeTruthy()
    }
});
