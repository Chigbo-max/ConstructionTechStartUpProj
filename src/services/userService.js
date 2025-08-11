const userRepository =  require('../repositories/userRepository');
const bcrypt = require('bcrypt');
const {cleanProfileResponse} = require('../utils/userProfileResponseCleaner')

const registerUser = async({email, password, firstName, lastName, roles, professionDescription}) => {
    if(!email || !password || !firstName || !lastName || !roles) {
        throw new Error('All fields are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email address');
    }

    const validRoles = ['HOMEOWNER', 'CONTRACTOR', 'OTHER'];

    if(!roles || !Array.isArray(roles) || roles.length === 0){
        throw new Error('At least one role is required');
    }

    for(const role of roles){
    if(!validRoles.includes(role)) {
        throw new Error(`Role must be one of: ${validRoles.join(', ')}`);
        }
    }

    if(roles.includes('OTHER') && !professionDescription ) {
        throw new Error('Please specify your profession for role OTHER');
    }

    if (professionDescription) {
        const trimmedProfDesc = professionDescription.trim();
    
        if (trimmedProfDesc === '' || /^\.{1,}$/.test(trimmedProfDesc)) {
            throw new Error('Profession description cannot be empty or just dots');
        }
    }

    const existingUser = await userRepository.findUserByEmail(email);
    if (existingUser) {
        const updatedRoles = [...new Set([...existingUser.roles, ...roles])];
        
        const updatedUser = await userRepository.updateUserRoles(existingUser.id, updatedRoles);
        
        return cleanProfileResponse(updatedUser);
      }
    
    const name = `${firstName} ${lastName}`;
   
    if(password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
    }
 
    if(password.length > 50) {
        throw new Error('Password must be less than 50 characters long');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUserData = {
        email,
        passwordHash,
        name,
        roles,
    }

    if(roles.includes('OTHER') && professionDescription){
        newUserData.professionDescription = professionDescription;
    }

    const newUser = await userRepository.createUser(newUserData);
    return cleanProfileResponse(newUser);
};

const findUserById = async (id) => {
    const user = await userRepository.findUserById(id);
    if (!user) return null;
    
    return cleanProfileResponse(user);
  };

const findUserByEmail = async (email) => {
    return await userRepository.findUserByEmail(email);
  };
  
const updateUser = async (userId, updateData) => {
    const allowedFields = ['name', 'professionDescription'];
    const filteredData = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }
    
    const updatedUser = await userRepository.updateUser(userId, filteredData);
    
    return cleanProfileResponse(updatedUser);
};

module.exports = {
    registerUser,
    findUserById,
    findUserByEmail,
    updateUser
};
