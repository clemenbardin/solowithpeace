import { test, expect } from '@playwright/test';
import { LoginPage } from '../pageObjects/LoginPage';
import { DashboardPage } from '../pageObjects/DashboardPage';

test.describe('Dashboard E2E', () => {
  test('active un feature flag et vérifie l’affichage exclusif', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login('admin@admin.com', 'admin');
    await expect(page).toHaveURL(/dashboard/);

    await dashboardPage.openAdminFeatureFlags();
    await expect(page.locator('text=Gestion des feature flags')).toBeVisible();

    const toggle = page.locator('button', { hasText: 'Désactivé' }).first();
    await toggle.click();
    await expect(toggle).toHaveText('Activé');

    await page.goto('/dashboard');
    await expect(page.locator('text=Voyages exclusifs activés')).toBeVisible();
  });
});
