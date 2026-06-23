export const dynamic = 'force-dynamic';

import { verifyPassword, signJWT } from '@/lib/auth';
import prisma from '@/lib/db';
import { toPublicUser } from '@/lib/user-public';
import { getClientIp } from '@/lib/audit';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, location } = body || {};
    if (!email || !password) {
      return Response.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return Response.json({ error: 'Invalid credentials' }, { status: 401 });

    if (!user.isActive) {
      return Response.json({ error: 'Account deactivated. Contact your administrator.' }, { status: 403 });
    }

    const ok = await verifyPassword(password, user.password);
    if (!ok) return Response.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = await signJWT({ id: user.id, email: user.email, name: user.name, role: user.role });
    const ipAddress = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || null;

    await Promise.all([
      prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } }),
      prisma.loginEvent.create({
        data: {
          userId: user.id,
          ipAddress,
          city: location?.city || null,
          region: location?.region || null,
          country: location?.country || null,
          latitude: location?.latitude != null ? Number(location.latitude) : null,
          longitude: location?.longitude != null ? Number(location.longitude) : null,
          timezone: location?.timezone || null,
          userAgent,
        },
      }).catch((err) => console.warn('LoginEvent create failed:', err)),
    ]);

    return Response.json({
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error('Login error', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
