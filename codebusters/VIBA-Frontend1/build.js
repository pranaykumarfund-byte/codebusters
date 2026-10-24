import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const source = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(source, 'dist');
const apiBase = String(process.env.VIBA_API_BASE || '').trim().replace(/\/+$/, '');

if (!apiBase) {
  throw new Error('Set VIBA_API_BASE to the deployed Render service URL before building the Vercel frontend.');
}

let apiUrl;
try {
  apiUrl = new URL(apiBase);
} catch {
  throw new Error('VIBA_API_BASE must be a complete URL, for example https://viba-api.onrender.com.');
}
if (apiUrl.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(apiUrl.hostname)) {
  throw new Error('VIBA_API_BASE must use HTTPS for a deployed frontend.');
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const ignored = new Set(['dist', 'build.js', 'package.json', 'vercel.json', '.gitignore']);
for (const entry of await readdir(source, { withFileTypes: true })) {
  if (ignored.has(entry.name)) continue;
  await cp(path.join(source, entry.name), path.join(output, entry.name), { recursive: true });
}
await writeFile(path.join(output, 'api-config.js'), `window.VIBA_API_BASE = ${JSON.stringify(apiBase)};\n`, 'utf8');
console.log(`VIBA frontend built for ${apiUrl.origin}`);
