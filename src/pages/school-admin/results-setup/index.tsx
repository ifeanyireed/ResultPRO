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
  schoolName: string | null;
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
    schoolName: null,
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

        // Store school name
        if (schoolRes.data.data?.name) {
          updateState({ schoolName: schoolRes.data.data.name });
        }

        if (schoolRes.data.data?.currentOnboardingStep && schoolRes.data.data.currentOnboardingStep < 6) {
          toast({
            title: 'Incomplete Onboarding',
            description: 'Please complete school setup first',
          });
          navigate('/school-admin/onboarding', { replace: true });
          return;
        }

        // Allow accessing results setup multiple times (not just first time)
        // Users will be forced here on first login by Login.tsx when resultsSetupStatus !== 'COMPLETE'
        // But they can also access it voluntarily from the dashboard anytime

        // Fetch existing results setup session if available
        try {
          const setupRes = await axios.get(
            `${API_BASE}/results-setup/session`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (setupRes.data.data) {
            const session = setupRes.data.data;
            const completedSteps = JSON.parse(session.completedSteps || '[]');
            
            // Set current step to the next incomplete step
            const nextStep = completedSteps.length > 0 
              ? Math.max(...completedSteps) + 1 
              : 1;

            // Restore all step data
            const newState: any = {
              currentStep: nextStep > 7 ? 7 : nextStep,
              completedSteps: completedSteps,
            };

            if (session.sessionId) {
              newState.sessionTermData = {
                sessionId: session.sessionId,
                sessionName: session.sessionName,
                termId: session.termId,
                termName: session.termName,
              };
            }
            if (session.examConfigComponents) {
              newState.step2Data = {
                components: JSON.parse(session.examConfigComponents),
              };
            }
            if (session.affectiveTraits) {
              newState.step3Data = {
                traits: JSON.parse(session.affectiveTraits || '[]'),
              };
            }
            if (session.psychomotorSkills) {
              newState.step4Data = {
                skills: JSON.parse(session.psychomotorSkills || '[]'),
              };
            }
            if (session.principalSignatureUrl || session.principalName || session.staffData) {
              newState.step5Data = {
                principalName: session.principalName,
                principalSignatureUrl: session.principalSignatureUrl,
                staffData: JSON.parse(session.staffData || '[]'),
              };
            }
            if (session.assignedStudents) {
              newState.step6Data = {
                assignedStudents: JSON.parse(session.assignedStudents || '[]'),
              };
            }
            if (session.resultsFileUrl) {
              newState.step7Data = {
                resultsFileUrl: session.resultsFileUrl,
                resultsFileName: session.resultsFileName,
              };
            }

            updateState(newState);
          }
        } catch (error: any) {
          // Session doesn't exist yet - start fresh
          console.log('No existing results setup session found, starting fresh');
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
        
        if (!token) {
          console.error('❌ No auth token found');
          toast({
            title: 'Error',
            description: 'Authentication token not found. Please log in again.',
            variant: 'destructive',
          });
          return;
        }

        console.log('📊 Marking results setup as complete...', {
          endpoint: `${API_BASE}/onboarding/mark-results-setup-complete`,
          token: token.substring(0, 20) + '...',
        });
        
        const response = await axios.post(
          `${API_BASE}/onboarding/mark-results-setup-complete`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log('✅ Results setup marked as complete:', response.data);

        toast({
          title: 'Success',
          description: 'Results setup completed successfully!',
        });
      } catch (error: any) {
        console.error('❌ Failed to mark results setup complete:', {
          error: error,
          response: error.response?.data,
          status: error.response?.status,
          message: error.message,
        });
        toast({
          title: 'Error',
          description: error.response?.data?.error || error.message || 'Failed to mark results setup as complete',
          variant: 'destructive',
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
        return <Step1SelectSessionTerm {...stepProps} initialData={state.sessionTermData} />;
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
        return <Step7ResultsCSV {...stepProps} examConfig={state.step2Data} affectiveDomainData={state.step3Data} psychomotorDomainData={state.step4Data} initialData={state.step7Data} />;
      default:
        return null;
    }
  };

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
              Results Setup Wizard
            </h1>
            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                Configure exam parameters and upload results data
              </p>
              {state.schoolName && (
                <p className="text-gray-400 text-sm">
                  {state.schoolName}
                </p>
              )}
            </div>
          </div>

          {/* Step Indicator */}
          <ResultsSetupStepIndicator
            currentStep={state.currentStep}
            completedSteps={state.completedSteps}
            totalSteps={7}
          />
        </div>
      </div>

      {/* Scrolling Section */}
      <section className="relative w-full flex flex-col px-4 md:px-12 lg:px-20 pb-12">
        {/* Content Container */}
        <div className="w-full max-w-5xl mx-auto pt-4">

          {/* Steps - Glass Morphism Card - Visible Before Scroll */}
          <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] backdrop-blur-xl shadow-2xl p-8 mb-8">
            {renderStep()}
          </div>

          {/* Error Message */}
          {state.error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-[15px] text-red-400 text-sm mb-8">
              {state.error}
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
