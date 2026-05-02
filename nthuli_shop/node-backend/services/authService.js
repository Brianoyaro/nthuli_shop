const { User } = require('../models');
const jwtService = require('./jwtService');

class AuthService {
  async register(email, password, firstName, lastName) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
    });

    const tokens = jwtService.generateTokens(user.id, user.email, user.role);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      ...tokens,
    };
  }

  async login(email, password, ipAddress) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login IP
    await user.update({ lastLoginIp: ipAddress });

    const tokens = jwtService.generateTokens(user.id, user.email, user.role);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      ...tokens,
    };
  }

  async refreshToken(refreshToken) {
    const payload = jwtService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error('Invalid refresh token');
    }

    const user = await User.findByPk(payload.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const tokens = jwtService.generateTokens(user.id, user.email, user.role);
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      ...tokens,
    };
  }
}

module.exports = new AuthService();
