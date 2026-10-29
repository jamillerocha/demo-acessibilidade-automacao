const path = require('path');
const fs = require('fs');
const AxeBuilder = require('@axe-core/playwright').default;

const url = (arquivo) => 'file://' + path.join(__dirname, '..', 'pages', arquivo);

// Mesmo conjunto de regras do exemplo oficial do Playwright, mais WCAG 2.2 e boas práticas.
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

async function varrer(page, nome) {
  const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const resumo = r.violations.map((v) => ({
    regra: v.id, impacto: v.impact,
    tipo: v.tags.includes('best-practice') ? 'boa prática' : 'falha WCAG',
    elementos: v.nodes.map((n) => n.target.join(' ')),
  }));
  fs.mkdirSync(path.join(__dirname, '..', 'evidencias'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '..', 'evidencias', `axe-${nome}.json`),
    JSON.stringify({ axeCore: r.testEngine.version, data: r.timestamp, violacoes: resumo }, null, 2));
  return r;
}

// Pressiona Tab n vezes e registra o elemento focado a cada passo.
async function percorrerComTab(page, n = 10) {
  const seq = [];
  for (let i = 0; i < n; i++) {
    await page.keyboard.press('Tab');
    seq.push(await page.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return '(fora da página)';
      const rot = e.labels && e.labels[0] ? e.labels[0].textContent.trim() : '';
      return rot || e.getAttribute('placeholder') || e.textContent.trim() || e.tagName;
    }));
  }
  return seq;
}

module.exports = { url, varrer, percorrerComTab };
