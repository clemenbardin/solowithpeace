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
    await this.page.fill('#email', email);
    await this.page.fill('#password', password);
    await this.page.fill('#name', name);
    await this.page.click('button[type="submit"]');
  }
}
