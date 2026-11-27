// GET /api/mural: contadores e os resultados mais recentes do mural da comunidade.
// Com ?teste=1 lista só os envios de teste (que nunca aparecem no site).
import { getStore } from "@netlify/blobs";
import gpusData from "../../data/gpus.json" with { type: "json" };
import { PREFIXO, PREFIXO_TESTE, lerChave, resumir } from "../../lib/mural.js";

export default async (req) => {
  const teste = new URL(req.url).searchParams.get("teste") === "1";
  try {
    const store = getStore("mural");
    const { blobs } = await store.list({ prefix: teste ? PREFIXO_TESTE : PREFIXO });
    const resumo = resumir(blobs.map((b) => lerChave(b.key)), { gpus: gpusData.gpus });
    return Response.json(resumo, {
      headers: {
        // Guarda no CDN por 30 s: aguenta muita gente sem chamar a função toda hora
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Netlify-CDN-Cache-Control": teste ? "no-store" : "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (e) {
    console.error("mural: falha ao listar", e);
    return Response.json({ erro: "mural indisponível" }, { status: 503 });
  }
};

export const config = { path: "/api/mural", method: "GET" };
