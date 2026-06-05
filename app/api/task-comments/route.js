export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireAuth, timeAgo, getInitials, AVATAR_COLORS } from '@/lib/api-utils';

async function notifyTeamMembers(taskId, projectId, senderId, title, message) {
  const members = await prisma.projectMember.findMany({
    where: { projectId },
    select: { userId: true },
  });
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { managerId: true, leadId: true },
  });
  const recipientIds = new Set();
  members.forEach((m) => { if (m.userId !== senderId) recipientIds.add(m.userId); });
  if (project?.managerId && project.managerId !== senderId) recipientIds.add(project.managerId);
  if (project?.leadId && project.leadId !== senderId) recipientIds.add(project.leadId);

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { assigneeId: true },
  });
  if (task?.assigneeId && task.assigneeId !== senderId) recipientIds.add(task.assigneeId);

  if (recipientIds.size === 0) return;

  await prisma.notification.createMany({
    data: [...recipientIds].map((userId) => ({
      userId,
      title,
      message,
      type: 'task_comment',
      projectId,
      taskId,
      linkType: 'task_comment',
    })),
  });
}

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');
    if (!taskId) return error('taskId is required');

    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return json({
      comments: comments.map((c, i) => ({
        id: c.id,
        content: c.content,
        senderId: c.senderId,
        senderName: c.sender.name,
        initials: getInitials(c.sender.name),
        color: AVATAR_COLORS[i % AVATAR_COLORS.length],
        time: timeAgo(c.createdAt),
        createdAt: c.createdAt,
      })),
      count: comments.length,
    });
  } catch (err) {
    console.error('TaskComments GET error:', err);
    return error('Failed to load comments', 500);
  }
}

export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const body = await parseBody(req);
    if (!body?.content || !body?.taskId || !body?.projectId) {
      return error('content, taskId, and projectId are required');
    }

    const comment = await prisma.taskComment.create({
      data: {
        content: body.content.trim(),
        taskId: body.taskId,
        projectId: body.projectId,
        senderId: auth.user.id,
      },
      include: {
        sender: { select: { id: true, name: true } },
        task: { select: { title: true } },
        project: { select: { name: true } },
      },
    });

    await notifyTeamMembers(
      body.taskId,
      body.projectId,
      auth.user.id,
      `New comment on "${comment.task.title}"`,
      `${comment.sender.name}: ${body.content.trim().slice(0, 80)}`
    );

    return json({
      id: comment.id,
      content: comment.content,
      senderName: comment.sender.name,
      initials: getInitials(comment.sender.name),
      time: 'Just now',
      count: await prisma.taskComment.count({ where: { taskId: body.taskId } }),
    }, 201);
  } catch (err) {
    console.error('TaskComments POST error:', err);
    return error('Failed to post comment', 500);
  }
}
