import React, { useEffect, useState } from 'react';
import { Crown, Check, XClose } from '@/lib/hugeicons-compat';
import { useAgentSubscription } from '@/hooks/useAgentAnalytics';

export const SubscriptionPlans: React.FC = () => {
  const { pricing, loading, fetchPricing, upgradePlan } = useAgentSubscription();
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  const handleUpgrade = async (tier: 'Free' | 'Pro' | 'Premium') => {
    if (!window.confirm(`Upgrade to ${tier} plan?`)) return;

    try {
      setUpgrading(true);
      await upgradePlan('', tier); // Replace with actual agent ID
      alert('Subscription updated successfully');
      fetchPricing();
    } catch (error) {
      console.error('Upgrade error:', error);
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading plans...</div>
      </div>
    );
  }

  const plans = [
    {
      tier: 'Free' as const,
      name: 'Starter',
      description: 'Perfect for getting started',
      monthlyFee: 0,
      commissionRate: 15,
      maxSchools: 3,
      features: [
        'Basic referral tracking',
        'Commission calculation',
        'Email support',
        'Monthly reports',
      ],
    },
    {
      tier: 'Pro' as const,
      name: 'Professional',
      description: 'For growing agents',
      monthlyFee: 29.99,
      commissionRate: 20,
      maxSchools: 15,
      features: [
        'Advanced referral tracking',
        'Commission calculation',
        'Gamification & badges',
        'Analytics dashboard',
        'Priority email support',
        '2 schools discount rate',
      ],
      highlighted: true,
    },
    {
      tier: 'Premium' as const,
      name: 'Enterprise',
      description: 'For professional networks',
      monthlyFee: 99.99,
      commissionRate: 25,
      maxSchools: 100,
      features: [
        'Unlimited referral tracking',
        'Advanced commission tracking',
        'Full gamification system',
        'Advanced analytics',
        'Dedicated account manager',
        'API access',
        'Custom branding',
        'White-label options',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
        <p className="text-gray-300">Choose the perfect plan for your business</p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.tier}
            className={`relative rounded-lg border p-6 transition ${
              plan.highlighted
                ? 'bg-blue-900 border-blue-500 ring-2 ring-blue-500'
                : 'bg-slate-800 border-slate-700 hover:border-slate-600'
            }`}
          >
            {/* Highlighted Badge */}
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold">
                Most Popular
              </div>
            )}

            {/* Plan Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">{plan.name}</h2>
              </div>
              <p className="text-gray-400 text-sm">{plan.description}</p>
            </div>

            {/* Pricing */}
            <div className="mb-6 pb-6 border-b border-slate-700">
              <div className="text-4xl font-bold text-white mb-1">
                ${plan.monthlyFee.toFixed(2)}
              </div>
              <div className="text-gray-400 text-sm">per month</div>
              <div className="mt-4 text-blue-300 text-sm font-semibold">
                {plan.commissionRate}% commission rate
              </div>
            </div>

            {/* Key Stats */}
            <div className="mb-6 pb-6 border-b border-slate-700">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{plan.maxSchools}</div>
                  <div className="text-xs text-gray-400">Max Schools</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{plan.commissionRate}%</div>
                  <div className="text-xs text-gray-400">Commission</div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white mb-3">Features</h3>
              <ul className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => handleUpgrade(plan.tier)}
              disabled={upgrading}
              className={`w-full py-3 rounded font-semibold transition ${
                plan.highlighted
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
              } disabled:opacity-50`}
            >
              {upgrading ? 'Processing...' : plan.monthlyFee === 0 ? 'Current' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Detailed Comparison</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Feature
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                  Free
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                  Pro
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {[
                'Referral Tracking',
                'Commission Calculation',
                'Gamification & Badges',
                'Analytics Dashboard',
                'Priority Support',
                'API Access',
                'Custom Branding',
                'Dedicated Manager',
              ].map((feature, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50">
                  <td className="px-6 py-4 text-gray-300 font-semibold">{feature}</td>
                  <td className="px-6 py-4 text-center">
                    {idx < 2 ? (
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-500 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {idx < 6 ? (
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-500 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="w-5 h-5 text-green-400 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">FAQs</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Can I change plans anytime?</h3>
            <p className="text-sm text-gray-300">
              Yes! You can upgrade or downgrade your plan anytime. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">What payment methods do you accept?</h3>
            <p className="text-sm text-gray-300">
              We accept credit cards, bank transfers, and PayPal. Billing is monthly.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-2">Is there a contract?</h3>
            <p className="text-sm text-gray-300">
              No long-term contracts. Cancel anytime. Your data is yours to keep.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
