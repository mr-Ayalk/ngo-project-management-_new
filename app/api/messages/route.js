export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, timeAgo, getInitials, AVATAR_COLORS, requireAuth } from '@/lib/api-utils';
import { assertProjectAccess } from '@/lib/project-access';

async function collectMessageRecipients(projectId, senderId, taskId = null) {
  const [members, project, admins, task] = await Promise.all([
    prisma.projectMember.findMany({
      where: { projectId },
      select: { userId: true },
    }),
    prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true, managerId: true, leadId: true },
    }),
    prisma.user.findMany({
      where: { role: { in: ['admin', 'manager', 'project_manager'] }, isActive: true },
      select: { id: true },
    }),
    taskId
      ? prisma.task.findUnique({
          where: { id: taskId },
          select: { title: true, assigneeId: true },
        })
      : Promise.resolve(null),
  ]);

  const recipientIds = new Set();
  members.forEach((m) => { if (m.userId !== senderId) recipientIds.add(m.userId); });
  if (project?.managerId && project.managerId !== senderId) recipientIds.add(project.managerId);
  if (project?.leadId && project.leadId !== senderId) recipientIds.add(project.leadId);
  if (task?.assigneeId && task.assigneeId !== senderId) recipientIds.add(task.assigneeId);
  admins.forEach((a) => { if (a.id !== senderId) recipientIds.add(a.id); });

  return { recipientIds, project, task };
}

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const taskId = searchParams.get('taskId');

    const where = {};
    if (projectId) where.projectId = projectId;
    if (taskId) {
      where.taskId = taskId;
    } else if (projectId) {
      where.taskId = null;
    }

    if (projectId) {
      const hasAccess = await assertProjectAccess(auth.user, projectId);
      if (!hasAccess) return error('You do not have access to this project', 403);
    }

    const messages = await prisma.message.findMany({
      where,
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: { id: true, name: true } } },
    });

    return json({
      enabled: true,
      messages: messages.reverse().map((m, i) => ({
        id: m.id,
        content: m.content,
        senderId: m.senderId,
        senderName: m.sender.name,
        projectId: m.projectId,
        taskId: m.taskId,
        initials: getInitials(m.sender.name),
        color: AVATAR_COLORS[i % AVATAR_COLORS.length],
        isOwn: m.senderId === auth.user.id,
        time: timeAgo(m.createdAt),
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    console.error('Messages GET error:', err);
    return error('Failed to load messages', 500);
  }
}

export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const body = await parseBody(req);
    if (!body?.content) return error('Content is required');
    if (!body?.projectId) return error('projectId is required');

    const hasAccess = await assertProjectAccess(auth.user, body.projectId);
    if (!hasAccess) return error('You do not have access to this project', 403);

    const message = await prisma.message.create({
      data: {
        content: body.content.trim(),
        senderId: auth.user.id,
        recipientId: body.recipientId || null,
        projectId: body.projectId,
        taskId: body.taskId || null,
      },
      include: { sender: { select: { id: true, name: true } } },
    });

    const { recipientIds, project, task } = await collectMessageRecipients(
      body.projectId,
      auth.user.id,
      body.taskId || null
    );

    if (recipientIds.size > 0) {
      const isTaskMessage = Boolean(body.taskId);
      await prisma.notification.createMany({
        data: [...recipientIds].map((userId) => ({
          userId,
          title: isTaskMessage
            ? `New message on "${task?.title || 'task'}"`
            : `New message in "${project?.name || 'project'}"`,
          message: `${message.sender.name}: ${body.content.trim().slice(0, 100)}`,
          type: isTaskMessage ? 'task_message' : 'project_message',
          projectId: body.projectId,
          taskId: body.taskId || null,
          linkType: isTaskMessage ? 'task_message' : 'project_message',
        })),
      });
    }

    return json(
      {
        id: message.id,
        content: message.content,
        senderName: message.sender.name,
        initials: getInitials(message.sender.name),
        time: 'Just now',
      },
      201
    );
  } catch (err) {
    console.error('Messages POST error:', err);
    return error('Failed to send message', 500);
  }
}
