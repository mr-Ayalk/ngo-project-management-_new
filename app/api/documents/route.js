export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, formatDate, requireAuth } from '@/lib/api-utils';
import { logActivity } from '@/lib/activity';

function formatDocument(d) {
  const projectLabel = d.project?.name || 'All Projects';
  return {
    id: d.id,
    icon: d.icon || '📄',
    name: d.name,
    fileType: d.fileType,
    category: d.category,
    project: d.project?.name,
    date: `${projectLabel} · ${formatDate(d.uploadedAt).replace(/, \d{4}$/, '')}`,
    uploaded: formatDate(d.uploadedAt),
    size: d.size,
    url: d.url,
  };
}

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const where = {};
    if (category && category !== 'all') where.category = category;

    const documents = await prisma.document.findMany({
      where,
      include: { project: { select: { name: true } } },
      orderBy: { uploadedAt: 'desc' },
    });

    return json({
      documents: documents.map(formatDocument),
      categories: ['all', 'reports', 'budget', 'data', 'contracts', 'media', 'training', 'feedback'],
    });
  } catch (err) {
    console.error('Documents GET error:', err);
    return error('Failed to load documents', 500);
  }
}

export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const user = auth.user;

    const body = await parseBody(req);
    if (!body?.name) return error('Name is required');

    const doc = await prisma.document.create({
      data: {
        name: body.name,
        url: body.url || '#',
        fileType: body.fileType,
        category: body.category,
        size: body.size,
        icon: body.icon || '📄',
        projectId: body.projectId || null,
      },
      include: { project: { select: { name: true } } },
    });

    await logActivity({
      userId: user.id,
      action: 'created',
      entity: 'document',
      entityId: doc.id,
      description: `Uploaded document "${doc.name}"`,
      projectId: doc.projectId || undefined,
    });

    return json(formatDocument(doc), 201);
  } catch (err) {
    return error('Failed to create document', 500);
  }
}
