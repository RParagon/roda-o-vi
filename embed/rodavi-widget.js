/**
 * Roda o VI: widget <roda-vi-teste>
 *
 * Uso:
 *   <script type="module" src="https://roda-o-vi.netlify.app/embed/rodavi-widget.js"></script>
 *   <roda-vi-teste idioma="pt"></roda-vi-teste>
 *
 * Atributos:
 *   idioma   "pt", "en" ou "es". Sem ele, usa o idioma do navegador.
 *   dados    Pasta alternativa com gpus.json e cpus.json.
 *
 * Cores (CSS no seu site):
 *   roda-vi-teste { --rodavi-fundo:#12141D; --rodavi-texto:#ECEEF3; --rodavi-mudo:#9A9EAC; --rodavi-borda:rgba(255,255,255,.12);
 *                   --rodavi-trilho:rgba(255,255,255,.12); --rodavi-campo:rgba(0,0,0,.25); --rodavi-raio:20px; }
 *
 * Evento:
 *   "rodavi:resultado", com o resultado completo em event.detail.
 *
 * Licença MIT. https://github.com/RParagon/roda-o-vi
 */
import { carregarDados, detectarGPU, acharGPU, avaliar, sugerirUpgrade, formatarFps, TEXTOS, IDIOMAS } from "../lib/rodavi.js";

const SITE = "https://roda-o-vi.netlify.app/";

const UI = {
  pt: { titulo: "Roda o VI?", sub: "Seu PC aguenta o port do GTA VI?", botao: "Testar meu PC", gpu: "Placa de vídeo", cpu: "Processador", ram: "RAM", naoSei: "Não sei", ram64: "64 GB ou mais", port: "No build do Cyberleek", falta: "O que falta", fGpu: "Placa {gpu} ou melhor", fRam: "32 GB de RAM", fRes: "Chega em “{etapa}”.", topo: "Já está no nível dos melhores PCs testados.", compat: "compatível com o melhor PC testado", fps: "fps estimado", rodape: "Ver o teste completo", sem: "Não deve abrir" },
  en: { titulo: "Roda o VI?", sub: "Can your PC handle the GTA VI port?", botao: "Test my PC", gpu: "Graphics card", cpu: "Processor", ram: "RAM", naoSei: "Not sure", ram64: "64 GB or more", port: "On Cyberleek's build", falta: "What it takes", fGpu: "{gpu} or better", fRam: "32 GB of RAM", fRes: "Gets you to “{etapa}”.", topo: "Already on par with the best tested PCs.", compat: "compatible with the best tested PC", fps: "estimated fps", rodape: "See the full test", sem: "Won't start" },
  es: { titulo: "Roda o VI?", sub: "¿Tu PC aguanta el port de GTA VI?", botao: "Probar mi PC", gpu: "Tarjeta gráfica", cpu: "Procesador", ram: "RAM", naoSei: "No sé", ram64: "64 GB o más", port: "En el build de Cyberleek", falta: "Lo que falta", fGpu: "{gpu} o mejor", fRam: "32 GB de RAM", fRes: "Llegas a “{etapa}”.", topo: "Ya está al nivel de los mejores PCs probados.", compat: "compatible con el mejor PC probado", fps: "fps estimados", rodape: "Ver la prueba completa", sem: "No arranca" },
};

