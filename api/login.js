import { makeToken, cookieHeader, json } from '../lib/auth.js';
const eq = (a, b) => { if (!a || !b || a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };
export async function POST(request) {
  let pw = '';
  try { pw = String((await request.json()).password || ''); } catch (e) { return json({ error: 'fel format' }, 400); }
  let role = null;
  if (eq(pw, process.env.ADMIN_PASSWORD)) role = 'admin';
  else if (eq(pw, process.env.VIEW_PASSWORD)) role = 'view';
  if (!role) { await new Promise(r => setTimeout(r, 600)); return json({ error: 'Fel lösenord' }, 401); }
  return json({ role }, 200, { 'set-cookie': cookieHeader(await makeToken(role), 30 * 86400) });
}
export async function DELETE() {
  return json({ ok: true }, 200, { 'set-cookie': cookieHeader('', 0) });
}
