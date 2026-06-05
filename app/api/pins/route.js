export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireAuth } from '@/lib/api-utils';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const pins = await prisma.pinnedProject.findMany({
      where: { userId: auth.user.id },
      include: {
        project: {
          select: { id: true, name: true, status: true, icon: true, progress: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return json(pins.map((p) => ({
      id: p.id,
      projectId: p.projectId,
      name: p.project.name,
      status: p.project.status,
      icon: p.project.icon,
      progress: p.project.progress,
    })));
  } catch (err) {
    console.error('Pins GET error:', err);
    return error('Failed to load pinned projects', 500);
  }
}

export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const body = await parseBody(req);
    if (!body?.projectId) return error('projectId is required');

    const existing = await prisma.pinnedProject.findUnique({
      where: { userId_projectId: { userId: auth.user.id, projectId: body.projectId } },
    });
    if (existing) return json({ success: true, id: existing.id });

    const count = await prisma.pinnedProject.count({ where: { userId: auth.user.id } });
    const pin = await prisma.pinnedProject.create({
      data: { userId: auth.user.id, projectId: body.projectId, sortOrder: count },
    });

    return json({ success: true, id: pin.id }, 201);
  } catch (err) {
    console.error('Pins POST error:', err);
    return error('Failed to pin project', 500);
  }
}

export async function DELETE(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) return error('projectId is required');

    await prisma.pinnedProject.deleteMany({
      where: { userId: auth.user.id, projectId },
    });

    return json({ success: true });
  } catch (err) {
    console.error('Pins DELETE error:', err);
    return error('Failed to unpin project', 500);
  }
}
