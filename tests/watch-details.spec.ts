import { test, expect } from '@playwright/test';
test.beforeEach(async ({page}) => {
 await page.route('**/rest/v1/**', route => route.fulfill({json:[]}));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
});
test('expansion, thumbnails, keyboard and focus', async ({page}, info) => {
 const trigger=page.getByRole('button',{name:'Expandir MY-H3-C Silvery',exact:true});
 await trigger.click();
 const panel=page.getByTestId('details-5');
 await expect(panel).toBeVisible();
 await expect(panel.getByText('Quartzo Miyota 2115', {exact:true})).toBeVisible();
 await panel.getByRole('button',{name:'Próxima foto',exact:true}).click();
 await expect(panel.locator('.detail-gallery-count')).toHaveText('02 / 04');
 await panel.getByRole('button',{name:'Ver foto 4 de MY-H3-C Silvery',exact:true}).click();
 await expect(panel.locator('.detail-gallery-count')).toHaveText('04 / 04');
 await panel.getByRole('region',{name:'Fotos de MY-H3-C Silvery'}).focus();
 await page.keyboard.press('ArrowLeft');
 await expect(panel.locator('.detail-gallery-count')).toHaveText('03 / 04');
 await panel.getByRole('button',{name:'Ver foto 1 de MY-H3-C Silvery',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('[data-watch-id="5"]').screenshot({path:`test-results/details-${info.project.name}.png`});
 await page.keyboard.press('Escape');
 await expect(panel).not.toBeVisible();
 await expect(trigger).toBeFocused();
});
test('catalog details and missing photography',async({page})=>{
 await page.getByRole('button',{name:'Explorar Catálogo',exact:true}).click();
 await page.getByRole('button',{name:'Expandir MY-H3-C Silvery',exact:true}).click();
 await expect(page.getByTestId('details-5')).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:/Meu Ranking/}).click();
 await page.getByRole('button',{name:'Expandir Piloto Automático 36mm (NH35)',exact:true}).click();
 await expect(page.getByText('Um olhar mais de perto, em breve.')).toBeVisible();
});