const ESTILO = `
  :host{--rodavi-fundo:#12141D;--rodavi-texto:#ECEEF3;--rodavi-mudo:#9A9EAC;--rodavi-borda:rgba(255,255,255,.12);--rodavi-raio:20px;--rodavi-trilho:rgba(255,255,255,.12);--rodavi-campo:rgba(0,0,0,.25);
    --rodavi-grad:linear-gradient(90deg,#7A5CFF 0%,#FF2E7E 55%,#FF8A3D 100%);
    display:block;max-width:420px;font:400 14px/1.5 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--rodavi-texto)}
  *{box-sizing:border-box}
  .card{background:var(--rodavi-fundo);border:1px solid var(--rodavi-borda);border-radius:var(--rodavi-raio);padding:20px}
  .topo{display:flex;align-items:center;gap:12px}
  .anel{width:44px;height:44px;flex:none}
  .anel circle{fill:none;stroke-width:5}
  .anel .v{stroke-dasharray:100 100;transition:stroke-dasharray 1.4s cubic-bezier(.2,.9,.25,1)}
  @media (prefers-reduced-motion:reduce){.anel .v{transition:none}}
  h2{margin:0;font:800 19px/1.1 "Inter Tight",Inter,system-ui,sans-serif;letter-spacing:-.02em}
  .sub{margin:2px 0 0;color:var(--rodavi-mudo);font-size:13px}
  .pct{margin-left:auto;font:800 22px/1 "Inter Tight",Inter,system-ui,sans-serif;font-variant-numeric:tabular-nums}
  button{width:100%;margin-top:16px;font:700 15px/1 Inter,system-ui,sans-serif;color:#fff;border:0;border-radius:999px;padding:13px 18px;cursor:pointer;background:var(--rodavi-grad)}
  button:hover{filter:brightness(1.08)}
  button:focus-visible,select:focus-visible,a:focus-visible{outline:2px solid #FFC24D;outline-offset:2px}
  .campos{display:grid;gap:8px;margin-top:14px}
  label{display:grid;grid-template-columns:110px 1fr;align-items:center;gap:10px;font-size:13px;color:var(--rodavi-mudo)}
  select{width:100%;font:600 13px/1.2 Inter,system-ui,sans-serif;color:var(--rodavi-texto);background:var(--rodavi-campo);border:1px solid var(--rodavi-borda);border-radius:10px;padding:9px 10px}
  .res{margin-top:16px;padding-top:14px;border-top:1px solid var(--rodavi-borda);display:none}
  .res.on{display:block}
  .linha{display:flex;justify-content:space-between;gap:12px;align-items:baseline}
  .rot{font-size:12px;color:var(--rodavi-mudo)}
  .big{font:800 20px/1.15 "Inter Tight",Inter,system-ui,sans-serif;letter-spacing:-.02em;margin:2px 0 4px}
  .fps{font:800 18px/1 "Inter Tight",Inter,system-ui,sans-serif;white-space:nowrap}
  .txt{margin:0;color:var(--rodavi-mudo);font-size:13px}
  .of{margin-top:12px}
  .barra{height:6px;border-radius:999px;background:var(--rodavi-trilho);overflow:hidden;margin-top:12px}
  .barra i{display:block;height:100%;width:0;background:var(--rodavi-grad);transition:width 1.2s ease}
  .compat{font-size:12px;color:var(--rodavi-mudo);margin-top:6px}
  a{display:inline-block;margin-top:14px;font-size:12.5px;font-weight:600;color:#FFC24D;text-decoration:none}
`;

class RodaViTeste extends HTMLElement {
  static get observedAttributes() { return ["idioma"]; }

  connectedCallback() {
    if (this.shadowRoot) return;
    this.attachShadow({ mode: "open" });
    this.render();
    this.iniciar();
  }

  attributeChangedCallback() {
    if (this.shadowRoot && this.dados) { this.render(); this.preencher(); if (this.ultimo) this.calcular(); }
  }

  get idioma() {
    const a = (this.getAttribute("idioma") || navigator.language || "pt").slice(0, 2).toLowerCase();
    return IDIOMAS.includes(a) ? a : "en";
  }

  render() {
    const u = UI[this.idioma];
    this.shadowRoot.innerHTML = `<style>${ESTILO}</style>
      <div class="card" part="card">
        <div class="topo">
          <svg class="anel" viewBox="0 0 44 44" aria-hidden="true">
            <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7A5CFF"/><stop offset=".55" stop-color="#FF2E7E"/><stop offset="1" stop-color="#FF8A3D"/></linearGradient></defs>
            <circle cx="22" cy="22" r="18" style="stroke:var(--rodavi-trilho)"/>
            <circle class="v" cx="22" cy="22" r="18" stroke="url(#g)" stroke-linecap="round" pathLength="100" transform="rotate(-90 22 22)"/>
          </svg>
          <div><h2>${u.titulo}</h2><p class="sub">${u.sub}</p></div>
          <span class="pct" aria-live="polite"></span>
        </div>
        <button type="button" part="botao">${u.botao}</button>
        <div class="campos">
          <label>${u.gpu}<select data-c="gpu"></select></label>
          <label>${u.cpu}<select data-c="cpu"></select></label>
          <label>${u.ram}<select data-c="ram">
            <option value="8">8 GB</option><option value="16" selected>16 GB</option><option value="24">24 GB</option><option value="32">32 GB</option><option value="48">48 GB</option><option value="64">${u.ram64}</option>
          </select></label>
        </div>
        <div class="res" aria-live="polite">
          <div class="linha"><span class="rot">${u.port}</span><span class="rot">${u.fps}</span></div>
          <div class="linha"><div class="big" data-r="port"></div><div class="fps" data-r="fps"></div></div>
          <p class="txt" data-r="portTxt"></p>
          <div class="barra"><i></i></div>
          <div class="compat" data-r="compat"></div>
          <div class="of"><span class="rot">${u.falta}</span><div class="big" data-r="of"></div><p class="txt" data-r="ofTxt"></p></div>
        </div>
        <a href="${SITE}" target="_blank" rel="noopener">${u.rodape}</a>
      </div>`;
    const $ = (s) => this.shadowRoot.querySelector(s);
    this.el = { botao: $("button"), gpu: $('[data-c="gpu"]'), cpu: $('[data-c="cpu"]'), ram: $('[data-c="ram"]'), res: $(".res"), anel: $(".anel .v"), pct: $(".pct"), barra: $(".barra i") };
    this.el.botao.addEventListener("click", () => this.testar());
    ["gpu", "cpu", "ram"].forEach((k) => this.el[k].addEventListener("change", () => this.calcular()));
  }

