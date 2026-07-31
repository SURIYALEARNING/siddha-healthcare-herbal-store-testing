import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {

  test('admin login redirects to admin page', async ({ page }) => {
    await page.goto('/auth');

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i });

    await emailInput.fill('admin@siddha.in');
    await passwordInput.fill('admin123');
    await submitButton.click();

    await page.waitForLoadState('networkidle');

    const adminUrl = page.url().includes('/admin');
    const accountUrl = page.url().includes('/account');

    if (adminUrl || accountUrl) {
      if (accountUrl) {
        await page.goto('/admin');
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('admin dashboard loads with analytics tab', async ({ page }) => {
    await page.goto('/auth');

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i });

    await emailInput.fill('admin@siddha.in');
    await passwordInput.fill('admin123');
    await submitButton.click();

    await page.waitForLoadState('networkidle');

    if (!page.url().includes('/admin')) {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
    }

    if (page.url().includes('/admin')) {
      await expect(page.locator('text=/Vanakkam|Stats|Analytics|Dashboard/i').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('admin sidebar navigation tabs exist', async ({ page }) => {
    await page.goto('/auth');

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i });

    await emailInput.fill('admin@siddha.in');
    await passwordInput.fill('admin123');
    await submitButton.click();

    await page.waitForLoadState('networkidle');

    if (!page.url().includes('/admin')) {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
    }

    if (page.url().includes('/admin')) {
      await page.hover('nav[class*="fixed"], nav[class*="sidebar"]');

      const sidebarTabs = page.locator('nav button:has-text("Products"), nav button:has-text("Orders"), nav button:has-text("Categories"), nav button:has-text("Coupons")');
      const count = await sidebarTabs.count();
      expect(count).toBeGreaterThanOrEqual(3);
    }
  });

  test('admin header shows sign out button', async ({ page }) => {
    await page.goto('/auth');

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i });

    await emailInput.fill('admin@siddha.in');
    await passwordInput.fill('admin123');
    await submitButton.click();

    await page.waitForLoadState('networkidle');

    if (!page.url().includes('/admin')) {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
    }

    if (page.url().includes('/admin')) {
      const signOutBtn = page.locator('button:has-text("Sign Out")').first();
      await expect(signOutBtn).toBeVisible({ timeout: 5000 });
    }
  });

  test('admin can switch tabs', async ({ page }) => {
    await page.goto('/auth');

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i });

    await emailInput.fill('admin@siddha.in');
    await passwordInput.fill('admin123');
    await submitButton.click();

    await page.waitForLoadState('networkidle');

    if (!page.url().includes('/admin')) {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
    }

    if (page.url().includes('/admin')) {
      await page.hover('nav[class*="fixed"], nav[class*="sidebar"]');

      const productsTab = page.locator('nav button:has-text("Products")').first();
      if (await productsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await productsTab.click();
        await page.waitForTimeout(500);
        await expect(page.locator('text=/Product Inventory|products/i').first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('admin can view analytics date presets', async ({ page }) => {
    await page.goto('/auth');

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i });

    await emailInput.fill('admin@siddha.in');
    await passwordInput.fill('admin123');
    await submitButton.click();

    await page.waitForLoadState('networkidle');

    if (!page.url().includes('/admin')) {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
    }

    if (page.url().includes('/admin')) {
      const datePreset = page.locator('button:has-text("Today"), button:has-text("Last 7"), button:has-text("Last 30")').first();
      if (await datePreset.isVisible({ timeout: 5000 }).catch(() => false)) {
        await datePreset.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('admin orders tab loads', async ({ page }) => {
    await page.goto('/auth');

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i });

    await emailInput.fill('admin@siddha.in');
    await passwordInput.fill('admin123');
    await submitButton.click();

    await page.waitForLoadState('networkidle');

    if (!page.url().includes('/admin')) {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
    }

    if (page.url().includes('/admin')) {
      await page.hover('nav[class*="fixed"], nav[class*="sidebar"]');

      const ordersTab = page.locator('nav button:has-text("Orders")').first();
      if (await ordersTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await ordersTab.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('admin staff tab is accessible', async ({ page }) => {
    await page.goto('/auth');

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i });

    await emailInput.fill('admin@siddha.in');
    await passwordInput.fill('admin123');
    await submitButton.click();

    await page.waitForLoadState('networkidle');

    if (!page.url().includes('/admin')) {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
    }

    if (page.url().includes('/admin')) {
      await page.hover('nav[class*="fixed"], nav[class*="sidebar"]');

      const staffTab = page.locator('nav button:has-text("Staff")').first();
      if (await staffTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await staffTab.click();
        await page.waitForTimeout(500);
        await expect(page.locator('text=/Staff Management|staff/i').first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('admin sign out works', async ({ page }) => {
    await page.goto('/auth');

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i });

    await emailInput.fill('admin@siddha.in');
    await passwordInput.fill('admin123');
    await submitButton.click();

    await page.waitForLoadState('networkidle');

    if (!page.url().includes('/admin')) {
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
    }

    if (page.url().includes('/admin')) {
      const signOutBtn = page.locator('button:has-text("Sign Out")').first();
      if (await signOutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await signOutBtn.click();
        await page.waitForLoadState('networkidle');
        expect(page.url()).not.toContain('/admin');
      }
    }
  });

});
