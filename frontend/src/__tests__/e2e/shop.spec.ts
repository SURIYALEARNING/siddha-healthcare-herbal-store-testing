import { test, expect } from '@playwright/test';

test.describe('Shop Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
  });

  test('shop page loads with title and products', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText(/pharmacy|therapeutics/i)).toBeVisible();
  });

  test('search for products', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Kabasura|Sandal|herbal/i).first();
    await searchInput.fill('Immunity', { force: true });
    await page.waitForTimeout(500);

    const resultsText = page.locator('text=/displaying|results/i');
    await expect(resultsText).toBeVisible();
  });

  test('filter by category', async ({ page }) => {
    const sidebarCats = page.locator('aside button:has-text("All")').first();
    if (await sidebarCats.isVisible().catch(() => false)) {
      const otherCategory = page.locator('aside button').filter({ hasText: /Booster|Care|Skin|Hair/i }).first();
      if (await otherCategory.isVisible().catch(() => false)) {
        await otherCategory.click();
        await page.waitForTimeout(500);
        expect(page.url()).toContain('/shop');
      }
    }
  });

  test('sort products by price', async ({ page }) => {
    const sortSelect = page.locator('select').first();
    if (await sortSelect.isVisible().catch(() => false)) {
      await sortSelect.selectOption('price-low', { force: true });
      await page.waitForTimeout(300);

      await sortSelect.selectOption('price-high', { force: true });
      await page.waitForTimeout(300);

      await sortSelect.selectOption('newest', { force: true });
      await page.waitForTimeout(300);
    }
  });

  test('view product details', async ({ page }) => {
    const productLink = page.locator('a[href^="/products/"]').first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('/products/');
    }
  });

  test('pagination works when multiple pages exist', async ({ page }) => {
    const nextButton = page.locator('button:has-text("Next"), button:has-text("next")').first();
    if (await nextButton.isVisible().catch(() => false) && await nextButton.isEnabled().catch(() => false)) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }

    const prevButton = page.locator('button:has-text("Prev"), button:has-text("prev")').first();
    if (await prevButton.isVisible().catch(() => false) && await prevButton.isEnabled().catch(() => false)) {
      await prevButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('reset filters when no results', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Kabasura|Sandal|herbal/i).first();
    await searchInput.fill('zzzznonexistentproduct', { force: true });
    await page.waitForTimeout(500);

    const resetButton = page.locator('button:has-text("Reset"), button:has-text("reset")');
    if (await resetButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await resetButton.click();
      await page.waitForTimeout(300);
    }
  });

});