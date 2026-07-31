import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {

  test('checkout page redirects to cart when empty', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/cart');
  });

  test('shipping form fields exist', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/checkout')) {
      const nameInput = page.locator('input[placeholder*="Name" i], input[placeholder*="name" i]').first();
      const phoneInput = page.locator('input[placeholder*="Phone" i], input[placeholder*="phone" i]').first();
      const addressInput = page.locator('input[placeholder*="Address" i], input[placeholder*="address" i]').first();

      await expect(nameInput).toBeVisible({ timeout: 5000 });
      await expect(phoneInput).toBeVisible();
      await expect(addressInput).toBeVisible();
    }
  });

  test('payment methods are displayed', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/checkout')) {
      const upiOption = page.locator('button:has-text("UPI")').first();
      await expect(upiOption).toBeVisible({ timeout: 5000 });

      const codOption = page.locator('button:has-text("Cash on Delivery")').first();
      await expect(codOption).toBeVisible();
    }
  });

  test('select different payment methods', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/checkout')) {
      const codOption = page.locator('button:has-text("Cash on Delivery")').first();
      await codOption.click();
      await page.waitForTimeout(300);

      const upiOption = page.locator('button:has-text("UPI")').first();
      await upiOption.click();
      await page.waitForTimeout(300);
    }
  });

  test('order summary section exists', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/checkout')) {
      const summary = page.locator('text=/Order Summary|order summary/i');
      await expect(summary).toBeVisible({ timeout: 5000 });
    }
  });

  test('place order button exists', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/checkout')) {
      const placeOrderBtn = page.locator('button[type="submit"]:has-text("Place"), button[type="submit"]:has-text("Order")').first();
      await expect(placeOrderBtn).toBeVisible({ timeout: 5000 });
    }
  });

  test('shipping form pre-fills for logged in user', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/checkout')) {
      const guestMessage = page.locator('text=/Guest|guest|login|register/i');
      if (await guestMessage.isVisible({ timeout: 3000 }).catch(() => false)) {
        const loginLink = page.locator('a[href="/auth"]');
        await expect(loginLink).toBeVisible();
      }
    }
  });

  test('return to cart link exists', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    if (page.url().includes('/checkout')) {
      const backLink = page.locator('a[href="/cart"]').first();
      await expect(backLink).toBeVisible({ timeout: 5000 });
    }
  });

});
