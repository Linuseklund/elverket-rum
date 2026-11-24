// Uppladdade miljöer: en JSON-fil per miljö i Vercel Blob (env/<id>.json).
import { list, put, del } from '@vercel/blob';
import { readRole, json } from '../lib/auth.js';
const SURF = ['LongWallA', 'ShortWallD', 'LongWallB', 'ShortWallC', 'Floor'];

async function readAll() {
  const out = []; let cursor;
  do {
    const r = await list({ prefix: 'env/', cursor, limit: 1000 });
    for (const b of r.blobs) {
      try { const res = await fetch(b.url + '?v=' + new Date(b.uploadedAt).getTime(), { cache: 'no-store' }); if (res.ok) out.push(await res.json()); } catch (e) {}
    }
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  return out.sort((a, b) => (b.created || 0) - (a.created || 0));
}
export async function GET(request) {
  if (!(await readRole(request))) return json({ error: 'inte inloggad' }, 401);
  return json({ environments: await readAll() });
}
export async function POST(request) {
  if ((await readRole(request)) !== 'admin') return json({ error: 'kräver adminlösenord' }, 403);
  let b; try { b = await request.json(); } catch (e) { return json({ error: 'fel format' }, 400); }
  const name = String(b.name || '').trim().slice(0, 80);
  if (!name) return json({ error: 'namn saknas' }, 400);
  const surfaces = {};
  for (const n of SURF) {
    const s = b.surfaces && b.surfaces[n];
    if (!s || typeof s.url !== 'string' || !/^https:\/\/[^/]+\.blob\.vercel-storage\.com\//.test(s.url)) return json({ error: 'yta saknas: ' + n }, 400);
    surfaces[n] = { src: s.url, type: s.type === 'video' ? 'video' : 'image' };
  }
  const id = 'm-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const env = { id, name, created: Date.now(), floorFlip: !!b.floorFlip, surfaces, uploaded: true };
  await put(`env/${id}.json`, JSON.stringify(env), { access: 'public', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 });
  return json({ environment: env });
}
export async function DELETE(request) {
  if ((await readRole(request)) !== 'admin') return json({ error: 'kräver adminlösenord' }, 403);
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^m-[a-z0-9]+$/.test(id)) return json({ error: 'fel id' }, 400);
  const env = (await readAll()).find(e => e.id === id);
  if (env) { const urls = SURF.map(n => env.surfaces[n] && env.surfaces[n].src).filter(Boolean); if (urls.length) await del(urls).catch(() => {}); }
  const r = await list({ prefix: `env/${id}.json` });
  if (r.blobs.length) await del(r.blobs.map(x => x.url));
  return json({ ok: true });
}
