export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody } from '@/lib/api-utils';

const ROLE_LABELS = {
  admin: 'Admin',
  manager: 'Program Mgr',
  staff: 'Staff',
  donor: 'Donor',
};

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, joinedDate: true },
      orderBy: { joinedDate: 'asc' },
    });

    return json(
      users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        roleLabel: ROLE_LABELS[u.role] || u.role,
        status: u.isActive ? 'Active' : 'Inactive',
        isActive: u.isActive,
        joinedDate: u.joinedDate,
      }))
    );
  } catch (err) {
    return error('Failed to load users', 500);
  }
}

export async function PUT(req) {
  try {
    const body = await parseBody(req);
    if (!body?.id) return error('User id is required');

    const data = {};
    if (body.name) data.name = body.name;
    if (body.role) data.role = body.role;
    if (body.isActive !== undefined) data.isActive = body.isActive;

    const user = await prisma.user.update({
      where: { id: body.id },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return json({
      ...user,
      roleLabel: ROLE_LABELS[user.role] || user.role,
      status: user.isActive ? 'Active' : 'Inactive',
    });
  } catch (err) {
    return error('Failed to update user', 500);
  }
}
