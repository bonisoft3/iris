import { test, expect } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('it should acquire user location', async ({ page }) => {
    const context = page.context();

    // Mock the geolocation to return a specific latitude and longitude
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 52.5200, longitude: 13.4050 }); // Berlin coordinates for example

    const geolocationHtmlPath = path.resolve(__dirname, 'geolocation.html');
    await page.goto(`file://${geolocationHtmlPath}`);

    // Click the "Get Location" button
    await page.click('#getLocation');

    // Check if the location was acquired successfully
    const locationResult = await page.textContent('#locationResult');
    expect(locationResult).toBe('Latitude: 52.52, Longitude: 13.405');
});
