// Enkel lösenordsinloggning: signerad cookie med roll (view/admin) och utgångstid.
const enc = new TextEncoder();
export const COOKIE = 'er_sess';
const DAYS = 30;

async function key() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET saknas');
  return crypto.subtle.importKey('raw', enc.encode(s), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export async function makeToken(role) {
  const body = `${role}.${Date.now() + DAYS * 864e5}`;
  const sig = await crypto.subtle.sign('HMAC', await key(), enc.encode(body));
  return `${body}.${b64(sig)}`;
}
export async function readRole(request) {
  const raw = request.headers.get('cookie') || '';
  const m = raw.split(/;\s*/).find(c => c.startsWith(COOKIE + '='));
  if (!m) return null;
  const tok = decodeURIComponent(m.slice(COOKIE.length + 1));
  const [role, exp, sig] = tok.split('.');
  if (!role || !exp || !sig || Number(exp) < Date.now()) return null;
  const want = b64(await crypto.subtle.sign('HMAC', await key(), enc.encode(`${role}.${exp}`)));
  if (want.length !== sig.length) return null;
  let diff = 0; for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0 && (role === 'view' || role === 'admin') ? role : null;
}
export function cookieHeader(value, maxAge) {
  return `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}
export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...headers } });
