export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, requireAuth } from '@/lib/api-utils';
import { logAudit, getClientIp } from '@/lib/audit';
import { storeProfileAvatar } from '@/lib/avatar-upload';
import { PUBLIC_USER_SELECT } from '@/lib/user-public';

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return error('No image provided', 400);
    }

    if (file.size > MAX_BYTES) {
      return error('Image must be 4 MB or smaller', 400);
    }

    const avatarUrl = await storeProfileAvatar(file, auth.user.id);

    const user = await prisma.user.update({
      where: { id: auth.user.id },
      data: { avatar: avatarUrl },
      select: PUBLIC_USER_SELECT,
    });

    await logAudit({
      userId: auth.user.id,
      action: 'updated',
      resource: 'profile',
      details: { fields: ['avatar'], storage: avatarUrl.startsWith('http') ? 'uploadthing' : 'local' },
      ipAddress: getClientIp(req),
    });

    return json({ user, url: avatarUrl, message: 'Profile photo updated' });
  } catch (err) {
    console.error('Profile avatar upload error:', err);
    return error(err.message || 'Upload failed', 500);
  }
}
