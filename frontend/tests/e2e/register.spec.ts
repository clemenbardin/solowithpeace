import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pageObjects/RegisterPage';

const uniqueEmail = `e2e_${Date.now()}@example.com`;

test.describe('Register E2E', () => {
  test('register page loads and form fields are accessible', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    
    // Verify form fields are visible
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });
});
