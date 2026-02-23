import { CheckCircle, Circle } from '@hugeicons/react';

interface StepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  totalSteps?: number;
}

const stepLabels = [
  'School Profile',
  'Academic Session',
  'Classes',
  'Subjects',
  'Grading System',
  'CSV Upload',
];

export const StepIndicator = ({
  currentStep,
  completedSteps,
  totalSteps = 6,
}: StepIndicatorProps) => {
  return (
    <div className="w-full py-8 px-4">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              {completedSteps.includes(step) ? (
                <CheckCircle
                  className="w-10 h-10 text-emerald-400 flex-shrink-0"
                  strokeWidth={2}
                />
              ) : step === currentStep ? (
                <div className="w-10 h-10 rounded-full border-2 border-blue-400 bg-blue-400/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-bold text-sm">{step}</span>
                </div>
              ) : (
                <Circle
                  className="w-10 h-10 text-gray-600 flex-shrink-0"
                  strokeWidth={2}
                />
              )}
              <p className="text-xs md:text-sm font-medium text-gray-400 mt-2 text-center">
                {stepLabels[index]}
              </p>
            </div>

            {/* Connector Line */}
            {index < totalSteps - 1 && (
              <div className="flex-1 h-1 mx-2">
                <div
                  className={`h-full transition-colors ${
                    completedSteps.includes(step)
                      ? 'bg-emerald-400'
                      : 'bg-gray-700'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Text */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-400">
          Step <span className="font-bold text-blue-400">{currentStep}</span> of{' '}
          <span className="font-bold text-gray-300">{totalSteps}</span>
        </p>
        {completedSteps.length > 0 && (
          <p className="text-xs text-emerald-400 mt-1">
            {completedSteps.length} of {totalSteps} steps completed
          </p>
        )}
      </div>
    </div>
  );
};
