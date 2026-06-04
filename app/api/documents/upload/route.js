export const dynamic = 'force-dynamic';

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { json, error } from '@/lib/api-utils';

const MAX_BYTES = 10 * 1024 * 1024;

const EXT_TYPES = {
  pdf: 'PDF',
  xlsx: 'XLSX',
  xls: 'XLSX',
  docx: 'DOCX',
  doc: 'DOCX',
  csv: 'CSV',
  zip: 'ZIP',
  png: 'PNG',
  jpg: 'JPEG',
  jpeg: 'JPEG',
};

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(ext) {
  if (ext === 'pdf') return '📄';
  if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') return '📊';
  if (ext === 'docx' || ext === 'doc') return '📝';
  if (ext === 'zip') return '🗂️';
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') return '🖼️';
  return '📋';
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return error('No file provided', 400);
    }

    if (file.size > MAX_BYTES) {
      return error('File must be 10 MB or smaller', 400);
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, safeName), buffer);

    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    return json({
      url: `/uploads/${safeName}`,
      name: file.name,
      size: formatSize(file.size),
      fileType: EXT_TYPES[ext] || ext.toUpperCase() || 'FILE',
      icon: fileIcon(ext),
    });
  } catch (err) {
    console.error('Upload error:', err);
    return error('Upload failed', 500);
  }
}
