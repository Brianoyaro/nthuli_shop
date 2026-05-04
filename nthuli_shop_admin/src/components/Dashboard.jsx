import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderAPI, paymentAPI, productAPI, categoryAPI } from '../services/apiService';

export default function Dashboard() {
  const navigate = useNavigate();

  // Fetch summary data
  const { data: ordersData = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['dashboardOrders'],
    queryFn: async () => {
      const response = await orderAPI.getAdminOrders(null, null, null, 50, 0);
      return Array.isArray(response.data) ? response.data : response.data.orders || [];
    },
    staleTime: 30000,
  });

  const { data: paymentsData = [] } = useQuery({
    queryKey: ['dashboardPayments'],
    queryFn: async () => {
      const response = await paymentAPI.getCompletedPayments();
      return Array.isArray(response.data) ? response.data : response.data.payments || [];
    },
    staleTime: 30000,
  });

  const { data: productsData = [] } = useQuery({
    queryKey: ['dashboardProducts'],
    queryFn: async () => {
      const response = await productAPI.getAllProducts();
      return Array.isArray(response.data) ? response.data : response.data.products || [];
    },
    staleTime: 30000,
  });

  const { data: categoriesData = [] } = useQuery({
    queryKey: ['dashboardCategories'],
    queryFn: async () => {
      const response = await categoryAPI.getAllCategories();
      return Array.isArray(response.data) ? response.data : response.data.categories || [];
    },
    staleTime: 30000,
  });

  // Calculate metrics
  const metrics = {
    totalOrders: ordersData.length,
    totalRevenue: ordersData.reduce((sum, o) => sum + ((o.totalAmount || 0) - (o.discountAmount || 0)), 0),
    pendingOrders: ordersData.filter((o) => o.status === 'PENDING').length,
    completedPayments: paymentsData.filter((p) => p.status === 'COMPLETED').length,
    totalProducts: productsData.length,
    totalCategories: categoriesData.length,
  };

  const recentOrders = ordersData.slice(0, 5);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `KES ${Math.round(metrics.totalRevenue).toLocaleString()}`,
      icon: '💰',
      color: 'from-blue-400 to-blue-600',
      action: () => navigate('/analytics'),
    },
    {
      title: 'Total Orders',
      value: metrics.totalOrders,
      icon: '📦',
      color: 'from-purple-400 to-purple-600',
      action: () => navigate('/orders'),
    },
    {
      title: 'Pending Orders',
      value: metrics.pendingOrders,
      icon: '⏱️',
      color: 'from-yellow-400 to-yellow-600',
      action: () => navigate('/orders'),
    },
    {
      title: 'Products',
      value: metrics.totalProducts,
      icon: '🛍️',
      color: 'from-green-400 to-green-600',
      action: () => navigate('/products'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your e-commerce summary.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              onClick={card.action}
              className={`bg-gradient-to-br ${card.color} rounded-lg shadow-lg p-6 text-white cursor-pointer hover:shadow-xl hover:scale-105 transition-all transform`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white text-opacity-80 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold mt-2">{card.value}</p>
                </div>
                <span className="text-4xl">{card.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                <button
                  onClick={() => navigate('/orders')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                >
                  View All →
                </button>
              </div>

              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                </div>
              ) : recentOrders.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                        <p className="text-xs text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          KES {Math.round((order.totalAmount || 0) - (order.discountAmount || 0)).toLocaleString()}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/product/create')}
                  className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg transition-colors font-medium text-sm"
                >
                  ➕ New Product
                </button>
                <button
                  onClick={() => navigate('/categories')}
                  className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg transition-colors font-medium text-sm"
                >
                  🏷️ Manage Categories
                </button>
                <button
                  onClick={() => navigate('/refunds')}
                  className="w-full text-left px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-900 rounded-lg transition-colors font-medium text-sm"
                >
                  💰 Process Refunds
                </button>
                <button
                  onClick={() => navigate('/analytics')}
                  className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 text-green-900 rounded-lg transition-colors font-medium text-sm"
                >
                  📈 View Analytics
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Categories</span>
                  <span className="font-bold text-gray-900">{metrics.totalCategories}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Products</span>
                  <span className="font-bold text-gray-900">{metrics.totalProducts}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Completed Payments</span>
                  <span className="font-bold text-gray-900">{metrics.completedPayments}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
