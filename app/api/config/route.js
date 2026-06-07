export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, requireAuth, requireManager } from '@/lib/api-utils';
import { REPORT_TYPES } from '@/lib/report-types';
import { REGIONS } from '@/lib/ethiopia-locations';

function parseJsonArray(value, fallback = []) {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function formatOrg(org) {
  if (!org) return null;
  return {
    ...org,
    strategicGoalsList: parseJsonArray(org.strategicGoals, []),
    enabledRegionsList: parseJsonArray(org.enabledRegions, REGIONS.slice(0, 6)),
    dashboardWidgets: parseJsonArray(org.dashboardLayout, ['kpi', 'tasks', 'budget', 'reports', 'beneficiaries']),
  };
}

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const [org, units, indicators, userScopes, reportWorkflow, users] = await Promise.all([
      prisma.organization.findFirst(),
      prisma.orgUnit.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
      prisma.programIndicator.findMany({ orderBy: { name: 'asc' } }),
      prisma.userScopeMapping.findMany({
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.reportWorkflowRule.findMany({ orderBy: { reportType: 'asc' } }),
      auth.user.role === 'admin' || ['manager', 'project_manager'].includes(auth.user.role)
        ? prisma.user.findMany({
            where: { isActive: true },
            select: { id: true, name: true, email: true, role: true, staffRole: true },
            orderBy: { name: 'asc' },
          })
        : Promise.resolve([]),
    ]);

    const workflow = REPORT_TYPES.map((t) => {
      const rule = reportWorkflow.find((r) => r.reportType === t.value);
      return {
        reportType: t.value,
        reportLabel: t.label,
        submitterRoles: rule?.submitterRoles?.split(',').filter(Boolean) || ['staff', 'field_worker', 'program_staff', 'finance_team'],
        approverRoles: rule?.approverRoles?.split(',').filter(Boolean) || ['admin', 'manager', 'project_manager'],
        isActive: rule?.isActive ?? true,
        id: rule?.id || null,
      };
    });

    return json({
      organization: formatOrg(org),
      units,
      indicators,
      userScopes: userScopes.map((s) => ({
        id: s.id,
        userId: s.userId,
        userName: s.user.name,
        userEmail: s.user.email,
        region: s.region,
        zone: s.zone,
        woreda: s.woreda,
        kebele: s.kebele,
      })),
      reportWorkflow: workflow,
      users,
      allRegions: REGIONS,
    });
  } catch (err) {
    console.error('Config GET error:', err);
    return error('Failed to load configuration', 500);
  }
}

export async function PUT(req) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;

    const body = await req.json();
    const existing = await prisma.organization.findFirst();
    if (!existing) return error('Organization not found', 404);

    const data = {};
    const fields = [
      'landingTitle', 'landingSubtitle', 'landingTagline', 'missionText', 'visionText',
      'primaryColor', 'accentColor', 'koboApiUrl', 'koboProjectId',
      'dateFormat', 'timezone', 'fiscalYearStart', 'name', 'country', 'email', 'phone', 'location', 'description',
    ];
    fields.forEach((f) => { if (body[f] !== undefined) data[f] = body[f]; });
    if (body.koboEnabled !== undefined) data.koboEnabled = Boolean(body.koboEnabled);
    if (body.strategicGoalsList) data.strategicGoals = JSON.stringify(body.strategicGoalsList);
    if (body.enabledRegionsList) data.enabledRegions = JSON.stringify(body.enabledRegionsList);
    if (body.dashboardWidgets) data.dashboardLayout = JSON.stringify(body.dashboardWidgets);

    const org = await prisma.organization.update({ where: { id: existing.id }, data });
    return json({ organization: formatOrg(org) });
  } catch (err) {
    console.error('Config PUT error:', err);
    return error('Failed to save configuration', 500);
  }
}
