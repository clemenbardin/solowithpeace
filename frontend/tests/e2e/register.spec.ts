import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pageObjects/RegisterPage';

const uniqueEmail = `e2e_${Date.now()}@example.com`;

test.describe('Register E2E', () => {
  test('inscrit un nouvel utilisateur et redirige vers le dashboard', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.register(uniqueEmail, 'password123', 'Test Utilisateur');
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('text=Mon espace')).toBeVisible();
  });
});
