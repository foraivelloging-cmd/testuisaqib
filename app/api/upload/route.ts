import { NextResponse } from 'next/server';
import { uploadToImageKit } from '@/src/lib/imagekit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let fileData: string | Blob = '';
    let fileName = `file-${Date.now()}.png`;
    let folder = '/saqib-hub/uploads';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file provided in form-data' },
          { status: 400 }
        );
      }

      if (typeof file === 'string') {
        fileData = file;
      } else {
        fileData = file as Blob;
        fileName = (file as File).name || fileName;
      }

      const requestedFolder = formData.get('folder');
      if (typeof requestedFolder === 'string' && requestedFolder.trim()) {
        folder = requestedFolder.trim();
      }

      const customFileName = formData.get('fileName');
      if (typeof customFileName === 'string' && customFileName.trim()) {
        fileName = customFileName.trim();
      }
    } else {
      // JSON body (base64 string or remote image URL)
      const body = await req.json().catch(() => ({}));
      if (!body.file) {
        return NextResponse.json(
          { success: false, error: 'Field "file" (base64 or URL) is required' },
          { status: 400 }
        );
      }

      fileData = body.file;
      if (body.fileName) fileName = body.fileName;
      if (body.folder) folder = body.folder;
    }

    // Sanitize folder path
    if (!folder.startsWith('/')) folder = `/${folder}`;

    // Upload to ImageKit
    const result = await uploadToImageKit({
      file: fileData,
      fileName,
      folder,
      useUniqueFileName: true,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      fileId: result.fileId,
      name: result.name,
      size: result.size,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    console.error('ImageKit upload route error:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
