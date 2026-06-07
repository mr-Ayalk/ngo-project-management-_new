export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { isValidAvatarValue } from '@/lib/avatar-upload';
import { PUBLIC_USER_SELECT } from '@/lib/user-public';
import { json, error, parseBody, requireAuth } from '@/lib/api-utils';
import { logAudit, getClientIp } from '@/lib/audit';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: { ...PUBLIC_USER_SELECT, joinedDate: true },
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
      if (isValidAvatarValue(avatar)) {
        data.avatar = avatar;
      } else if (avatar === '') {
        data.avatar = null;
      } else {
        return error('Invalid avatar value');
      }
    }

    if (body.phone !== undefined) data.phone = String(body.phone).trim() || null;
    if (body.bio !== undefined) data.bio = String(body.bio).trim() || null;
    if (body.countryScope !== undefined) data.countryScope = String(body.countryScope).trim() || null;
    if (body.coreFocus !== undefined) data.coreFocus = String(body.coreFocus).trim() || null;

    if (body.email !== undefined) {
      if (auth.user.role !== 'admin') {
        return error('Only administrators can change their email address', 403);
      }
      const email = String(body.email).trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return error('A valid email address is required', 400);
      }
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken && taken.id !== auth.user.id) {
        return error('This email is already in use', 400);
      }
      data.email = email;
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
      select: PUBLIC_USER_SELECT,
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
