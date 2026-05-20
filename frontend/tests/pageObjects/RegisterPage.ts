import type { Page } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/register');
  }

  async register(email: string, password: string, name: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.fill('input[name="name"]', name);
    await this.page.click('button[type="submit"]');
  }
}
