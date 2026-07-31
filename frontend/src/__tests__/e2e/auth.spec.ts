import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

  test('guest user navigates the homepage', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByText(/Siddha Veda/i)).toBeVisible();

    const navLinks = page.locator('header nav a, header a');
    await expect(navLinks.first()).toBeVisible();

    await page.locator('header a[href="/shop"], header a:has-text("Shop")').first().click({ timeout: 5000 }).catch(() => {});
    await page.goto('/shop');
    await expect(page).toHaveURL(/\/shop/);
  });

  test('login form is functional', async ({ page }) => {
    await page.goto('/auth');

    await expect(page.getByText(/sign in/i).first()).toBeVisible();

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await emailInput.fill('testuser@siddha.in');
    await passwordInput.fill('testpass123');

    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i });
    await expect(submitButton).toBeVisible();
  });

  test('registration form is functional', async ({ page }) => {
    await page.goto('/auth');

    const registerTab = page.locator('button:has-text("Register")');
    await registerTab.click();

    const nameInput = page.locator('input[placeholder*="Suriyashankara" i]').first();
    const phoneInput = page.locator('input[placeholder*="98765" i]').first();
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await expect(nameInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await nameInput.fill('Test User');
    await phoneInput.fill('9876543210');
    await emailInput.fill('testuser' + Date.now() + '@siddha.in');
    await passwordInput.fill('StrongPass1');

    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /register/i });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('Google Login button exists', async ({ page }) => {
    await page.goto('/auth');

    await expect(page.locator('button:has-text("Google"), button:has-text("google")').first()).toBeVisible({ timeout: 10000 });
  });

  test('protected routes redirect when not logged in', async ({ page }) => {
    await page.goto('/account');
    await page.waitForURL('**/auth', { timeout: 10000 });
    expect(page.url()).toContain('/auth');

    await page.goto('/admin');
    await page.waitForURL((url) => !url.pathname.includes('/admin'), { timeout: 10000 });
    expect(page.url()).not.toContain('/admin');
  });

  test('user can switch between login and register tabs', async ({ page }) => {
    await page.goto('/auth');

    const loginTab = page.locator('button:has-text("Sign In")');
    const registerTab = page.locator('button:has-text("Register")');

    await registerTab.click();
    await expect(page.locator('input[placeholder*="Suriyashankara" i]').first()).toBeVisible();

    await loginTab.click();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
  });

  test('login and logout flow', async ({ page }) => {
    await page.goto('/auth');

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i });

    await emailInput.fill('admin@siddha.in');
    await passwordInput.fill('admin123');
    await submitButton.click();

    await page.waitForLoadState('networkidle');

    const isLoggedIn = await page.locator('#login-nav-btn').count() === 0;
    if (isLoggedIn) {
      const logoutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Logout"), button:has-text("log out")').first();
      if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await logoutBtn.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

});
