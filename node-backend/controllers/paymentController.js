const paymentService = require('../services/paymentService');

class PaymentController {
  /**
   * Get all payments (admin only)
   */
  async getAllPayments(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const payments = await paymentService.getAllPayments(limit, offset);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(req, res) {
    try {
      const payment = await paymentService.getPaymentById(req.params.id);
      res.json(payment);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  /**
   * Get user payments
   */
  async getUserPayments(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const payments = await paymentService.getPaymentsByUser(
        req.params.userId,
        limit,
        offset
      );
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Initiate M-Pesa payment
   */
  async initiateM2uPayment(req, res) {
    try {
      const { phoneNumber, amount, description, orderId } = req.body;
      const userId = req.user.userId;

      if (!phoneNumber || !amount) {
        return res.status(400).json({
          message: 'phoneNumber and amount are required',
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          message: 'Amount must be greater than 0',
        });
      }

      // Validate phone number format (Kenyan format)
      if (!/^254\d{9}$/.test(phoneNumber.replace(/\D/g, ''))) {
        return res.status(400).json({
          message: 'Invalid phone number format. Use format: 254XXXXXXXXX',
        });
      }

      const result = await paymentService.initiateM2uPayment(
        userId,
        phoneNumber,
        amount,
        description,
        orderId || null
      );

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Query payment status
   */
  async queryPaymentStatus(req, res) {
    try {
      const { id } = req.params;

      const result = await paymentService.queryPaymentStatus(id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * M-Pesa callback endpoint
   */
  async handleMpesaCallback(req, res) {
    try {
      // M-Pesa expects a 200 response immediately
      res.status(200).json({ success: true });

      // Process callback asynchronously
      await paymentService.handleMpesaCallback(req.body);
    } catch (error) {
      console.error('M-Pesa callback error:', error);
      // Still return 200 to avoid M-Pesa resending
      res.status(200).json({ success: false });
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const payment = await paymentService.cancelPayment(id, reason);
      res.json({
        message: 'Payment cancelled successfully',
        payment,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Refund payment
   */
  async refundPayment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const payment = await paymentService.refundPayment(id, reason);
      res.json({
        message: 'Payment refunded successfully',
        payment,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new PaymentController();
