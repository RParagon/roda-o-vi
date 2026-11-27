/**
 * Roda o VI: motor de estimativa
 * Estima como um PC se sai rodando o build vazado do GTA VI (o executável divulgado
 * pelo Cyberleek), com base nos testes que a comunidade publicou.
 *
 * Não usa o DOM, a não ser em detectarGPU(). Funciona no navegador e no Node 18+.
 * Licença MIT. https://github.com/RParagon/roda-o-vi
 */

export const VERSAO = "1.5.0";

/**
 * Melhor fps que a comunidade conseguiu no build, usado pra calibrar as estimativas.
 * O site e o robô do GitHub atualizam esse valor com os dados do PortWatch; este é só o padrão.
 */
export const TETO_PADRAO = 25;

/** Idiomas com tradução. */
export const IDIOMAS = ["pt", "en", "es"];

/** Textos da avaliação em cada idioma. {min}, {max} e {faixa} são trocados pelos valores. */
export const TEXTOS = {
  pt: {
    etapas: ["Não abre", "Menus", "Abre o jogo", "Jogável", "Como os testados"],
    gpu: { ruim: ["Fica de fora.", "Não tem DirectX 12 Ultimate nem ray tracing, que os ports usam."], fraca: ["Fraca para o port.", "Placas assim não passaram de 1 a 4 fps."], media: ["Entra no jogo,", "mas os testes nessa faixa ficaram entre 3 e 10 fps."], ok: ["Faixa dos PCs de teste.", "É o tipo de placa que os grupos usam."] },
    cpu: { ok: ["Ótimo.", "No nível dos PCs de teste."], meio: ["Dá conta,", "mas não é ele que vai segurar o port."], ruim: ["Fraco.", "Vai travar mesmo com uma placa boa."] },
    ram: { ok: ["Suficiente.", "O port mais avançado usa uns 30GB."], meio: ["Pouca.", "O port mais avançado usa uns 30GB, então vai faltar."], ruim: ["Muito pouca", "para o port."] },
    faixa: "Algo entre {min} e {max} fps",
    port: [
      ["Ainda não.", "Não deve abrir", "Sua placa não tem os recursos gráficos que os ports usam hoje. Até o melhor PC testado fica em torno de {teto} fps."],
      ["Quase nada.", "Só os menus", "Na melhor das hipóteses o jogo abre e para nos menus, ou roda a 1–2 fps."],
      ["Mais ou menos.", "Abre, mas trava muito", "{faixa}. Dá pra ver o jogo, mas não pra jogar."],
      ["Quase.", "Dá pra andar pela cidade", "{faixa}, dependendo do build. Jogável com paciência."],
      ["Roda.", "Roda como os PCs de teste", "{faixa}, dependendo do build. É o máximo que a comunidade conseguiu até agora."],
    ],
  },
  en: {
    etapas: ["Won't start", "Menus", "Boots in", "Playable", "Like the test rigs"],
    gpu: { ruim: ["Left out.", "No DirectX 12 Ultimate or ray tracing, which the ports use."], fraca: ["Too weak for the port.", "Cards like this didn't get past 1 to 4 fps."], media: ["Gets in,", "but tests in this range landed between 3 and 10 fps."], ok: ["Test rig territory.", "This is the kind of card the groups use."] },
    cpu: { ok: ["Great.", "On par with the test rigs."], meio: ["Gets by,", "but it won't be what carries the port."], ruim: ["Weak.", "It will stutter even with a good card."] },
    ram: { ok: ["Enough.", "The most advanced port uses about 30GB."], meio: ["Not enough.", "The most advanced port uses about 30GB, so you'll run short."], ruim: ["Far too little", "for the port."] },
    faixa: "Somewhere between {min} and {max} fps",
    port: [
      ["Not yet.", "Probably won't start", "Your card lacks the graphics features the ports use today. Even the best test rig runs at around {teto} fps."],
      ["Barely.", "Menus only", "At best the game starts and stops at the menus, or runs at 1–2 fps."],
      ["Sort of.", "Boots, but stutters a lot", "{faixa}. You can see the game, but you can't really play."],
      ["Almost.", "You can walk around the city", "{faixa}, depending on the build. Playable if you're patient."],
      ["It runs.", "Runs like the test rigs", "{faixa}, depending on the build. That's the best the community has managed so far."],
    ],
  },
  es: {
    etapas: ["No arranca", "Menús", "Entra al juego", "Jugable", "Como los de prueba"],
    gpu: { ruim: ["Se queda fuera.", "No tiene DirectX 12 Ultimate ni ray tracing, que usan los ports."], fraca: ["Floja para el port.", "Tarjetas así no pasaron de 1 a 4 fps."], media: ["Entra al juego,", "pero las pruebas en este rango quedaron entre 3 y 10 fps."], ok: ["Nivel de los PCs de prueba.", "Es el tipo de tarjeta que usan los grupos."] },
    cpu: { ok: ["Excelente.", "Al nivel de los PCs de prueba."], meio: ["Cumple,", "pero no es lo que va a sostener el port."], ruim: ["Débil.", "Va a trabarse incluso con una buena tarjeta."] },
    ram: { ok: ["Suficiente.", "El port más avanzado usa unos 30GB."], meio: ["Poca.", "El port más avanzado usa unos 30GB, así que te va a faltar."], ruim: ["Muy poca", "para el port."] },
    faixa: "Entre {min} y {max} fps",
    port: [
      ["Todavía no.", "No debería arrancar", "Tu tarjeta no tiene las funciones gráficas que usan los ports. Incluso el mejor PC de prueba ronda los {teto} fps."],
      ["Casi nada.", "Solo los menús", "En el mejor caso el juego abre y se queda en los menús, o corre a 1–2 fps."],
      ["Más o menos.", "Abre, pero se traba mucho", "{faixa}. Se puede ver el juego, pero no jugarlo."],
      ["Casi.", "Puedes recorrer la ciudad", "{faixa}, según el build. Jugable con paciencia."],
      ["Corre.", "Corre como los PCs de prueba", "{faixa}, según el build. Es lo máximo que la comunidad ha logrado hasta ahora."],
    ],
  },
};

