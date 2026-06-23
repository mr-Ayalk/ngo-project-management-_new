import prisma from '@/lib/db';
import { isDean, isProjectManagerRole, userLeadsProject } from '@/lib/roles';

export function userCanAccessProject(user, project) {
  if (!user || !project) return false;
  if (isDean(user)) return true;

  const uid = user.id;
  if (project.managerId === uid || project.leadId === uid) return true;

  const members = project.members || [];
  return members.some((m) => {
    const memberId = m.userId ?? m.user?.id ?? m.id;
    return memberId === uid;
  });
}

export function userCanManageProject(user, project) {
  if (!user || !project) return false;
  return userLeadsProject(user, project);
}

export async function assertProjectAccess(user, projectId) {
  if (isDean(user)) return true;

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

export async function assertProjectManageAccess(user, projectId) {
  if (isDean(user)) return true;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { managerId: true, leadId: true },
  });

  if (!project) return false;
  return userLeadsProject(user, project);
}
