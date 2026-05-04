import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderAPI } from '../services/apiService';
import toast from 'react-hot-toast';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Analytics = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [chartType, setChartType] = useState('daily'); // daily, weekly, monthly
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Fetch orders data
  const { data: ordersResponse = {}, isLoading, refetch } = useQuery({
    queryKey: ['analyticsOrders', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      try {
        const response = await orderAPI.getAdminOrders(null, dateRange.startDate, dateRange.endDate, 1000, 0);
        return response.data;
      } catch (err) {
        toast.error('Failed to load analytics data');
        throw err;
      }
    },
    staleTime: 30000,
  });

  const orders = Array.isArray(ordersResponse) ? ordersResponse : ordersResponse.orders || [];

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  // Calculate metrics
  const calculateMetrics = () => {
    const metrics = {
      totalRevenue: 0,
      ordersByStatus: {},
      dailyRevenue: {},
    };

    orders.forEach((order) => {
      // Total revenue
      const revenue = (order.totalAmount || 0) - (order.discountAmount || 0);
      metrics.totalRevenue += revenue;

      // Orders by status
      metrics.ordersByStatus[order.status] = (metrics.ordersByStatus[order.status] || 0) + 1;

      // Daily revenue
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      metrics.dailyRevenue[date] = (metrics.dailyRevenue[date] || 0) + revenue;
    });

    return metrics;
  };

  const metrics = calculateMetrics();

  // Format revenue data for chart
  const revenueChartData = Object.entries(metrics.dailyRevenue)
    .map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.round(revenue),
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Format status data for pie chart
  const statusChartData = Object.entries(metrics.ordersByStatus).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const statusColors = {
    PENDING: '#FCD34D',
    PROCESSING: '#60A5FA',
    SHIPPED: '#A78BFA',
    DELIVERED: '#34D399',
    CANCELLED: '#F87171',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-600 mt-1">Track your e-commerce performance</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => refetch()}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">KES {Math.round(metrics.totalRevenue).toLocaleString()}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-yellow-500">
                <p className="text-gray-600 text-sm font-medium">Pending Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.ordersByStatus.PENDING || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-400">
                <p className="text-gray-600 text-sm font-medium">Processing</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.ordersByStatus.PROCESSING || 0}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
                <p className="text-gray-600 text-sm font-medium">Delivered</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.ordersByStatus.DELIVERED || 0}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
                {revenueChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => `KES ${value.toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#2563EB" name="Revenue (KES)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">No data available</p>
                )}
              </div>

              {/* Order Status Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Distribution</h2>
                {statusChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">No data available</p>
                )}
              </div>
            </div>

            {/* Status Summary */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status Summary</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {Object.entries(metrics.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="text-center p-4 border border-gray-200 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600 mt-1">{status}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
