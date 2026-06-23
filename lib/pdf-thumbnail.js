'use client';

/** Generate a JPEG thumbnail blob from the first page of a PDF file. */
export async function generatePdfThumbnail(file, maxWidth = 480) {
  if (typeof window === 'undefined') return null;
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext !== 'pdf') return null;

  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

    const data = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjs.getDocument({ data }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(maxWidth / viewport.width, 1.5);
    const scaled = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = scaled.width;
    canvas.height = scaled.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport: scaled }).promise;
    return await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88));
  } catch (err) {
    console.warn('PDF thumbnail generation failed:', err);
    return null;
  }
}

export function isImageFile(file) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
}

export async function resolveDocumentThumbnail(file) {
  if (isImageFile(file)) return { useFileUrl: true };
  const blob = await generatePdfThumbnail(file);
  if (!blob) return null;
  return { blob, fileName: `${Date.now()}-cover.jpg` };
}
