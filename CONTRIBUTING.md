# Como contribuir

Valeu por querer ajudar! Dá pra contribuir mesmo sem saber programar: a maior parte do projeto é dado em JSON.

## Regra número um

**Nada de arquivos do jogo, chaves, executáveis ou links pra eles.** Pull requests com isso são fechados na hora. O projeto é só uma calculadora de hardware.

## Adicionar ou corrigir uma placa de vídeo

Edite [`data/gpus.json`](data/gpus.json):

```json
{
  "id": "rtx-5050",
  "nome": "RTX 5050",
  "fabricante": "nvidia",
  "desempenho": 24,
  "vram": 8,
  "dx12u": true,
  "busca": ["rtx 5050"]
}
```

| Campo | O que é |
|---|---|
| `id` | Único, minúsculo, com hífens |
| `fabricante` | `nvidia`, `amd` ou `intel` |
| `desempenho` | Desempenho relativo em jogos, com **RTX 4090 = 100**. Use médias de benchmarks em 1440p de fontes confiáveis (TechPowerUp, Hardware Unboxed, Gamers Nexus) e diga a fonte no pull request |
| `vram` | Memória de vídeo em GB |
| `dx12u` | `true` se tem DirectX 12 Ultimate / ray tracing por hardware |
| `busca` | Termos em minúsculas que aparecem no nome que o navegador mostra (WebGL). Ganha o termo mais longo, então "rtx 4070 ti super" vence "rtx 4070" |

Pra descobrir o texto que o seu navegador mostra, abra o console (F12) em qualquer página e rode:

```js
const gl = document.createElement("canvas").getContext("webgl");
gl.getParameter(gl.getExtension("WEBGL_debug_renderer_info").UNMASKED_RENDERER_WEBGL);
```

## Adicionar ou corrigir um processador

Edite [`data/cpus.json`](data/cpus.json). A `nota` vai de 0 a 1 e mede o desempenho em jogos pesados de mundo aberto. Ryzen 7 9800X3D = 1 e Ryzen 5 5500G = 0,58 servem de referência.

## Atualizar os PCs testados

Edite [`data/rigs.json`](data/rigs.json) com o link da fonte no pull request (README do projeto, vídeo, post). O site já puxa o ranking ao vivo do PortWatch. Esse arquivo serve de reserva e guarda o hardware de cada grupo.

## Traduzir pra outro idioma

1. Copie [`i18n/en.json`](i18n/en.json) com o código do idioma, por exemplo `i18n/fr.json`, e traduza os valores (não as chaves).
2. Em [`lib/rodavi.js`](lib/rodavi.js), adicione o idioma em `IDIOMAS` e um bloco em `TEXTOS`.
3. No widget ([`embed/rodavi-widget.js`](embed/rodavi-widget.js)), adicione o bloco em `UI`.
4. No `index.html`, adicione o botão em `.langs`.

O validador avisa se faltar alguma chave.

## Traduzir notícias

Adicione o `id` da notícia do PortWatch (o final do link, sem `.html`) em [`data/noticias-pt.json`](data/noticias-pt.json) com `titulo` e `resumo`.

## Antes de mandar

```bash
npm run validar
npm run testar
```

Os dois rodam sozinhos em todo pull request.
