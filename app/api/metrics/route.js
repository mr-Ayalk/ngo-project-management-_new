// Simple SSE endpoint that streams JSON metrics periodically (demo only)
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  function sendEvent(data) {
    const s = `data: ${JSON.stringify(data)}\n\n`;
    return writer.write(new TextEncoder().encode(s));
  }

  let count = 0;
  const iv = setInterval(() => {
    count += 1;
    const payload = {
      activeProjects: 12 + Math.round(Math.sin(count / 5) * 2),
      tasksCompleted: 240 + Math.round(Math.random() * 20),
      beneficiaries: 4670 + Math.round(Math.random() * 50),
      budgetPct: 65 + Math.round(Math.random() * 6),
      ts: Date.now(),
    };
    sendEvent(payload).catch(() => {});
    // stop after long time for safety
    if (count > 3600) {
      clearInterval(iv);
      writer.close();
    }
  }, 1500);

  // When client disconnects, clear interval
  req.signal.addEventListener('abort', () => {
    clearInterval(iv);
    try { writer.close(); } catch (e) {}
  });

  // initial headers for SSE
  const headers = new Headers({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  return new Response(readable, { headers });
}
