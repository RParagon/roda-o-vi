// Testes rápidos do motor. Uso: node scripts/testar-motor.mjs
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { avaliar, acharGPU, formatarFps, sugerirUpgrade, IDIOMAS } from "../lib/rodavi.js";
import { validarEnvio, chaveDe, lerChave, resumir } from "../lib/mural.js";

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
assert.equal(forte.resposta, "Roda.");

// Mais RAM nunca piora o resultado
assert.ok(avaliar({ gpu: gpu("rtx-4070"), ramGB: 32 }).pct >= avaliar({ gpu: gpu("rtx-4070"), ramGB: 16 }).pct);

// Todos os idiomas respondem
for (const idioma of IDIOMAS) {
  const r = avaliar({ gpu: gpu("rtx-4090"), ramGB: 32, idioma });
  assert.equal(r.idioma, idioma);
  assert.ok(r.port.titulo && r.resposta && r.pecas.gpu.titulo);
}
assert.equal(formatarFps(4.1, "en"), "4.1");
assert.equal(formatarFps(4.1, "pt"), "4,1");

// Sugestão de upgrade
const up = sugerirUpgrade({ gpu: gpu("gtx-1050-ti"), cpu: cpu("ryzen-5-5500g"), ramGB: 16 }, gpus);
assert.ok(up && up.gpu && up.para >= 3, "1050 Ti deve receber uma placa que chegue em Jogável");
const soRam = sugerirUpgrade({ gpu: gpu("rx-9070-xt"), cpu: cpu("ryzen-7-9800x3d"), ramGB: 16 }, gpus);
assert.equal(soRam.gpu, null); assert.equal(soRam.ramGB, 32);
assert.equal(sugerirUpgrade({ gpu: gpu("rx-9070-xt"), cpu: cpu("ryzen-7-9800x3d"), ramGB: 64 }, gpus), null);

// Calibração: se a comunidade dobrar o fps, a estimativa dobra junto
const base = avaliar({ gpu: gpu("rx-9070-xt"), cpu: cpu("ryzen-7-9800x3d"), ramGB: 64 });
const dobro = avaliar({ gpu: gpu("rx-9070-xt"), cpu: cpu("ryzen-7-9800x3d"), ramGB: 64, teto: 50 });
assert.ok(Math.abs(dobro.fps.max - base.fps.max * 2) < 0.2, "fps acompanha o teto");
assert.ok(avaliar({ gpu: gpu("rtx-4070"), ramGB: 32, teto: 100 }).etapa >= avaliar({ gpu: gpu("rtx-4070"), ramGB: 32 }).etapa);
assert.ok(avaliar({ gpu: gpu("gtx-1050-ti"), teto: 40 }).port.texto.includes("40"));

// Mural: o servidor recalcula a nota e recusa dados estranhos
const ctx = { gpus, cpus, teto: 25 };
const ok = validarEnvio({ gpu: "gtx-1050-ti", cpu: "ryzen-5-5500g", ram: 16, threads: 12, fpsGpu: 141, idioma: "pt", pct: 100 }, ctx);
assert.ok(ok.ok); assert.equal(ok.registro.pct, avaliar({ gpu: gpu("gtx-1050-ti"), cpu: cpu("ryzen-5-5500g"), ramGB: 16, threads: 12 }).pct, "nota enviada pelo navegador é ignorada");
assert.equal(validarEnvio({ gpu: "placa-falsa", ram: 16 }, ctx).ok, false);
assert.equal(validarEnvio({ gpu: "rtx-4090", ram: 17 }, ctx).ok, false);
assert.equal(validarEnvio({ gpu: "rtx-4090", ram: 32, cpu: "cpu-falsa" }, ctx).ok, false);
assert.equal(validarEnvio({ gpu: "rtx-4090", ram: 32, threads: 9999 }, ctx).ok, false);
const k1 = chaveDe(ok.registro, { agora: 1000, pais: "BR" }), k2 = chaveDe(ok.registro, { agora: 2000, pais: "<script>" });
assert.ok(k1.startsWith("r/") && k1.length < 600);
assert.equal(lerChave(k1).pais, "BR"); assert.equal(lerChave(k2).pais, null, "país estranho não entra");
assert.equal(lerChave(k1).quando, 1000); assert.equal(lerChave("r/lixo"), null);
assert.ok(k2 < k1, "mais novo vem primeiro na ordem alfabética");
assert.ok(chaveDe(ok.registro, { teste: true }).startsWith("t/"));
const res = resumir([lerChave(k1), lerChave(k2), null], { gpus });
assert.equal(res.total, 2); assert.equal(res.recentes[0].quando, 2000); assert.equal(res.gpuTop.nome, "GTX 1050 Ti");

console.log("✓ Motor ok");
