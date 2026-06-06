export const dynamic = 'force-dynamic';

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/db';
import { json, error, requireAuth } from '@/lib/api-utils';
import { logAudit, getClientIp } from '@/lib/audit';

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

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

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED.includes(ext)) {
      return error(`Image type not allowed. Allowed: ${ALLOWED.join(', ')}`, 400);
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    await mkdir(uploadDir, { recursive: true });

    const safeName = `${auth.user.id}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, safeName), buffer);

    const avatarUrl = `/uploads/avatars/${safeName}`;

    const user = await prisma.user.update({
      where: { id: auth.user.id },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        staffRole: true,
        avatar: true,
      },
    });

    await logAudit({
      userId: auth.user.id,
      action: 'updated',
      resource: 'profile',
      details: { fields: ['avatar'] },
      ipAddress: getClientIp(req),
    });

    return json({ user, url: avatarUrl, message: 'Profile photo updated' });
  } catch (err) {
    console.error('Profile avatar upload error:', err);
    return error('Upload failed', 500);
  }
}
