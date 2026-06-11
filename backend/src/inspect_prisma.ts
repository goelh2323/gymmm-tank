import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Connecting via Prisma Client...');
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables in public schema:');
    console.log(tables);
  } catch (err: any) {
    console.error('Prisma query failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
