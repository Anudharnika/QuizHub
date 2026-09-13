const jwt = require('jsonwebtoken');
const mockStore = require('../utils/mockStore');
const { getMongoStatus } = require('../config/db');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'quizhub_super_secret_jwt_key_2026_modern_platform';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      if (getMongoStatus()) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        req.user = mockStore.findUserById(decoded.id);
      }

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Admin privileges required' });
};

module.exports = { protect, admin, JWT_SECRET };
