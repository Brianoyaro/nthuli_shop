const jwtService = require('../services/jwtService');
const { ROLE } = require('../models/enums');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const payload = jwtService.verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.user = payload;
  next();
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== ROLE.ADMIN) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };
