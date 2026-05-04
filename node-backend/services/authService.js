const { User } = require('../models');
const { ROLE } = require('../models/enums');
const jwtService = require('./jwtService');

// Admin registration code - change this to a secure value in production
const ADMIN_REGISTRATION_CODE = process.env.ADMIN_CODE || 'AdminCode@2024';

class AuthService {
  async register(email, password, firstName, lastName, adminCode = null) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Determine user role based on admin code
    let userRole = ROLE.USER;
    if (adminCode) {
      if (adminCode !== ADMIN_REGISTRATION_CODE) {
        throw new Error('Invalid admin code');
      }
      userRole = ROLE.ADMIN;
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: userRole,
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
