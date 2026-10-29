// O que uma pessoa que navega só pelo teclado encontra: o que a varredura não vê.
const { test, expect } = require('@playwright/test');
const { url, percorrerComTab } = require('./helpers');

test.describe('Página com barreiras (pages/demo.html)', () => {
  test('B4: a ordem do Tab difere da ordem visual (Nome antes de E-mail)', async ({ page }) => {
    await page.goto(url('demo.html'));
    const seq = await percorrerComTab(page, 3);
    test.info().annotations.push({ type: 'ordem do Tab', description: seq.join(' -> ') });
    expect(seq).toEqual(['Nome', 'CEP', 'E-mail']);
  });

  test('B5: "Confirmar pedido" nunca recebe foco e Enter não envia o pedido', async ({ page }) => {
    await page.goto(url('demo.html'));
    let enviado = false;
    page.on('dialog', (d) => { enviado = true; d.dismiss(); });
    const seq = await percorrerComTab(page, 10);
    test.info().annotations.push({ type: 'ordem do Tab', description: seq.join(' -> ') });
    expect(seq).not.toContain('Confirmar pedido');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    expect(enviado).toBe(false);
  });

  test('B2: o leitor de tela anunciaria a imagem como "imagem1"', async ({ page }) => {
    await page.goto(url('demo.html'));
    await expect(page.getByRole('img', { name: 'imagem1' })).toBeAttached();
  });
});

test('Versão corrigida: o teclado alcança o botão e Enter envia o pedido', async ({ page }) => {
  await page.goto(url('demo-corrigida.html'));
  let enviado = false;
  page.on('dialog', (d) => { enviado = true; d.dismiss(); });
  const seq = await percorrerComTab(page, 4);
  expect(seq).toEqual(['Nome', 'E-mail', 'CEP', 'Confirmar pedido']);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  expect(enviado).toBe(true);
});
