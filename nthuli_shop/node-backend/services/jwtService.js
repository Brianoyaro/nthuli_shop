const jwt = require('jsonwebtoken');
const config = require('../config/env');

class JwtService {
  generateAccessToken(userId, email, role) {
    return jwt.sign(
      { userId, email, role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      return null;
    }
  }

  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, config.jwt.refreshSecret);
    } catch (error) {
      return null;
    }
  }

  generateTokens(userId, email, role) {
    return {
      accessToken: this.generateAccessToken(userId, email, role),
      refreshToken: this.generateRefreshToken(userId),
    };
  }
}

module.exports = new JwtService();
