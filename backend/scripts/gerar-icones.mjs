// Executar com npm run icons. Apenas os ícones usados no painel são publicados.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';

const raiz = new URL('../../', import.meta.url);
const pacote = new URL('../node_modules/lucide-static/', import.meta.url);
const { version } = JSON.parse(await readFile(new URL('package.json', pacote), 'utf8'));
const painel = await readFile(new URL('painel.js', raiz), 'utf8');
const nomes = [...new Set([...painel.matchAll(/icone: '([a-z][a-z-]+)'/g)].map(m => m[1]))].sort();
if (!nomes.length) throw new Error('Nenhum ícone encontrado no menu.');
const simbolos = [];
for (const nome of nomes) {
  const svg = await readFile(new URL(`icons/${nome}.svg`, pacote), 'utf8');
  const corpo = svg.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/)?.[1];
  if (!corpo) throw new Error(`SVG inválido: ${nome}`);
  simbolos.push(`<symbol id="${nome}" viewBox="0 0 24 24">${corpo}</symbol>`);
}
await mkdir(new URL('assets/', raiz), { recursive: true });
await writeFile(new URL('assets/lucide.svg', raiz), `<!-- Lucide ${version}; licença em lucide-LICENSE.txt. Gerado por npm run icons. -->\n<svg xmlns="http://www.w3.org/2000/svg">\n${simbolos.join('\n')}\n</svg>\n`);
await copyFile(new URL('LICENSE', pacote), new URL('assets/lucide-LICENSE.txt', raiz));
console.log(`${nomes.length} ícones Lucide ${version} gerados em assets/lucide.svg.`);
