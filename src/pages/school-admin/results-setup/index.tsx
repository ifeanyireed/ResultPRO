import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { ResultsSetupStepIndicator } from './StepIndicator';
import {
  Step1SelectSessionTerm,
  Step2ExamConfig,
  Step3AffectiveDomain,
  Step4PsychomotorDomain,
  Step5StaffUploads,
  Step6AssignStudents,
  Step7ResultsCSV,
} from './steps';

const API_BASE = 'http://localhost:5000/api';

interface ResultsSetupState {
  currentStep: number;
  completedSteps: number[];
  isLoading: boolean;
  error: string | null;
  sessionTermData: any;
  step2Data: any;
  step3Data: any;
  step4Data: any;
  step5Data: any;
  step6Data: any;
  step7Data: any;
}

export const ResultsSetupWizard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<ResultsSetupState>({
    currentStep: 1,
    completedSteps: [],
    isLoading: false,
    error: null,
    sessionTermData: null,
    step2Data: null,
    step3Data: null,
    step4Data: null,
    step5Data: null,
    step6Data: null,
    step7Data: null,
  });

  // Check authentication and fetch current setup status
  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
        if (!token) {
          navigate('/auth/login', { replace: true });
          return;
        }

        // Try to fetch existing setup session
        const schoolId = localStorage.getItem('schoolId');
        if (!schoolId) {
          navigate('/auth/login', { replace: true });
          return;
        }

        // Fetch school info to get current academic session
        const schoolRes = await axios.get(
          `${API_BASE}/onboarding/school/${schoolId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (schoolRes.data.data?.currentOnboardingStep && schoolRes.data.data.currentOnboardingStep < 6) {
          toast({
            title: 'Incomplete Onboarding',
            description: 'Please complete school setup first',
          });
          navigate('/school-admin/onboarding', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Setup status check error:', error);
      }
    };

    checkSetupStatus();
  }, [navigate, toast]);

  const updateState = (updates: Partial<ResultsSetupState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleNextStep = async (data: any) => {
    updateState({ isLoading: false });
    const nextStep = state.currentStep + 1;
    
    // Store data from current step
    if (state.currentStep === 1) {
      updateState({ 
        sessionTermData: {
          sessionId: data.sessionId,
          sessionName: data.sessionName,
          termId: data.termId,
          termName: data.termName,
          startDate: data.startDate,
          endDate: data.endDate,
        }
      });
    } else if (state.currentStep === 2) {
      updateState({ step2Data: data });
    } else if (state.currentStep === 3) {
      updateState({ step3Data: data });
    } else if (state.currentStep === 4) {
      updateState({ step4Data: data });
    } else if (state.currentStep === 5) {
      updateState({ step5Data: data });
    } else if (state.currentStep === 6) {
      updateState({ step6Data: data });
    } else if (state.currentStep === 7) {
      updateState({ step7Data: data });
      // All steps complete - mark results setup as complete
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
        
        await axios.post(
          `${API_BASE}/onboarding/mark-results-setup-complete`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        toast({
          title: 'Success',
          description: 'Results setup completed successfully!',
        });
      } catch (error) {
        console.error('Failed to mark results setup complete:', error);
        toast({
          title: 'Warning',
          description: 'Setup complete but failed to sync. Proceeding anyway.',
        });
      }
      
      navigate('/school-admin/overview', { replace: true });
      return;
    }

    // Update completed steps
    const newCompletedSteps = [...state.completedSteps];
    if (!newCompletedSteps.includes(state.currentStep)) {
      newCompletedSteps.push(state.currentStep);
    }

    updateState({
      currentStep: nextStep,
      completedSteps: newCompletedSteps,
    });
  };

  const handlePreviousStep = () => {
    if (state.currentStep > 1) {
      updateState({
        currentStep: state.currentStep - 1,
      });
    }
  };

  const renderStep = () => {
    const stepProps = {
      onNext: handleNextStep,
      onPrevious: handlePreviousStep,
      isLoading: state.isLoading,
      sessionTermData: state.sessionTermData,
    };

    switch (state.currentStep) {
      case 1:
        return <Step1SelectSessionTerm {...stepProps} />;
      case 2:
        return <Step2ExamConfig {...stepProps} initialData={state.step2Data} />;
      case 3:
        return <Step3AffectiveDomain {...stepProps} initialData={state.step3Data} />;
      case 4:
        return <Step4PsychomotorDomain {...stepProps} initialData={state.step4Data} />;
      case 5:
        return <Step5StaffUploads {...stepProps} initialData={state.step5Data} />;
      case 6:
        return <Step6AssignStudents {...stepProps} initialData={state.step6Data} />;
      case 7:
        return <Step7ResultsCSV {...stepProps} initialData={state.step7Data} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background Image */}
      <img
        src="/Hero.png"
        className="absolute h-full w-full object-cover inset-0"
        alt="Background"
      />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      
      {/* Content */}
      <div className="relative z-10">
        <ResultsSetupStepIndicator
          currentStep={state.currentStep}
          completedSteps={state.completedSteps}
          totalSteps={7}
        />
        {renderStep()}
      </div>
    </div>
  );
};
