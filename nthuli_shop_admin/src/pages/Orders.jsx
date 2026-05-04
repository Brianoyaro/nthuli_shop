import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderAPI } from '../services/apiService';
import toast from 'react-hot-toast';

export const Orders = () => {
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    searchOrder: '',
  });
  const [pagination, setPagination] = useState({ limit: 10, offset: 0 });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data: ordersResponse = {}, isLoading, refetch } = useQuery({
    queryKey: ['orders', filters, pagination],
    queryFn: async () => {
      try {
        const response = await orderAPI.getAdminOrders(
          filters.status || null,
          filters.startDate || null,
          filters.endDate || null,
          pagination.limit,
          pagination.offset
        );
        return response.data;
      } catch (err) {
        toast.error('Failed to load orders');
        throw err;
      }
    },
    staleTime: 30000,
  });

  const orders = Array.isArray(ordersResponse) ? ordersResponse : ordersResponse.orders || [];

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleViewDetail = async (orderId) => {
    try {
      const response = await orderAPI.getAdminOrderDetail(orderId);
      setSelectedOrder(response.data);
      setShowDetailModal(true);
    } catch (err) {
      toast.error('Failed to load order details');
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder) return;
    try {
      await orderAPI.updateOrderStatus(selectedOrder.id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      refetch();
      setShowDetailModal(false);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    try {
      await orderAPI.cancelOrder(selectedOrder.id);
      toast.success('Order cancelled');
      refetch();
      setShowDetailModal(false);
    } catch (err) {
      toast.error('Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage customer orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPagination({ limit: 10, offset: 0 }); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPagination({ limit: 10, offset: 0 }); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPagination({ limit: 10, offset: 0 }); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => refetch()}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.User?.email || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        KES {Math.round(order.totalAmount - (order.discountAmount || 0)).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleViewDetail(order.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setPagination({ ...pagination, offset: Math.max(0, pagination.offset - pagination.limit) })}
                disabled={pagination.offset === 0}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.offset + orders.length)} of {pagination.offset + orders.length}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, offset: pagination.offset + pagination.limit })}
                disabled={orders.length < pagination.limit}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-600 hover:text-gray-900 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Order Info */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order Number</p>
                      <p className="font-semibold text-gray-900">{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className={`font-semibold px-2 py-1 rounded inline-block text-xs ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-semibold text-gray-900">KES {Math.round(selectedOrder.totalAmount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Discount</p>
                      <p className="font-semibold text-gray-900">KES {Math.round(selectedOrder.discountAmount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {selectedOrder.OrderItems && selectedOrder.OrderItems.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.OrderItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-600 p-2 bg-gray-50 rounded">
                          <span>{item.Product?.name || 'Product'} x{item.quantity}</span>
                          <span>KES {Math.round(item.subtotal).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleUpdateStatus(e.target.value);
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  >
                    <option value="">Update Status...</option>
                    <option value="PROCESSING">→ Processing</option>
                    <option value="SHIPPED">→ Shipped</option>
                    <option value="DELIVERED">→ Delivered</option>
                  </select>
                  <button
                    onClick={handleCancelOrder}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
