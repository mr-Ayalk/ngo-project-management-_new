export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireAuth } from '@/lib/api-utils';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') || '2024', 10);
    const month = parseInt(searchParams.get('month') || '5', 10);

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const toLocalDay = (date) => {
      const d = new Date(date);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    const events = await prisma.calendarEvent.findMany({
      where: { date: { gte: start, lte: end } },
      include: { project: { select: { name: true } } },
      orderBy: { date: 'asc' },
    });

    const firstDay = start.getDay();
    const daysInMonth = end.getDate();
    const prevDays = new Date(year, month - 1, 0).getDate();

    const eventsByDay = {};
    events.forEach((e) => {
      const eventDay = toLocalDay(e.date);
      const day = eventDay.getDate();
      const isOverdue = eventDay < todayStart;
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push({
        t: e.title,
        c: isOverdue ? 'overdue' : e.color,
        id: e.id,
        overdue: isOverdue,
      });
    });

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ num: prevDays - firstDay + i + 1, otherMonth: true });
    }
    const today = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        num: d,
        today: today.getFullYear() === year && today.getMonth() === month - 1 && today.getDate() === d,
        events: eventsByDay[d] || [],
      });
    }
    const remaining = 42 - firstDay - daysInMonth;
    for (let d = 1; d <= remaining; d++) {
      days.push({ num: d, otherMonth: true });
    }

    const upcoming = events
      .filter((e) => toLocalDay(e.date) >= todayStart)
      .slice(0, 6)
      .map((e) => {
        const d = new Date(e.date);
        const dateStr = e.allDay
          ? `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · All Day`
          : `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${e.time || '9:00 AM'}`;
        return { id: e.id, title: e.title, date: dateStr, color: e.color, type: 'event' };
      });

    const [overdueEvents, overdueTasks] = await Promise.all([
      prisma.calendarEvent.findMany({
        where: { date: { lt: todayStart } },
        include: { project: { select: { name: true } } },
        orderBy: { date: 'desc' },
        take: 8,
      }),
      prisma.task.findMany({
        where: {
          dueDate: { lt: todayStart },
          status: { in: ['todo', 'in_progress'] },
        },
        include: { project: { select: { name: true } } },
        orderBy: { dueDate: 'asc' },
        take: 8,
      }),
    ]);

    const overdue = [
      ...overdueEvents.map((e) => {
        const d = toLocalDay(e.date);
        return {
          id: e.id,
          title: e.title,
          type: 'event',
          project: e.project?.name || null,
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          daysOverdue: Math.ceil((todayStart - d) / (1000 * 60 * 60 * 24)),
        };
      }),
      ...overdueTasks.map((t) => {
        const d = toLocalDay(t.dueDate);
        return {
          id: t.id,
          title: t.title,
          type: 'task',
          project: t.project?.name || null,
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          daysOverdue: Math.ceil((todayStart - d) / (1000 * 60 * 60 * 24)),
        };
      }),
    ]
      .sort((a, b) => b.daysOverdue - a.daysOverdue)
      .slice(0, 10);

    const monthLabel = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return json({ days, upcoming, overdue, monthLabel, year, month });
  } catch (err) {
    console.error('Calendar GET error:', err);
    return error('Failed to load calendar', 500);
  }
}

export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const body = await parseBody(req);
    if (!body?.title || !body?.date) return error('Title and date are required');

    const eventDate = new Date(body.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    if (eventDate < today) {
      return error('Events cannot be scheduled on past dates', 400);
    }

    const event = await prisma.calendarEvent.create({
      data: {
        title: body.title,
        date: new Date(body.date),
        time: body.time,
        allDay: body.allDay || false,
        color: body.color || 'green',
        projectId: body.projectId || null,
      },
    });

    return json(event, 201);
  } catch (err) {
    return error('Failed to create event', 500);
  }
}
