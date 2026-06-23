import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaPhone, FaCreditCard, FaBuilding, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { paymentsAPI } from '../../services/paymentsAPI';
import { orderAPI } from '../../services/orderAPI';
import { cartAPI } from '../../services/cartAPI';

export function PaymentMethod() {
  const navigate = useNavigate();
  const { cart, clearCart, getCartTotal } = useCart();
  const { success: showSuccess } = useToast();
  const { user } = useAuth();
  
  const [selectedMethod, setSelectedMethod] = useState('mpesa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentState, setPaymentState] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [orderTotal, setOrderTotal] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentErrorType, setPaymentErrorType] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  // Store polling references to allow cancellation
  const pollIntervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Empty cart redirect
  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Please return to your order.</p>
            <button
              onClick={() => navigate('/order-review')}
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              Back to Order Review
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    try {
      setError('');
      setIsProcessing(true);

      // Retrieve the order that was already created during checkout
      const pendingOrderIdStr = sessionStorage.getItem('pendingOrderId');
      if (!pendingOrderIdStr) {
        throw new Error('No pending order found. Please go back and complete checkout again.');
      }

      const newOrderId = parseInt(pendingOrderIdStr, 10);

      // Fetch the actual order total from the stored order
      const orderResponse = await orderAPI.getOrder(newOrderId);
      const orderAmount = orderResponse?.totalAmount || getCartTotal();

      setOrderId(newOrderId);
      setOrderTotal(orderAmount);

      console.log('✅ Using existing order:', { newOrderId, orderAmount });

      // Step 2: Handle payment based on method
      if (selectedMethod === 'mpesa') {
        if (!phoneNumber) {
          throw new Error('Please enter your M-Pesa phone number');
        }

        setPaymentState('waiting');
        console.log('📱 Initiating M-Pesa payment...');

        const paymentResponse = await paymentsAPI.initiateM2uPayment(
          phoneNumber,
          Math.round(orderAmount * 100) / 100,
          newOrderId,
          `Order #${newOrderId} from Nthuli Shop`
        );

        if (!paymentResponse || (!paymentResponse.checkoutRequestId && !paymentResponse.paymentId)) {
          throw new Error('Payment initiation failed');
        }

        const payId = paymentResponse.checkoutRequestId || paymentResponse.paymentId;
        setPaymentId(payId);
        setPaymentState('checking');
        showSuccess('M-Pesa prompt sent. Check your phone and enter your PIN.');

        // Poll for payment status
        pollIntervalRef.current = setInterval(async () => {
          try {
            const status = await paymentsAPI.getPaymentStatus(payId);

            if (status.paymentStatus === 'COMPLETED') {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);

              // Clear cart
              try {
                await cartAPI.clearCart();
              } catch (clearErr) {
                console.warn('⚠️ Cart clear failed:', clearErr);
              }

              // Clear checkout session data
              sessionStorage.removeItem('pendingOrderId');
              sessionStorage.removeItem('checkoutData');

              showSuccess('Payment successful! Your order is confirmed.');
              setPaymentState('completed');
              clearCart();
              setOrderPlaced(true);
            } else if (status.paymentStatus === 'CANCELLED') {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setPaymentState(null);
              setPaymentErrorType('cancelled');
              setPaymentError('You cancelled the M-Pesa payment prompt. Your order is still available for retry.');
              setIsProcessing(false);
            } else if (status.paymentStatus === 'FAILED') {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              setPaymentState(null);
              setPaymentErrorType('failed');
              setPaymentError('Payment failed. Please check your M-Pesa balance and try again.');
              setIsProcessing(false);
            }
          } catch (err) {
            console.error('Error checking payment status:', err);
          }
        }, 2000);

        timeoutRef.current = setTimeout(() => {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setPaymentState(null);
          setPaymentErrorType('timeout');
          setPaymentError('Payment timeout. Please check your M-Pesa notifications and try again.');
          setIsProcessing(false);
        }, 120000);
      } else if (selectedMethod === 'paystack') {
        // Paystack redirect flow
        const email = (orderResponse?.email) || user?.email;
        if (!email) {
          throw new Error('No customer email available for Paystack payment');
        }

        setPaymentState('redirecting');
        console.log('💳 Initiating Paystack transaction...');

        const initResponse = await paymentsAPI.initPaystackTransaction(newOrderId, email);

        // Try multiple possible shapes for the authorization URL
        const authorizationUrl = initResponse?.authorizationUrl || initResponse?.authorization_url || initResponse?.data?.authorization_url || initResponse?.data?.authorizationUrl || initResponse?.authorizationURL;
        const reference = initResponse?.reference || initResponse?.data?.reference;

        if (!authorizationUrl) {
          console.error('Paystack init response:', initResponse);
          throw new Error('Failed to obtain Paystack authorization URL from server');
        }

        // Persist reference so backend can correlate after redirect (if needed)
        if (reference) {
          sessionStorage.setItem('pendingPaymentReference', reference);
        }

        // Redirect the browser to Paystack's hosted payment page
        window.location.href = authorizationUrl;
        return; // navigation away
      } else {
        // Other payment methods not yet implemented
        throw new Error(`${selectedMethod.toUpperCase()} payment not yet available`);
      }
    } catch (err) {
      console.error('❌ Payment error:', err);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleCancelPayment = () => {
    console.log('🛑 User cancelled payment polling');
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    setPaymentState(null);
    setPaymentErrorType('user-cancelled');
    setPaymentError('Payment cancelled. You can retry whenever you are ready.');
    setIsProcessing(false);
  };

  // Success screen
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="mb-6 inline-block p-4 bg-green-100 rounded-full">
              <FaCheckCircle className="w-20 h-20 text-green-600 animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Order Confirmed!</h2>
            <p className="text-gray-600 mb-8">
              Your payment has been received and your order is confirmed.
            </p>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-8 mb-8">
              <div className="mb-4">
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="text-3xl font-bold text-green-600">#{orderId}</p>
              </div>
              <div className="h-0.5 bg-green-200 my-4"></div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900">KES {orderTotal.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-xl font-bold text-green-600">CONFIRMED</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-8">
              ✉️ A confirmation email has been sent to your email address.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment waiting/checking screen
  if (paymentState === 'waiting' || paymentState === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="mb-6 inline-block p-4 bg-green-50 rounded-full">
              <FaSpinner className="w-16 h-16 text-green-600 animate-spin" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {paymentState === 'waiting' ? 'Preparing Payment...' : 'Waiting for Confirmation'}
            </h2>
            <p className="text-gray-600 mb-8">
              {paymentState === 'waiting'
                ? 'Setting up your M-Pesa payment...'
                : 'Check your phone and enter your M-Pesa PIN'}
            </p>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-8">
              <p className="text-sm text-amber-700 font-medium">
                ⏳ This may take a few moments. Do not close this page.
              </p>
            </div>
            {paymentState === 'checking' && (
              <button
                onClick={handleCancelPayment}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-all border-2 border-red-200"
              >
                <FaTimes className="w-4 h-4" />
                Cancel Payment
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Payment error screen
  if (paymentError) {
    const isRecoverable = ['cancelled', 'user-cancelled', 'timeout'].includes(paymentErrorType);
    const iconColor = paymentErrorType === 'failed' ? 'red' : 'amber';
    const bgColor = paymentErrorType === 'failed' ? 'red' : 'amber';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className={`mb-6 inline-block p-4 bg-${bgColor}-50 rounded-full`}>
              <FaSpinner className={`w-16 h-16 text-${iconColor}-600`} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {paymentErrorType === 'cancelled' && 'Payment Cancelled by M-Pesa'}
              {paymentErrorType === 'user-cancelled' && 'Payment Cancelled'}
              {paymentErrorType === 'failed' && 'Payment Failed'}
              {paymentErrorType === 'timeout' && 'Payment Timeout'}
              {!paymentErrorType && 'Payment Failed'}
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{paymentError}</p>
            
            {isRecoverable && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-8 text-left">
                <p className="text-blue-700 text-sm font-medium">
                  💡 <strong>Tip:</strong> Your order has been saved. You can retry the payment with the same details whenever you're ready.
                </p>
              </div>
            )}
            
            <button
              onClick={() => {
                setPaymentError('');
                setPaymentErrorType(null);
                setIsProcessing(false);
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main payment method selection
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => navigate('/checkout')}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back to Shipping
            </button>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Choose Payment Method</h1>
          <p className="text-gray-600 mt-2">Select how you'd like to pay</p>
        </div>

        {/* Payment Method Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {error && (
            <div className="mb-6 flex items-start gap-4 bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
              <p className="text-red-700 font-semibold">{error}</p>
            </div>
          )}

          {/* M-Pesa Option */}
          <div
            onClick={() => setSelectedMethod('mpesa')}
            className={`mb-4 p-6 border-2 rounded-xl cursor-pointer transition-all ${
              selectedMethod === 'mpesa'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedMethod === 'mpesa' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
              }`}>
                {selectedMethod === 'mpesa' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FaPhone className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-gray-900">M-Pesa STK Push</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Receive a secure payment prompt on your registered phone number
                </p>
              </div>
            </div>

            {/* M-Pesa Phone Input */}
            {selectedMethod === 'mpesa' && (
              <div className="mt-6 ml-10">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="254XXXXXXXXX"
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white font-medium"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Format: 254XXXXXXXXX or 07XXXXXXXX
                </p>
              </div>
            )}
          </div>

          {/* Paystack Card Option (Redirect) */}
          <div
            onClick={() => setSelectedMethod('paystack')}
            className={`mb-4 p-6 border-2 rounded-xl cursor-pointer transition-all ${
              selectedMethod === 'paystack'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedMethod === 'paystack' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
              }`}>
                {selectedMethod === 'paystack' && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FaCreditCard className="w-5 h-5 text-indigo-600" />
                  <h3 className={`font-bold ${selectedMethod === 'paystack' ? 'text-gray-900' : 'text-gray-700'}`}>
                    Card (Paystack)
                  </h3>
                </div>
                <p className="text-sm text-gray-600">Pay with card securely via Paystack (redirect)</p>
              </div>
            </div>

            {selectedMethod === 'paystack' && (
              <div className="mt-6 ml-10 text-sm text-gray-700">
                <p>You'll be redirected to Paystack to complete payment.</p>
                <p className="mt-2">Email: {user?.email || 'Not available'}</p>
              </div>
            )}
          </div>

          {/* Bank Option (Disabled for now) */}
          <div className="p-6 border-2 border-gray-200 rounded-xl opacity-50 cursor-not-allowed">
            <div className="flex items-start gap-4">
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FaBuilding className="w-5 h-5 text-gray-400" />
                  <h3 className="font-bold text-gray-500">Bank Transfer</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Coming Soon</span>
                </div>
                <p className="text-sm text-gray-500">
                  Direct bank transfer to our account
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-8 pt-8 border-t-2 border-gray-200">
            <h3 className="font-bold text-gray-900 mb-3">Order Summary</h3>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Items ({cart.length}):</span>
              <span className="font-bold">KES {getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-bold text-green-600">FREE</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold border-t pt-4">
              <span>Total:</span>
              <span className="text-blue-600">KES {getCartTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing || (selectedMethod === 'mpesa' && !phoneNumber)}
            className={`w-full mt-8 py-4 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
              isProcessing || (selectedMethod === 'mpesa' && !phoneNumber)
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
                Complete Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
