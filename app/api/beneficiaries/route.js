export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, formatMonthYear, requireAuth, requireManager } from '@/lib/api-utils';
import { logActivity } from '@/lib/activity';
import { getBeneficiaryStatusLabel, getBeneficiaryStatusBadge } from '@/lib/beneficiary-status';

function formatBeneficiary(b) {
  return {
    id: b.id,
    name: b.name,
    email: b.email,
    program: b.program,
    region: b.region,
    status: b.status,
    statusBadge: getBeneficiaryStatusBadge(b.status),
    statusLabel: getBeneficiaryStatusLabel(b.status),
    date: formatMonthYear(b.enrolledDate),
    enrolledDate: b.enrolledDate,
    programs: b.projects?.length || 1,
  };
}

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const region = searchParams.get('region');
    const program = searchParams.get('program');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where = {};
    if (region && region !== 'all') where.region = region;
    if (program && program !== 'all') where.program = program;
    if (status && status !== 'all') where.status = status;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [beneficiaries, org, allForFilters] = await Promise.all([
      prisma.beneficiary.findMany({
        where,
        include: { projects: true },
        orderBy: { enrolledDate: 'desc' },
      }),
      prisma.organization.findFirst(),
      prisma.beneficiary.findMany({
        select: { program: true, region: true, status: true },
      }),
    ]);

    const programs = [...new Set(allForFilters.map((b) => b.program).filter(Boolean))].sort();
    const regions = [...new Set(allForFilters.map((b) => b.region).filter(Boolean))].sort();

    return json({
      stats: {
        total: org?.totalBeneficiaries ?? 0,
        children: org?.childrenCount ?? 0,
        womenFamilies: org?.womenFamiliesCount ?? 0,
        communityMembers: org?.communityMembersCount ?? 0,
        thisMonth: org?.beneficiariesThisMonth ?? 0,
        activePrograms: org?.activePrograms ?? 0,
        completionRate: org?.completionRate ?? 0,
      },
      beneficiaries: beneficiaries.map(formatBeneficiary),
      regions,
      programs,
    });
  } catch (err) {
    console.error('Beneficiaries GET error:', err);
    return error('Failed to load beneficiaries', 500);
  }
}

export async function POST(req) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;
    const user = auth.user;

    const body = await parseBody(req);
    if (!body?.name) return error('Name is required');

    const beneficiary = await prisma.beneficiary.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        program: body.program,
        category: body.category,
        status: body.status || 'active',
        region: body.region,
        enrolledDate: body.enrolledDate ? new Date(body.enrolledDate) : new Date(),
        notes: body.notes,
      },
      include: { projects: true },
    });

    await logActivity({
      userId: user.id,
      action: 'created',
      entity: 'beneficiary',
      entityId: beneficiary.id,
      description: `Enrolled beneficiary "${beneficiary.name}"`,
    });

    return json(formatBeneficiary(beneficiary), 201);
  } catch (err) {
    return error('Failed to create beneficiary', 500);
  }
}
