import React, { useState } from 'react';
import { CheckCircle, CreditCard, Download01 } from '@hugeicons/react';

const BillingSubscription: React.FC = () => {
  const [currentPlan] = useState({
    name: 'Professional',
    price: 50000,
    billing: 'monthly',
    startDate: '2025-01-01',
    nextBillingDate: '2025-02-01',
    status: 'Active',
  });

  const [invoices] = useState([
    { id: 1, date: 'Jan 2025', amount: '₦50,000', status: 'Paid', dueDate: '2025-01-31' },
    { id: 2, date: 'Dec 2024', amount: '₦50,000', status: 'Paid', dueDate: '2024-12-31' },
    { id: 3, date: 'Nov 2024', amount: '₦50,000', status: 'Paid', dueDate: '2024-11-30' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Billing & Subscription</h2>
        <p className="text-gray-400 text-sm mt-1">Manage your subscription and billing information</p>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-[30px] border border-blue-400/20 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{currentPlan.name} Plan</h3>
            <p className="text-gray-400">Billed {currentPlan.billing.replace('monthly', 'Monthly')}</p>
          </div>
          <span className="px-4 py-2 bg-green-400/20 rounded-full text-green-400 font-semibold text-sm border border-green-400/30">
            {currentPlan.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Monthly Cost</p>
            <p className="text-2xl font-bold text-white">₦{currentPlan.price.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Started</p>
            <p className="text-lg font-semibold text-white">{currentPlan.startDate}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Next Billing</p>
            <p className="text-lg font-semibold text-white">{currentPlan.nextBillingDate}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Days Remaining</p>
            <p className="text-lg font-semibold text-blue-400">17 days</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-400 font-medium transition-colors">
            Upgrade Plan
          </button>
          <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition-colors">
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-6">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Starter',
              price: 25000,
              features: ['Up to 100 students', 'Single class', 'Basic reports', 'Email support'],
            },
            {
              name: 'Professional',
              price: 50000,
              features: ['Up to 500 students', 'Multiple classes', 'Advanced reports', 'Priority support'],
              current: true,
            },
            {
              name: 'Enterprise',
              price: 100000,
              features: ['Unlimited students', 'All features', 'Custom reports', 'Dedicated support'],
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`rounded-[20px] border p-6 ${
                plan.current
                  ? 'bg-blue-500/10 border-blue-400/30'
                  : 'bg-[rgba(255,255,255,0.02)] border-white/10 hover:border-blue-400/30'
              }`}
            >
              <h4 className="text-lg font-semibold text-white mb-2">{plan.name}</h4>
              <p className="text-3xl font-bold text-white mb-6">₦{plan.price.toLocaleString()}</p>
              <div className="space-y-2 mb-6">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-400 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <button
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  plan.current
                    ? 'bg-green-400/20 text-green-400 border border-green-400/40 cursor-default'
                    : 'bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-400'
                }`}
              >
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Payment Method</h3>
          <button className="text-blue-400 hover:text-blue-300 font-medium text-sm">Edit</button>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/5">
          <CreditCard className="w-8 h-8 text-gray-400" />
          <div>
            <p className="text-white font-medium">Visa ending in 4242</p>
            <p className="text-gray-400 text-sm">Expires on 12/2026</p>
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
        <div className="p-8 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Recent Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 bg-white/2.5">
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Invoice Period</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Amount</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Due Date</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4 px-6 text-white font-medium">{invoice.date}</td>
                  <td className="py-4 px-6 text-white">{invoice.amount}</td>
                  <td className="py-4 px-6 text-gray-400">{invoice.dueDate}</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400 border border-green-400/20">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="text-blue-400 hover:text-blue-300">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BillingSubscription;
