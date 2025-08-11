const { prisma } = require('./testUtils');
const bcrypt = require('bcrypt');

async function seedTestData() {
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

  } catch (error) {
    throw new Error(`
      Failed to seed test data.
      Original error: ${error.message}
    `);
  }
}

seedTestData()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });