const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public callback endpoint (no auth required)
router.post('/mpesa/callback', paymentController.handleMpesaCallback.bind(paymentController));

// Protected endpoints (auth required)
router.post('/initiate-m2u',
  // authMiddleware,
  paymentController.initiateM2uPayment.bind(paymentController)
);

router.get('/:id',
  // authMiddleware,
  paymentController.getPayment.bind(paymentController)
);

router.get('/:id/status',
  // authMiddleware,
  paymentController.queryPaymentStatus.bind(paymentController)
);

router.post('/:id/cancel',
  // authMiddleware,
  paymentController.cancelPayment.bind(paymentController)
);

router.post('/:id/refund',
  // authMiddleware,
  // adminMiddleware,
  paymentController.refundPayment.bind(paymentController)
);

// Admin endpoints
router.get('/',
  // authMiddleware,
  // adminMiddleware,
  paymentController.getAllPayments.bind(paymentController)
);

router.get('/user/:userId',
  // authMiddleware,
  paymentController.getUserPayments.bind(paymentController)
);

module.exports = router;
