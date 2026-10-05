import type { Handler, HandlerEvent } from '@netlify/functions';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// R2 client — credentials must be set in Netlify environment variables
// ---------------------------------------------------------------------------
function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const explicitEndpoint = process.env.R2_ENDPOINT;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY must be configured.');
  }

  // Use R2_ENDPOINT if provided, otherwise derive from R2_ACCOUNT_ID
  const endpoint = explicitEndpoint || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : null);
  if (!endpoint) {
    throw new Error('Either R2_ENDPOINT or R2_ACCOUNT_ID must be configured.');
  }

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

// ---------------------------------------------------------------------------
// Multipart parser — handles the raw body Netlify gives us
// ---------------------------------------------------------------------------
function parseMultipart(
  body: string,
  boundary: string,
  isBase64: boolean
): { fileBuffer: Buffer; mimeType: string; originalName: string } | null {
  const raw = isBase64 ? Buffer.from(body, 'base64') : Buffer.from(body, 'binary');
  const boundaryBuf = Buffer.from(`--${boundary}`);
  const parts: Buffer[] = [];

  let start = 0;
  while (start < raw.length) {
    const idx = raw.indexOf(boundaryBuf, start);
    if (idx === -1) break;
    const end = raw.indexOf(boundaryBuf, idx + boundaryBuf.length);
    parts.push(raw.slice(idx + boundaryBuf.length, end === -1 ? undefined : end));
    start = idx + boundaryBuf.length;
    if (end === -1) break;
  }

  for (const part of parts) {
    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEnd === -1) continue;
    const headerStr = part.slice(0, headerEnd).toString('utf8');
    if (!headerStr.includes('name="file"')) continue;

    const fileBuffer = part.slice(headerEnd + 4).slice(0, part.slice(headerEnd + 4).lastIndexOf(Buffer.from('\r\n')));

    const nameMatch = headerStr.match(/filename="([^"]+)"/);
    const typeMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);

    return {
      fileBuffer,
      mimeType: typeMatch?.[1]?.trim() ?? 'application/octet-stream',
      originalName: nameMatch?.[1] ?? 'upload',
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export const handler: Handler = async (event: HandlerEvent) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // -- Validate env --
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

    if (!bucketName || !publicBaseUrl) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'R2_BUCKET_NAME or R2_PUBLIC_BASE_URL not configured' }),
      };
    }

    // -- Parse Content-Type for boundary --
    const contentType = event.headers['content-type'] ?? event.headers['Content-Type'] ?? '';
    const boundaryMatch = contentType.match(/boundary=([^;]+)/);
    if (!boundaryMatch) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing multipart boundary' }),
      };
    }
    const boundary = boundaryMatch[1].trim();

    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Empty request body' }),
      };
    }

    // -- Parse the file --
    const parsed = parseMultipart(event.body, boundary, event.isBase64Encoded ?? false);
    if (!parsed) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Could not parse uploaded file' }),
      };
    }

    const { fileBuffer, mimeType, originalName } = parsed;

    // -- Validate file size (5 MB max) --
    const MAX_BYTES = 5 * 1024 * 1024;
    if (fileBuffer.length > MAX_BYTES) {
      return {
        statusCode: 413,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'File exceeds 5 MB limit' }),
      };
    }

    // -- Validate MIME type --
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return {
        statusCode: 415,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Only JPG, PNG, and WebP images are accepted' }),
      };
    }

    // -- Derive extension from MIME --
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const ext = extMap[mimeType] ?? 'jpg';

    // -- Pull providerId from query string (optional, defaults to "general") --
    const providerId = (event.queryStringParameters?.providerId ?? 'general')
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 60);

    // -- Build the R2 object key --
    const timestamp = Date.now();
    const uuid = randomUUID().replace(/-/g, '').slice(0, 8);
    const key = `providers/${providerId}/${timestamp}-${uuid}.${ext}`;

    // -- Upload to R2 --
    const r2 = getR2Client();
    await r2.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    // -- Build the permanent public URL --
    const baseUrl = publicBaseUrl.replace(/\/$/, '');
    const imageUrl = `${baseUrl}/${key}`;

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl }),
    };
  } catch (err: any) {
    console.error('[upload-provider-image] Error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err?.message ?? 'Internal server error' }),
    };
  }
};
