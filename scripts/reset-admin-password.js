const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

function loadEnvFile(filename) {
  const envPath = path.join(__dirname, '..', filename);
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  });
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const ADMIN_EMAIL = process.argv[2] || 'ayalkbet@bamah.com';
const NEW_PASSWORD = process.argv[3] || '123456789';

async function main() {
  const prisma = new PrismaClient();
  const email = ADMIN_EMAIL.toLowerCase().trim();
  try {
    const hash = await bcrypt.hash(NEW_PASSWORD, 10);
    const user = await prisma.user.upsert({
      where: { email },
      update: { password: hash, isActive: true },
      create: {
        email,
        name: 'Ayalkbet Teketel',
        password: hash,
        role: 'dean',
        isActive: true,
        joinedDate: new Date(),
      },
      select: { email: true, name: true, role: true },
    });
    console.log(`Account ready for ${user.name} (${user.email}) with password: ${NEW_PASSWORD}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
