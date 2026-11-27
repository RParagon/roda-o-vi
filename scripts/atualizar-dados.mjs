// Robô: puxa os dados públicos do PortWatch VI e atualiza data/.
// Roda sozinho pelo GitHub Actions (.github/workflows/atualizar.yml) e também à mão:
//   node scripts/atualizar-dados.mjs
// Se o PortWatch estiver fora do ar ou mandar algo estranho, não mexe em nada.
import { readFileSync, writeFileSync } from "node:fs";

const FONTE = "https://portwatch-vi.xyz/data/tracker.json";
const arq = (f) => new URL(`../data/${f}`, import.meta.url);
const ler = (f) => JSON.parse(readFileSync(arq(f), "utf8"));
const gravar = (f, d) => writeFileSync(arq(f), JSON.stringify(d, null, 2) + "\n");
const ETAPAS = { playable: "Jogável", world: "No mundo", menu: "Menus", boots: "Abre", loads: "Carrega" };

let pw;
try {
  const r = await fetch(FONTE, { headers: { "User-Agent": "roda-o-vi-bot (+https://github.com/RParagon/roda-o-vi)" } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  pw = await r.json();
} catch (e) {
  console.log(`PortWatch indisponível (${e.message}). Nada foi alterado.`);
  process.exit(0);
}

const esforcos = Array.isArray(pw.efforts) ? pw.efforts : [];
const jogaveis = esforcos.filter((e) => e.tier === "tracked" && !e.nuked && e.gta && e.gta.playable >= 1 && Number(e.gta.fps) > 0);
if (!jogaveis.length) {
  console.log("Nenhum projeto jogável com fps nos dados. Nada foi alterado.");
  process.exit(0);
}
const melhor = jogaveis.reduce((a, b) => (b.gta.fps > a.gta.fps ? b : a));
const melhorFps = Number(melhor.gta.fps);
if (!(melhorFps > 0 && melhorFps <= 240)) {
  console.log(`Melhor fps fora do esperado (${melhorFps}). Nada foi alterado.`);
  process.exit(0);
}
const hist = Array.isArray(pw.history) ? pw.history : [];
const ultimo = hist[hist.length - 1] || {};
const hoje = (pw.updated || new Date().toISOString()).slice(0, 10);

// 1. Calibração usada pelo motor
const calib = {
  versao: 1,
  atualizado: pw.updated || new Date().toISOString(),
  fonte: FONTE,
  melhorFps,
  melhorProjeto: melhor.name,
  projetosJogaveis: jogaveis.length,
  progressoLider: ultimo.leader ?? null,
  liderId: ultimo.leaderId ?? null,
};
gravar("calibracao.json", calib);

// 2. Histórico: progresso do líder (do PortWatch) + melhor fps de cada dia (nosso)
let h;
try { h = ler("historico.json"); } catch { h = { versao: 1, fonte: FONTE, dias: [] }; }
const porData = new Map(h.dias.map((d) => [d.data, d]));
for (const d of hist) {
  const dia = porData.get(d.date) || { data: d.date };
  Object.assign(dia, { progressoLider: d.leader, liderId: d.leaderId, acompanhados: d.tracked });
  porData.set(d.date, dia);
}
const diaHoje = porData.get(hoje) || { data: hoje };
diaHoje.melhorFps = Math.max(diaHoje.melhorFps || 0, melhorFps);
if (diaHoje.melhorFps === melhorFps) diaHoje.melhorProjeto = melhor.name;
porData.set(hoje, diaHoje);
h.dias = [...porData.values()].sort((a, b) => a.data.localeCompare(b.data));
h.atualizado = calib.atualizado;
gravar("historico.json", h);

// 3. PCs testados: atualiza fps e etapa dos projetos que já conhecemos
const rigs = ler("rigs.json");
let mudou = 0;
for (const rig of rigs.rigs) {
  const e = esforcos.find((x) => String(x.name).toLowerCase() === rig.projeto.toLowerCase());
  if (!e || !e.gta) continue;
  const etapa = Object.keys(ETAPAS).find((k) => e.gta[k] >= 1);
  const fps = e.gta.fps ? `~${e.gta.fps}` : rig.fps;
  const removido = !!e.nuked || (e.stats && e.stats.missing);
  const novo = { fps, ate_onde: etapa ? ETAPAS[etapa] : rig.ate_onde, selo: removido ? "removido" : rig.selo === "removido" ? null : rig.selo };
  if (novo.fps !== rig.fps || novo.ate_onde !== rig.ate_onde || novo.selo !== rig.selo) { Object.assign(rig, novo); mudou++; }
}
rigs.atualizado = hoje;
gravar("rigs.json", rigs);

console.log(`✓ Melhor fps: ${melhorFps} (${melhor.name}) · ${jogaveis.length} projetos jogáveis · líder em ${calib.progressoLider}% · ${mudou} PCs testados atualizados`);
