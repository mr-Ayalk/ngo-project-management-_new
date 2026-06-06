export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { json, error, parseBody, requireAuth } from '@/lib/api-utils';
import { logAudit, getClientIp } from '@/lib/audit';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        staffRole: true,
        avatar: true,
        joinedDate: true,
      },
    });

    if (!user) return error('User not found', 404);
    return json({ user });
  } catch (err) {
    console.error('Profile GET error:', err);
    return error('Failed to load profile', 500);
  }
}

export async function PUT(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const body = await parseBody(req);
    if (!body) return error('Invalid request body');

    const data = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) return error('Name is required');
      data.name = name;
    }

    if (body.avatar !== undefined) {
      const avatar = String(body.avatar).trim();
      if (avatar.startsWith('emoji:') || avatar.startsWith('http')) {
        data.avatar = avatar;
      } else if (avatar === '') {
        data.avatar = null;
      } else {
        return error('Invalid avatar value');
      }
    }

    if (body.currentPassword && body.newPassword) {
      const existing = await prisma.user.findUnique({ where: { id: auth.user.id } });
      const valid = await verifyPassword(body.currentPassword, existing.password);
      if (!valid) return error('Current password is incorrect', 400);
      if (body.newPassword.length < 8) {
        return error('New password must be at least 8 characters', 400);
      }
      data.password = await hashPassword(body.newPassword);
    }

    if (!Object.keys(data).length) {
      return error('No valid fields to update');
    }

    const user = await prisma.user.update({
      where: { id: auth.user.id },
      data,
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
      details: { fields: Object.keys(data).filter((k) => k !== 'password') },
      ipAddress: getClientIp(req),
    });

    return json({ user, message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Profile PUT error:', err);
    return error('Failed to update profile', 500);
  }
}
