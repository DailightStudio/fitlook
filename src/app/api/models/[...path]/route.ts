import { getCloudflareContext } from '@opennextjs/cloudflare';

// Serve GLB models stored in R2 with permissive CORS headers,
// so 3D viewers (model-viewer / Unity WebGL) can fetch them cross-origin.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const key = path.join('/');

    const { env } = getCloudflareContext();
    const bucket = env.R2_BUCKET;

    if (!bucket) {
      return Response.json(
        { error: 'R2_BUCKET binding is not configured' },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const object = await bucket.get(key);

    if (!object) {
      return Response.json(
        { error: 'Model not found' },
        { status: 404, headers: CORS_HEADERS }
      );
    }

    const headers = new Headers(CORS_HEADERS);
    headers.set('Content-Type', object.httpMetadata?.contentType ?? 'model/gltf-binary');
    headers.set('Cache-Control', object.httpMetadata?.cacheControl ?? 'public, max-age=31536000, immutable');
    headers.set('Content-Length', String(object.size));
    headers.set('ETag', object.etag);

    return new Response(object.body, { status: 200, headers });
  } catch (error) {
    console.error('[Models] R2 fetch error:', error);
    return Response.json(
      { error: 'Failed to fetch model' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
