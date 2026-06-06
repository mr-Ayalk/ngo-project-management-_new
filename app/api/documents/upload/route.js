export const dynamic = 'force-dynamic';

import { json, error, requireAuth } from '@/lib/api-utils';
import { storeUploadedFile } from '@/lib/file-upload';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['pdf', 'xlsx', 'xls', 'docx', 'doc', 'csv', 'zip', 'png', 'jpg', 'jpeg'];

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
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return error('No file provided', 400);
    }

    if (file.size > MAX_BYTES) {
      return error('File must be 10 MB or smaller', 400);
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return error(`File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`, 400);
    }

    const stored = await storeUploadedFile(file, { folder: 'uploads' });

    return json({
      url: stored.url,
      name: file.name,
      size: formatSize(file.size),
      fileType: EXT_TYPES[ext] || ext.toUpperCase() || 'FILE',
      icon: fileIcon(ext),
    });
  } catch (err) {
    console.error('Upload error:', err);
    return error(err.message || 'Upload failed', 500);
  }
}
