# Roda o VI?

[![Netlify](https://api.netlify.com/api/v1/badges/ab233ea5-3ad9-4bd5-b365-85ce32eb2aa6/deploy-status)](https://roda-o-vi.netlify.app)
[![Validar](https://github.com/RParagon/roda-o-vi/actions/workflows/validar.yml/badge.svg)](https://github.com/RParagon/roda-o-vi/actions/workflows/validar.yml)
[![Atualizar dados](https://github.com/RParagon/roda-o-vi/actions/workflows/atualizar.yml/badge.svg)](https://github.com/RParagon/roda-o-vi/actions/workflows/atualizar.yml)

**Teste se seu PC aguenta o build vazado do GTA VI (o executável divulgado pelo Cyberleek), com base nos testes da comunidade.** Tudo roda no navegador e não tem nada pra baixar.

🔗 **Site:** https://roda-o-vi.netlify.app
🧩 **Widget pro seu site:** https://roda-o-vi.netlify.app/embed/

[English](#english) · [Español](#español)

> Inspirado no **[PortWatch VI](https://portwatch-vi.xyz/)**, de 4lwayz, que acompanha os ports desde o começo. As notícias e o ranking ao vivo do site vêm dos dados públicos do PortWatch. Valeu!

---

## O que é

O site lê sua placa de vídeo pelo navegador (WebGL), você escolhe o processador e a RAM, e ele mostra:

- **No build do Cyberleek:** a faixa de fps estimada e até onde seu PC chega (não abre, menus, abre o jogo, jogável, como os PCs testados).
- **O que falta pra rodar:** a troca mais simples (placa e/ou RAM) que leva seu PC até "Jogável".
- **Diagnóstico real:** teste de GPU, teste de CPU, tela e sistema, medidos no próprio navegador.
- **Compatibilidade:** de 0 a 100%, comparando com o melhor PC que a comunidade já testou.

Funciona em português, inglês e espanhol.

**Este projeto não tem, não distribui e não aponta pra arquivos do jogo, chaves ou executáveis.** É só uma calculadora de hardware.

## Use no seu site

### 1. Widget pronto

```html
<script type="module" src="https://roda-o-vi.netlify.app/embed/rodavi-widget.js"></script>
<roda-vi-teste idioma="pt"></roda-vi-teste>
```

- `idioma`: `pt`, `en` ou `es`. Sem ele, usa o idioma do navegador.
- Cores por variáveis de CSS: `--rodavi-fundo`, `--rodavi-texto`, `--rodavi-mudo`, `--rodavi-borda`, `--rodavi-trilho`, `--rodavi-campo`, `--rodavi-raio`.
- Evento `rodavi:resultado` com o resultado completo em `event.detail`.

Pra fixar uma versão, use o jsDelivr direto do GitHub:

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/RParagon/roda-o-vi@v1.4.0/embed/rodavi-widget.js"></script>
```

### 2. Só o motor de cálculo

```js
import { carregarDados, detectarGPU, acharGPU, avaliar } from "https://roda-o-vi.netlify.app/lib/rodavi.js";

const { gpus, cpus } = await carregarDados();
const gpu = acharGPU(detectarGPU(), gpus);
const r = avaliar({ gpu, cpu: cpus.find(c => c.id === "ryzen-5-5500g"), ramGB: 16, idioma: "pt" });

r.pct            // 0–100, compatibilidade com o melhor PC testado
r.fps            // { min, max } estimado no port
r.etapa          // 0 a 4: não abre, menus, abre o jogo, jogável, como os testados
r.port           // { titulo, texto }
r.pecas          // { gpu, cpu, ram } cada um com { status: "ok"|"meio"|"ruim", titulo, texto }

// O que trocar pra chegar pelo menos em "Jogável"
sugerirUpgrade({ gpu, cpu, ramGB: 16 }, gpus)
// { de: 0, para: 3, gpu: { nome: "RX 9060 XT", ... }, ramGB: 32 }
```

Também funciona no Node 18+ (menos o `detectarGPU`, que precisa do navegador).

### 3. Só os dados

Com CORS liberado:

| Arquivo | O que tem |
|---|---|
| [`data/gpus.json`](data/gpus.json) | Placas de vídeo: desempenho relativo (RTX 4090 = 100), VRAM, suporte a DirectX 12 Ultimate e termos pra detectar pelo WebGL |
| [`data/cpus.json`](data/cpus.json) | Processadores: nota de 0 a 1 pra jogos pesados e número de threads |
| [`data/rigs.json`](data/rigs.json) | PCs que a comunidade usou nos testes dos ports |
| [`data/noticias-pt.json`](data/noticias-pt.json) | Traduções das notícias do PortWatch |
| [`data/calibracao.json`](data/calibracao.json) | Melhor fps que a comunidade conseguiu no build, atualizado pelo robô |
| [`data/historico.json`](data/historico.json) | Evolução dia a dia: progresso do líder no PortWatch e melhor fps |
| [`i18n/`](i18n/) | Textos do site em cada idioma |

## Como a estimativa funciona

Tudo está em [`lib/rodavi.js`](lib/rodavi.js), numa função só (`avaliar`):

1. **Placa de vídeo** pesa mais. Sem DirectX 12 Ultimate o port não abre. A VRAM limita: 16 GB conta inteiro, 12 GB conta metade e 8 GB conta um quarto.
2. **RAM:** o port mais avançado usa uns 30 GB, então 32 GB conta inteiro e 16 GB conta metade.
3. **Processador** ajusta o resultado pra cima ou pra baixo.
4. A faixa de fps é **calibrada pelo melhor fps que a comunidade publicou** rodando o build do Cyberleek (`teto`). Quando os grupos otimizam, a régua sobe e todas as estimativas acompanham.

## Atualização automática

Um robô no GitHub Actions ([`atualizar.yml`](.github/workflows/atualizar.yml)) roda 4 vezes por dia: puxa os dados públicos do PortWatch, atualiza `calibracao.json`, `historico.json` e o fps dos PCs testados, confere tudo e salva no repositório. O site ainda lê o PortWatch ao vivo, então pega mudanças antes mesmo do robô.

```js
avaliar({ gpu, cpu, ramGB: 32, teto: 25 })   // teto = melhor fps da comunidade (padrão: TETO_PADRAO)
```

São estimativas pra matar a curiosidade, não garantia.

## Contribua

Placa ou processador faltando? Número errado? Quer traduzir pra outro idioma? Veja o [CONTRIBUTING.md](CONTRIBUTING.md). Toda mudança passa por uma checagem automática.

```bash
npm run validar   # confere data/ e i18n/
npm run testar    # testes do motor
```

Pra rodar o site no seu PC, sirva a pasta com qualquer servidor estático (os módulos não abrem via `file://`):

```bash
npx http-server . -p 5178
```

## Créditos

- **[PortWatch VI](https://portwatch-vi.xyz/)**, de 4lwayz: a inspiração, as notícias e o ranking ao vivo.
- Fotos: [Unsplash](https://unsplash.com/).

## Aviso

Projeto de fãs, sem ligação com a Rockstar Games, a Take-Two ou a Microsoft. GTA e Grand Theft Auto são marcas da Take-Two Interactive.

## Licença

Código sob [MIT](LICENSE). Dados em `data/` sob [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): use à vontade citando "Roda o VI".

---

## English

**Check whether your PC can handle Cyberleek's leaked GTA VI build, based on community tests.** Runs in the browser, nothing to download. Inspired by **[PortWatch VI](https://portwatch-vi.xyz/)** by 4lwayz.

Drop it on your site:

```html
<script type="module" src="https://roda-o-vi.netlify.app/embed/rodavi-widget.js"></script>
<roda-vi-teste idioma="en"></roda-vi-teste>
```

Or use the engine (`lib/rodavi.js`, `avaliar({ gpu, cpu, ramGB, idioma: "en" })`) or the open data in `data/`. Contributions welcome, see [CONTRIBUTING.md](CONTRIBUTING.md). Code is MIT, data is CC BY 4.0. Fan-made, not affiliated with Rockstar Games or Take-Two.

## Español

**Prueba si tu PC aguanta el build filtrado de GTA VI de Cyberleek, según las pruebas de la comunidad.** Corre en el navegador, nada que descargar. Inspirado en **[PortWatch VI](https://portwatch-vi.xyz/)**, de 4lwayz.

Ponlo en tu sitio:

```html
<script type="module" src="https://roda-o-vi.netlify.app/embed/rodavi-widget.js"></script>
<roda-vi-teste idioma="es"></roda-vi-teste>
```

También puedes usar el motor (`lib/rodavi.js`) o los datos abiertos de `data/`. Las contribuciones son bienvenidas, mira [CONTRIBUTING.md](CONTRIBUTING.md). Código MIT, datos CC BY 4.0. Hecho por fans, sin relación con Rockstar Games ni Take-Two.
