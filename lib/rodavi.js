/**
 * Roda o VI: motor de estimativa
 * Estima se um PC aguenta os ports de PC do GTA VI feitos pela comunidade
 * e como ele deve se sair na versão oficial de PC, comparando com o PS5.
 *
 * Não usa o DOM, a não ser em detectarGPU(). Funciona no navegador e no Node 18+.
 * Licença MIT. https://github.com/RafaeltCMSP/roda-o-vi
 */

export const VERSAO = "1.0.0";

/** Desempenho aproximado do PS5 na mesma escala dos dados (RTX 4090 = 100). */
export const PS5 = 30;

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
      ["Ainda não.", "Não deve abrir", "Sua placa não tem os recursos gráficos que os ports usam hoje. Até o melhor PC testado fica em torno de 22 fps."],
      ["Quase nada.", "Só os menus", "Na melhor das hipóteses o jogo abre e para nos menus, ou roda a 1–2 fps."],
      ["Mais ou menos.", "Abre, mas trava muito", "{faixa}. Dá pra ver o jogo, mas não pra jogar."],
      ["Quase.", "Dá pra andar pela cidade", "{faixa}, dependendo do build. Jogável com paciência."],
      ["Roda.", "Roda como os PCs de teste", "{faixa}, dependendo do build. É o máximo que a comunidade conseguiu até agora."],
    ],
    oficial: {
      fraca: ["Abaixo do mínimo provável", "Fica bem abaixo do PS5. Pode nem abrir se o jogo exigir ray tracing."],
      r2: ["1440p no alto, 60 fps", "Bem acima do PS5. Deve sobrar desempenho pra jogar com qualidade."],
      r13: ["1080p a 1440p no alto", "Acima do PS5. Deve rodar melhor que no console."],
      r09: ["Nível de console, 1080p", "Parecido com o PS5: 30 a 45 fps em 1080p."],
      r055: ["1080p no baixo, com FSR", "Abaixo do PS5. Deve rodar com upscaling e gráficos no mínimo."],
      baixa: ["Abaixo do mínimo provável", "Muito abaixo do PS5. Vale pensar em trocar a placa de vídeo."],
      semRT: " Se o jogo exigir ray tracing, sua placa não abre.",
    },
  },
  en: {
    etapas: ["Won't start", "Menus", "Boots in", "Playable", "Like the test rigs"],
    gpu: { ruim: ["Left out.", "No DirectX 12 Ultimate or ray tracing, which the ports use."], fraca: ["Too weak for the port.", "Cards like this didn't get past 1 to 4 fps."], media: ["Gets in,", "but tests in this range landed between 3 and 10 fps."], ok: ["Test rig territory.", "This is the kind of card the groups use."] },
    cpu: { ok: ["Great.", "On par with the test rigs."], meio: ["Gets by,", "but it won't be what carries the port."], ruim: ["Weak.", "It will stutter even with a good card."] },
    ram: { ok: ["Enough.", "The most advanced port uses about 30GB."], meio: ["Not enough.", "The most advanced port uses about 30GB, so you'll run short."], ruim: ["Far too little", "for the port."] },
    faixa: "Somewhere between {min} and {max} fps",
    port: [
      ["Not yet.", "Probably won't start", "Your card lacks the graphics features the ports use today. Even the best test rig runs at around 22 fps."],
      ["Barely.", "Menus only", "At best the game starts and stops at the menus, or runs at 1–2 fps."],
      ["Sort of.", "Boots, but stutters a lot", "{faixa}. You can see the game, but you can't really play."],
      ["Almost.", "You can walk around the city", "{faixa}, depending on the build. Playable if you're patient."],
      ["It runs.", "Runs like the test rigs", "{faixa}, depending on the build. That's the best the community has managed so far."],
    ],
    oficial: {
      fraca: ["Below the likely minimum", "Well below the PS5. It may not start at all if the game requires ray tracing."],
      r2: ["1440p high, 60 fps", "Well above the PS5. You should have headroom for high settings."],
      r13: ["1080p to 1440p high", "Above the PS5. It should run better than on console."],
      r09: ["Console level, 1080p", "Similar to the PS5: 30 to 45 fps at 1080p."],
      r055: ["1080p low, with FSR", "Below the PS5. Expect upscaling and minimum settings."],
      baixa: ["Below the likely minimum", "Far below the PS5. Consider upgrading your graphics card."],
      semRT: " If the game requires ray tracing, your card won't start it.",
    },
  },
  es: {
    etapas: ["No arranca", "Menús", "Entra al juego", "Jugable", "Como los de prueba"],
    gpu: { ruim: ["Se queda fuera.", "No tiene DirectX 12 Ultimate ni ray tracing, que usan los ports."], fraca: ["Floja para el port.", "Tarjetas así no pasaron de 1 a 4 fps."], media: ["Entra al juego,", "pero las pruebas en este rango quedaron entre 3 y 10 fps."], ok: ["Nivel de los PCs de prueba.", "Es el tipo de tarjeta que usan los grupos."] },
    cpu: { ok: ["Excelente.", "Al nivel de los PCs de prueba."], meio: ["Cumple,", "pero no es lo que va a sostener el port."], ruim: ["Débil.", "Va a trabarse incluso con una buena tarjeta."] },
    ram: { ok: ["Suficiente.", "El port más avanzado usa unos 30GB."], meio: ["Poca.", "El port más avanzado usa unos 30GB, así que te va a faltar."], ruim: ["Muy poca", "para el port."] },
    faixa: "Entre {min} y {max} fps",
    port: [
      ["Todavía no.", "No debería arrancar", "Tu tarjeta no tiene las funciones gráficas que usan los ports. Incluso el mejor PC de prueba ronda los 22 fps."],
      ["Casi nada.", "Solo los menús", "En el mejor caso el juego abre y se queda en los menús, o corre a 1–2 fps."],
      ["Más o menos.", "Abre, pero se traba mucho", "{faixa}. Se puede ver el juego, pero no jugarlo."],
      ["Casi.", "Puedes recorrer la ciudad", "{faixa}, según el build. Jugable con paciencia."],
      ["Corre.", "Corre como los PCs de prueba", "{faixa}, según el build. Es lo máximo que la comunidad ha logrado hasta ahora."],
    ],
    oficial: {
      fraca: ["Por debajo del mínimo probable", "Muy por debajo de la PS5. Puede que ni arranque si el juego exige ray tracing."],
      r2: ["1440p en alto, 60 fps", "Muy por encima de la PS5. Debería sobrar rendimiento."],
      r13: ["1080p a 1440p en alto", "Por encima de la PS5. Debería correr mejor que en consola."],
      r09: ["Nivel consola, 1080p", "Parecido a la PS5: 30 a 45 fps en 1080p."],
      r055: ["1080p en bajo, con FSR", "Por debajo de la PS5. Con escalado y gráficos al mínimo."],
      baixa: ["Por debajo del mínimo probable", "Muy por debajo de la PS5. Conviene cambiar la tarjeta gráfica."],
      semRT: " Si el juego exige ray tracing, tu tarjeta no lo abrirá.",
    },
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
 */
export function avaliar({ gpu = null, cpu = null, ramGB = 16, threads, idioma = "pt" } = {}) {
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
  const max = u ? Math.round(Math.min((p / 85) * 26, 28) * fv * fr * fc * 10) / 10 : 0;
  const min = Math.round(max * 0.25 * 10) / 10;
  const pct = u
    ? Math.round(100 * (0.6 * Math.min(p / 85, 1) * fv + 0.25 * fr + 0.15 * cs))
    : Math.round(100 * (0.1 * fr + 0.06 * cs));

  const etapa = !u ? 0 : max < 2 ? 1 : max < 8 ? 2 : max < 16 ? 3 : 4;
  const faixa = T.faixa.replace("{min}", formatarFps(min, idioma)).replace("{max}", formatarFps(max, idioma));
  const [resposta, portTitulo, portTexto] = T.port[etapa];
  const port = { titulo: portTitulo, texto: portTexto.replace("{faixa}", faixa) };

  // Versão oficial, comparando com o PS5
  let r = p / PS5; if (v < 8) r *= 0.6;
  const O = T.oficial;
  const [ot, ox] = (!u && p < 20) ? O.fraca : r >= 2 ? O.r2 : r >= 1.3 ? O.r13 : r >= 0.9 ? O.r09 : r >= 0.55 ? O.r055 : O.baixa;
  const oficial = { titulo: ot, texto: ox + (!u && p >= 20 ? O.semRT : "") };

  return {
    versao: VERSAO,
    pct,
    fps: { min, max },
    abre: u,
    etapa,
    etapaNome: T.etapas[etapa],
    idioma: TEXTOS[idioma] ? idioma : "pt",
    resposta,
    port,
    oficial,
    pecas,
  };
}
