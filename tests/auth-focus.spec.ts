import { test, expect } from '@playwright/test';

test('login keeps keyboard focus inside and restores its trigger', async ({ page }) => {
 await page.route('**/rest/v1/**', route => route.fulfill({ json: [] }));
 await page.goto('/');
 const trigger = page.getByRole('button', { name: 'Entrar', exact: true });
 await trigger.click();
 const dialog = page.getByRole('dialog', { name: 'Acessar Conta' });
 await expect(dialog.locator('input').first()).toBeFocused();
 await dialog.getByRole('button', { name: 'Fechar modal' }).focus();
 await page.keyboard.press('Shift+Tab');
 await expect.poll(() => dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
 await page.keyboard.press('Escape');
 await expect(dialog).not.toBeVisible();
 await expect(trigger).toBeFocused();
});

test('guest collection action closes product before focusing login', async ({ page }) => {
 await page.route('**/rest/v1/**', route => route.fulfill({ json: [] }));
 await page.goto('/');
 await page.getByRole('button', { name: /Explorar Cat/ }).click();
 await page.getByRole('button', { name: 'Expandir MY-H3-C Silvery', exact: true }).click();
 await page.getByRole('dialog').getByRole('button', { name: /Cole/ }).click();
 const login = page.getByRole('dialog', { name: 'Acessar Conta' });
 await expect(login.locator('input').first()).toBeFocused();
 await expect(page.getByRole('dialog')).toHaveCount(1);
});