  async iniciar() {
    try {
      const base = this.getAttribute("dados") || new URL("../data/", import.meta.url);
      this.dados = await carregarDados(base);
      this.preencher();
    } catch (e) {
      console.error(e);
    }
  }

  preencher() {
    const u = UI[this.idioma];
    const { gpus, cpus } = this.dados;
    const g = this.el.gpu, c = this.el.cpu;
    g.innerHTML = c.innerHTML = "";
    g.add(new Option(u.naoSei, -1)); gpus.forEach((x, i) => g.add(new Option(`${x.nome} · ${x.vram}GB`, i)));
    c.add(new Option(u.naoSei, -1)); cpus.forEach((x, i) => c.add(new Option(x.nome, i)));
    if (this.ultimo) { g.value = this.ultimo.g; c.value = this.ultimo.c; this.el.ram.value = this.ultimo.r; }
  }

  testar() {
    if (!this.dados) return;
    const gpu = acharGPU(detectarGPU(), this.dados.gpus);
    if (gpu) this.el.gpu.value = this.dados.gpus.indexOf(gpu);
    this.calcular();
  }

  calcular() {
    if (!this.dados) return;
    const u = UI[this.idioma];
    const gpu = this.dados.gpus[+this.el.gpu.value] || null;
    const cpu = this.dados.cpus[+this.el.cpu.value] || null;
    const ramGB = +this.el.ram.value;
    this.ultimo = { g: this.el.gpu.value, c: this.el.cpu.value, r: this.el.ram.value };
    const r = avaliar({ gpu, cpu, ramGB, threads: navigator.hardwareConcurrency, idioma: this.idioma });
    const $ = (k) => this.shadowRoot.querySelector(`[data-r="${k}"]`);
    $("port").textContent = r.port.titulo;
    $("portTxt").textContent = r.port.texto;
    $("fps").textContent = r.abre ? `${formatarFps(r.fps.min, r.idioma)}–${formatarFps(r.fps.max, r.idioma)}` : "0";
    $("compat").textContent = `${r.pct}% ${u.compat}`;
    const up = sugerirUpgrade({ gpu, cpu, ramGB, threads: navigator.hardwareConcurrency }, this.dados.gpus);
    if (up) {
      $("of").textContent = [up.gpu ? u.fGpu.replace("{gpu}", up.gpu.nome) : "", up.ramGB ? u.fRam : ""].filter(Boolean).join(" + ");
      $("ofTxt").textContent = u.fRes.replace("{etapa}", TEXTOS[r.idioma].etapas[up.para]);
    } else { $("of").textContent = "✓"; $("ofTxt").textContent = u.topo; }
    this.el.pct.textContent = r.pct + "%";
    this.el.res.classList.add("on");
    const a = this.el.anel;
    if (!a.dataset.ok) { a.style.transition = "none"; a.style.strokeDasharray = "0 100"; a.getBoundingClientRect(); a.style.transition = ""; a.dataset.ok = 1; }
    requestAnimationFrame(() => { a.style.strokeDasharray = `${Math.max(r.pct, 3)} 100`; this.el.barra.style.width = r.pct + "%"; });
    this.dispatchEvent(new CustomEvent("rodavi:resultado", { detail: { ...r, gpu, cpu, ramGB }, bubbles: true, composed: true }));
  }
}

if (!customElements.get("roda-vi-teste")) customElements.define("roda-vi-teste", RodaViTeste);
export { RodaViTeste };
