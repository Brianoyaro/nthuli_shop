import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaShoppingCart, FaCheckCircle, FaMobileAlt, FaLock, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { z } from 'zod';
import { useCartStore } from '../store/cartStore';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Button } from '../components/Button';
import { paymentsAPI } from '../services/paymentsAPI';

// Simple validation schema for M-Pesa checkout
const mpesaCheckoutSchema = z.object({
  phone: z.string().regex(/^\d{10,}$/, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
});

function CheckoutContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cart = useCartStore(state => state.cart);
  const getCartTotal = useCartStore(state => state.getCartTotal);
  const clearCart = useCartStore(state => state.clearCart);
  const { error: showError, success: showSuccess } = useToast();
  
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentState, setPaymentState] = useState(null); // 'waiting' | 'checking' | null
  const [paymentId, setPaymentId] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(mpesaCheckoutSchema),
    defaultValues: {
      phone: '',
      address: '',
      city: '',
    },
  });

  // Poll for M-Pesa payment status
  useEffect(() => {
    if (paymentState === 'checking' && paymentId) {
      const pollInterval = setInterval(async () => {
        try {
          const status = await paymentsAPI.getPaymentStatus(paymentId);
          
          if (status.status === 'COMPLETED') {
            clearInterval(pollInterval);
            showSuccess('Payment received! Your order is being processed.');
            setPaymentState(null);
            clearCart();
            setOrderPlaced(true);
          } else if (status.status === 'FAILED' || status.status === 'CANCELLED') {
            clearInterval(pollInterval);
            setPaymentState(null);
            setPaymentError(`Payment ${status.status.toLowerCase()}. Please try again.`);
            setIsProcessing(false);
          }
        } catch (err) {
          console.error('Error checking payment status:', err);
        }
      }, 2000); // Poll every 2 seconds

      // Clean up after 2 minutes
      const timeout = setTimeout(() => {
        clearInterval(pollInterval);
        setPaymentState(null);
        setPaymentError('Payment confirmation timeout. Please check your M-Pesa notifications.');
        setIsProcessing(false);
      }, 120000);

      return () => {
        clearInterval(pollInterval);
        clearTimeout(timeout);
      };
    }
  }, [paymentState, paymentId, showSuccess, clearCart]);

  const onSubmit = async (data) => {
    try {
      setPaymentError('');
      setIsProcessing(true);

      const total = getCartTotal();
      const shipping = total > 50 ? 0 : 9.99;
      const tax = total * 0.1;
      const finalTotal = total + shipping + tax;

      // Format phone number: remove non-digits and ensure it starts with 254
      let phoneNumber = data.phone.replace(/\D/g, '');
      if (!phoneNumber.startsWith('254')) {
        phoneNumber = '254' + phoneNumber;
      }

      // Validate phone number format
      if (!/^254\d{9}$/.test(phoneNumber)) {
        setPaymentError('Invalid phone number. Please use format: 254XXXXXXXXX (11 digits)');
        setIsProcessing(false);
        return;
      }

      try {
        // Initiate M-Pesa payment
        const result = await paymentsAPI.initiateM2uPayment(
          phoneNumber,
          Math.round(finalTotal),
          `Order from Nthuli Shop - ${data.city}`
        );

        if (result.responseCode === '0') {
          setPaymentId(result.paymentId);
          setPaymentState('waiting');
          showSuccess('M-Pesa prompt sent to your phone. Please enter your PIN to complete payment.');
          
          // After 3 seconds, start polling for status
          setTimeout(() => {
            setPaymentState('checking');
          }, 3000);
        } else {
          setPaymentError(
            result.customerMessage || 
            result.responseDescription || 
            'Failed to initiate M-Pesa payment. Please try again.'
          );
          setIsProcessing(false);
        }
      } catch (err) {
        setPaymentError(err.response?.data?.message || err.message || 'Failed to process M-Pesa payment');
        setIsProcessing(false);
      }
    } catch (err) {
      setPaymentError(err.message || 'An error occurred during payment processing');
      setIsProcessing(false);
    }
  };

  const total = getCartTotal();
  const shipping = total > 50 ? 0 : 9.99;
  const tax = total * 0.1;
  const finalTotal = total + shipping + tax;

  // Empty cart screen
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaShoppingCart className="w-20 h-20 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Add items to your cart before proceeding to checkout.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Order placed successfully screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="mb-6">
              <FaCheckCircle className="w-20 h-20 mx-auto text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-2">
              Thank you for your purchase, {user?.firstName}!
            </p>
            <p className="text-gray-600 mb-8">
              Your order confirmation has been sent to {user?.email}.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // M-Pesa payment waiting screen
  if (paymentState === 'waiting') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="mb-6">
              <FaSpinner className="w-20 h-20 mx-auto text-green-600 animate-spin" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Waiting for M-Pesa Confirmation</h2>
            <p className="text-gray-600 mb-2">
              A payment prompt has been sent to your M-Pesa phone.
            </p>
            <p className="text-gray-600 mb-8">
              Please enter your PIN on your phone to complete the payment.
            </p>
            
            {/* Payment amount */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <p className="text-sm text-green-700 mb-2">Amount to Pay</p>
              <p className="text-4xl font-bold text-green-900">KSH {finalTotal.toFixed(2)}</p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
              <p className="font-semibold text-blue-900 mb-3">Next steps:</p>
              <ol className="text-sm text-blue-800 list-decimal list-inside space-y-2">
                <li>Check your M-Pesa notification</li>
                <li>Enter your 4-digit PIN to approve payment</li>
                <li>Payment confirmation will appear on this screen</li>
              </ol>
            </div>

            <p className="text-xs text-gray-500">
              This may take up to 2 minutes. Do not refresh the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Payment error screen
  if (paymentError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="mb-6">
              <FaExclamationTriangle className="w-20 h-20 mx-auto text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Error</h2>
            <p className="text-red-600 font-semibold mb-2">
              {paymentError}
            </p>
            <p className="text-gray-600 mb-8">
              Please try again or use a different payment method.
            </p>
            
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                setPaymentError('');
                setIsProcessing(false);
                setPaymentState(null);
              }}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Delivery Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Address</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    {...register('address')}
                    type="text"
                    placeholder="Street address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {errors.address && (
                    <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    {...register('city')}
                    type="text"
                    placeholder="Nairobi"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {errors.city && (
                    <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
                  )}
                </div>
              </div>

              {/* M-Pesa Payment Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaMobileAlt className="text-green-600" />
                  M-Pesa Payment
                </h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    M-Pesa Phone Number *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-600 font-medium">🇰🇪 +254</span>
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder="712 345 678"
                      className="w-full px-4 py-3 pl-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Enter your M-Pesa registered phone number (without country code)
                  </p>
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {/* M-Pesa Instructions */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-green-900">How to complete payment:</p>
                  <ol className="text-sm text-green-800 list-decimal list-inside space-y-1">
                    <li>Enter your M-Pesa phone number above</li>
                    <li>Click "Complete M-Pesa Payment"</li>
                    <li>You'll receive a prompt on your phone</li>
                    <li>Enter your M-Pesa PIN to confirm</li>
                    <li>Payment will be processed immediately</li>
                  </ol>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 mt-6">
                  <FaLock className="text-blue-600" />
                  <p className="text-sm text-blue-700">
                    Your payment information is secure and encrypted
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/cart')}
                  className="flex-1"
                  type="button"
                  disabled={isProcessing}
                >
                  Back to Cart
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  type="submit"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2 justify-center">
                      <FaSpinner className="animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    'Complete M-Pesa Payment'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>

              {/* User Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <p className="text-xs text-green-700 font-medium">Delivery to:</p>
                <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>

              {/* Cart Items */}
              <div className="space-y-4 pb-6 border-b border-gray-200 max-h-64 overflow-y-auto scrollbar-hide">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">
                      KSH {(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-3 pb-6 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">KSH {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {shipping === 0 ? 'FREE' : `KSH ${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-semibold text-gray-900">KSH {tax.toFixed(2)}</span>
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-4 text-white">
                <p className="text-sm text-green-100 mb-1">Total Amount to Pay</p>
                <p className="text-3xl font-bold">KSH {finalTotal.toFixed(2)}</p>
              </div>

              {/* M-Pesa Badge */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <FaMobileAlt className="text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  M-Pesa Payment
                </span>
              </div>

              {/* Security Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                <div className="flex items-center gap-2">
                  <FaLock className="text-green-600 text-sm" />
                  <span className="text-xs text-gray-700 font-medium">Secure Payment</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Your payment is processed securely through M-Pesa.
                </p>
                <div className="text-xs text-gray-500 flex items-center gap-1 pt-2 border-t border-gray-200">
                  <span>🔒</span> SSL Secured Connection
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Checkout() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
