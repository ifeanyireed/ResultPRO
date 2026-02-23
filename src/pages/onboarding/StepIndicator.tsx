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
                <CheckCircle2
                  className="w-10 h-10 text-green-600 flex-shrink-0"
                  strokeWidth={2}
                />
              ) : step === currentStep ? (
                <div className="w-10 h-10 rounded-full border-3 border-blue-600 bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">{step}</span>
                </div>
              ) : (
                <Circle
                  className="w-10 h-10 text-gray-300 flex-shrink-0"
                  strokeWidth={2}
                />
              )}
              <p className="text-xs md:text-sm font-medium text-gray-700 mt-2 text-center">
                {stepLabels[index]}
              </p>
            </div>

            {/* Connector Line */}
            {index < totalSteps - 1 && (
              <div className="flex-1 h-1 mx-2">
                <div
                  className={`h-full transition-colors ${
                    completedSteps.includes(step)
                      ? 'bg-green-600'
                      : 'bg-gray-300'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Text */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Step <span className="font-bold text-blue-600">{currentStep}</span> of{' '}
          <span className="font-bold">{totalSteps}</span>
        </p>
        {completedSteps.length > 0 && (
          <p className="text-xs text-green-600 mt-1">
            {completedSteps.length} of {totalSteps} steps completed
          </p>
        )}
      </div>
    </div>
  );
};
