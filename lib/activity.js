import prisma from './db';

export async function logActivity({ userId, action, entity, entityId, description, projectId, taskId }) {
  try {
    await prisma.activity.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        description,
        projectId: projectId || null,
        taskId: taskId || null,
      },
    });
  } catch (err) {
    console.error('Activity log error:', err);
  }
}
