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
import { Step6CsvUpload } from './steps/Step6CsvUpload';
import { useToast } from '@/hooks/use-toast';

const API_BASE = 'http://localhost:5000/api';

export const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [apiStatus, setApiStatus] = useState<'checking' | 'ready' | 'error'>('checking');

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
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/auth/login');
          return;
        }

        // Check API health
        const healthRes = await axios.get(`${API_BASE}/health`);
        if (healthRes.status === 200) {
          setApiStatus('ready');

          // Fetch current onboarding status
          const statusRes = await axios.get(`${API_BASE}/onboarding/status`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (statusRes.data.data?.currentStep) {
            // TODO: Load progress from server if resuming
            console.log('Current server step:', statusRes.data.data.currentStep);
          }
        }
      } catch (error) {
        console.error('API check failed:', error);
        setApiStatus('error');
        toast({
          title: 'Server Error',
          description: 'Could not connect to backend. Please check if server is running on port 5000.',
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
      
      // Prepare form data for file upload if file exists
      let requestData: any = data;
      
      if (data.csvFile instanceof File) {
        const formData = new FormData();
        formData.append('csvFile', data.csvFile);
        
        const response = await axios.post(
          `${API_BASE}/onboarding/step/6`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.data.success) {
          setStep6Data(data);
          markStepComplete(6);
          handleCompleteOnboarding();
        }
      } else {
        // No file, just complete
        handleCompleteOnboarding();
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        'Failed to upload CSV';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow p-8 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Server Connection Error
          </h2>
          <p className="text-gray-600 mb-6">
            Could not connect to the backend server. Please ensure the server is running on port 5000.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (apiStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading onboarding wizard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Welcome to Results Pro
          </h1>
          <p className="text-gray-600 mt-2">
            Let's set up your school in just a few minutes
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
          totalSteps={6}
        />

        {/* Steps */}
        <div className="mt-8">
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
            <Step6CsvUpload
              onNext={handleStep6Next}
              onPrevious={handlePrevious}
              initialData={step6Data || undefined}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>
            Questions? Contact support@resultspro.io
          </p>
        </div>
      </div>
    </div>
  );
};
