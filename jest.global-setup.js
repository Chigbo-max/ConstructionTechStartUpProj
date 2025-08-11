require('dotenv').config({ path: '.env.test' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

module.exports = async () => {
  try {
    await prisma.$executeRaw`DROP SCHEMA IF EXISTS public CASCADE`;
    await prisma.$executeRaw`CREATE SCHEMA public`;
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    
    const { execSync } = require('child_process');
    
    try {
      execSync('npx prisma migrate deploy', { 
        env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
        stdio: 'inherit'
      });
    } catch (migrationError) {
      throw migrationError;
    }
    
    try {
      const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
      
      if (tables.length === 0) {
        throw new Error('No tables were created by migrations');
      }
    } catch (verifyError) {
      throw verifyError;
    }

    try {
      await prisma.user.createMany({
        data: [
          {
            id: 'homeowner-1',
            name: 'Mary Bruce',
            email: 'marybruce@gmail.com',
            passwordHash: await bcrypt.hash('password', 10),
            roles: ['HOMEOWNER']
          },
          {
            id: 'contractor-1',
            name: 'Bruce Bruce',
            email: 'brucebruce@gmail.com',
            passwordHash: await bcrypt.hash('password', 10),
            roles: ['CONTRACTOR']
          }
        ],
        skipDuplicates: true
      });
    } catch (userError) {
      if (userError.code === 'P2002') {
      } else {
        throw userError;
      }
    }

    try {
      await prisma.project.create({
        data: {
          id: 'project-1',
          title: 'Bathroom Renovation',
          description: 'To be transformed to a modern style in one month',
          ownerId: 'homeowner-1',
          status: 'OPEN_FOR_BIDS',
          budget: 10000,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          address: '24 Salako Street, Mushin'
        }
      });
    } catch (projectError) {
      if (projectError.code === 'P2002') {
      } else {
        throw projectError;
      }
    }
    
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};