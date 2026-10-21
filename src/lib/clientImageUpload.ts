/**
 * @file clientImageUpload.ts
 * @description Helper for browser client components to upload files directly to ImageKit via Next.js API.
 */

export interface UploadResponse {
  success: boolean;
  url: string;
  thumbnailUrl?: string;
  fileId?: string;
  error?: string;
}

/**
 * Upload an image File, Blob, or base64 data URL to ImageKit CDN.
 *
 * @param file - File object from <input type="file">, Blob, or base64 data URL
 * @param folder - Destination folder on ImageKit (e.g. '/saqib-hub/proofs', '/saqib-hub/services')
 * @param customName - Optional custom file name
 */
export async function uploadImageToImageKit(
  file: File | Blob | string,
  folder: string = '/saqib-hub/uploads',
  customName?: string
): Promise<UploadResponse> {
  try {
    if (typeof file === 'string') {
      // Base64 data URL or remote URL
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file,
          folder,
          fileName: customName || `upload-${Date.now()}.png`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          url: '',
          error: data.error || 'Upload failed',
        };
      }

      return {
        success: true,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        fileId: data.fileId,
      };
    } else {
      // Binary File or Blob
      const formData = new FormData();
      formData.append('file', file, customName || (file as File).name || `upload-${Date.now()}.png`);
      formData.append('folder', folder);
      if (customName) formData.append('fileName', customName);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          url: '',
          error: data.error || 'Upload failed',
        };
      }

      return {
        success: true,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        fileId: data.fileId,
      };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error during upload';
    return {
      success: false,
      url: '',
      error: message,
    };
  }
}
