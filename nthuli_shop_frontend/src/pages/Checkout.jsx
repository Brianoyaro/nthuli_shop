import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaShoppingCart, FaCheckCircle, FaMobileAlt, FaExclamationTriangle, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';
import { orderAPI } from '../services/orderAPI';
import { paymentsAPI } from '../services/paymentsAPI';
import { cartAPI } from '../services/cartAPI';
import { useToast } from '../context/ToastContext';

// Validation schema - only shipping address needed
const checkoutSchema = z.object({
  shippingAddress: z.string().min(5, 'Address must be at least 5 characters'),
  notes: z.string().optional().default(''),
});

export function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();
  const { success: showSuccess } = useToast();
  
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentState, setPaymentState] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: '',
      notes: '',
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
            
            // Clear backend cart after payment success
            try {
              await cartAPI.clearCart();
            } catch (clearErr) {
              console.warn('⚠️ Cart clear failed:', clearErr);
            }

            showSuccess('Payment successful! Your order is confirmed.');
            setPaymentState('completed');
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
      }, 2000);

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

  // Empty cart screen
  if (cart.length === 0 && !orderPlaced) {
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

  // Payment waiting screen
  if (paymentState === 'waiting') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="mb-6">
              <FaSpinner className="w-16 h-16 mx-auto text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Initiating M-Pesa Payment...</h2>
            <p className="text-gray-600 mb-4">
              Please wait while we prepare your M-Pesa payment prompt.
            </p>
            <p className="text-lg font-semibold text-gray-900 mb-8">
              Amount: KES {orderTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Payment checking screen
  if (paymentState === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="mb-6">
              <FaMobileAlt className="w-16 h-16 mx-auto text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Waiting for M-Pesa Confirmation</h2>
            <p className="text-gray-600 mb-4">
              Please check your phone and enter your M-Pesa PIN.
            </p>
            <div className="mb-8">
              <FaSpinner className="w-10 h-10 mx-auto text-blue-600 animate-spin" />
            </div>
            <p className="text-sm text-gray-500">
              This may take a few moments. Do not close this page.
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
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="mb-6">
              <FaExclamationTriangle className="w-16 h-16 mx-auto text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h2>
            <p className="text-gray-600 mb-8">
              {paymentError}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Order ID: <span className="font-semibold">#{orderId}</span>
            </p>
            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setPaymentError('');
                  setPaymentState(null);
                  setIsProcessing(false);
                }}
              >
                Try Again with M-Pesa
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="mb-6">
              <FaCheckCircle className="w-20 h-20 mx-auto text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed Successfully!</h2>
            <p className="text-gray-600 mb-2">
              Your payment has been received and your order is confirmed.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <p className="text-gray-900 mb-2">
                Order ID: <span className="font-bold text-green-600 text-lg">#{orderId}</span>
              </p>
              <p className="text-gray-700">
                Total Amount: <span className="font-semibold">KES {orderTotal.toFixed(2)}</span>
              </p>
              <p className="text-gray-700 mt-2">
                Status: <span className="font-semibold text-green-600">CONFIRMED</span>
              </p>
            </div>
            <p className="text-sm text-gray-500 mb-8">
              A confirmation email has been sent to your email address.
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

  // Checkout form screen
  const total = getCartTotal();
  const shipping = total > 50 ? 0 : 0;
  const tax = total * 0.0;
  const finalTotal = total + shipping + tax;

  const onSubmit = async (data) => {
    try {
      setError('');
      setPaymentError('');
      setIsProcessing(true);

      console.log('🛒 Starting checkout with data:', data);

      // Step 1: Create order from cart
      console.log('📤 Creating order from cart...');
      const orderResponse = await orderAPI.createOrderFromCart({
        shippingAddress: data.shippingAddress,
        notes: data.notes,
        description: `Order from Nthuli Shop`,
      });

      if (!orderResponse.id) {
        throw new Error('Order created but no ID returned');
      }

      const newOrderId = orderResponse.id;
      const orderAmount = orderResponse.totalAmount || finalTotal;

      setOrderId(newOrderId);
      setOrderTotal(orderAmount);

      console.log('✅ Order created:', { newOrderId, orderAmount });

      // Step 2: Initiate M-Pesa payment
      if (!phoneNumber) {
        throw new Error('Phone number not available for payment');
      }

      setPaymentState('waiting');
      console.log('📱 Initiating M-Pesa payment...');

      const paymentResponse = await paymentsAPI.initiateM2uPayment(
        phoneNumber,
        Math.round(orderAmount * 100) / 100,
        newOrderId,
        `Order #${newOrderId} from Nthuli Shop`
      );

      if (!paymentResponse.paymentId) {
        throw new Error('Payment initiation failed');
      }

      setPaymentId(paymentResponse.paymentId);
      setPaymentState('checking');
      showSuccess('M-Pesa prompt sent. Please check your phone and enter your PIN.');

      console.log('✅ M-Pesa payment initiated:', paymentResponse.paymentId);
    } catch (err) {
      console.error('❌ Checkout error:', err);
      const errorMessage = err.message || 'Checkout failed. Please try again.';
      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            Back to Cart
          </button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              {error && (
                <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                  <FaExclamationTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Authenticated User Info (Display Only) */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Shopping as:</span> {user?.email}
                  </p>
                </div>

                {/* Shipping Address */}
                <div>
                  <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Address *
                  </label>
                  <textarea
                    {...register('shippingAddress')}
                    rows="4"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.shippingAddress ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full shipping address..."
                  />
                  {errors.shippingAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.message}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    {...register('notes')}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special instructions or notes for your order..."
                  />
                </div>

                {/* Payment Method - M-Pesa Only */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Payment Method</h3>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">M-Pesa</span> - You will receive a prompt on your phone
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <FaSpinner className="inline w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Complete Order & Pay with M-Pesa'
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-gray-600">x {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      KES {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">KES {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">{shipping === 0 ? 'FREE' : `KES ${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span className="font-medium">KES {tax.toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total:</span>
                  <span>KES {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Phone number input for M-Pesa */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="254XXXXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the phone number registered for M-Pesa
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
