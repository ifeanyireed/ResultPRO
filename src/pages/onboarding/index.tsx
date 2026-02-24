import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { StepIndicator } from './StepIndicator';
import { Step1SchoolProfile } from './steps/Step1SchoolProfile';
import { Step2AcademicSession } from './steps/Step2AcademicSession';
import { Step3Classes } from './steps/Step3Classes';
import { Step4Subjects } from './steps/Step4Subjects';
import { Step5GradingSystem } from './steps/Step5GradingSystem';
import { Step6PaymentPlans } from './steps/Step6PaymentPlans';
import { useToast } from '@/hooks/use-toast';

const API_BASE = 'http://localhost:5000/api';

export const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [apiStatus, setApiStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [schoolName, setSchoolName] = useState<string>('');
  const [classes, setClasses] = useState<any[]>([]);

  const {
    currentStep,
    completedSteps,
    isLoading,
    error,
    setStep1Data,
    setStep2Data,
    setStep3Data,
    setStep4Data,
    setStep5Data,
    setStep6Data,
    nextStep,
    previousStep,
    goToStep,
    markStepComplete,
    setIsLoading,
    setError,
    step1Data,
    step2Data,
    step3Data,
    step4Data,
    step5Data,
    step6Data,
    reset,
  } = useOnboardingStore();

  // Check API and fetch current status
  useEffect(() => {
    const checkApi = async () => {
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
        if (!token) {
          console.log('❌ No auth token found. Redirecting to login...');
          navigate('/auth/login', { replace: true });
          return;
        }

        console.log('🔐 Auth token found, checking API...');

        // Check API health
        const healthRes = await axios.get(`${API_BASE}/health`);
        if (healthRes.status === 200) {
          console.log('✅ API is healthy');
          setApiStatus('ready');

          // Fetch current onboarding status
          console.log('📡 Fetching onboarding status with token:', token.substring(0, 20) + '...');
          const statusRes = await axios.get(`${API_BASE}/onboarding/status`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const statusData = statusRes.data.data;
          console.log('✅ Current server step:', statusData.currentStep);
          console.log('✅ Completed steps:', statusData.completedSteps);

          // Extract school name
          if (statusData?.schoolName) {
            setSchoolName(statusData.schoolName);
            console.log('✅ School name:', statusData.schoolName);
          }

          // Navigate to current step
          const currentStep = statusData.currentStep || 1;
          const completedSteps = statusData.completedSteps || [];
          
          // Mark completed steps in the store
          completedSteps.forEach((step: number) => {
            markStepComplete(step);
          });
          
          // Navigate to the current step that needs to be filled (not completed ones)
          goToStep(currentStep);
          console.log('📍 Navigating to step:', currentStep);

          // Only load data for Step 1 if it's completed, otherwise keep form empty
          if (completedSteps.includes(1) && currentStep > 1) {
            const step1Data: any = {
              motto: statusData.motto || '',
              logoUrl: statusData.logoUrl || '',
              primaryColor: statusData.primaryColor || '#1e40af',
              secondaryColor: statusData.secondaryColor || '#0ea5e9',
              accentColor: statusData.accentColor || '#f59e0b',
              contactPersonName: statusData.contactPersonName || '',
              contactPhone: statusData.contactPhone || '',
              altContactEmail: statusData.altContactEmail || '',
            };
            setStep1Data(step1Data);
            console.log('✅ Loaded completed Step 1 data');
          }

          // Only load data for Step 2 if it's completed, otherwise keep form empty
          if (completedSteps.includes(2) && currentStep > 2) {
            const step2Data: any = {
              academicSessionName: statusData.academicSessionName || '',
              startDate: statusData.startDate ? statusData.startDate.split('T')[0] : '',
              endDate: statusData.endDate ? statusData.endDate.split('T')[0] : '',
              terms: (statusData.terms || []).map((term: any) => ({
                name: term.name || '',
                startDate: term.startDate ? term.startDate.split('T')[0] : '',
                endDate: term.endDate ? term.endDate.split('T')[0] : '',
              })),
            };
            setStep2Data(step2Data);
            console.log('✅ Loaded completed Step 2 data');
          }

          // Load classes for Step 3/4 (always available if they exist)
          if (statusData.classes && Array.isArray(statusData.classes)) {
            setClasses(statusData.classes);
            console.log('✅ Loaded classes:', statusData.classes.length);
          }

          // Only load data for Step 3 if it's completed, otherwise keep form empty
          if (completedSteps.includes(3) && currentStep > 3) {
            const step3Data: any = {
              classes: statusData.classes || [],
            };
            setStep3Data(step3Data);
            console.log('✅ Loaded completed Step 3 data');
          }

          // Only load data for Step 4 if it's completed, otherwise keep form empty
          if (completedSteps.includes(4) && currentStep > 4) {
            const step4Data: any = {
              subjects: (statusData.subjects || []).map((subject: any) => ({
                name: subject.name || '',
                classId: subject.classIds?.[0] || '', // Use first class association
              })),
            };
            setStep4Data(step4Data);
            console.log('✅ Loaded completed Step 4 data');
          }
        }
      } catch (error: any) {
        console.error('❌ API check failed:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        
        // If 401, redirect to login
        if (error.response?.status === 401) {
          console.log('🔐 Unauthorized (401) - Clearing session and redirecting to login');
          localStorage.removeItem('authToken');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          navigate('/auth/login', { replace: true });
          return;
        }
        
        setApiStatus('error');
        toast({
          title: 'Server Error',
          description: error.response?.status === 401 
            ? 'Your session has expired. Please login again.'
            : 'Could not connect to backend. Please check if server is running on port 5000.',
          variant: 'destructive',
        });
      }
    };

    checkApi();
  }, [navigate, toast]);

  const handleStep1Next = async (data: any) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_BASE}/onboarding/step/1`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStep1Data(data);
        markStepComplete(1);
        nextStep();
        toast({
          title: 'Success',
          description: 'School profile saved successfully',
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        'Failed to save school profile';
      setError(msg);
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Next = async (data: any) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_BASE}/onboarding/step/2`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStep2Data(data);
        markStepComplete(2);
        nextStep();
        toast({
          title: 'Success',
          description: 'Academic session saved successfully',
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        'Failed to save academic session';
      setError(msg);
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Next = async (data: any) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_BASE}/onboarding/step/3`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStep3Data(data);
        markStepComplete(3);
        nextStep();
        toast({
          title: 'Success',
          description: 'Classes saved successfully',
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        'Failed to save classes';
      setError(msg);
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep4Next = async (data: any) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_BASE}/onboarding/step/4`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStep4Data(data);
        markStepComplete(4);
        nextStep();
        toast({
          title: 'Success',
          description: 'Subjects saved successfully',
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        'Failed to save subjects';
      setError(msg);
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep5Next = async (data: any) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_BASE}/onboarding/step/5`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStep5Data(data);
        markStepComplete(5);
        nextStep();
        toast({
          title: 'Success',
          description: 'Grading system saved successfully',
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        'Failed to save grading system';
      setError(msg);
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep6Next = async (data: any) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // Check if selected plan is free
      const isFreeplan = data.selectedPlanId === 'free';
      
      if (isFreeplan) {
        // For free plan, just save and complete onboarding
        setStep6Data(data);
        markStepComplete(6);
        
        // Complete the onboarding
        const completeRes = await axios.post(
          `${API_BASE}/onboarding/complete`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setIsLoading(false);
        
        // Redirect to overview
        navigate('/school-admin/overview', { replace: true });
        toast({
          title: 'Success',
          description: 'Onboarding completed! Welcome to Results Pro',
        });
      } else {
        // For paid plans, initialize payment with Paystack
        setStep6Data(data);
        markStepComplete(6);
        
        // Get plan details
        const planName = data.selectedPlanId.includes('pro-term') || data.selectedPlanId === 'pro-term' 
          ? 'Pro' 
          : data.selectedPlanId.includes('pro-year') 
          ? 'Pro' 
          : 'Enterprise';
        
        const amount = data.selectedPlanId.includes('pro-term') || data.selectedPlanId === 'pro-term'
          ? 50000
          : data.selectedPlanId.includes('pro-year')
          ? 150000
          : data.selectedPlanId.includes('enterprise-term') || data.selectedPlanId === 'enterprise-term'
          ? 200000
          : 600000; // enterprise-year

        // Initialize payment with backend (tax will be added server-side)
        const initPaymentRes = await axios.post(
          `${API_BASE}/payment/initialize`,
          {
            planId: data.selectedPlanId,
            planName,
            amount, // Base amount, tax will be added by backend
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (initPaymentRes.data?.success && initPaymentRes.data?.data?.authorizationUrl) {
          // Redirect to Paystack payment page
          window.location.href = initPaymentRes.data.data.authorizationUrl;
        } else {
          throw new Error(initPaymentRes.data?.error || 'Failed to initialize payment');
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to process payment';
      setError(msg);
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `${API_BASE}/onboarding/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        markStepComplete(6);
        toast({
          title: 'Success!',
          description: 'Onboarding complete! Redirecting to dashboard...',
        });

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          reset();
          navigate('/school-admin/overview');
        }, 2000);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        'Failed to complete onboarding';
      setError(msg);
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    }
  };

  const handlePrevious = () => {
    previousStep();
  };

  if (apiStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] backdrop-blur-xl shadow-2xl p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">
            Server Connection Error
          </h2>
          <p className="text-gray-300 mb-6">
            Could not connect to the backend server. Please ensure the server is running on port 5000.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (apiStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-300">Loading onboarding wizard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-white min-h-screen flex flex-col">
      {/* Fixed Background Image */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <img
          src="/Hero.png"
          className="w-full h-full object-cover object-center"
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      {/* Sticky Header & Step Indicator */}
      <div className="sticky top-0 z-40 px-4 md:px-12 lg:px-20 pt-4 pb-1 bg-gradient-to-b from-black via-black/60 to-transparent backdrop-blur-lg">
        <div className="w-full max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-4 pb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              School Setup Wizard
            </h1>
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                Configure your school settings to get started with Results Pro
              </p>
              {schoolName && (
                <p className="text-gray-400 text-sm">
                  {schoolName}
                </p>
              )}
            </div>
          </div>

          {/* Step Indicator */}
          <StepIndicator
            currentStep={currentStep}
            completedSteps={completedSteps}
            totalSteps={6}
          />
        </div>
      </div>

      {/* Scrolling Section */}
      <section className="relative w-full flex flex-col px-4 md:px-12 lg:px-20 pb-12">
        {/* Content Container */}
        <div className="w-full max-w-5xl mx-auto pt-4">

          {/* Steps - Glass Morphism Card - Visible Before Scroll */}
          <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] backdrop-blur-xl shadow-2xl p-8 mb-8">
            {currentStep === 1 && (
              <Step1SchoolProfile
                onNext={handleStep1Next}
                onPrevious={handlePrevious}
                initialData={step1Data || undefined}
                isLoading={isLoading}
              />
            )}

            {currentStep === 2 && (
              <Step2AcademicSession
                onNext={handleStep2Next}
                onPrevious={handlePrevious}
                initialData={step2Data || undefined}
                isLoading={isLoading}
              />
            )}

            {currentStep === 3 && (
              <Step3Classes
                onNext={handleStep3Next}
                onPrevious={handlePrevious}
                initialData={step3Data || undefined}
                isLoading={isLoading}
              />
            )}

            {currentStep === 4 && (
              <Step4Subjects
                onNext={handleStep4Next}
                onPrevious={handlePrevious}
                initialData={step4Data || undefined}
                classes={classes}
                isLoading={isLoading}
              />
            )}

            {currentStep === 5 && (
              <Step5GradingSystem
                onNext={handleStep5Next}
                onPrevious={handlePrevious}
                initialData={step5Data || undefined}
                isLoading={isLoading}
              />
            )}

            {currentStep === 6 && (
              <Step6PaymentPlans
                onNext={handleStep6Next}
                onPrevious={handlePrevious}
                initialData={step6Data || undefined}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-[15px] text-red-400 text-sm mb-8">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 py-8">
            <p>
              Questions? Contact support@resultspro.ng
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
