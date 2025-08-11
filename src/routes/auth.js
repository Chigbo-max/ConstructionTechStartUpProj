const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userService =  require('../services/userService');
const { authenticateToken } = require('../middleware/auth');


const router =  express.Router();

router.post('/register', async (req, res) => {
    try{
        const user = await userService.registerUser(req.body);

        const token = jwt.sign(
            {
                sub: user.id,
                email: user.email,
                role: user.roles[0],
                allRoles: user.roles
            },
            process.env.JWT_SECRET,
            {expiresIn: '24h'}
        );

        res.status(201).json({
            message: 'Registration successful',
            user: { ...user, password: undefined},
            token
        });
    } catch (error){
        res.status(400).json({
            message: error.message
        });
    }
});

router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
      }
  
      const user = await userService.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign(
        { 
          sub: user.id, 
          email: user.email, 
          role: user.roles[0],
          allRoles: user.roles
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
  
      res.json({ 
        message: 'Login successful',
        user: { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          roles: user.roles
        },
        token 
      });
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  });

router.post('/switch-role', authenticateToken, async (req, res) => {
    try {
      const { role } = req.body;
      
      if (!req.user.allRoles.includes(role)) {
        return res.status(403).json({ message: 'Role not available for this user' });
      }
  
      const token = jwt.sign(
        { 
          sub: req.user.sub, 
          email: req.user.email, 
          role: role,
          allRoles: req.user.allRoles
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
  
      res.json({ 
        message: 'Role switched successfully',
        currentRole: role,
        token 
      });
    } catch (error) {
      res.status(500).json({ message: 'Role switch failed' });
    }
  });

  module.exports =  router;