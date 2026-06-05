export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { json, error, parseBody, requireAuth } from '@/lib/api-utils';
import { isProjectManager, formatUserRole } from '@/lib/roles';
import { logAudit, getClientIp } from '@/lib/audit';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, staffRole: true,
        isActive: true, joinedDate: true,
      },
      orderBy: { joinedDate: 'asc' },
    });

    return json(
      users.map((u) => ({
        ...formatUserRole(u),
        status: u.isActive ? 'Active' : 'Inactive',
        isActive: u.isActive,
        joinedDate: u.joinedDate,
      }))
    );
  } catch (err) {
    return error('Failed to load users', 500);
  }
}

export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const caller = await prisma.user.findUnique({ where: { id: auth.user.id } });
    if (!isProjectManager(caller)) return error('Only project managers can add staff', 403);

    const body = await parseBody(req);
    if (!body?.email || !body?.name || !body?.password) {
      return error('Email, name, and password are required');
    }

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return error('Email already registered', 409);

    const hashedPassword = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: hashedPassword,
        role: body.role || 'staff',
        staffRole: body.staffRole || 'program_staff',
      },
      select: { id: true, name: true, email: true, role: true, staffRole: true, isActive: true },
    });

    await logAudit({
      userId: auth.user.id,
      action: 'created',
      resource: 'user',
      details: { userId: user.id, email: user.email, role: user.role },
      ipAddress: getClientIp(req),
    });

    return json({
      ...formatUserRole(user),
      status: 'Active',
    }, 201);
  } catch (err) {
    console.error('Users POST error:', err);
    return error('Failed to create user', 500);
  }
}

export async function PUT(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const body = await parseBody(req);
    if (!body?.id) return error('User id is required');

    const caller = await prisma.user.findUnique({ where: { id: auth.user.id } });
    if (!isProjectManager(caller) && body.id !== auth.user.id) {
      return error('Forbidden', 403);
    }

    const data = {};
    if (body.name) data.name = body.name;
    if (body.role && isProjectManager(caller)) data.role = body.role;
    if (body.staffRole !== undefined && isProjectManager(caller)) data.staffRole = body.staffRole;
    if (body.isActive !== undefined && isProjectManager(caller)) data.isActive = body.isActive;

    const user = await prisma.user.update({
      where: { id: body.id },
      data,
      select: { id: true, name: true, email: true, role: true, staffRole: true, isActive: true },
    });

    await logAudit({
      userId: auth.user.id,
      action: 'updated',
      resource: 'user',
      details: { userId: user.id, changes: Object.keys(data) },
      ipAddress: getClientIp(req),
    });

    return json({
      ...formatUserRole(user),
      status: user.isActive ? 'Active' : 'Inactive',
    });
  } catch (err) {
    return error('Failed to update user', 500);
  }
}
