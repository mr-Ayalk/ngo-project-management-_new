export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireAuth, timeAgo } from '@/lib/api-utils';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');
    if (!taskId) return error('taskId is required');

    const deliverables = await prisma.taskDeliverable.findMany({
      where: { taskId },
      include: { creator: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return json({
      deliverables: deliverables.map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        fileUrl: d.fileUrl,
        fileName: d.fileName,
        fileType: d.fileType,
        fileSize: d.fileSize,
        creatorName: d.creator.name,
        time: timeAgo(d.createdAt),
        createdAt: d.createdAt,
      })),
      count: deliverables.length,
    });
  } catch (err) {
    console.error('TaskDeliverables GET error:', err);
    return error('Failed to load deliverables', 500);
  }
}

export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const body = await parseBody(req);
    if (!body?.taskId) return error('taskId is required');
    if (!body?.description?.trim() && !body?.fileUrl) {
      return error('Description or a document is required');
    }

    const deliverable = await prisma.taskDeliverable.create({
      data: {
        taskId: body.taskId,
        title: body.title?.trim() || null,
        description: body.description?.trim() || null,
        fileUrl: body.fileUrl || null,
        fileName: body.fileName || null,
        fileType: body.fileType || null,
        fileSize: body.fileSize || null,
        createdById: auth.user.id,
      },
      include: { creator: { select: { name: true } } },
    });

    return json({
      id: deliverable.id,
      title: deliverable.title,
      description: deliverable.description,
      fileUrl: deliverable.fileUrl,
      fileName: deliverable.fileName,
      fileType: deliverable.fileType,
      fileSize: deliverable.fileSize,
      creatorName: deliverable.creator.name,
      time: 'Just now',
      count: await prisma.taskDeliverable.count({ where: { taskId: body.taskId } }),
    }, 201);
  } catch (err) {
    console.error('TaskDeliverables POST error:', err);
    return error('Failed to save deliverable', 500);
  }
}
