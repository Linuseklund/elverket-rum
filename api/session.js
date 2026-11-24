import { readRole, json } from '../lib/auth.js';
export async function GET(request) { return json({ role: await readRole(request) }); }
