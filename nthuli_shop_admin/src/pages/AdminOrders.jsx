import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderAPI } from '../services/apiService';

const STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const NEXT_STATUSES = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount ?? 0);
}

function OrderCard({ order, onStatusUpdate, isUpdating }) {
  const [expanded, setExpanded] = useState(false);
  const nextStatuses = NEXT_STATUSES[order.orderStatus] ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
            #{order.id}
          </span>
          <span className="text-sm text-gray-600 truncate hidden sm:block">{order.email}</span>
          <StatusBadge status={order.orderStatus} />
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-sm font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</span>
          <span className="text-xs text-gray-400">{order.createdAt}</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          {/* Customer + shipping */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Customer</p>
              <p className="text-sm text-gray-800">{order.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Shipping Address</p>
              <p className="text-sm text-gray-800">{order.shippingAddress || '—'}</p>
            </div>
            {order.notes && (
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-gray-600 italic">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Items table */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Order Items</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-3 py-2 text-xs text-gray-500 font-semibold">Product</th>
                    <th className="px-3 py-2 text-xs text-gray-500 font-semibold text-center">Qty</th>
                    <th className="px-3 py-2 text-xs text-gray-500 font-semibold text-right">Unit Price</th>
                    <th className="px-3 py-2 text-xs text-gray-500 font-semibold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.orderItems ?? []).map((item) => (
                    <tr key={item.id} className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-800">{item.productName}</td>
                      <td className="px-3 py-2 text-center text-gray-700">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-blue-800">
                    <td colSpan={3} className="px-3 py-2 font-bold text-gray-900">Total</td>
                    <td className="px-3 py-2 text-right font-bold text-blue-800">{formatCurrency(order.totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Status update actions */}
          {nextStatuses.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 font-medium">Update status:</span>
              {nextStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusUpdate(order.id, s)}
                  disabled={isUpdating}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50
                    ${s === 'CANCELLED'
                      ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                    }`}
                >
                  {isUpdating ? '…' : `Mark ${s}`}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const [activeTab, setActiveTab] = useState('ALL');
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading, isError, error } = useQuery({
    queryKey: ['adminOrders', activeTab],
    queryFn: () =>
      activeTab === 'ALL'
        ? orderAPI.getAllOrders()
        : orderAPI.getOrdersByStatus(activeTab),
  });

  const { mutate: updateStatus, variables: updatingVars, isPending: isUpdating } = useMutation({
    mutationFn: ({ orderId, status }) => orderAPI.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage and fulfil customer orders</p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 flex-wrap mb-6 bg-white border border-gray-200 rounded-xl p-1.5 w-fit">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveTab(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                ${activeTab === s
                  ? 'bg-blue-800 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 h-16 animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
            Failed to load orders: {error?.message ?? 'Unknown error'}
          </div>
        )}

        {!isLoading && !isError && orders.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium">No orders found{activeTab !== 'ALL' ? ` with status ${activeTab}` : ''}</p>
          </div>
        )}

        {!isLoading && !isError && orders.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusUpdate={(orderId, status) => updateStatus({ orderId, status })}
                isUpdating={isUpdating && updatingVars?.orderId === order.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
