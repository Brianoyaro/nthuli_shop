import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentAPI } from '../services/apiService';
import toast from 'react-hot-toast';

export const Refunds = () => {
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundStep, setRefundStep] = useState(1); // 1: reason, 2: notes, 3: confirm
  const [refundData, setRefundData] = useState({
    reason: '',
    notes: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: paymentsResponse = [], isLoading, refetch } = useQuery({
    queryKey: ['refunds'],
    queryFn: async () => {
      try {
        const response = await paymentAPI.getCompletedPayments();
        // Filter for completed payments only
        const payments = Array.isArray(response.data) ? response.data : response.data.payments || [];
        return payments.filter((p) => p.status === 'COMPLETED');
      } catch (err) {
        toast.error('Failed to load payments');
        throw err;
      }
    },
    staleTime: 30000,
  });

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleOpenRefundModal = (payment) => {
    setSelectedPayment(payment);
    setRefundStep(1);
    setRefundData({ reason: '', notes: '' });
    setShowRefundModal(true);
  };

  const handleNextStep = () => {
    if (refundStep === 1 && !refundData.reason) {
      toast.error('Please select a reason');
      return;
    }
    if (refundStep < 3) {
      setRefundStep(refundStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (refundStep > 1) {
      setRefundStep(refundStep - 1);
    }
  };

  const handleSubmitRefund = async () => {
    if (!selectedPayment) return;

    setIsProcessing(true);
    try {
      const refundReason = `${refundData.reason}${refundData.notes ? ` - ${refundData.notes}` : ''}`;
      await paymentAPI.refundPayment(selectedPayment.id, refundReason);
      toast.success('Refund processed successfully');
      refetch();
      setShowRefundModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setIsProcessing(false);
    }
  };

  const refundReasons = [
    'Customer Request',
    'Damaged Item',
    'Wrong Item Shipped',
    'Changed Mind',
    'Order Duplicate',
    'Other',
  ];

  const getPaymentMethodBadge = (method) => {
    const badges = {
      MPESA: 'bg-green-100 text-green-800',
      STRIPE: 'bg-blue-100 text-blue-800',
      PAYPAL: 'bg-yellow-100 text-yellow-800',
    };
    return badges[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Refunds & Returns</h1>
          <p className="text-gray-600 mt-1">Process customer refunds for completed payments</p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">ℹ️ Info:</span> Below are all completed M-Pesa payments eligible for refund. Select a payment to process a refund.
          </p>
        </div>

        {/* Refresh Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Payments Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : paymentsResponse.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No completed payments available for refund</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Method</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Txn ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paymentsResponse.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{payment.id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                        KES {Math.round(payment.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentMethodBadge(payment.method)}`}>
                          {payment.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payment.transactionId || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleOpenRefundModal(payment)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Request Refund
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Refund Modal */}
        {showRefundModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Process Refund</h2>
                  <button
                    onClick={() => setShowRefundModal(false)}
                    className="text-gray-600 hover:text-gray-900 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Step Indicator */}
                <div className="flex justify-between items-center mb-6">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        step === refundStep
                          ? 'bg-blue-600 text-white'
                          : step < refundStep
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {step < refundStep ? '✓' : step}
                      </div>
                      {step < 3 && <div className="w-12 h-1 bg-gray-300 mx-1"></div>}
                    </div>
                  ))}
                </div>

                {/* Step 1: Reason */}
                {refundStep === 1 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Refund Reason</h3>
                    <div className="space-y-2">
                      {refundReasons.map((reason) => (
                        <label key={reason} className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                          <input
                            type="radio"
                            name="reason"
                            value={reason}
                            checked={refundData.reason === reason}
                            onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span className="ml-3 text-gray-900">{reason}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Notes */}
                {refundStep === 2 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes (Optional)</h3>
                    <p className="text-sm text-gray-600 mb-3">Add any additional information about this refund:</p>
                    <textarea
                      value={refundData.notes}
                      onChange={(e) => setRefundData({ ...refundData, notes: e.target.value })}
                      placeholder="e.g., Customer confirmed receipt of damaged item..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none"
                      rows={4}
                    />
                  </div>
                )}

                {/* Step 3: Confirm */}
                {refundStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Confirm</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Payment Amount</p>
                        <p className="text-2xl font-bold text-gray-900">KES {Math.round(selectedPayment.amount).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase font-semibold">Refund Reason</p>
                        <p className="text-gray-900">{refundData.reason}</p>
                      </div>
                      {refundData.notes && (
                        <div>
                          <p className="text-xs text-gray-600 uppercase font-semibold">Notes</p>
                          <p className="text-gray-900">{refundData.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Once processed, this refund cannot be undone. Proceed carefully.
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={handlePrevStep}
                    disabled={refundStep === 1}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Back
                  </button>
                  {refundStep < 3 ? (
                    <button
                      onClick={handleNextStep}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitRefund}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isProcessing ? 'Processing...' : 'Process Refund'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Refunds;
