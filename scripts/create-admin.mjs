import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const email = String(
  process.env.BOOTSTRAP_ADMIN_EMAIL || process.env.PROVISION_ADMIN_EMAIL || '',
).trim().toLowerCase();
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD || process.env.PROVISION_ADMIN_PASSWORD || '';
const name = String(
  process.env.BOOTSTRAP_ADMIN_NAME || process.env.PROVISION_ADMIN_NAME || 'Administrator',
).trim();

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error('BOOTSTRAP_ADMIN_EMAIL must be a valid email address');
}
if (password.length < 12 || password.length > 128 || !/[a-z]/.test(password)
  || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
  throw new Error('BOOTSTRAP_ADMIN_PASSWORD must contain 12-128 characters with upper-case, lower-case, and numeric characters');
}
if (name.length < 2 || name.length > 100) {
  throw new Error('BOOTSTRAP_ADMIN_NAME must contain 2-100 characters');
}

const prisma = new PrismaClient();
try {
  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: await bcrypt.hash(password, 12),
    },
    create: {
      email,
      name,
      password: await bcrypt.hash(password, 12),
    },
  });
  console.log(`Administrator identity is ready for ${email}`);
} finally {
  await prisma.$disconnect();
}
