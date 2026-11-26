// Confere os arquivos de data/ e i18n/ antes de publicar.
// Uso: node scripts/validar-dados.mjs
import { readFileSync, readdirSync } from "node:fs";

const erros = [];
const ler = (f) => {
  try { return JSON.parse(readFileSync(new URL(`../${f}`, import.meta.url), "utf8")); }
  catch (e) { erros.push(`${f}: JSON inválido (${e.message})`); return null; }
};
const unicos = (lista, campo, arq) => {
  const vistos = new Set();
  for (const x of lista) {
    if (vistos.has(x[campo])) erros.push(`${arq}: "${campo}" repetido: ${x[campo]}`);
    vistos.add(x[campo]);
  }
};

const g = ler("data/gpus.json");
if (g) {
  unicos(g.gpus, "id", "gpus.json");
  for (const x of g.gpus) {
    const onde = `gpus.json › ${x.id}`;
    if (!/^[a-z0-9-]+$/.test(x.id || "")) erros.push(`${onde}: id deve ser minúsculo com hífens`);
    if (!x.nome) erros.push(`${onde}: falta "nome"`);
    if (!["nvidia", "amd", "intel"].includes(x.fabricante)) erros.push(`${onde}: fabricante deve ser nvidia, amd ou intel`);
    if (!(x.desempenho > 0 && x.desempenho <= 200)) erros.push(`${onde}: desempenho fora de 1–200`);
    if (!(x.vram > 0 && x.vram <= 64)) erros.push(`${onde}: vram fora de 1–64`);
    if (typeof x.dx12u !== "boolean") erros.push(`${onde}: dx12u deve ser true ou false`);
    if (!Array.isArray(x.busca) || !x.busca.length || x.busca.some((b) => b !== b.toLowerCase())) erros.push(`${onde}: "busca" deve ser uma lista de termos em minúsculas`);
  }
}

const c = ler("data/cpus.json");
if (c) {
  unicos(c.cpus, "id", "cpus.json");
  for (const x of c.cpus) {
    const onde = `cpus.json › ${x.id}`;
    if (!/^[a-z0-9-]+$/.test(x.id || "")) erros.push(`${onde}: id deve ser minúsculo com hífens`);
    if (!x.nome) erros.push(`${onde}: falta "nome"`);
    if (!["amd", "intel"].includes(x.fabricante)) erros.push(`${onde}: fabricante deve ser amd ou intel`);
    if (!(x.nota >= 0 && x.nota <= 1)) erros.push(`${onde}: nota fora de 0–1`);
    if (!Number.isInteger(x.threads) || x.threads < 2) erros.push(`${onde}: threads deve ser um número inteiro`);
  }
}

const r = ler("data/rigs.json");
if (r) for (const x of r.rigs) if (!x.projeto || !x.hardware) erros.push(`rigs.json: item sem projeto ou hardware`);

// Todo idioma precisa ter as mesmas chaves do português
const chaves = (o, p = "") => Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" && !Array.isArray(v) ? chaves(v, `${p}${k}.`) : [`${p}${k}`]));
const pt = ler("i18n/pt.json");
if (pt) {
  const base = new Set(chaves(pt));
  for (const f of readdirSync(new URL("../i18n/", import.meta.url))) {
    if (!f.endsWith(".json") || f === "pt.json") continue;
    const outro = ler(`i18n/${f}`);
    if (!outro) continue;
    const tem = new Set(chaves(outro));
    for (const k of base) if (!tem.has(k)) erros.push(`i18n/${f}: falta a chave "${k}"`);
  }
}

if (erros.length) {
  console.error(`✗ ${erros.length} problema(s):\n  ` + erros.join("\n  "));
  process.exit(1);
}
console.log(`✓ Dados ok: ${g.gpus.length} placas, ${c.cpus.length} processadores, ${r.rigs.length} PCs testados.`);
