export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireManager } from '@/lib/api-utils';

export async function PUT(req) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;
    const body = await parseBody(req);
    if (!body?.reportType) return error('Report type is required');

    const submitterRoles = (body.submitterRoles || []).join(',');
    const approverRoles = (body.approverRoles || []).join(',');

    const rule = await prisma.reportWorkflowRule.upsert({
      where: { reportType: body.reportType },
      create: {
        reportType: body.reportType,
        submitterRoles,
        approverRoles,
        isActive: body.isActive !== false,
      },
      update: { submitterRoles, approverRoles, isActive: body.isActive !== false },
    });

    return json(rule);
  } catch {
    return error('Failed to save workflow rule', 500);
  }
}