/** Etapas do port em português, da pior para a melhor. */
export const ETAPAS = TEXTOS.pt.etapas;

/** Placa usada quando a pessoa não sabe qual tem. */
const GPU_DESCONHECIDA = { id: null, nome: "Não informada", desempenho: 15, vram: 6, dx12u: false };

/**
 * Baixa as listas de placas e processadores.
 * @param {string|URL} [base] Pasta onde estão gpus.json e cpus.json. Padrão: a pasta data/ ao lado deste arquivo.
 * @returns {Promise<{gpus: object[], cpus: object[]}>}
 */
export async function carregarDados(base = new URL("../data/", import.meta.url)) {
  const pasta = String(base).endsWith("/") ? String(base) : String(base) + "/";
  const [g, c] = await Promise.all(
    ["gpus.json", "cpus.json"].map((f) => fetch(pasta + f).then((r) => {
      if (!r.ok) throw new Error(`Roda o VI: não deu pra carregar ${f} (${r.status})`);
      return r.json();
    }))
  );
  return { gpus: g.gpus, cpus: c.cpus };
}

/**
 * Lê o nome da placa de vídeo pelo WebGL. Só funciona no navegador.
 * @returns {string|null} Ex.: "ANGLE (NVIDIA, NVIDIA GeForce GTX 1050 Ti Direct3D11 ...)"
 */
export function detectarGPU() {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  } catch {
    return null;
  }
}

/** Deixa o texto do WebGL mais legível: "NVIDIA, NVIDIA GeForce GTX 1050 Ti". */
export function limparNomeGPU(texto) {
  return String(texto || "")
    .replace(/^ANGLE \(|\)$/g, "")
    .replace(/\s*\(0x[0-9A-F]+\)| Direct3D.*$| vs_\d.*$/gi, "")
    .trim();
}

/**
 * Acha a placa da lista que corresponde ao texto detectado.
 * Ganha o termo de busca mais longo, então "rtx 4070 ti super" vence "rtx 4070".
 * @returns {object|null}
 */
export function acharGPU(texto, gpus) {
  if (!texto) return null;
  const s = String(texto).toLowerCase().replace(/\(tm\)|\(r\)/g, "").replace(/\s+/g, " ");
  let melhor = null, tamanho = 0;
  for (const g of gpus) {
    for (const termo of g.busca || [g.nome.toLowerCase()]) {
      if (s.includes(termo) && termo.length > tamanho) { melhor = g; tamanho = termo.length; }
    }
  }
  return melhor;
}

/** Nota do processador quando a pessoa não escolheu o modelo, a partir das threads. */
export function notaPorThreads(threads) {
  const t = threads || 8;
  return t >= 16 ? 0.8 : t >= 12 ? 0.62 : t >= 8 ? 0.45 : 0.25;
}

/** Formata fps no padrão brasileiro: 4,1 ou 17. */
export function formatarFps(n, idioma = "pt") {
  const t = n < 10 ? n.toFixed(1) : String(Math.round(n));
  return idioma === "en" ? t : t.replace(".", ",");
}

/**
 * Faz a avaliação completa.
 * @param {object} pc
 * @param {object|null} pc.gpu   Item de gpus.json, ou null se não souber.
 * @param {object|null} pc.cpu   Item de cpus.json, ou null se não souber.
 * @param {number} pc.ramGB      RAM instalada em GB.
 * @param {number} [pc.threads]  Threads do processador, usado quando cpu é null.
 * @param {string} [pc.idioma]   "pt", "en" ou "es". Padrão: "pt".
 * @param {number} [pc.teto]     Melhor fps da comunidade no build. Padrão: TETO_PADRAO.
 */
