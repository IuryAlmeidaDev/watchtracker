import { test, expect } from '@playwright/test';
test.beforeEach(async ({page}) => {
 await page.route('**/rest/v1/**',r=>r.fulfill({json:[]}));await page.goto('/');
});
test('one open watch, animated panel, fixed gallery and no duplicate cover',async({page})=>{
 await page.getByRole('button',{name:'Expandir MY-H3-C Silvery',exact:true}).click();
 const row=page.locator('[data-watch-id="5"]');
 await expect(row.locator('.watch-photo-trigger')).not.toBeVisible();
 await expect(row.locator('.watch-expansion')).toHaveCSS('transition-property','height, opacity');
 await expect(row.locator('.detail-gallery-stage').first()).toBeVisible();
 const before=await row.locator('.detail-gallery-stage').first().boundingBox();
 await row.getByRole('button',{name:'Próxima foto',exact:true}).click();
 const after=await row.locator('.detail-gallery-stage').nth(1).boundingBox();
 expect(after!.height).toBe(before!.height);
 await page.getByRole('button',{name:'Expandir AD2554 (Field 36mm)',exact:true}).click();
 await expect(page.getByTestId('details-5')).not.toBeVisible();
 await expect(page.getByTestId('details-2')).toBeVisible();
 await expect(page.locator('.watch-row.is-open')).toHaveCount(1);
});
test('theme selection survives reload',async({page})=>{
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByRole('button',{name:'Ativar tema escuro'}).click();
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('button',{name:'Ativar tema claro'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});
