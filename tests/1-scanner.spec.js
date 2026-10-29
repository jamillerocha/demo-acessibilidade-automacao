// O que a varredura automática (axe-core) vê na página com 5 barreiras plantadas.
// Os testes descrevem o comportamento OBSERVADO: passam quando a ferramenta se
// comporta como documentado no README, inclusive quando ela deixa passar algo.
const { test, expect } = require('@playwright/test');
const { url, varrer } = require('./helpers');

test.describe('Página com barreiras (pages/demo.html)', () => {
  let r;
  test.beforeEach(async ({ page }) => {
    await page.goto(url('demo.html'));
    r = await varrer(page, 'demo');
  });
  const ids = () => r.violations.map((v) => v.id);
  const passou = () => r.passes.map((p) => p.id);
  const regrasQueCitam = (sel) => r.violations
    .filter((v) => v.nodes.some((n) => n.target.join(' ').includes(sel))).map((v) => v.id);

  test('B1 contraste baixo: o axe DETECTA', async () => {
    expect(ids()).toContain('color-contrast');
  });

  test('B2 alt="imagem1" (sem significado): o axe NÃO detecta', async () => {
    expect(ids()).not.toContain('image-alt');
    expect(passou()).toContain('image-alt'); // a regra roda e passa
  });

  test('B3 campo só com placeholder: o axe NÃO detecta (aceita o placeholder como nome)', async () => {
    expect(ids()).not.toContain('label');
    expect(passou()).toContain('label');
  });

  test('B4 tabindex > 0: o axe sinaliza só como boa prática, não como falha WCAG', async () => {
    const v = r.violations.find((x) => x.id === 'tabindex');
    expect(v).toBeDefined();
    expect(v.tags).toContain('best-practice');
  });

  test('B5 <div> usada como botão: o axe NÃO aponta problema de teclado', async () => {
    // As únicas regras que citam a div são de contraste e de landmark.
    expect(regrasQueCitam('div').sort()).toEqual(['color-contrast', 'region']);
  });
});

test('Versão corrigida (pages/demo-corrigida.html): nenhuma violação', async ({ page }) => {
  await page.goto(url('demo-corrigida.html'));
  const r = await varrer(page, 'demo-corrigida');
  expect(r.violations.map((v) => v.id)).toEqual([]);
});