export function avaliar({ gpu = null, cpu = null, ramGB = 16, threads, idioma = "pt", teto = TETO_PADRAO } = {}) {
  teto = Number(teto) > 0 ? Math.min(Number(teto), 240) : TETO_PADRAO;
  const T = TEXTOS[idioma] || TEXTOS.pt;
  const item = (status, [titulo, texto]) => ({ status, titulo, texto });
  const g = gpu || GPU_DESCONHECIDA;
  const p = g.desempenho, v = g.vram, u = !!g.dx12u;
  const cs = cpu ? cpu.nota : notaPorThreads(threads);
  const ram = Number(ramGB) || 16;

  // Peças
  const pecas = {
    gpu: !u ? item("ruim", T.gpu.ruim)
      : (v < 12 || p < 35) ? item("meio", T.gpu.fraca)
      : (p < 65 || v < 16) ? item("meio", T.gpu.media)
      : item("ok", T.gpu.ok),
    cpu: cs >= 0.85 ? item("ok", T.cpu.ok) : cs >= 0.55 ? item("meio", T.cpu.meio) : item("ruim", T.cpu.ruim),
    ram: ram >= 32 ? item("ok", T.ram.ok) : ram >= 16 ? item("meio", T.ram.meio) : item("ruim", T.ram.ruim),
  };

  // Port da comunidade: faixa de fps e compatibilidade
  const fv = v >= 16 ? 1 : v >= 12 ? 0.5 : v >= 8 ? 0.25 : 0;
  const fr = ram >= 32 ? 1 : ram >= 16 ? 0.5 : 0.2;
  const fc = 0.5 + 0.5 * cs;
  // Calibrado pra que um PC igual ao do topo do ranking chegue perto do melhor fps publicado
  const max = u ? Math.round(Math.min((p / 85) * 26, 28) * (teto / TETO_PADRAO) * fv * fr * fc * 10) / 10 : 0;
  const min = Math.round(max * 0.25 * 10) / 10;
  const pct = u
    ? Math.round(100 * (0.6 * Math.min(p / 85, 1) * fv + 0.25 * fr + 0.15 * cs))
    : Math.round(100 * (0.1 * fr + 0.06 * cs));

  // "Como os testados" acompanha o teto: quando os builds melhoram, a régua sobe junto
  const etapa = !u ? 0 : max < 2 ? 1 : max < 8 ? 2 : max < Math.max(16, teto * 0.64) ? 3 : 4;
  const faixa = T.faixa.replace("{min}", formatarFps(min, idioma)).replace("{max}", formatarFps(max, idioma));
  const [resposta, portTitulo, portTexto] = T.port[etapa];
  const port = { titulo: portTitulo, texto: portTexto.replace("{faixa}", faixa).replace("{teto}", formatarFps(teto, idioma)) };

  return {
    versao: VERSAO,
    pct,
    fps: { min, max },
    abre: u,
    etapa,
    etapaNome: T.etapas[etapa],
    teto,
    idioma: TEXTOS[idioma] ? idioma : "pt",
    resposta,
    port,
    pecas,
  };
}

/**
 * Sugere a troca mais simples que leva o PC pelo menos até "Jogável" (ou à etapa seguinte, se já for jogável).
 * Primeiro tenta só subir a RAM pra 32 GB. Se não bastar, procura a placa mais fraca
 * (a mais barata, em geral) que resolve, com a RAM atual ou com 32 GB, e fica com a mais fraca das duas.
 * @returns {null | { de: number, para: number, ramGB: number|null, gpu: object|null }}
 *   null quando o PC já está na melhor etapa ou nada na lista resolve.
 */
export function sugerirUpgrade({ gpu = null, cpu = null, ramGB = 16, threads, teto } = {}, gpus = []) {
  const base = { cpu, threads, teto };
  const etapaCom = (g, ram) => avaliar({ ...base, gpu: g, ramGB: ram }).etapa;
  const atual = etapaCom(gpu, ramGB);
  if (atual >= ETAPAS.length - 1) return null;
  const alvo = Math.max(atual + 1, 3);

  if (ramGB < 32 && etapaCom(gpu, 32) >= alvo) return { de: atual, para: etapaCom(gpu, 32), ramGB: 32, gpu: null };

  const minimo = gpu ? gpu.desempenho : 0;
  const candidatas = gpus.filter((g) => g.dx12u && g.desempenho > minimo).sort((a, b) => a.desempenho - b.desempenho);
  let melhor = null;
  for (const ram of ramGB < 32 ? [ramGB, 32] : [ramGB]) {
    const g = candidatas.find((x) => etapaCom(x, ram) >= alvo);
    if (g && (!melhor || g.desempenho < melhor.gpu.desempenho)) {
      melhor = { de: atual, para: etapaCom(g, ram), ramGB: ram !== ramGB ? ram : null, gpu: g };
    }
  }
  return melhor;
}
