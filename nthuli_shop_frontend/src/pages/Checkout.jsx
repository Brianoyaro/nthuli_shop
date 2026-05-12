import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaArrowLeft, FaSpinner, FaMapMarkerAlt, FaFileAlt, FaCheckCircle, FaShoppingCart, FaExclamationTriangle } from 'react-icons/fa';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { orderAPI } from '../services/orderAPI';

// Validation schema - only shipping address and notes
const checkoutSchema = z.object({
  shippingAddress: z.string().min(5, 'Address must be at least 5 characters'),
  notes: z.string().optional().default(''),
});

export function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart } = useCart();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

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

  // Redirect to order review if empty cart
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="mb-6 inline-block p-4 bg-blue-50 rounded-full">
              <FaShoppingCart className="w-16 h-16 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Please add items to your cart before checkout.
            </p>
            <button
              onClick={() => navigate('/products')}
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all active:scale-95"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (data) => {
    try {
      setError('');
      setIsProcessing(true);

      // Check if there's already a pending order for this exact checkout
      // (user came back via browser back button without changing cart)
      const existingOrderId = sessionStorage.getItem('pendingOrderId');
      const existingCheckout = sessionStorage.getItem('checkoutData');

      let orderId;

      if (existingOrderId && existingCheckout) {
        const prev = JSON.parse(existingCheckout);
        // Reuse the pending order only if shipping address hasn't changed
        if (prev.shippingAddress === data.shippingAddress) {
          console.log('♻️ Reusing existing pending order:', existingOrderId);
          orderId = existingOrderId;
        }
      }

      if (!orderId) {
        // Create a fresh order from the cart
        console.log('📤 Creating order from cart...');
        const orderResponse = await orderAPI.createOrderFromCart({
          shippingAddress: data.shippingAddress,
          notes: data.notes,
          description: 'Order from Nthuli Shop',
        });

        if (!orderResponse?.id) {
          throw new Error('Order creation failed. Please try again.');
        }

        orderId = orderResponse.id;
        console.log('✅ Order created:', orderId);
      }

      // Store checkout data and the order ID for the payment page
      sessionStorage.setItem('checkoutData', JSON.stringify({
        shippingAddress: data.shippingAddress,
        notes: data.notes,
      }));
      sessionStorage.setItem('pendingOrderId', String(orderId));

      navigate('/checkout/payment');
    } catch (err) {
      console.error('❌ Checkout error:', err);
      setError(err.message || 'An error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => navigate('/order-review')}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back to Order Review
            </button>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Shipping & Details</h1>
          <p className="text-gray-600 mt-2">Enter your shipping information</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {error && (
            <div className="mb-6 flex items-start gap-4 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
              <FaExclamationTriangle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900">Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* User Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  <FaCheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Logged in as</p>
                  <p className="font-semibold text-gray-900">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <label htmlFor="shippingAddress" className="flex items-center gap-2 block text-sm font-bold text-gray-900 mb-3">
                <FaMapMarkerAlt className="w-4 h-4 text-blue-600" />
                Shipping Address <span className="text-red-600">*</span>
              </label>
              <textarea
                {...register('shippingAddress')}
                rows="4"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                  errors.shippingAddress 
                    ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                placeholder="Enter your full shipping address (street, city, postal code, etc.)"
              />
              {errors.shippingAddress && (
                <p className="mt-2 text-sm text-red-600 font-medium">{errors.shippingAddress.message}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                This is where your order will be delivered.
              </p>
            </div>

            {/* Order Notes */}
            <div>
              <label htmlFor="notes" className="flex items-center gap-2 block text-sm font-bold text-gray-900 mb-3">
                <FaFileAlt className="w-4 h-4 text-gray-600" />
                Order Notes (Optional)
              </label>
              <textarea
                {...register('notes')}
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Any special instructions or delivery notes... (e.g., 'Leave at door', 'Call upon arrival')"
              />
              <p className="mt-2 text-xs text-gray-500">
                Let us know if there's anything special about your delivery.
              </p>
            </div>

            {/* Divider */}
            <div className="h-0.5 bg-gray-200"></div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg hover:scale-105 active:scale-95'
              }`}
            >
              {isProcessing ? (
                <>
                  <FaSpinner className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Continue to Payment
                </>
              )}
            </button>
          </form>
        </div>

        {/* Progress/Info Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">Checkout Steps</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
              <span className="text-sm text-gray-700">Order Review</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span className="text-sm text-gray-900 font-semibold">Shipping Details (you're here)</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold">3</span>
              <span className="text-sm text-gray-600">Payment Method</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold">4</span>
              <span className="text-sm text-gray-600">Complete Payment</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
