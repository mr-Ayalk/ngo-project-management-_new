import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { UTApi, UTFile } from 'uploadthing/server';
import { getUploadThingToken } from '@/lib/uploadthing-token';

export function isServerlessEnvironment() {
  return Boolean(
    process.env.VERCEL
    || process.env.AWS_LAMBDA_FUNCTION_NAME
    || process.env.LAMBDA_TASK_ROOT
  );
}

/**
 * Store a file via UploadThing when configured, otherwise on local disk (dev only).
 */
export async function storeUploadedFile(file, { folder = 'uploads', safeName } = {}) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = safeName || `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const token = getUploadThingToken();

  if (token) {
    const utapi = new UTApi({ token });
    const utFile = new UTFile([buffer], fileName, {
      type: file.type || 'application/octet-stream',
    });
    const result = await utapi.uploadFiles(utFile);
    if (result.error) {
      throw new Error(result.error.message || 'UploadThing upload failed');
    }
    return {
      url: result.data.ufsUrl || result.data.url,
      name: file.name,
    };
  }

  if (isServerlessEnvironment()) {
    throw new Error(
      'File uploads require UPLOADTHING_TOKEN in production. Add it to your deployment environment variables.'
    );
  }

  const uploadDir = path.join(process.cwd(), 'public', folder);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);

  return {
    url: `/${folder}/${fileName}`.replace(/\/+/g, '/'),
    name: file.name,
  };
}
