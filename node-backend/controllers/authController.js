const authService = require('../services/authService');

class AuthController {
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, adminCode } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const result = await authService.register(email, password, firstName, lastName, adminCode);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await authService.login(email, password, ipAddress);
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }

      const result = await authService.refreshToken(refreshToken);
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();
