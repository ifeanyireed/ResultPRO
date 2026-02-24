import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check } from 'lucide-react';
import { useOnboardingStore, Step6Data } from '@/stores/onboardingStore';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number; // in NGN
  currency: string;
  duration: string; // e.g., 'per term', 'per year', 'forever'
  studentCount: string; // e.g., '0-200', 'Unlimited'
  features: string[];
  isPopular?: boolean;
  billingType?: 'term' | 'year'; // to differentiate plans
}

const AVAILABLE_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for testing Results Pro',
    price: 0,
    currency: 'NGN',
    duration: 'forever',
    studentCount: '0-200',
    features: [
      'CSV result upload',
      'Basic result publishing',
      'Parent viewing portal',
      'Email notifications',
      'Basic analytics',
      'Email support',
    ],
    isPopular: false,
  },
  {
    id: 'pro-term',
    name: 'Pro',
    description: 'For growing schools',
    price: 50000,
    currency: 'NGN',
    duration: 'per term',
    studentCount: '201-2,000',
    features: [
      'All Free features',
      'Result checker with scratch cards',
      'Parent mobile app access',
      'Advanced analytics',
      'SMS notifications',
      'Priority email support',
      'Custom branding',
      'Batch processing',
      'CSV data export',
    ],
    isPopular: true,
    billingType: 'term',
  },
  {
    id: 'pro-year',
    name: 'Pro',
    description: 'For growing schools (Save 17%)',
    price: 150000,
    currency: 'NGN',
    duration: 'per year',
    studentCount: '201-2,000',
    features: [
      'All Free features',
      'Result checker with scratch cards',
      'Parent mobile app access',
      'Advanced analytics',
      'SMS notifications',
      'Priority email support',
      'Custom branding',
      'Batch processing',
      'CSV data export',
    ],
    isPopular: false,
    billingType: 'year',
  },
  {
    id: 'enterprise-term',
    name: 'Enterprise',
    description: 'For large school networks',
    price: 200000,
    currency: 'NGN',
    duration: 'per term',
    studentCount: 'Unlimited',
    features: [
      'All Pro features',
      'Multiple schools management',
      'White-label platform',
      'Dedicated account manager',
      '24/7 phone & email support',
      'API access',
      'Custom integrations',
      'Advanced security features',
      'Custom SLA agreement',
    ],
    isPopular: false,
    billingType: 'term',
  },
  {
    id: 'enterprise-year',
    name: 'Enterprise',
    description: 'For large school networks (Save 17%)',
    price: 600000,
    currency: 'NGN',
    duration: 'per year',
    studentCount: 'Unlimited',
    features: [
      'All Pro features',
      'Multiple schools management',
      'White-label platform',
      'Dedicated account manager',
      '24/7 phone & email support',
      'API access',
      'Custom integrations',
      'Advanced security features',
      'Custom SLA agreement',
    ],
    isPopular: false,
    billingType: 'year',
  },
];

interface Step6Props {
  onNext: (data: Step6Data) => Promise<void>;
  onPrevious: () => void;
  initialData?: Step6Data;
  isLoading?: boolean;
}

const API_BASE = 'http://localhost:5000/api';

export const Step6PaymentPlans = ({
  onNext,
  onPrevious,
  initialData,
  isLoading = false,
}: Step6Props) => {
  const [billingPeriod, setBillingPeriod] = useState<'term' | 'year'>('year');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialData?.selectedPlanId || '');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setError } = useOnboardingStore();

  // Load available plans on mount
  useEffect(() => {
    setLoadingPlans(false);
  }, []);

  // Filter plans by billing period (Free is always shown)
  const filteredPlans = AVAILABLE_PLANS.filter(plan => 
    plan.id === 'free' || plan.billingType === billingPeriod
  );

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleProceedToPayment = async () => {
    if (!selectedPlanId) {
      setSubmitError('Please select a plan to continue');
      return;
    }

    setIsProcessing(true);
    try {
      setSubmitError(null);
      setError(null);

      const selectedPlan = AVAILABLE_PLANS.find(p => p.id === selectedPlanId);
      if (!selectedPlan) {
        throw new Error('Selected plan not found');
      }

      // Call the onNext handler with selected plan
      await onNext({
        selectedPlanId: selectedPlanId,
        paymentMethod: 'paystack',
      });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to proceed with payment';
      setSubmitError(errorMessage);
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loadingPlans) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-8 backdrop-blur-xl">
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-8 backdrop-blur-xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Choose Your Plan</h2>
          <p className="text-gray-400 mt-2">
            Select a subscription plan that works best for your school
          </p>
        </div>

        {submitError && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{submitError}</p>
          </div>
        )}

        {/* Billing Period Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] p-1">
            {(['term', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setBillingPeriod(period)}
                className={`px-6 py-2 rounded-md transition-all font-medium text-sm ${
                  billingPeriod === period
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {period === 'term' && 'Per Term'}
                {period === 'year' && 'Annually (Save 17%)'}
              </button>
            ))}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => handleSelectPlan(plan.id)}
              className={`relative rounded-lg border-2 transition cursor-pointer overflow-hidden ${
                selectedPlanId === plan.id
                  ? 'border-blue-400 bg-blue-500/10'
                  : 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.02)]'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                  Popular
                </div>
              )}

              <div className="p-6">
                {/* Plan Name & Description */}
                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{plan.description}</p>
                <p className="text-xs text-gray-500 mt-2">👥 {plan.studentCount} students</p>

                {/* Price */}
                <div className="mt-6 mb-6">
                  <div className="text-3xl font-bold text-white">
                    {plan.price === 0 ? 'Free' : `₦${plan.price.toLocaleString()}`}
                  </div>
                  <div className="text-sm text-gray-400">{plan.duration}</div>
                  {plan.price > 0 && (
                    <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.1)] space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Base price:</span>
                        <span>₦{plan.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Tax (7.5%):</span>
                        <span>₦{Math.round(plan.price * 0.075).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold text-white pt-1">
                        <span>Total:</span>
                        <span>₦{(plan.price + Math.round(plan.price * 0.075)).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Selection Indicator */}
                {selectedPlanId === plan.id && (
                  <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.1)]">
                    <div className="text-sm font-medium text-blue-400 text-center">
                      ✓ Selected Plan
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-[rgba(255,255,255,0.07)] pt-8 flex gap-4 justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={isProcessing}
            className="bg-transparent border-[rgba(255,255,255,0.2)] text-gray-300 hover:bg-white/5 hover:text-white"
          >
            Back
          </Button>
          <Button
            onClick={handleProceedToPayment}
            disabled={isProcessing || !selectedPlanId}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isProcessing ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </div>

        {/* Info Note */}
        <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <p className="text-sm text-blue-300">
            💡 You can upgrade or downgrade your plan at any time. Cancel anytime with no penalties.
          </p>
        </div>
      </div>
    </div>
  );
};
