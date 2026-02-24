import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const API_BASE = 'http://localhost:5000/api';

export const PaymentComplete = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing your payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const reference = searchParams.get('reference');
        if (!reference) {
          setStatus('error');
          setMessage('No payment reference found');
          return;
        }

        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_BASE}/payment/verify/${reference}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.success) {
          setStatus('success');
          setMessage('Payment verified successfully!');
          toast({
            title: 'Payment Successful',
            description: 'Your subscription is now active. Redirecting to dashboard...',
          });

          // Complete onboarding
          await axios.post(
            `${API_BASE}/onboarding/complete`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate('/school-admin/overview', { replace: true });
          }, 2000);
        } else {
          setStatus('error');
          setMessage(response.data?.error || 'Payment verification failed');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage(error?.response?.data?.error || 'Payment verification failed. Please contact support.');
        toast({
          title: 'Payment Verification Failed',
          description: error?.response?.data?.error || error?.message,
          variant: 'destructive',
        });
      }
    };

    verifyPayment();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-8 backdrop-blur-xl">
          {status === 'loading' && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Processing Payment</h2>
              <p className="text-gray-400">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="inline-block">
                  <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-gray-400 mb-6">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="inline-block">
                  <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Error</h2>
              <p className="text-gray-400 mb-6">{message}</p>
              <button
                onClick={() => navigate('/onboarding', { replace: true })}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
              >
                Return to Onboarding
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
