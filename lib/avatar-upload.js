import { storeUploadedFile } from '@/lib/file-upload';

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

  const { url } = await storeUploadedFile(file, {
    folder: 'uploads/avatars',
    safeName: `${userId}-${Date.now()}.${ext}`,
  });
  return url;
}
