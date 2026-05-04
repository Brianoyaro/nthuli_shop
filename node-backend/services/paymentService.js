const { Payment, User, Order } = require('../models');
const { PAYMENT_STATUS, PAYMENT_METHOD, ORDER_STATUS } = require('../models/enums');
const mpesaService = require('./mpesaService');

class PaymentService {
  /**
   * Get all payments
   */
  async getAllPayments(limit = 50, offset = 0) {
    return Payment.findAll({
      include: [{ association: 'user', attributes: ['id', 'email', 'firstName', 'lastName'] }],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id) {
    const payment = await Payment.findByPk(id, {
      include: [{ association: 'user' }],
    });
    if (!payment) throw new Error('Payment not found');
    return payment;
  }

  /**
   * Get payments by user ID
   */
  async getPaymentsByUser(userId, limit = 50, offset = 0) {
    return Payment.findAll({
      where: { userId },
      include: [{ association: 'user' }],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Get payment by transaction ID
   */
  async getPaymentByTransactionId(transactionId) {
    return Payment.findOne({
      where: { transactionId },
      include: [{ association: 'user' }],
    });
  }

  /**
   * Initiate M-Pesa payment
   */
  async initiateM2uPayment(userId, phoneNumber, amount, description, orderId = null) {
    try {
      // Validate user exists
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      // Validate order if orderId provided
      if (orderId) {
        const order = await Order.findOne({
          where: { id: orderId, userId },
        });
        if (!order) throw new Error('Order not found or does not belong to user');
      }

      // Create payment record
      const payment = await Payment.create({
        userId,
        amount,
        currency: 'KES',
        status: PAYMENT_STATUS.PENDING,
        method: PAYMENT_METHOD.MPESA,
        description,
        orderId: orderId || null,
      });

      // Initiate M-Pesa STK push
      const mpesaResponse = await mpesaService.initiateStkPush(
        phoneNumber,
        amount,
        `ORD-${payment.id}`,
        description || 'Nthuli Shop Payment'
      );

      // Check for M-Pesa API errors
      if (
        mpesaResponse.ResponseCode !== '0' &&
        mpesaResponse.errorCode
      ) {
        await payment.destroy();
        throw new Error(`M-Pesa error: ${mpesaResponse.errorMessage || mpesaResponse.ResponseDescription}`);
      }

      // Store checkout request ID for status queries
      if (mpesaResponse.CheckoutRequestID) {
        payment.transactionId = mpesaResponse.CheckoutRequestID;
        await payment.save();
      }

      return {
        paymentId: payment.id,
        checkoutRequestId: mpesaResponse.CheckoutRequestID,
        responseCode: mpesaResponse.ResponseCode,
        responseDescription: mpesaResponse.ResponseDescription,
        customerMessage: mpesaResponse.CustomerMessage,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Query M-Pesa payment status
   */
  async queryPaymentStatus(paymentId) {
    try {
      const payment = await this.getPaymentById(paymentId);
      if (!payment.transactionId) {
        throw new Error('Payment has no transaction ID');
      }

      const statusResponse = await mpesaService.queryPaymentStatus(payment.transactionId);

      // Update payment status based on response
      if (statusResponse.ResultCode === '0') {
        payment.status = PAYMENT_STATUS.COMPLETED;
      } else if (statusResponse.ResultCode === '1032') {
        payment.status = PAYMENT_STATUS.FAILED;
      }

      await payment.save();

      return {
        paymentId: payment.id,
        status: payment.status,
        resultCode: statusResponse.ResultCode,
        resultDescription: statusResponse.ResultDescription,
        amount: payment.amount,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle M-Pesa callback
   */
  async handleMpesaCallback(callbackData) {
    try {
      const { Body } = callbackData;
      const { stkCallback } = Body;
      const { CheckoutRequestID, ResultCode, CallbackMetadata } = stkCallback;

      // Find payment by transaction ID
      let payment = await this.getPaymentByTransactionId(CheckoutRequestID);

      if (!payment) {
        throw new Error(`Payment not found for transaction: ${CheckoutRequestID}`);
      }

      // Update payment based on callback result
      if (ResultCode === 0) {
        // Success
        payment.status = PAYMENT_STATUS.COMPLETED;

        // Extract amount if available in metadata
        if (CallbackMetadata && CallbackMetadata.Item) {
          const amountItem = CallbackMetadata.Item.find(item => item.Name === 'Amount');
          if (amountItem) {
            payment.amount = amountItem.Value;
          }

          // Extract M-Pesa receipt number
          const receiptItem = CallbackMetadata.Item.find(item => item.Name === 'MpesaReceiptNumber');
          if (receiptItem) {
            payment.transactionId = receiptItem.Value;
          }
        }

        // Update order status to PROCESSING if orderId exists
        if (payment.orderId) {
          const order = await Order.findByPk(payment.orderId);
          if (order && order.status === ORDER_STATUS.PENDING) {
            order.status = ORDER_STATUS.PROCESSING;
            await order.save();
          }
        }
      } else if (ResultCode === 1) {
        // The user cancelled the operation
        payment.status = PAYMENT_STATUS.CANCELLED;
      } else {
        // Other failures
        payment.status = PAYMENT_STATUS.FAILED;
      }

      await payment.save();

      return {
        success: true,
        paymentId: payment.id,
        status: payment.status,
      };
    } catch (error) {
      console.error('Error handling M-Pesa callback:', error);
      throw error;
    }
  }

  /**
   * Cancel payment
   */
  async cancelPayment(paymentId, reason) {
    const payment = await this.getPaymentById(paymentId);

    if (payment.status === PAYMENT_STATUS.COMPLETED) {
      throw new Error('Cannot cancel completed payment');
    }

    payment.status = PAYMENT_STATUS.CANCELLED;
    if (reason) {
      payment.description = `${payment.description} (Cancelled: ${reason})`;
    }

    await payment.save();
    return payment;
  }

  /**
   * Refund payment (mark as refunded)
   */
  async refundPayment(paymentId, reason) {
    const payment = await this.getPaymentById(paymentId);

    if (payment.status !== PAYMENT_STATUS.COMPLETED) {
      throw new Error('Can only refund completed payments');
    }

    payment.status = PAYMENT_STATUS.FAILED; // Use FAILED as refund status
    if (reason) {
      payment.description = `${payment.description} (Refunded: ${reason})`;
    }

    await payment.save();
    return payment;
  }
}

module.exports = new PaymentService();
