import prisma from '@/lib/db';
import { isProjectManager } from '@/lib/roles';

export function userCanAccessProject(user, project) {
  if (!user || !project) return false;
  if (isProjectManager(user)) return true;

  const uid = user.id;
  if (project.managerId === uid || project.leadId === uid) return true;

  const members = project.members || [];
  return members.some((m) => {
    const memberId = m.userId ?? m.user?.id ?? m.id;
    return memberId === uid;
  });
}

export async function assertProjectAccess(user, projectId) {
  if (isProjectManager(user)) return true;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      managerId: true,
      leadId: true,
      members: { select: { userId: true } },
    },
  });

  if (!project) return false;
  return userCanAccessProject(user, project);
}
