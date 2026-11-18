// Builds one self-contained HTML file from dist/ for publishing as a Claude artifact.
// Usage: npm run build && node scripts/artifact.mjs  ->  artifact/kinotake-cup.html
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';

const assets = readdirSync('dist/assets');
const css = readFileSync(`dist/assets/${assets.find((f) => f.endsWith('.css'))}`, 'utf8');
const js = readFileSync(`dist/assets/${assets.find((f) => f.endsWith('.js'))}`, 'utf8');
if (/<\/script/i.test(js)) throw new Error('bundle contains </script');

const html = `<title>きのたけカップ</title>
<meta name="theme-color" content="#4a2c1d">
<style>
${css}
</style>
<div class="app" id="app"></div>
<script type="module">
${js}
</script>
`;
mkdirSync('artifact', { recursive: true });
writeFileSync('artifact/kinotake-cup.html', html);
console.log('wrote artifact/kinotake-cup.html', html.length, 'bytes');
