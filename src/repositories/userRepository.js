const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createUser = async (userData) => {
    return await prisma.user.create({
        data: userData,
    });
};

const findUserByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: { email },
    });
};

const findUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id },
    });
}

const updateUserRoles = async (userId, roles) => {
    return await prisma.user.update({
      where: { id: userId },
      data: { roles },
    });
  };

  const updateUser = async (userId, updateData) => {
    return await prisma.user.update({
        where: { id: userId },
        data: updateData,
    });
};



module.exports ={
    createUser,
    findUserByEmail,
    findUserById,
    updateUserRoles,
    updateUser,
}