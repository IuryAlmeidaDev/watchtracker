import { test, expect } from '@playwright/test';

test('carrega a aba Meu Ranking por padrão e permite alternar para o Catálogo', async ({ page }) => {
  await page.goto('/');

  // Verifica se a aba Meu Ranking está ativa
  await expect(page.getByRole('button', { name: /Meu Ranking/ })).toBeVisible();

  // Alterna para Explorar Catálogo
  await page.getByRole('button', { name: 'Explorar Catálogo' }).click();

  // Verifica título do catálogo
  await expect(page.getByRole('heading', { name: 'Catálogo de Modelos' })).toBeVisible();

  // Alterna para Minha Coleção
  await page.getByRole('button', { name: /Minha Coleção/ }).click();
  await expect(page.getByRole('heading', { name: 'Minha Coleção' })).toBeVisible();
});

test('botão de entrar abre o modal de autenticação', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Acessar Conta' })).toBeVisible();

  // Fecha o modal
  await page.getByLabel('Fechar modal').click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
