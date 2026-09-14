import { test, expect } from '@playwright/test';
test.beforeEach(async({page})=>{await page.route('**/rest/v1/**',r=>r.fulfill({json:[]}));await page.goto('/');await page.getByRole('button',{name:'Explorar Catálogo',exact:true}).click();});
test('filters combine with AND and can be cleared',async({page},info)=>{
 await page.getByText('Filtrar características',{exact:false}).click();
 await page.getByRole('checkbox',{name:'Safira',exact:true}).check();
 await page.getByRole('checkbox',{name:'Automático',exact:true}).check();
 await page.screenshot({path:`.impeccable/review/filters-${info.project.name}.png`});
 const count=await page.locator('.catalog-card').count();expect(count).toBeGreaterThan(0);
 for(const card of await page.locator('.catalog-card').all()){await expect(card.locator('.watch-tags')).toContainText('Safira');await expect(card.locator('.watch-tags')).toContainText('Automático');}
 await page.getByRole('checkbox',{name:'Eco-Drive',exact:true}).check();
 await expect(page.getByText('Nenhum relógio com essa combinação')).toBeVisible();
 await page.getByRole('button',{name:'Limpar filtros'}).first().click();
 expect(await page.locator('.catalog-card').count()).toBeGreaterThan(count);
 await expect(page.getByRole('button',{name:'Cadastrar relógio'})).toHaveCount(0);
});
test('admin registration preserves failure then saves complete data',async({page},info)=>{
 await page.evaluate(async()=>{
  const auth=await import('/src/store/authStore.ts');const catalog=await import('/src/store/catalogStore.ts');const {supabase}=await import('/src/lib/supabase.ts');
  const user={id:'test-admin',app_metadata:{catalog_admin:true},email:'admin@example.test'};
  auth.useAuthStore.setState({user});
  supabase.auth.getUser=async()=>({data:{user},error:null});
  let attempts=0;
  supabase.rpc=async(_name,args)=>{(window as any).submittedWatch=args;return {error:++attempts===1?new Error('test failure'):null,data:'saved-id'};};
  catalog.useCatalogStore.setState({loadData:async()=>{}});
 });
 await page.getByRole('button',{name:'Cadastrar relógio'}).click();
 const dialog=page.getByRole('dialog',{name:'Cadastrar relógio'});
 await page.screenshot({path:`.impeccable/review/registration-${info.project.name}.png`});
 await dialog.getByLabel('Marca *',{exact:true}).fill('Teste');await dialog.getByLabel('Modelo *',{exact:true}).fill('Solar 38');
 await dialog.getByLabel('Preço médio ou mínimo').fill('125');await dialog.getByLabel('Descrição e informações').fill('Modelo de teste com safira.');
 await dialog.getByLabel('Ou links de fotos').fill('https://example.test/watch.jpg');await dialog.getByRole('checkbox',{name:'Safira',exact:true}).check();
 await dialog.getByRole('button',{name:'Salvar relógio'}).click();await expect(dialog.getByRole('alert')).toBeVisible();
 await expect(dialog.getByLabel('Modelo *',{exact:true})).toHaveValue('Solar 38');
 await dialog.getByRole('button',{name:'Salvar relógio'}).click();await expect(dialog).not.toBeVisible();
 const submitted=await page.evaluate(()=>(window as any).submittedWatch);expect(submitted.payload.tags).toContain('Safira');expect(submitted.photos).toEqual(['https://example.test/watch.jpg']);
});
