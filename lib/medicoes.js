/**
 * Roda o VI: medições feitas no navegador
 * Tudo roda localmente. Nada é enviado pra lugar nenhum.
 * Licença MIT. https://github.com/RParagon/roda-o-vi
 */

const pausa = () => new Promise((r) => setTimeout(r, 0));

/** Sistema operacional e navegador. Ex.: { so: "Windows 11", navegador: "Chrome 142" } */
export async function lerSistema() {
  const ua = navigator.userAgent;
  let so = /Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "macOS" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Linux/.test(ua) ? "Linux" : "";
  let navegador = "";
  const m = ua.match(/(Edg|OPR|Firefox|Chrome|Version)\/(\d+)/);
  if (m) navegador = ({ Edg: "Edge", OPR: "Opera", Version: "Safari" }[m[1]] || m[1]) + " " + m[2];
  try {
    const d = navigator.userAgentData;
    if (d && d.getHighEntropyValues) {
      const h = await d.getHighEntropyValues(["platformVersion", "fullVersionList"]);
      if (h.platform === "Windows") so = parseInt(h.platformVersion) >= 13 ? "Windows 11" : "Windows 10";
      else if (h.platform) so = h.platform;
      // Ignora as marcas falsas ("Not:A-Brand") e prefere o nome real do navegador ao "Chromium"
      const lista = (h.fullVersionList || []).filter((b) => !/not.?a.?brand/i.test(b.brand));
      const marca = lista.find((b) => !/chromium/i.test(b.brand)) || lista[0];
      if (marca) navegador = `${marca.brand.replace("Google ", "").replace("Microsoft ", "")} ${parseInt(marca.version)}`;
    }
  } catch { /* segue com o userAgent */ }
  return { so, navegador };
}

/** Recursos gráficos do navegador. */
export async function lerRecursosGraficos() {
  const c = document.createElement("canvas");
  const gl2 = c.getContext("webgl2");
  const gl = gl2 || c.getContext("webgl");
  const textura = gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0;
  let webgpu = false, arquitetura = "";
  try {
    if (navigator.gpu) {
      const a = await navigator.gpu.requestAdapter();
      if (a) {
        webgpu = true;
        const info = a.info || (a.requestAdapterInfo ? await a.requestAdapterInfo() : null);
        arquitetura = (info && info.architecture) || "";
      }
    }
  } catch { /* sem WebGPU */ }
  return { webgl2: !!gl2, webgl: !!gl, textura, webgpu, arquitetura };
}

/**
 * Teste de GPU: desenha um shader pesado por `ms` milissegundos e conta os quadros.
 * Devolve quadros por segundo, ou null se não houver WebGL.
 */
export async function testarGPU(ms = 1000, progresso = () => {}) {
  const c = document.createElement("canvas");
  c.width = c.height = 384;
  const gl = c.getContext("webgl2", { antialias: false }) || c.getContext("webgl", { antialias: false });
  if (!gl) return null;
  const sh = (tipo, src) => { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}"));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER,
    "precision highp float;uniform float t;void main(){vec2 u=gl_FragCoord.xy/384.;float s=0.;" +
    "for(int i=0;i<128;i++){float f=float(i);s+=sin(u.x*f*1.7+t)*cos(u.y*f*1.3-t)+sin(s*.5);}" +
    "gl_FragColor=vec4(fract(s),u,1.);}"));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
  gl.useProgram(p);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(p, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const ut = gl.getUniformLocation(p, "t");
  const px = new Uint8Array(4);
  let quadros = 0;
  const t0 = performance.now();
  while (performance.now() - t0 < ms) {
    gl.uniform1f(ut, quadros * 0.01);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); // espera a GPU terminar o quadro
    quadros++;
    if (quadros % 3 === 0) { progresso(Math.min((performance.now() - t0) / ms, 1)); await pausa(); }
  }
  const seg = (performance.now() - t0) / 1000;
  const ext = gl.getExtension("WEBGL_lose_context");
  if (ext) ext.loseContext();
  return Math.round(quadros / seg);
}

/** Teste de CPU: conta quantos blocos de cálculo cabem em `ms` milissegundos. Devolve pontos (blocos por segundo). */
export async function testarCPU(ms = 700, progresso = () => {}) {
  let blocos = 0, x = 0;
  const t0 = performance.now();
  while (performance.now() - t0 < ms) {
    const fatia = performance.now();
    while (performance.now() - fatia < 14) {
      for (let i = 1; i < 4000; i++) x += Math.sqrt(i * (blocos + 1)) * Math.sin(i) / i;
      blocos++;
    }
    progresso(Math.min((performance.now() - t0) / ms, 1));
    await pausa();
  }
  if (x === 42) console.log(x); // evita que o cálculo seja descartado
  return Math.round(blocos / ((performance.now() - t0) / 1000));
}

/** Tela: resolução real e taxa de atualização medida pelos quadros do navegador. */
export async function lerTela(ms = 600, progresso = () => {}) {
  const dpr = window.devicePixelRatio || 1;
  const largura = Math.round(screen.width * dpr), altura = Math.round(screen.height * dpr);
  const hz = await new Promise((ok) => {
    let n = 0; const t0 = performance.now();
    const f = (t) => {
      n++; progresso(Math.min((t - t0) / ms, 1));
      if (t - t0 < ms) requestAnimationFrame(f);
      else {
        const bruto = (n - 1) / ((t - t0) / 1000);
        const comuns = [30, 50, 60, 75, 90, 100, 120, 144, 165, 180, 240, 360];
        ok(comuns.reduce((a, b) => (Math.abs(b - bruto) < Math.abs(a - bruto) ? b : a)));
      }
    };
    requestAnimationFrame(f);
  });
  return { largura, altura, hz };
}
