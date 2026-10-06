import type { Handler, HandlerEvent } from '@netlify/functions';
import { S3Client, PutObjectCommand, HeadBucketCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Clean environment variable helper (trims whitespace and strips quotes)
// ---------------------------------------------------------------------------
function cleanEnv(val?: string): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '').trim();
}

function sanitizeAccountId(raw?: string, accessKeyId?: string): string {
  const defaultId = '93888554ef9d9e0b8c18b322683a9652';
  if (!raw) return defaultId;
  let val = cleanEnv(raw);
  // Strip protocol if mistakenly present
  val = val.replace(/^https?:\/\//i, '');
  // Strip domain suffixes if mistakenly present
  val = val.replace(/\.r2\.cloudflarestorage\.com.*$/i, '');
  val = val.replace(/\.r2\.dev.*$/i, '');
  val = val.replace(/\/.*$/, '').trim();

  // If someone passed the public bucket hash or the Access Key ID (620c8e408b865b0cf374335eea20427a)
  // instead of the actual Account ID:
  if (
    val.startsWith('pub-') ||
    val.toLowerCase() === '463524c5dd1e422ca67b4960ad60e690' ||
    val.toLowerCase() === '620c8e408b865b0cf374335eea20427a' ||
    (accessKeyId && val.toLowerCase() === accessKeyId.toLowerCase())
  ) {
    return defaultId;
  }

  // A valid Cloudflare Account ID is a 32-hex string
  if (!/^[a-f0-9]{32}$/i.test(val)) {
    const hexMatch = val.match(/[a-f0-9]{32}/i);
    if (
      hexMatch &&
      hexMatch[0].toLowerCase() !== '463524c5dd1e422ca67b4960ad60e690' &&
      hexMatch[0].toLowerCase() !== '620c8e408b865b0cf374335eea20427a'
    ) {
      return hexMatch[0];
    }
    return defaultId;
  }

  return val;
}

// ---------------------------------------------------------------------------
// R2 client configuration with standard S3-compatible Cloudflare endpoint
// ---------------------------------------------------------------------------
function getR2Config() {
  const accessKeyId =
    cleanEnv(process.env.R2_ACCESS_KEY_ID) ||
    cleanEnv(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) ||
    '620c8e408b865b0cf374335eea20427a';

  const accountId = sanitizeAccountId(
    process.env.R2_ACCOUNT_ID ||
    process.env.CLOUDFLARE_ACCOUNT_ID,
    accessKeyId
  );

  const secretAccessKey =
    cleanEnv(process.env.R2_SECRET_ACCESS_KEY) ||
    cleanEnv(process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) ||
    '319c9a470be72b458b69c0bb25e4c4726d1992711bbf81c7fb59b544914f4740';

  const bucketName =
    cleanEnv(process.env.R2_BUCKET_NAME) ||
    cleanEnv(process.env.CLOUDFLARE_R2_BUCKET) ||
    'deval-gadhvi';

  const rawPublicUrl =
    cleanEnv(process.env.R2_PUBLIC_URL) ||
    cleanEnv(process.env.R2_PUBLIC_BASE_URL) ||
    cleanEnv(process.env.R2_PUBLIC_DOMAIN) ||
    cleanEnv(process.env.R2_CUSTOM_DOMAIN) ||
    cleanEnv(process.env.R2_DOMAIN) ||
    'https://pub-463524c5dd1e422ca67b4960ad60e690.r2.dev';

  const publicBaseUrl = rawPublicUrl.replace(/\/+$/, '');

  // CRITICAL: Always use the official Cloudflare R2 S3-compatible endpoint for API operations.
  // Never use public/r2.dev or bucket public domains as the S3 API endpoint.
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY must be configured.');
  }

  const client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });

  return { client, bucketName, publicBaseUrl, accountId, endpoint };
}

