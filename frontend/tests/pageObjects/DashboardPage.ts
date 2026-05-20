import type { Page } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async openAdminFeatureFlags() {
    await this.page.click('text=Administration');
  }

  async isExclusiveOfferVisible() {
    return this.page.locator('text=Offre exclusive').isVisible();
  }
}
