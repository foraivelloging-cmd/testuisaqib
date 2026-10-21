/**
 * @file imagekit.ts
 * @description Centralized server-side ImageKit CDN integration for Muhammad Saqib Visuals Hub.
 * Provides high-speed direct file uploads, automatic optimization, CDN URL generation, and file deletion.
 */

function cleanEnv(val?: string | null): string {
  if (!val) return '';
  return val.trim().replace(/^['"]|['"]$/g, '');
}

export function getImageKitConfig() {
  const publicKey =
    cleanEnv(process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY) ||
    cleanEnv(process.env.IMAGEKIT_PUBLIC_KEY) ||
    'public_hAsIn5Rl4yEptvRhS++GoJeO9ck=';

  const urlEndpoint =
    cleanEnv(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) ||
    cleanEnv(process.env.IMAGEKIT_URL_ENDPOINT) ||
    'https://ik.imagekit.io/ws9mlpwdsj';

  const privateKey =
    cleanEnv(process.env.IMAGEKIT_PRIVATE_KEY) ||
    'private_XiedF7mU8mxbGCLOnLcvgyTByE8=';

  return { publicKey, urlEndpoint, privateKey };
}

export interface ImageKitUploadParams {
  file: string | Blob; // Base64 string, image URL, or binary Blob
  fileName: string;
  folder?: string;
  useUniqueFileName?: boolean;
  tags?: string[];
}

export interface ImageKitUploadResult {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  height?: number;
  width?: number;
  size?: number;
  filePath?: string;
}

/**
 * Upload a file directly to ImageKit using their official REST API.
 */
export async function uploadToImageKit(
  params: ImageKitUploadParams
): Promise<ImageKitUploadResult> {
  const { privateKey } = getImageKitConfig();
  const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');

  const formData = new FormData();
  formData.append('file', params.file as any);
  formData.append('fileName', params.fileName || `upload-${Date.now()}.png`);

  const folder = params.folder || '/saqib-hub';
  formData.append('folder', folder.startsWith('/') ? folder : `/${folder}`);
  formData.append('useUniqueFileName', String(params.useUniqueFileName !== false));

  if (params.tags && params.tags.length > 0) {
    formData.append('tags', params.tags.join(','));
  }

  const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: {
      Authorization: authHeader,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.message || data?.help || 'ImageKit upload failed';
    throw new Error(`ImageKit Error (${response.status}): ${errorMsg}`);
  }

  return {
    fileId: data.fileId,
    name: data.name,
    url: data.url,
    thumbnailUrl: data.thumbnailUrl,
    height: data.height,
    width: data.width,
    size: data.size,
    filePath: data.filePath,
  };
}

/**
 * Delete a file from ImageKit by fileId
 */
export async function deleteFromImageKit(fileId: string): Promise<boolean> {
  if (!fileId) return false;
  const { privateKey } = getImageKitConfig();
  const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');

  try {
    const response = await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: authHeader,
      },
    });
    return response.ok || response.status === 404;
  } catch {
    return false;
  }
}
