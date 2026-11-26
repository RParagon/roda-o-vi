// Testes rápidos do motor. Uso: node scripts/testar-motor.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { avaliar, acharGPU, formatarFps, IDIOMAS } from "../lib/rodavi.js";

const { gpus } = JSON.parse(readFileSync(new URL("../data/gpus.json", import.meta.url)));
const { cpus } = JSON.parse(readFileSync(new URL("../data/cpus.json", import.meta.url)));
const gpu = (id) => gpus.find((g) => g.id === id);
const cpu = (id) => cpus.find((c) => c.id === id);

// Detecção pelo texto do WebGL
assert.equal(acharGPU("ANGLE (NVIDIA, NVIDIA GeForce GTX 1050 Ti Direct3D11 vs_5_0 ps_5_0, D3D11)", gpus).id, "gtx-1050-ti");
assert.equal(acharGPU("ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Ti SUPER Direct3D11)", gpus).id, "rtx-4070-ti-super");
assert.equal(acharGPU("AMD Radeon RX 9070 XT", gpus).id, "rx-9070-xt");
assert.equal(acharGPU("ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11)", gpus).fabricante, "intel");
assert.equal(acharGPU("ANGLE (AMD, AMD Radeon(TM) Graphics Direct3D11)", gpus).id, "radeon-vega-integrada");
assert.equal(acharGPU("placa desconhecida", gpus), null);

// GTX 1050 Ti não abre
const fraca = avaliar({ gpu: gpu("gtx-1050-ti"), cpu: cpu("ryzen-5-5500g"), ramGB: 16 });
assert.equal(fraca.abre, false);
assert.equal(fraca.etapa, 0);
assert.ok(fraca.pct < 15);

// PC igual ao do Belobug fica no topo
const forte = avaliar({ gpu: gpu("rx-9070-xt"), cpu: cpu("ryzen-7-9800x3d"), ramGB: 64 });
assert.equal(forte.etapa, 4);
assert.ok(forte.pct > 80);
assert.equal(forte.oficial.titulo, "1440p no alto, 60 fps");

// Mais RAM nunca piora o resultado
assert.ok(avaliar({ gpu: gpu("rtx-4070"), ramGB: 32 }).pct >= avaliar({ gpu: gpu("rtx-4070"), ramGB: 16 }).pct);

// Todos os idiomas respondem
for (const idioma of IDIOMAS) {
  const r = avaliar({ gpu: gpu("rtx-4090"), ramGB: 32, idioma });
  assert.equal(r.idioma, idioma);
  assert.ok(r.port.titulo && r.oficial.titulo && r.pecas.gpu.titulo);
}
assert.equal(formatarFps(4.1, "en"), "4.1");
assert.equal(formatarFps(4.1, "pt"), "4,1");

console.log("✓ Motor ok");
