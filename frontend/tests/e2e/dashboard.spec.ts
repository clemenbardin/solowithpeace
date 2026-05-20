import { test, expect } from '@playwright/test';
import { LoginPage } from '../pageObjects/LoginPage';

test.describe('Dashboard E2E', () => {
  test('admin can login and navigate dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('admin@admin.com', 'admin');
    await expect(page).toHaveURL(/dashboard/);
    
    // Verify dashboard loaded with greeting
    await expect(page.locator('text=Mon espace')).toBeVisible({ timeout: 5000 });
  });
});
