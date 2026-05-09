import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FaBoxOpen,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
  FaExclamationCircle,
  FaShoppingBag,
  FaTimesCircle,
  FaClock,
  FaCheckCircle,
  FaTruck,
} from 'react-icons/fa';
import { orderAPI } from '../services/orderAPI';
import { Button } from '../components/Button';
import { useToast } from '../hooks/useToast';

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: <FaClock className="w-3 h-3" />,
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800',
    icon: <FaCheckCircle className="w-3 h-3" />,
  },
  PROCESSING: {
    label: 'Processing',
    color: 'bg-indigo-100 text-indigo-800',
    icon: <FaSpinner className="w-3 h-3" />,
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-purple-100 text-purple-800',
    icon: <FaTruck className="w-3 h-3" />,
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800',
    icon: <FaCheckCircle className="w-3 h-3" />,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: <FaTimesCircle className="w-3 h-3" />,
  },
  REFUNDED: {
    label: 'Refunded',
    color: 'bg-gray-100 text-gray-800',
    icon: <FaTimesCircle className="w-3 h-3" />,
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    color: 'bg-gray-100 text-gray-800',
    icon: null,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const { addToast } = useToast();
  const [cancelling, setCancelling] = useState(false);

  const createdAt = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.orderStatus);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await orderAPI.cancelOrder(order.id);
      addToast('Order cancelled successfully', 'success');
      // The query will refetch automatically via React Query invalidation after the mutation
      // For simplicity we reload – in a full implementation you'd use useMutation + queryClient.invalidateQueries
      window.location.reload();
    } catch (err) {
      addToast(err.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Order header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FaShoppingBag className="text-blue-600 w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Order #{order.id}</p>
            <p className="text-sm text-gray-500">{createdAt}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={order.orderStatus} />
          <p className="font-bold text-gray-900">KSH {Number(order.totalAmount).toFixed(2)}</p>
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Toggle order details"
          >
            {expanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>

      {/* Expandable details */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          {/* Order items */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Items</h4>
            <div className="space-y-2">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm text-gray-700">
                  <span className="flex-1">
                    {item.productName || `Product #${item.productId}`}
                    {item.quantity > 1 && (
                      <span className="text-gray-400 ml-1">× {item.quantity}</span>
                    )}
                  </span>
                  <span className="font-medium">KSH {Number(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Shipping Address</h4>
              <p className="text-sm text-gray-600">{order.shippingAddress}</p>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Notes</h4>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}

          {/* Cancel button */}
          {canCancel && (
            <div className="pt-2">
              <Button
                variant="danger"
                size="sm"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? (
                  <span className="flex items-center gap-2">
                    <FaSpinner className="animate-spin" /> Cancelling...
                  </span>
                ) : (
                  'Cancel Order'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Orders() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');

  const { data: allOrders = [], isLoading, error } = useQuery({
    queryKey: ['userOrders'],
    queryFn: orderAPI.getUserOrders,
  });

  const filteredOrders = filter === 'ALL'
    ? allOrders
    : allOrders.filter(o => o.orderStatus === filter);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load orders</h2>
          <p className="text-gray-500 mb-6">{error.message}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const filterOptions = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaBoxOpen className="text-blue-700 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500">{allOrders.length} total order{allOrders.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {filterOptions.map(opt => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === opt
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt === 'ALL' ? 'All' : STATUS_CONFIG[opt]?.label || opt}
              {opt === 'ALL'
                ? ` (${allOrders.length})`
                : ` (${allOrders.filter(o => o.orderStatus === opt).length})`}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FaBoxOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'ALL' ? 'No orders yet' : `No ${STATUS_CONFIG[filter]?.label.toLowerCase() || filter.toLowerCase()} orders`}
            </h2>
            <p className="text-gray-500 mb-8">
              {filter === 'ALL'
                ? "You haven't placed any orders yet. Start shopping!"
                : `You don't have any orders with status "${STATUS_CONFIG[filter]?.label || filter}".`}
            </p>
            {filter === 'ALL' && (
              <Button variant="primary" size="lg" onClick={() => navigate('/products')}>
                Start Shopping
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
