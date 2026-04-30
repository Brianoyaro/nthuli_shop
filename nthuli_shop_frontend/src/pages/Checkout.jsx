import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaShoppingCart, FaCheckCircle, FaCreditCard, FaMobileAlt, FaLock } from 'react-icons/fa';
import { useCartStore } from '../store/cartStore';
import { Button } from '../components/Button';
import { checkoutFormSchema } from '../schemas/validation';

export function Checkout() {
  const navigate = useNavigate();
  const cart = useCartStore(state => state.cart);
  const getCartTotal = useCartStore(state => state.getCartTotal);
  const clearCart = useCartStore(state => state.clearCart);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'mpesa'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    },
  });

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
              Thank you for your purchase.
            </p>
            <p className="text-gray-600 mb-8">
              Your order confirmation has been sent to your email.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                clearCart();
                navigate('/');
              }}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = (data) => {
    console.log('Order data:', data);
    setOrderPlaced(true);
  };

  const total = getCartTotal();
  const shipping = total > 50 ? 0 : 9.99;
  const tax = total * 0.1;
  const finalTotal = total + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Shipping Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      {...register('firstName')}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.firstName && (
                      <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      {...register('lastName')}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.lastName && (
                      <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    {...register('address')}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.address && (
                    <p className="text-red-600 text-sm mt-1">{errors.address.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      {...register('city')}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.city && (
                      <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      {...register('state')}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.state && (
                      <p className="text-red-600 text-sm mt-1">{errors.state.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code *
                    </label>
                    <input
                      {...register('zipCode')}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.zipCode && (
                      <p className="text-red-600 text-sm mt-1">{errors.zipCode.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>

                {/* Payment Method Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {/* Card Payment Option */}
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`relative p-5 rounded-xl border-2 transition-all duration-200 ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${paymentMethod === 'card' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                        <FaCreditCard className={`text-lg ${paymentMethod === 'card' ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">Card Payment</p>
                        <p className="text-sm text-gray-600">Visa, Mastercard, etc.</p>
                      </div>
                    </div>
                    {paymentMethod === 'card' && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>

                  {/* M-Pesa Payment Option */}
                  <button
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`relative p-5 rounded-xl border-2 transition-all duration-200 ${
                      paymentMethod === 'mpesa'
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${paymentMethod === 'mpesa' ? 'bg-green-600' : 'bg-gray-200'}`}>
                        <FaMobileAlt className={`text-lg ${paymentMethod === 'mpesa' ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">M-Pesa</p>
                        <p className="text-sm text-gray-600">Mobile money</p>
                      </div>
                    </div>
                    {paymentMethod === 'mpesa' && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Payment Method Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 border-t pt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number *
                      </label>
                      <div className="relative">
                        <input
                          {...register('cardNumber')}
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                        />
                        <FaCreditCard className="absolute left-3 top-3.5 text-gray-400" />
                      </div>
                      {errors.cardNumber && (
                        <p className="text-red-600 text-sm mt-1">{errors.cardNumber.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date *
                        </label>
                        <input
                          {...register('expiryDate')}
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.expiryDate && (
                          <p className="text-red-600 text-sm mt-1">{errors.expiryDate.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV *
                        </label>
                        <div className="relative">
                          <input
                            {...register('cvv')}
                            type="text"
                            placeholder="123"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <FaLock className="absolute right-3 top-3.5 text-gray-400" />
                        </div>
                        {errors.cvv && (
                          <p className="text-red-600 text-sm mt-1">{errors.cvv.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                      <FaLock className="text-blue-600" />
                      <p className="text-sm text-blue-700">
                        Your card information is secure and encrypted
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'mpesa' && (
                  <div className="space-y-4 border-t pt-6">
                    <div>
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
                        Enter your M-Pesa registered phone number (without 254)
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
                        <li>Click "Complete Payment"</li>
                        <li>You'll receive a prompt on your phone</li>
                        <li>Enter your M-Pesa PIN to confirm</li>
                        <li>Payment will be processed immediately</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/cart')}
                  className="flex-1"
                  type="button"
                >
                  Back to Cart
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  type="submit"
                >
                  {paymentMethod === 'mpesa' ? 'Complete M-Pesa Payment' : 'Complete Card Payment'}
                </Button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 pb-6 border-b border-gray-200 max-h-64 overflow-y-auto scrollbar-hide">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">
                      KSH {(item.price * item.quantity).toFixed(2)}
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
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
                <p className="text-sm text-blue-100 mb-1">Total Amount to Pay</p>
                <p className="text-3xl font-bold">KSH {finalTotal.toFixed(2)}</p>
              </div>

              {/* Payment Method Badge */}
              <div className={`rounded-lg p-3 flex items-center gap-2 ${
                paymentMethod === 'card' 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                {paymentMethod === 'card' ? (
                  <>
                    <FaCreditCard className="text-blue-600" />
                    <span className={`text-sm font-medium ${paymentMethod === 'card' ? 'text-blue-900' : 'text-green-900'}`}>
                      Card Payment Selected
                    </span>
                  </>
                ) : (
                  <>
                    <FaMobileAlt className="text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      M-Pesa Payment Selected
                    </span>
                  </>
                )}
              </div>

              {/* Security Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                <div className="flex items-center gap-2">
                  <FaLock className="text-green-600 text-sm" />
                  <span className="text-xs text-gray-700 font-medium">Secure Payment</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Your payment information is encrypted and processed securely. We never store your full card details.
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
