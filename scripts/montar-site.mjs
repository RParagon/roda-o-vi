// Monta a pasta dist/ que a Netlify publica, só com os arquivos do site.
// Assim o código das funções, os scripts e as dependências não ficam públicos.
import { cpSync, rmSync, mkdirSync } from "node:fs";

const raiz = new URL("../", import.meta.url);
const dist = new URL("dist/", raiz);
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist);
for (const item of ["index.html", "embed", "lib", "data", "i18n"]) {
  cpSync(new URL(item, raiz), new URL(item, dist), { recursive: true });
}
console.log("✓ Site montado em dist/");
