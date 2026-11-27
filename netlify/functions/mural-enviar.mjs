// POST /api/mural/enviar: guarda um resultado no mural, só quando a pessoa clica em "Mostrar no mural".
// O resultado é recalculado aqui com o mesmo motor do site, então não dá pra mandar nota falsa.
// Guarda placa, processador, RAM, resultado e país. Não guarda IP, nome nem texto livre.
import { getStore } from "@netlify/blobs";
import gpusData from "../../data/gpus.json" with { type: "json" };
import cpusData from "../../data/cpus.json" with { type: "json" };
import calibracao from "../../data/calibracao.json" with { type: "json" };
import { validarEnvio, chaveDe, lerChave } from "../../lib/mural.js";

export default async (req, context) => {
  let corpo;
  try {
    const texto = await req.text();
    if (texto.length > 2000) return Response.json({ erro: "envio grande demais" }, { status: 413 });
    corpo = JSON.parse(texto);
  } catch {
    return Response.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const v = validarEnvio(corpo, { gpus: gpusData.gpus, cpus: cpusData.cpus, teto: calibracao.melhorFps });
  if (!v.ok) return Response.json({ erro: v.erro }, { status: 400 });

  const pais = context.geo && context.geo.country ? String(context.geo.country.code || "") : "";
  const chave = chaveDe(v.registro, { pais, teste: corpo.teste === true });
  try {
    await getStore("mural").set(chave, "1");
  } catch (e) {
    console.error("mural: falha ao salvar", e);
    return Response.json({ erro: "mural indisponível" }, { status: 503 });
  }
  return Response.json({ ok: true, registro: lerChave(chave) }, { status: 201 });
};

export const config = {
  path: "/api/mural/enviar",
  method: "POST",
  // Até 5 envios por minuto por pessoa, pra ninguém lotar o mural
  rateLimit: { action: "rate_limit", aggregateBy: ["ip", "domain"], windowSize: 60, windowLimit: 5 },
};
