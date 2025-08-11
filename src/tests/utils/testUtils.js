const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

function getAuthToken(userId, roles = ['HOMEOWNER']) {
  return jwt.sign(
    {
      sub: userId,
      allRoles: Array.isArray(roles) ? roles : [roles],
      email: `${userId}@test.com`
    },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
}

module.exports = {
  prisma,
  getAuthToken
};