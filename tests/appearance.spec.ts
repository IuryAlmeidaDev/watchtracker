import { test, expect } from '@playwright/test';
test.beforeEach(async ({page}) => {
 await page.route('**/rest/v1/**',r=>r.fulfill({json:[]}));await page.goto('/');
});
test('one open watch, animated panel, fixed gallery and no duplicate cover',async({page})=>{
 await page.getByRole('button',{name:'Expandir MY-H3-C Silvery',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'MY-H3-C Silvery'});
 await expect(dialog).toBeVisible();
 await expect(dialog).toHaveCSS('transition-duration','0.65s, 0.65s');
 await expect(page.getByRole('dialog')).toHaveCount(1);
 await expect(dialog).toHaveCSS('scale', '1');
 const stage=dialog.locator('.detail-gallery-stage').first();
 const before=await stage.boundingBox();
 await dialog.getByRole('region').first().focus();
 await page.keyboard.press('ArrowRight');
 const after=await dialog.locator('.detail-gallery-stage').nth(1).boundingBox();
 expect(after!.height).toBe(before!.height);
 await page.keyboard.press('Escape');
 await expect(dialog).not.toBeVisible();
 await expect(page.getByRole('button',{name:'Expandir MY-H3-C Silvery',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'Expandir AD2554 (Field 36mm)',exact:true}).click();
 await expect(page.getByRole('dialog')).toHaveCount(1);
 await expect(page.getByTestId('details-2')).toBeVisible();
});
test('theme selection survives reload',async({page})=>{
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByRole('button',{name:'Ativar tema escuro'}).click();
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('button',{name:'Ativar tema claro'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});
