// Token för direktuppladdning från webbläsaren till Vercel Blob (inga storleksgränser via servern).
import { handleUpload } from '@vercel/blob/client';
import { readRole, json } from '../lib/auth.js';
export async function POST(request) {
  const role = await readRole(request);
  let body; try { body = await request.json(); } catch (e) { return json({ error: 'fel format' }, 400); }
  try {
    const result = await handleUpload({
      body, request,
      onBeforeGenerateToken: async () => {
        if (role !== 'admin') throw new Error('kräver adminlösenord');
        return { allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'], addRandomSuffix: true, maximumSizeInBytes: 2 * 1024 ** 3 };
      },
      onUploadCompleted: async () => {},
    });
    return json(result);
  } catch (e) { return json({ error: String(e.message || e) }, 400); }
}
