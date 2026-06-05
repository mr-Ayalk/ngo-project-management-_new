export const dynamic = 'force-dynamic';

import { hashPassword } from '@/lib/auth';
import prisma from '@/lib/db';
import { requireAdmin, parseBody, json, error } from '@/lib/api-utils';
import { logAudit, getClientIp } from '@/lib/audit';

export async function POST(req) {
  if (process.env.ALLOW_PUBLIC_SIGNUP !== 'true') {
    const auth = await requireAdmin(req);
    if (auth.error) return auth.error;
  }

  try {
    const body = await parseBody(req);
    const { email, name, password, role, staffRole } = body || {};

    if (!email || !name || !password) {
      return error('Missing required fields');
    }

    if (password.length < 8) {
      return error('Password must be at least 8 characters');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return error('Email already registered', 409);
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        password: hashedPassword,
        role: role || 'staff',
        staffRole: staffRole || null,
      },
    });

    const adminAuth = await requireAdmin(req).catch(() => null);
    if (adminAuth?.user) {
      await logAudit({
        userId: adminAuth.user.id,
        action: 'CREATE',
        resource: 'user',
        details: { createdUserId: user.id, email: user.email },
        ipAddress: getClientIp(req),
      });
    }

    return json(
      { user: { id: user.id, email: user.email, name: user.name, role: user.role, staffRole: user.staffRole } },
      201
    );
  } catch (err) {
    console.error('Signup error:', err);
    return error('Internal server error', 500);
  }
}
