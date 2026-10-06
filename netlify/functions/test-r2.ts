import type { Handler, HandlerEvent } from '@netlify/functions';
import { S3Client, HeadBucketCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

function cleanEnv(val?: string): string {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '').trim();
}

function getR2Client() {
  const accountId =
    cleanEnv(process.env.R2_ACCOUNT_ID) ||
    cleanEnv(process.env.CLOUDFLARE_ACCOUNT_ID) ||
    '93888554ef9d9e0b8c18b322683a9652';

  const accessKeyId =
    cleanEnv(process.env.R2_ACCESS_KEY_ID) ||
    cleanEnv(process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) ||
    '620c8e408b865b0cf374335eea20427a';

  const secretAccessKey =
    cleanEnv(process.env.R2_SECRET_ACCESS_KEY) ||
    cleanEnv(process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) ||
    '319c9a470be72b458b69c0bb25e4c4726d1992711bbf81c7fb59b544914f4740';

  const bucketName =
    cleanEnv(process.env.R2_BUCKET_NAME) ||
    cleanEnv(process.env.CLOUDFLARE_R2_BUCKET) ||
    'deval-gadhvi';

  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

  const client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { client, bucketName, accountId, endpoint };
}

export const handler: Handler = async (event: HandlerEvent) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  try {
    const { client, bucketName, accountId, endpoint } = getR2Client();

    // 1. Check bucket access
    const headRes = await client.send(new HeadBucketCommand({ Bucket: bucketName }));

    // 2. Test list objects
    const listRes = await client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        MaxKeys: 10,
      })
    );

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Cloudflare R2 TLS connection, authentication, and bucket access succeeded.',
        endpoint,
        accountId: `${accountId.slice(0, 6)}...${accountId.slice(-4)}`,
        bucket: bucketName,
        headBucketStatusCode: headRes.$metadata?.httpStatusCode ?? 200,
        objectsFound: listRes.KeyCount ?? 0,
        sampleKeys: (listRes.Contents || []).map((c) => c.Key).slice(0, 5),
      }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: err.message,
        name: err.name,
        code: err.code,
      }),
    };
  }
};
