const cleanProfileResponse = (user) => {
    const cleanProfile = {
     id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
    createdAt:user.createdAt
    };
  
    if (user.professionDescription) user.professionDescription = user.professionDescription;
  
    return cleanProfile;
  };
  
  module.exports = { cleanProfileResponse };