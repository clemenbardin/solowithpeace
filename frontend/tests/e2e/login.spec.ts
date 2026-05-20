import { test, expect } from '@playwright/test';
import { LoginPage } from '../pageObjects/LoginPage';

test.describe('Login E2E', () => {
  test('connecte un utilisateur existant', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@admin.com', 'admin');
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('text=Déconnexion')).toBeVisible();
  });
});
