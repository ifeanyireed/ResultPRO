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
import { AlertCircle, Trash2 } from '@hugeicons/react';
import { useOnboardingStore, Step2Data } from '@/stores/onboardingStore';

const termSchema = z.object({
  name: z.string().min(1, 'Term name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
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
  terms: z.array(termSchema).min(1, 'At least one term is required').default([]),
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
      terms: [
        { name: '1st Term', startDate: '', endDate: '' },
        { name: '2nd Term', startDate: '', endDate: '' },
        { name: '3rd Term', startDate: '', endDate: '' },
      ],
    },
  });

  const termFields = form.watch('terms') || [];

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
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-8 backdrop-blur-xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Academic Session</h2>
          <p className="text-gray-400 mt-2">
            Set up the academic year and term dates for your school.
          </p>
        </div>

        {submitError && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{submitError}</p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Session Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">
                Session Details
              </h3>

              <FormField
                control={form.control}
                name="academicSessionName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Academic Session Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={defaultSessionName}
                        className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-600"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Format: e.g., {defaultSessionName} or {currentYear}/2025
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Term Dates Section */}
            <div className="border-t border-[rgba(255,255,255,0.07)] pt-8">
              <h3 className="text-lg font-semibold text-white mb-6">
                Session Duration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Session Start Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-600"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
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
                      <FormLabel className="text-gray-300">Session End Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-600"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        When does the academic year end?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date Range Summary */}
              {form.watch('startDate') && form.watch('endDate') && (
                <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <p className="text-sm text-blue-300">
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
                  <p className="text-xs text-blue-400 mt-2">
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
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                <strong>Note:</strong> You can add multiple terms (1st, 2nd, 3rd term) 
                after this step. For now, we're setting up the overall academic session.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-[rgba(255,255,255,0.07)] pt-8 flex gap-4 justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                disabled={isLoading}
                className="bg-transparent border-[rgba(255,255,255,0.2)] text-gray-300 hover:bg-white/5 hover:text-white"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Saving...' : 'Next: Classes'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
