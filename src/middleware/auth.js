const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token){
        return res.status(401).json({
            message: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err){
            return res.status(403).json({
                message:'Invalid or expired token'
            });
        }
        req.user = user;
        next();
        });
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user.allRoles || !req.user.allRoles.includes(role)){
            return res.status(403).json({
                message: `Access denied. ${role} role required`
            });
            }
            next();
        };
    
};

module.exports = { authenticateToken, requireRole };