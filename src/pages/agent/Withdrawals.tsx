import React, { useEffect, useState } from 'react';
import { DollarSign, CreditCard, Wallet, Clock, CheckCircle, AlertTriangle } from '@/lib/hugeicons-compat';
import { useAgentWithdrawals } from '@/hooks/useAgentAnalytics';

export const Withdrawals: React.FC = () => {
  const { withdrawals, stats, loading, fetchWithdrawals, fetchStats, requestWithdrawal } =
    useAgentWithdrawals('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: 0,
    paymentMethod: 'BANK_TRANSFER',
    bankAccountName: '',
    bankCode: '',
    walletAddress: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchWithdrawals((page - 1) * 10, 10);
  }, [page, fetchStats, fetchWithdrawals]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    try {
      setSubmitting(true);
      await requestWithdrawal(
        formData.amount,
        formData.paymentMethod,
        {
          bankAccountName: formData.bankAccountName,
          bankCode: formData.bankCode,
          walletAddress: formData.walletAddress,
        }
      );
      alert('Withdrawal request submitted successfully');
      setShowForm(false);
      setFormData({
        amount: 0,
        paymentMethod: 'BANK_TRANSFER',
        bankAccountName: '',
        bankCode: '',
        walletAddress: '',
      });
      fetchWithdrawals();
      fetchStats();
    } catch (error) {
      console.error('Withdrawal error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'APPROVED':
        return 'text-blue-400 bg-blue-900/20';
      case 'PAID':
        return 'text-green-400 bg-green-900/20';
      case 'REJECTED':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Withdrawal Management</h1>
        <p className="text-gray-300">Manage your commission withdrawals</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Pending</span>
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.pending}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Withdrawn</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              ${stats.totalWithdrawn.toFixed(2)}
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Requests</span>
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalWithdrawals}</div>
          </div>
        </div>
      )}

      {/* New Withdrawal Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2 transition"
        >
          <DollarSign className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Request Withdrawal'}
        </button>
      </div>

      {/* New Withdrawal Form */}
      {showForm && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">New Withdrawal Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="100"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  placeholder="Minimum $100"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white placeholder-gray-400 focus:border-green-500 outline-none"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Minimum withdrawal: $100</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white focus:border-green-500 outline-none"
                >
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="CRYPTOCURRENCY">Cryptocurrency</option>
                </select>
              </div>
            </div>

            {/* Bank Transfer Fields */}
            {formData.paymentMethod === 'BANK_TRANSFER' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Account Holder Name"
                  value={formData.bankAccountName}
                  onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white placeholder-gray-400 focus:border-green-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Bank Code (SWIFT/IFSC)"
                  value={formData.bankCode}
                  onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white placeholder-gray-400 focus:border-green-500 outline-none"
                />
              </div>
            )}

            {/* Crypto Fields */}
            {formData.paymentMethod === 'CRYPTOCURRENCY' && (
              <input
                type="text"
                placeholder="Crypto Wallet Address"
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white placeholder-gray-400 focus:border-green-500 outline-none"
              />
            )}

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={submitting || formData.amount <= 0}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition"
              >
                {submitting ? 'Submitting...' : 'Submit Withdrawal Request'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Withdrawals Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Withdrawal History</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading withdrawals...</div>
        ) : withdrawals.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No withdrawals found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {withdrawals.map((withdrawal: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition">
                    <td className="px-6 py-4">
                      <span className="text-white font-semibold">
                        ${withdrawal.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 flex items-center gap-2">
                      {withdrawal.paymentMethod === 'BANK_TRANSFER' && (
                        <Bank className="w-4 h-4" />
                      )}
                      {withdrawal.paymentMethod === 'CRYPTOCURRENCY' && (
                        <Wallet className="w-4 h-4" />
                      )}
                      {withdrawal.paymentMethod}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(withdrawal.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {withdrawal.paidAt ? new Date(withdrawal.paidAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-700 flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-gray-700 text-white text-sm rounded transition"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-gray-300">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Withdrawals;