// ---------------------------------------------------------------------------
// Multipart parser fallback
// ---------------------------------------------------------------------------
function parseMultipart(
  body: string,
  boundary: string,
  isBase64: boolean
): { fileBuffer: Buffer; mimeType: string; originalName: string } | null {
  const cleanBoundary = boundary.replace(/^"|"$/g, '').trim();
  const raw = isBase64 ? Buffer.from(body, 'base64') : Buffer.from(body, 'binary');
  const boundaryBuf = Buffer.from(`--${cleanBoundary}`);
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
    if (!headerStr.includes('name="file"') && !headerStr.includes('filename=')) continue;

    let fileBuffer = part.slice(headerEnd + 4);
    // Remove trailing \r\n before closing boundary if present
    if (fileBuffer.length >= 2 && fileBuffer[fileBuffer.length - 2] === 13 && fileBuffer[fileBuffer.length - 1] === 10) {
      fileBuffer = fileBuffer.slice(0, fileBuffer.length - 2);
    }

    const nameMatch = headerStr.match(/filename="?([^";\r\n]+)"?/);
    const typeMatch = headerStr.match(/Content-Type:\s*([^\r\n;]+)/i);

    return {
      fileBuffer,
      mimeType: typeMatch?.[1]?.trim().toLowerCase() ?? 'application/octet-stream',
      originalName: nameMatch?.[1]?.trim() ?? 'upload',
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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  // Connectivity Test Endpoint (GET /.netlify/functions/upload-provider-image?test=true)
  if (event.httpMethod === 'GET') {
    try {
      const { client, bucketName, accountId, endpoint } = getR2Config();
      const headRes = await client.send(new HeadBucketCommand({ Bucket: bucketName }));
      const listRes = await client.send(new ListObjectsV2Command({ Bucket: bucketName, MaxKeys: 5 }));

      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: 'Cloudflare R2 TLS connection, authentication, and bucket access verified successfully.',
          endpoint,
          bucket: bucketName,
          accountId: `${accountId.slice(0, 6)}...${accountId.slice(-4)}`,
          headBucketStatusCode: headRes.$metadata?.httpStatusCode ?? 200,
          objectsFound: listRes.KeyCount ?? 0,
        }),
      };
    } catch (testErr: any) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: testErr.message,
          name: testErr.name,
          code: testErr.code,
        }),
      };
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { client, bucketName, publicBaseUrl } = getR2Config();

    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Empty request body' }),
      };
    }

    const contentType =
      event.headers['content-type'] ??
      event.headers['Content-Type'] ??
      '';

    let fileBuffer: Buffer | null = null;
    let mimeType = 'image/jpeg';
    let originalName = 'provider-image.jpg';
    let requestedProviderId: string | null = null;

    // 1. JSON Payload: { imageBase64, filename, mimeType, providerId }
    if (contentType.includes('application/json')) {
      try {
        const rawJsonStr = event.isBase64Encoded
          ? Buffer.from(event.body, 'base64').toString('utf8')
          : event.body;
        const parsedJson = JSON.parse(rawJsonStr);

        if (!parsedJson.imageBase64) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Missing imageBase64 in JSON body' }),
          };
        }

        // Clean out any data URI prefix like "data:image/jpeg;base64,"
        const base64Content = parsedJson.imageBase64.includes(',')
          ? parsedJson.imageBase64.split(',')[1]
          : parsedJson.imageBase64;

        fileBuffer = Buffer.from(base64Content, 'base64');
        mimeType = (parsedJson.mimeType || 'image/jpeg').toLowerCase();
        originalName = parsedJson.filename || 'provider-photo.jpg';
        requestedProviderId = parsedJson.providerId || null;
      } catch (jsonErr: any) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Invalid JSON payload: ' + jsonErr.message }),
        };
      }
    }
    // 2. Multipart FormData
    else if (contentType.includes('multipart/form-data')) {
      const boundaryMatch = contentType.match(/boundary=([^;]+)/);
      if (!boundaryMatch) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Missing multipart boundary in Content-Type' }),
        };
      }
      const boundary = boundaryMatch[1].trim();
      const parsed = parseMultipart(event.body, boundary, event.isBase64Encoded ?? false);
      if (!parsed) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Could not parse uploaded multipart file' }),
        };
      }
      fileBuffer = parsed.fileBuffer;
      mimeType = parsed.mimeType;
      originalName = parsed.originalName;
    }
    // 3. Raw Binary Payload
    else if (event.body) {
      fileBuffer = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64')
        : Buffer.from(event.body, 'binary');
      mimeType = contentType || 'image/jpeg';
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'No file content received' }),
      };
    }

    // Validate file size (15 MB max)
    const MAX_BYTES = 15 * 1024 * 1024;
    if (fileBuffer.length > MAX_BYTES) {
      return {
        statusCode: 413,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'File exceeds 15 MB limit' }),
      };
    }

    // Normalize and validate MIME type
    if (mimeType === 'image/jpg') mimeType = 'image/jpeg';
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];
    if (!ALLOWED_TYPES.includes(mimeType) && !mimeType.startsWith('image/')) {
      return {
        statusCode: 415,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Only JPG, PNG, WebP, AVIF images are accepted' }),
      };
    }

    // Determine extension
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/avif': 'avif',
      'image/svg+xml': 'svg',
    };
    const extension = extMap[mimeType] || originalName.split('.').pop() || 'jpg';

    // Provider ID: check query string or JSON payload
    const rawProviderId =
      requestedProviderId ||
      event.queryStringParameters?.providerId ||
      'general';
    const providerId = rawProviderId
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'general';

    // Sanitized clean filename
    const baseName = originalName
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 40) || 'photo';

    // Build the UNIQUE R2 object key: providers/{providerId}/{timestamp}-{filename}
    const timestamp = Date.now();
    const shortUid = randomUUID().replace(/-/g, '').slice(0, 6);
    const key = `providers/${providerId}/${timestamp}-${baseName}-${shortUid}.${extension}`;

    // Upload to Cloudflare R2
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    // Build the permanent public URL
    const imageUrl = `${publicBaseUrl}/${key}`;

    console.log(`[R2 Upload Success] Provider: ${providerId} | Key: ${key} | URL: ${imageUrl}`);

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        imageUrl,
        imageKey: key,
        providerId,
        size: fileBuffer.length,
      }),
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
