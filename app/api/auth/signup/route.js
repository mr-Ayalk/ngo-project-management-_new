export const dynamic = 'force-dynamic';

import { hashPassword, signJWT } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !name || !password) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return Response.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'staff',
      },
    });

    const token = await signJWT({ id: user.id, email: user.email, name: user.name, role: user.role });

    return Response.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Signup error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
