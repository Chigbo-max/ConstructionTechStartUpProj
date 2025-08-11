const userService = require('../services/userService');
const projectRepository = require('../repositories/projectRepository')
const {cleanProjectResponse} = require('../utils/projectResponseCleaner')


exports.getProfile =  async (req, res) => {
    try{
        const user =  await userService.findUserById(req.user.sub);
        if (!user){
            return res.status(404).json({ message: 'User not found'});
        }

        const safeUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles,
            professionDescription: user.professionDescription,
            createdAt: user.createdAt
        };

        res.json({ user: safeUser});
    }catch (error){
        res.status(500).json({message: 'Failed to get profile'});
    }
};

exports.updateProfile =  async (req, res) => {
    try{
        const {name, professionDescription} = req.body;
        const updatedUser = await userService.updateUser(req.user.sub,{
            name,
            professionDescription
        });
        res.json({ message: 'Profile updated', user: updatedUser});
    } catch (error){
        res.status(400).json({ message: error.message});
    }
};

exports.getUserProjects = async(req, res) => {
    try{
        let projects;

        if (req.user.role === 'HOMEOWNER'){
            projects = await projectRepository.findProjectByOwnerId(req.user.sub);
        } else if (req.user.role === 'CONTRACTOR'){
            projects = await projectRepository.findProjectsByContractorId(req.user.sub);
        }else{
            return res.status(403).json({ message: 'Access denied'});
        }

        const cleanProjects = projects.map( project => {

        return cleanProjectResponse(project);
        });
        res.json({projects: cleanProjects});
    } catch (error) {
        res.status(500).json({ message: 'Failed to get projects'});
    }
    
};