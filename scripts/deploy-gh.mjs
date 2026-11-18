// Publishes to GitHub without git: source -> main, dist/ -> gh-pages (GitHub Pages serves gh-pages).
// Same layout as the mirai-denwa repo. Needs the GitHub CLI signed in (`gh auth login`).
// Usage: npm run build && GH=/path/to/gh node scripts/deploy-gh.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const REPO = process.env.REPO || 'goro828828/kinotake';
const GH = process.env.GH || 'gh';
const SKIP = new Set(['node_modules', 'dist', 'artifact', '.claude', '.git', '.DS_Store']);

function api(method, path, body) {
  const args = ['api', '-X', method, path];
  if (body) args.push('--input', '-');
  try {
    const out = execFileSync(GH, args, { input: body ? JSON.stringify(body) : undefined, stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 64 << 20 });
    const s = out.toString();
    return s ? JSON.parse(s) : null;
  } catch (e) {
    const msg = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
    const err = new Error(`${method} ${path}: ${msg}`);
    err.notFound = /Not Found|404|Git Repository is empty|409/.test(msg);
    throw err;
  }
}

function walk(dir, root = dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) walk(abs, root, out);
    else out.push({ path: relative(root, abs).split(sep).join('/'), abs });
  }
  return out;
}

function refSha(branch) {
  try { return api('GET', `repos/${REPO}/git/ref/heads/${branch}`).object.sha; }
  catch (e) { if (e.notFound) return null; throw e; }
}

function commitFiles(branch, files, message) {
  const tree = files.map((f) => {
    const content = f.abs ? readFileSync(f.abs) : Buffer.from(f.text ?? '');
    const blob = api('POST', `repos/${REPO}/git/blobs`, { content: content.toString('base64'), encoding: 'base64' });
    return { path: f.path, mode: '100644', type: 'blob', sha: blob.sha };
  });
  const t = api('POST', `repos/${REPO}/git/trees`, { tree });
  const parent = refSha(branch);
  const c = api('POST', `repos/${REPO}/git/commits`, { message, tree: t.sha, parents: parent ? [parent] : [] });
  if (parent) api('PATCH', `repos/${REPO}/git/refs/heads/${branch}`, { sha: c.sha, force: false });
  else api('POST', `repos/${REPO}/git/refs`, { ref: `refs/heads/${branch}`, sha: c.sha });
  console.log(`${branch}: ${files.length} files -> ${c.sha.slice(0, 7)}`);
}

// an empty repo has no git database yet; one contents write initialises it
if (!refSha('main')) {
  api('PUT', `repos/${REPO}/contents/README.md`, { message: 'init', content: readFileSync('README.md').toString('base64'), branch: 'main' });
}

const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
commitFiles('main', walk('.'), `Update source (${stamp})`);
commitFiles('gh-pages', [...walk('dist'), { path: '.nojekyll', text: '' }], `Deploy (${stamp})`);

try {
  api('GET', `repos/${REPO}/pages`);
} catch (e) {
  if (!e.notFound) throw e;
  api('POST', `repos/${REPO}/pages`, { source: { branch: 'gh-pages', path: '/' } });
  console.log('GitHub Pages enabled (gh-pages /)');
}
const [owner, name] = REPO.split('/');
console.log(`https://${owner}.github.io/${name}/`);
