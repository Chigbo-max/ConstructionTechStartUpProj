const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createNotification = async (notificationData) => {

    const cleanData = {};
    Object.keys(notificationData).forEach(key => {
        if(notificationData[key] !== undefined){
            cleanData[key] = notificationData[key];
        }
    });

  return await prisma.notification.create({
    data: cleanData,
  });
};

const getUserNotifications = async (userId, { limit = 20, offset = 0, unreadOnly = false } = {}) => {
  const where = { userId };
  if (unreadOnly) {
    where.read = false;
  }

  return await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      project: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
};

const markAsRead = async (notificationId, userId) => {
  return await prisma.notification.update({
    where: {
      id: notificationId,
      userId, 
    },
    data: { read: true },
  });
};

const markAllAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
};

const getProjectById = async (projectId) => {
  return await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      title: true,
      ownerId: true,
    },
  });
};

const getProjectWithBids = async (projectId) => {
  return await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      bids: {
        include: {
          contractor: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getProjectById,
  getProjectWithBids,
};