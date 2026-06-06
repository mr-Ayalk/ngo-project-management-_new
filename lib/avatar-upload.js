import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { UTApi, UTFile } from 'uploadthing/server';
import { getUploadThingToken } from '@/lib/uploadthing-token';

const ALLOWED = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

export function isValidAvatarValue(avatar) {
  if (!avatar || typeof avatar !== 'string') return false;
  const value = avatar.trim();
  if (!value) return false;
  if (value.startsWith('emoji:')) return true;
  if (value.startsWith('https://') || value.startsWith('http://')) return true;
  if (value.startsWith('/uploads/')) return true;
  return false;
}

export async function storeProfileAvatar(file, userId) {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED.includes(ext)) {
    throw new Error(`Image type not allowed. Allowed: ${ALLOWED.join(', ')}`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = `${userId}-${Date.now()}.${ext}`;
  const token = getUploadThingToken();

  if (token) {
    const utapi = new UTApi({ token });
    const utFile = new UTFile([buffer], safeName, { type: file.type || `image/${ext}` });
    const result = await utapi.uploadFiles(utFile);
    if (result.error) {
      throw new Error(result.error.message || 'UploadThing upload failed');
    }
    return result.data.ufsUrl || result.data.url;
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, safeName), buffer);
  return `/uploads/avatars/${safeName}`;
}
