import React, { useState, useEffect } from 'react';
import { CheckCircle, CreditCard, AlertCircle } from 'lucide-react';
import { LoadingSpinner, InlineLoadingSpinner } from '@/components/LoadingSpinner';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const API_BASE = 'http://localhost:5000/api';

interface Subscription {
  id: string;
  planName: string;
  status: string;
  startDate: Date;
  endDate: Date;
  isAutoRenew: boolean;
  daysRemaining: number;
  isExpiring: boolean;
  maxStudents: number;
  maxTeachers: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  planName: string;
  billingPeriod: string;
  totalAmount: number;
  status: string;
  paidAt: string;
  dueDate: string;
}

interface UsageData {
  students: {
    used: number;
    limit: number;
    percentage: number;
    isAtLimit: boolean;
  };
  teachers: {
    used: number;
    limit: number;
    percentage: number;
    isAtLimit: boolean;
  };
}

const BillingSubscription: React.FC = () => {
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      if (!token) return;

      setLoading(true);

      const [subRes, historyRes, usageRes] = await Promise.all([
        axios.get(`${API_BASE}/payment/subscription/active`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/payment/subscription/billing-history`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/payment/subscription/usage`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]).catch(error => {
        console.log('Some subscription data not available:', error.message);
        return [null, null, null];
      });

      if (subRes?.data?.data) {
        setCurrentSubscription(subRes.data.data);
      }

      if (historyRes?.data?.data) {
        setInvoices(historyRes.data.data);
      }

      if (usageRes?.data?.data) {
        setUsage(usageRes.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load billing information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setCancelling(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      if (!token) return;

      await axios.post(
        `${API_BASE}/payment/subscription/cancel`,
        { reason: cancelReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: 'Success',
        description: 'Subscription cancelled successfully',
      });

      setShowCancelModal(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Billing & Subscription</h2>
        <p className="text-gray-400 text-sm mt-1">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan */}
      {currentSubscription ? (
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-[30px] border border-blue-400/20 p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{currentSubscription.planName} Plan</h3>
              <p className="text-gray-400">Active subscription</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="px-4 py-2 bg-green-400/20 rounded-full text-green-400 font-semibold text-sm border border-green-400/30">
                {currentSubscription.status}
              </span>
              {currentSubscription.isExpiring && (
                <span className="px-4 py-2 bg-orange-400/20 rounded-full text-orange-400 font-semibold text-xs border border-orange-400/30">
                  Expires soon
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Started</p>
              <p className="text-lg font-semibold text-white">
                {new Date(currentSubscription.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Expires</p>
              <p className="text-lg font-semibold text-white">
                {new Date(currentSubscription.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Days Remaining</p>
              <p className={`text-lg font-semibold ${currentSubscription.daysRemaining <= 7 ? 'text-orange-400' : 'text-blue-400'}`}>
                {currentSubscription.daysRemaining} days
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Auto-renew</p>
              <p className="text-lg font-semibold text-white">{currentSubscription.isAutoRenew ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-red-400 font-medium transition-colors"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-500/10 rounded-[30px] border border-yellow-400/20 p-8">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-400">No Active Subscription</h3>
              <p className="text-yellow-300/80 text-sm mt-1">You're currently on the Free plan. Upgrade to access premium features.</p>
            </div>
          </div>
        </div>
      )}

      {/* Usage Summary */}
      {usage && (
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
          <h3 className="text-lg font-semibold text-white mb-6">Plan Usage</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Students */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400">Students</p>
                <p className="text-sm font-semibold text-white">
                  {usage.students.used} / {usage.students.limit}
                </p>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${usage.students.isAtLimit ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(usage.students.percentage, 100)}%` }}
                />
              </div>
              <p className={`text-xs mt-2 ${usage.students.isAtLimit ? 'text-red-400' : 'text-gray-400'}`}>
                {usage.students.percentage}% used
              </p>
            </div>

            {/* Teachers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400">Teachers/Staff</p>
                <p className="text-sm font-semibold text-white">
                  {usage.teachers.used} / {usage.teachers.limit}
                </p>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${usage.teachers.isAtLimit ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(usage.teachers.percentage, 100)}%` }}
                />
              </div>
              <p className={`text-xs mt-2 ${usage.teachers.isAtLimit ? 'text-red-400' : 'text-gray-400'}`}>
                {usage.teachers.percentage}% used
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Payment Method</h3>
          <button className="text-blue-400 hover:text-blue-300 font-medium text-sm">Edit</button>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/5">
          <CreditCard className="w-8 h-8 text-gray-400" />
          <div>
            <p className="text-white font-medium">Paystack Payment Gateway</p>
            <p className="text-gray-400 text-sm">Secure payment processing via Paystack</p>
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
        <div className="p-8 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Recent Invoices</h3>
        </div>
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5 bg-white/2.5">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Invoice</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Plan</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Period</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-4 px-6 text-white font-medium">{invoice.invoiceNumber}</td>
                    <td className="py-4 px-6 text-white">{invoice.planName}</td>
                    <td className="py-4 px-6 text-white">₦{invoice.totalAmount.toLocaleString()}</td>
                    <td className="py-4 px-6 text-gray-400 text-xs">
                      {invoice.billingPeriod.charAt(0).toUpperCase() + invoice.billingPeriod.slice(1)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'PAID'
                            ? 'bg-green-400/10 text-green-400 border border-green-400/20'
                            : 'bg-orange-400/10 text-orange-400 border border-orange-400/20'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">No invoices yet. Your first invoice will appear after your first payment.</div>
        )}
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-[20px] border border-gray-700 p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Cancel Subscription?</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to cancel your subscription? You'll lose access to premium features immediately.
            </p>

            <textarea
              placeholder="Tell us why you're cancelling (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm mb-4 resize-none"
              rows={3}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <InlineLoadingSpinner size="sm" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingSubscription;
