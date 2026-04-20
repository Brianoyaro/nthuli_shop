import { useNavigate } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import { useCartStore } from '../store/cartStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export function Cart() {
  const navigate = useNavigate();
  const cart = useCartStore(state => state.cart);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const clearCart = useCartStore(state => state.clearCart);
  const getCartTotal = useCartStore(state => state.getCartTotal);
  
  const total = getCartTotal();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaShoppingCart className="w-20 h-20 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any products yet.
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-6 flex gap-6"
              >
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0">
                  <img
                    src={`http://localhost:8080${item.image}`}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900">
                      KSH {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 capitalize">
                    {item.category} • KSH {item.price.toFixed(2)} each
                  </p>

                  {/* Quantity and Remove */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, Math.max(1, item.quantity - 1))
                        }
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.id,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-12 text-center border-l border-r border-gray-300 py-1 focus:outline-none"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Summary Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-semibold">KSH {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Shipping</span>
                  <span className="font-semibold">
                    {total > 50 ? 'FREE' : 'KSH 9.99'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Tax</span>
                  <span className="font-semibold">
                    KSH {(total * 0.1).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-blue-600">
                  KSH {(total + (total > 50 ? 0 : 9.99) + total * 0.1).toFixed(2)}
                </span>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code"
                    className="flex-1"
                  />
                  <Button variant="secondary" size="md">
                    Apply
                  </Button>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full mb-4"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="secondary"
                size="lg"
                className="w-full mb-4"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </Button>

              <button
                onClick={clearCart}
                className="w-full text-red-600 hover:text-red-800 font-medium py-2"
              >
                Clear Cart
              </button>

              {/* Shipping Info */}
              {total <= 50 && (
                <div className="mt-6 bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                  Add ${(50 - total).toFixed(2)} more for free shipping!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
