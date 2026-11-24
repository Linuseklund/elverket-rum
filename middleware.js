// Allt utom inloggningssidan kräver giltig session.
import { next } from '@vercel/functions';
import { readRole } from './lib/auth.js';
export const config = { matcher: ['/((?!login\\.html|api/login|favicon\\.ico).*)'] };
export default async function middleware(request) {
  let role = null;
  try { role = await readRole(request); } catch (e) { role = null; }
  if (role) return next();
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/')) {
    // uppladdningens kvitto från Vercel Blob har ingen cookie
    if (url.pathname === '/api/upload') return next();
    return new Response(JSON.stringify({ error: 'inte inloggad' }), { status: 401, headers: { 'content-type': 'application/json' } });
  }
  const back = encodeURIComponent(url.pathname + url.search + url.hash);
  return Response.redirect(new URL('/login.html?next=' + back, url), 302);
}
