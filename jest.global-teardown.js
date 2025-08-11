const { prisma } = require('./src/tests/utils/testUtils');

module.exports = async () => {
  await prisma.$disconnect();
};