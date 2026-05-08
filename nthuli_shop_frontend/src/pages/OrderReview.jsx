import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBox, FaTruck, FaPercent, FaCheckCircle, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../hooks/useCart';

export function OrderReview() {
  const navigate = useNavigate();
  const { cart, getCartTotal } = useCart();

  // Empty cart redirect
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="mb-6 inline-block p-4 bg-blue-50 rounded-full">
              <FaShoppingCart className="w-16 h-16 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Add items to your cart before proceeding to checkout.
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

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => navigate('/cart')}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back to Cart
            </button>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Review Your Order</h1>
          <p className="text-gray-600 mt-2">Verify your items and proceed to checkout</p>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaBox className="w-6 h-6 text-blue-600" />
            Order Items ({cart.length})
          </h2>

          <div className="space-y-4">
            {cart.map((item, index) => (
              <div
                key={item.id}
                className={`flex gap-4 p-4 rounded-xl border-2 transition-all hover:border-blue-300 hover:shadow-md ${
                  index === cart.length - 1 ? 'border-gray-200' : 'border-gray-200'
                }`}
              >
                {/* Product Image */}
                <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  <img
                    src={item.image || 'https://via.placeholder.com/96'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-lg line-clamp-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {item.category && <span>{item.category}</span>}
                  </p>

                  {/* Price Info */}
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-gray-500 text-sm">
                      KES {item.price.toFixed(2)} × {item.quantity}
                    </span>
                    <span className="text-blue-600 font-bold">
                      = KES {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Quantity Badge */}
                <div className="text-right flex flex-col items-end justify-between">
                  <div className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">
                    Qty: {item.quantity}
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    KES {(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

          <div className="space-y-4 pb-6 border-b-2 border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2">
                <FaBox className="w-4 h-4 text-gray-400" />
                Subtotal
              </span>
              <span className="font-bold text-gray-900">KES {getCartTotal().toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2">
                <FaTruck className="w-4 h-4 text-gray-400" />
                Shipping
              </span>
              <span className="font-bold text-green-600">FREE</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2">
                <FaPercent className="w-4 h-4 text-gray-400" />
                Tax
              </span>
              <span className="font-bold text-gray-900">KES 0.00</span>
            </div>
          </div>

          {/* Total */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold text-gray-900">Order Total</span>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600">
                  KES {getCartTotal().toFixed(2)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold text-green-900 mb-1">Order details verified</p>
              <p className="text-sm text-green-700">
                All items are in stock and ready to ship. Proceed to checkout when ready.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleProceedToCheckout}
            className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:scale-105 transition-all active:scale-95"
          >
            Proceed to Checkout
          </button>

          <button
            onClick={handleContinueShopping}
            className="w-full px-8 py-3 bg-white text-blue-600 font-bold border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
