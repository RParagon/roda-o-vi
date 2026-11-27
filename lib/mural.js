/**
 * Roda o VI: regras do mural da comunidade
 *
 * Cada resultado vira uma chave no Netlify Blobs. Os dados ficam na própria chave,
 * então uma listagem só já traz tudo, sem ler arquivo por arquivo:
 *   r/<tempo invertido>_<aleatório>~<gpu>~<cpu>~<ram>~<threads>~<pct>~<etapa>~<fpsGpu>~<país>~<idioma>
 * O tempo invertido faz a ordem alfabética ser do mais novo pro mais antigo.
 *
 * Nada aqui identifica a pessoa: sem IP, sem nome, sem texto livre.
 * Licença MIT. https://github.com/RParagon/roda-o-vi
 */
import { avaliar, IDIOMAS } from "./rodavi.js";

export const PREFIXO = "r/";
export const PREFIXO_TESTE = "t/";
export const RAMS = [8, 16, 24, 32, 48, 64];
const MAX_TEMPO = 9999999999999;
const SEP = "~";

/**
 * Confere o que o navegador mandou e recalcula o resultado no servidor.
 * @returns {{ ok: true, registro: object } | { ok: false, erro: string }}
 */
export function validarEnvio(corpo, { gpus, cpus, teto }) {
  if (!corpo || typeof corpo !== "object") return { ok: false, erro: "corpo inválido" };
  const gpu = gpus.find((g) => g.id === corpo.gpu);
  if (!gpu) return { ok: false, erro: "placa desconhecida" };
  const cpu = corpo.cpu == null ? null : cpus.find((c) => c.id === corpo.cpu);
  if (corpo.cpu != null && !cpu) return { ok: false, erro: "processador desconhecido" };
  const ram = Number(corpo.ram);
  if (!RAMS.includes(ram)) return { ok: false, erro: "RAM inválida" };
  const threads = corpo.threads == null ? 0 : Math.round(Number(corpo.threads));
  if (!(threads === 0 || (threads >= 2 && threads <= 256))) return { ok: false, erro: "threads inválidas" };
  const fpsGpu = corpo.fpsGpu == null ? 0 : Math.round(Number(corpo.fpsGpu));
  if (!(fpsGpu >= 0 && fpsGpu <= 100000)) return { ok: false, erro: "teste de GPU inválido" };
  const idioma = IDIOMAS.includes(corpo.idioma) ? corpo.idioma : "pt";

  // O resultado é sempre recalculado aqui: o navegador não escolhe a nota
  const r = avaliar({ gpu, cpu, ramGB: ram, threads: threads || undefined, teto });
  return { ok: true, registro: { gpu: gpu.id, cpu: cpu ? cpu.id : null, ram, threads, pct: r.pct, etapa: r.etapa, fpsGpu, idioma } };
}

/** Monta a chave do Blobs pra um registro. */
export function chaveDe(registro, { agora = Date.now(), pais = "", teste = false } = {}) {
  const inv = String(MAX_TEMPO - agora).padStart(13, "0");
  const rand = Math.random().toString(36).slice(2, 6).padEnd(4, "0");
  const p = /^[A-Z]{2}$/.test(pais) ? pais : "-";
  const partes = [registro.gpu, registro.cpu || "-", registro.ram, registro.threads || 0, registro.pct, registro.etapa, registro.fpsGpu || 0, p, registro.idioma];
  return (teste ? PREFIXO_TESTE : PREFIXO) + `${inv}_${rand}` + SEP + partes.join(SEP);
}

/** Lê de volta uma chave. Devolve null se a chave estiver fora do formato. */
export function lerChave(chave) {
  const semPrefixo = chave.replace(/^[rt]\//, "");
  const [id, gpu, cpu, ram, threads, pct, etapa, fpsGpu, pais, idioma] = semPrefixo.split(SEP);
  if (!id || !gpu || idioma === undefined) return null;
  const inv = Number(id.split("_")[0]);
  if (!Number.isFinite(inv)) return null;
  return {
    id,
    quando: MAX_TEMPO - inv,
    gpu, cpu: cpu === "-" ? null : cpu,
    ram: Number(ram), threads: Number(threads) || null,
    pct: Number(pct), etapa: Number(etapa),
    fpsGpu: Number(fpsGpu) || null,
    pais: pais === "-" ? null : pais,
    idioma,
  };
}

/** Resume a lista de registros pro site: contadores e os mais recentes. */
export function resumir(registros, { gpus, recentes = 12 } = {}) {
  const lista = registros.filter(Boolean).sort((a, b) => b.quando - a.quando);
  const total = lista.length;
  const nomeGpu = (id) => (gpus.find((g) => g.id === id) || { nome: id }).nome;
  const contagem = new Map();
  for (const r of lista) contagem.set(r.gpu, (contagem.get(r.gpu) || 0) + 1);
  const [topId, topQtd] = [...contagem.entries()].sort((a, b) => b[1] - a[1])[0] || [null, 0];
  return {
    total,
    jogaveis: lista.filter((r) => r.etapa >= 3).length,
    mediaPct: total ? Math.round(lista.reduce((s, r) => s + r.pct, 0) / total) : 0,
    gpuTop: topId ? { id: topId, nome: nomeGpu(topId), qtd: topQtd } : null,
    porEtapa: [0, 1, 2, 3, 4].map((e) => lista.filter((r) => r.etapa === e).length),
    recentes: lista.slice(0, recentes),
  };
}
