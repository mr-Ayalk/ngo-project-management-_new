export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, formatMonthYear, requireAuth, requireManager } from '@/lib/api-utils';
import { logActivity } from '@/lib/activity';

function formatBeneficiary(b) {
  const statusMap = { active: 'on-track', 'follow-up': 'at-risk', inactive: 'inactive' };
  return {
    id: b.id,
    name: b.name,
    email: b.email,
    program: b.program,
    region: b.region,
    status: statusMap[b.status] || b.status,
    statusLabel: b.status === 'active' ? 'Active' : b.status === 'follow-up' ? 'Follow-up' : 'Inactive',
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
    const search = searchParams.get('search');

    const where = {};
    if (region && region !== 'all') where.region = region;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [beneficiaries, org] = await Promise.all([
      prisma.beneficiary.findMany({
        where,
        include: { projects: true },
        orderBy: { enrolledDate: 'desc' },
      }),
      prisma.organization.findFirst(),
    ]);

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
      regions: ['Nairobi', 'Lagos', 'Eldoret', 'Addis Ababa', 'Dar es Salaam', 'Oromia', 'South West', 'Southern'],
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
