import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from '@hugeicons/react';
import { useOnboardingStore, Step2Data } from '@/stores/onboardingStore';

const step2Schema = z.object({
  academicSessionName: z
    .string()
    .min(1, 'Academic session name is required')
    .default(''),
  startDate: z
    .string()
    .min(1, 'Start date is required')
    .default(''),
  endDate: z
    .string()
    .min(1, 'End date is required')
    .default(''),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) < new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);

type Step2FormData = z.infer<typeof step2Schema>;

interface Step2Props {
  onNext: (data: Step2Data) => Promise<void>;
  onPrevious: () => void;
  initialData?: Step2Data;
  isLoading?: boolean;
}

export const Step2AcademicSession = ({
  onNext,
  onPrevious,
  initialData,
  isLoading = false,
}: Step2Props) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { setError } = useOnboardingStore();

  // Generate default session name based on current year
  const currentYear = new Date().getFullYear();
  const defaultSessionName = `${currentYear}/${currentYear + 1}`;

  const form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: initialData || {
      academicSessionName: defaultSessionName,
      startDate: '',
      endDate: '',
    },
  });

  const onSubmit = async (data: Step2FormData) => {
    try {
      setSubmitError(null);
      setError(null);
      await onNext(data);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to save academic session';
      setSubmitError(errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Academic Session</h2>
        <p className="text-gray-600 mt-2">
          Set up the academic year and term dates for your school.
        </p>
      </div>

      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Session Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Session Details
            </h3>

            <FormField
              control={form.control}
              name="academicSessionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Session Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={defaultSessionName}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Format: e.g., {defaultSessionName} or {currentYear}/2025
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Term Dates Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Session Duration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      When does the academic year begin?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      When does the academic year end?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date Range Summary */}
            {form.watch('startDate') && form.watch('endDate') && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Session Duration:</span>{' '}
                  {new Date(form.watch('startDate')).toLocaleDateString(
                    undefined,
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}{' '}
                  to{' '}
                  {new Date(form.watch('endDate')).toLocaleDateString(
                    undefined,
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  {Math.ceil(
                    (new Date(form.watch('endDate')).getTime() -
                      new Date(form.watch('startDate')).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days total
                </p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> You can add multiple terms (1st, 2nd, 3rd term) 
              after this step. For now, we're setting up the overall academic session.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-6 flex gap-4 justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Next: Classes'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};
