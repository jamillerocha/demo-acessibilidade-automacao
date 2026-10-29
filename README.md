# O que a automação não vê — demonstração

Artefato técnico do Seminário Técnico (Projeto Final) da disciplina **Qualidade em Aplicações Web e Mobile** — Pós-graduação em Engenharia de Software com Ênfase em Teste de Software, PUC Minas, 2026.

**Grupo:** Jamille Rocha, Angélica Alves e Andressa Santana

## Objetivo

Mostrar, de forma reproduzível, a pergunta central do seminário: **até onde a automação chega na detecção de barreiras de acessibilidade, e o que continua exigindo avaliação humana?**

Uma página de checkout recebeu cinco barreiras plantadas. Ela foi avaliada de duas formas:

1. **Varredura automática** com axe-core via `@axe-core/playwright`, a integração recomendada na documentação oficial do Playwright.
2. **Navegação por teclado** automatizada com Playwright, simulando uma pessoa que não usa mouse.

Uma versão corrigida da mesma página serve de controle.

## Resultados observados

| Barreira plantada | Critério WCAG 2.2 | axe-core detectou? | Teste de teclado / árvore de acessibilidade |
|---|---|---|---|
| B1 — texto com contraste baixo | 1.4.3 | **Sim** (falha WCAG, impacto *serious*) | — |
| B2 — `alt="imagem1"`, sem significado | 1.1.1 | **Não** (a regra `image-alt` passou) | O nome acessível da imagem é "imagem1" |
| B3 — campo só com placeholder, sem `<label>` | 1.3.1 / 3.3.2 | **Não** (a regra `label` passou: o axe aceitou o placeholder como nome) | — |
| B4 — `tabindex` positivo, ordem de foco ilógica | 2.4.3 | **Parcial**: só como *boa prática* (`tabindex`), não como falha WCAG | O Tab percorre Nome → CEP → E-mail, fora da ordem visual |
| B5 — `<div>` com `onclick` usada como botão | 2.1.1 / 4.1.2 | **Não** (as únicas regras que citam a `div` são de contraste e de landmark) | "Confirmar pedido" **nunca recebe foco**; Enter **não envia** o pedido |
| Controle — versão corrigida | — | **0 violações** | O Tab segue Nome → E-mail → CEP → Confirmar pedido; Enter envia |

Leitura: a varredura detectou com segurança a barreira **objetiva** (contraste) e deixou passar as que **impedem a tarefa** (B5) ou dependem de **significado** (B2, B3). A pessoa que usa teclado não consegue concluir a compra, embora o relatório automático não aponte nenhuma falha de teclado.

O resultado de B3 **contrariou a hipótese inicial do grupo**, que esperava a detecção. Placeholder não substitui um rótulo, porque desaparece quando a pessoa começa a digitar, mas a regra considera que o campo "tem nome acessível". É o mesmo padrão de B2: a ferramenta verifica a **presença** de um nome, não sua **adequação**.

Evidências em [`evidencias/`](evidencias/):

- `axe-demo.json` e `axe-demo-corrigida.json`: violações encontradas pelo axe em cada página.
- `execucao-testes.txt`: saída da execução dos 10 testes.
- `1-demo-foco-apos-3-tabs.png`: o foco termina em "E-mail" e não chega ao botão.
- `2-corrigida-foco-no-botao.png`: na versão corrigida, o foco chega ao botão.

## Como executar

Pré-requisito: Node.js 18 ou superior. Tudo é gratuito e de código aberto.

```bash
npm install
npx playwright install chromium
npx playwright test          # executa os 10 testes
npx playwright show-report   # relatório HTML (opcional)
```

Os testes descrevem o comportamento **observado**: passam quando a ferramenta se comporta como na tabela acima, inclusive quando ela deixa uma barreira passar. Se uma versão futura do axe-core passar a detectar B2, B3 ou B5, o teste correspondente falha, sinalizando a mudança. Também é possível abrir `pages/demo.html` no navegador e testar à mão: Lighthouse (F12 › Lighthouse › Accessibility), tecla Tab e um leitor de tela como o NVDA.

## Estrutura

```
pages/demo.html             página com as 5 barreiras plantadas
pages/demo-corrigida.html   mesma página corrigida (controle)
tests/1-scanner.spec.js     o que o axe-core detecta e o que deixa passar
tests/2-teclado.spec.js     navegação por teclado e nome acessível
tests/helpers.js            varredura axe e percurso com Tab
evidencias/                 saídas e capturas da execução
```

## Ambiente da execução registrada

Playwright 1.56.0 com Chromium headless, `@axe-core/playwright` 4.10.2 (motor axe-core 4.10.3) e regras com as tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` e `best-practice`. Executado em 28/10/2026 (UTC 29/10/2026).

## Limites

- É **uma página com cinco barreiras escolhidas pelo grupo**. A demonstração ilustra o fenômeno, mas não mede a cobertura das ferramentas; nos estudos citados no seminário, a detecção variou de 17% a 71%, conforme a ferramenta e a métrica.
- Foi usado só o axe-core. Lighthouse (que usa o axe internamente) e WAVE não foram executados nesta suíte e podem apresentar resultados diferentes.
- O percurso com Tab foi simulado pelo Playwright; não houve teste com leitor de tela real nem com usuários.

## Referências

- MICROSOFT. *Accessibility testing*. Playwright Docs. https://playwright.dev/docs/accessibility-testing. Acesso em: 28 out. 2026.
- W3C. *Web Content Accessibility Guidelines (WCAG) 2.2*. 2023 (atual. 2024). https://www.w3.org/TR/WCAG22/. Acesso em: 28 out. 2026.
- DURAN, M. *What we found when we tested tools on the world's least-accessible webpage*. GOV.UK, 2017. https://accessibility.blog.gov.uk/2017/02/24/what-we-found-when-we-tested-tools-on-the-worlds-least-accessible-webpage/. Acesso em: 28 out. 2026.
- DEQUE SYSTEMS. *Deque Study Shows Its Automated Testing Identifies 57 Percent of Digital Accessibility Issues*. 2021. https://www.deque.com/blog/automated-testing-study-identifies-57-percent-of-digital-accessibility-issues. Acesso em: 28 out. 2026.

## Uso de IA

O código, as páginas de teste e este README foram elaborados com apoio do Claude (Anthropic), que também executou os testes e registrou as evidências. [Ajustar: descrever a revisão e a reexecução feitas pelas integrantes.]
