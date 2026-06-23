import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSpinner, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { paymentsAPI } from '../services/paymentsAPI';
import { cartAPI } from '../services/cartAPI';
import { useToast } from '../context/ToastContext';
import { useCart } from '../hooks/useCart';

export function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  const { clearCart } = useCart();

  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'failed' | 'no-ref'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reference =
      params.get('reference') ||
      params.get('trxref') ||
      sessionStorage.getItem('pendingPaymentReference');

    if (!reference) {
      setStatus('no-ref');
      setMessage('No payment reference found.');
      return;
    }

    (async () => {
      try {
        setStatus('verifying');
        const result = await paymentsAPI.verifyPaystackTransaction(reference);
        console.log('Payment verification result:', result);

        // Adjust checks here to match your backend's verify response shape
        const ok = result?.success
          // (result && (result.status.toLowerCase() === 'success' || result.paymentStatus?.toLowerCase() === 'completed')) ||
          // result?.success === true;

        if (ok) {
          console.log('Payment verified successfully:', result);
          setStatus('success');
          // Clear client + server cart / checkout state
          try { await cartAPI.clearCart(); } catch (_) {}
          try { clearCart(); } catch (_) {}

          sessionStorage.removeItem('pendingOrderId');
          sessionStorage.removeItem('checkoutData');
          sessionStorage.removeItem('pendingPaymentReference');

          setStatus('success');
          setMessage('Payment confirmed. Thank you for your order.');
          showSuccess('Payment successful. Order confirmed.');
        } else {
          setStatus('failed');
          setMessage('Payment verification failed. Please contact support or try again.');
          showError('Payment verification failed.');
        }
      } catch (err) {
        setStatus('failed');
        setMessage(err?.message || 'Verification error');
        showError(err?.message || 'Payment verification failed.');
      }
    })();
  }, [location.search, showSuccess, showError]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-16 h-16 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-lg">Verifying payment, please wait...</p>
        </div>
      </div>
    );
  }

  if (status === 'no-ref') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaTimes className="w-16 h-16 mx-auto text-red-600" />
          <p className="mt-4 text-lg">{message}</p>
          <button onClick={() => navigate('/orders')} className="mt-6 px-6 py-3 bg-blue-600 text-white rounded">
            View Orders
          </button>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <FaCheckCircle className="w-20 h-20 mx-auto text-green-600" />
          <h2 className="text-2xl font-bold mt-4">Payment Successful</h2>
          <p className="mt-2 text-gray-600">{message}</p>
          <div className="mt-6 grid gap-3">
            <button onClick={() => navigate('/orders')} className="px-6 py-3 bg-blue-600 text-white rounded">
              View Orders
            </button>
            <button onClick={() => navigate('/')} className="px-6 py-3 border rounded">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // failed
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <FaTimes className="w-20 h-20 mx-auto text-red-600" />
        <h2 className="text-2xl font-bold mt-4">Payment Verification Failed</h2>
        <p className="mt-2 text-gray-600">{message}</p>
        <div className="mt-6 grid gap-3">
          <button onClick={() => navigate('/checkout')} className="px-6 py-3 bg-blue-600 text-white rounded">
            Retry Payment
          </button>
          <button onClick={() => navigate('/contact')} className="px-6 py-3 border rounded">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;