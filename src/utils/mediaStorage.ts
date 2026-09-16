import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export interface UploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
  type: string;
}

export interface UploadOptions {
  folder?: string;
  customFilename?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Checks if an image string is a legacy Base64 Data URL
 */
export function isBase64Image(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return url.trim().startsWith('data:image/');
}

/**
 * Converts a Data URL / Base64 string to a standard Blob
 */
export function convertBase64ToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/webp';
  const byteString = atob(parts[1] || parts[0]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  return new Blob([uint8Array], { type: mimeType });
}

/**
 * Optimizes an image blob/file on canvas to 4:5 portrait (or max dimensions) without distortion
 */
export async function optimizeImage(
  fileOrBlob: File | Blob,
  maxWidth = 1200,
  maxHeight = 1500,
  quality = 0.92
): Promise<Blob> {
  return new Promise((resolve) => {
    // If SVG or gif, return as is
    if (fileOrBlob.type.includes('svg') || fileOrBlob.type.includes('gif')) {
      return resolve(fileOrBlob);
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(fileOrBlob);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Maintain aspect ratio, scaling down only if larger than maxWidth/maxHeight
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return resolve(fileOrBlob);
      }

      // Smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Prefer WebP with fallback to original type
      const targetMime = 'image/webp';
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < fileOrBlob.size) {
            resolve(blob);
          } else {
            resolve(fileOrBlob);
          }
        },
        targetMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(fileOrBlob);
    };

    img.src = objectUrl;
  });
}

/**
 * Uploads a file to Server filesystem endpoint (/api/upload)
 */
async function uploadToServerApi(
  blob: Blob,
  filename: string,
  folder: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const fileData = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData,
            filename,
            folder
          })
        });

        if (!res.ok) {
          throw new Error(`Upload server returned status ${res.status}`);
        }

        const data = await res.json();
        resolve({
          url: data.url,
          path: `${folder}/${data.filename}`,
          name: data.filename,
          size: data.size || blob.size,
          type: blob.type
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(blob);
  });
}

/**
 * Uploads an image and returns a URL the site can render.
 * Firebase Storage is preferred for production. When Storage rules reject the
 * upload in local/admin environments, fall back to the local Express upload API.
 */
export async function uploadMediaFile(
  file: File | Blob,
  options: UploadOptions | string = {}
): Promise<UploadResult> {
  const opts: UploadOptions = typeof options === 'string'
    ? (options.includes('/')
        ? { folder: options.split('/')[0], customFilename: options.split('/').slice(1).join('/') }
        : { folder: options })
    : options;

  const folder = opts.folder || 'media';
  const originalName = (file as File).name || 'image.webp';
  const ext = originalName.split('.').pop() || 'webp';
  const cleanBaseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  
  const filename = opts.customFilename
    ? opts.customFilename.includes('.') ? opts.customFilename : `${opts.customFilename}.${ext}`
    : `${cleanBaseName}-${Date.now()}.${ext}`;

  // 1. Optimize image
  const optimizedBlob = await optimizeImage(
    file,
    opts.maxWidth || 1200,
    opts.maxHeight || 1500,
    opts.quality || 0.92
  );

  const storagePath = `${folder}/${filename}`;

  // 2. Try Firebase Storage first
  try {
    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, optimizedBlob, {
      contentType: optimizedBlob.type || 'image/webp',
      cacheControl: 'public, max-age=31536000'
    });
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      url: downloadUrl,
      path: storagePath,
      name: filename,
      size: optimizedBlob.size,
      type: optimizedBlob.type || 'image/webp'
    };
  } catch (firebaseErr) {
    console.warn('Firebase Storage upload failed; falling back to local upload API:', firebaseErr);
    return uploadToServerApi(optimizedBlob, filename, folder);
  }
}

/**
 * Uploads a Base64 string to persistent storage and returns permanent URL
 */
export async function uploadBase64Image(
  dataUri: string,
  options: UploadOptions | string = {}
): Promise<string> {
  if (!isBase64Image(dataUri)) {
    return dataUri;
  }

  const blob = convertBase64ToBlob(dataUri);
  const result = await uploadMediaFile(blob, options);
  return result.url;
}

/**
 * Migrates any image value: if Base64, uploads and returns real URL; otherwise returns URL
 */
export async function migrateIfBase64(
  imageStr: string | undefined | null,
  options: UploadOptions | string = {}
): Promise<string> {
  if (!imageStr || typeof imageStr !== 'string') return '';
  if (!isBase64Image(imageStr)) return imageStr.trim();
  return await uploadBase64Image(imageStr, options);
}
