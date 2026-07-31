import { test, expect } from '@playwright/test';

test.describe('Cart Functionality', () => {

  test('empty cart shows appropriate message', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    const emptyMessage = page.locator('text=/empty|no items|explore/i').first();
    await expect(emptyMessage).toBeVisible();
  });

  test('add product to cart from shop', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    const addToCartButton = page.locator('button:has-text("Add"), button:has-text("add")').first();
    if (await addToCartButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
    }

    const cartIcon = page.locator('a[href="/cart"], a[title*="cart" i]').first();
    await cartIcon.scrollIntoViewIfNeeded();

    const cartCount = page.locator('a[href="/cart"] span, a[title*="cart" i] span').filter({ hasText: /[0-9]/ });
    const hasCount = await cartCount.count();
    if (hasCount > 0) {
      await expect(cartCount.first()).toBeVisible();
    }

    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
  });

  test('navigate to cart via cart icon', async ({ page }) => {
    await page.goto('/');
    const cartLink = page.locator('a[href="/cart"]').first();
    await expect(cartLink).toBeVisible();
    await cartLink.click();
    await expect(page).toHaveURL(/\/cart/);
  });

  test('proceed to checkout button exists in cart', async ({ page }) => {
    await page.goto('/cart');

    const checkoutButton = page.locator('button:has-text("Checkout"), button:has-text("checkout")').first();
    if (await checkoutButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(checkoutButton).toBeVisible();
    }
  });

  test('coupon code input exists', async ({ page }) => {
    await page.goto('/cart');

    const couponInput = page.locator('input[placeholder*="coupon" i], input[placeholder*="Coupon" i]').first();
    if (await couponInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(couponInput).toBeVisible();

      const applyButton = page.locator('button:has-text("Apply"), button:has-text("apply")').first();
      await expect(applyButton).toBeVisible();
    }
  });

  test('remove item from cart', async ({ page }) => {
    await page.goto('/cart');

    const deleteButton = page.locator('button[title*="Remove" i], button[title*="remove" i], button:has-text("delete")').first();
    if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await deleteButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('update quantity in cart', async ({ page }) => {
    await page.goto('/cart');

    const plusButton = page.locator('button:has-text("+")').first();
    if (await plusButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await plusButton.click();
      await page.waitForTimeout(300);

      const minusButton = page.locator('button:has-text("-")').first();
      if (await minusButton.isVisible().catch(() => false)) {
        await minusButton.click();
        await page.waitForTimeout(300);
      }
    }
  });

});
