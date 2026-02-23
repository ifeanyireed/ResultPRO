import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { AlertCircle, Trash01, Plus } from '@hugeicons/react';
import { useOnboardingStore, Step4Data } from '@/stores/onboardingStore';

const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  code: z.string().optional().default(''),
  classId: z.string().optional().default(''),
});

const step4Schema = z.object({
  subjects: z.array(subjectSchema).min(1, 'At least one subject is required'),
});

type Step4FormData = z.infer<typeof step4Schema>;

interface Step4Props {
  onNext: (data: Step4Data) => Promise<void>;
  onPrevious: () => void;
  initialData?: Step4Data;
  isLoading?: boolean;
}

const COMMON_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'Civic Education',
  'Literature in English',
  'Economics',
  'Computer Science',
  'Fine Arts',
  'Physical Education',
  'Agriculture',
  'French Language',
  'Yoruba Language',
  'Igbo Language',
];

export const Step4Subjects = ({
  onNext,
  onPrevious,
  initialData,
  isLoading = false,
}: Step4Props) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { setError } = useOnboardingStore();

  const form = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      subjects: initialData?.subjects || [
        { name: '', code: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subjects',
  });

  const onSubmit = async (data: Step4FormData) => {
    try {
      setSubmitError(null);
      setError(null);
      await onNext(data);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to save subjects';
      setSubmitError(errorMessage);
      setError(errorMessage);
    }
  };

  const addSubject = () => {
    append({ name: '', code: '' });
  };

  const addCommonSubject = (subjectName: string) => {
    // Check if subject already added
    const exists = form.watch('subjects').some(s => s.name === subjectName);
    if (!exists) {
      append({ name: subjectName, code: '' });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-8 backdrop-blur-xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">Subjects</h2>
          <p className="text-gray-400 mt-2">
            Add all the subjects taught in your school.
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
            {/* Quick Add Common Subjects */}
            <div>
              <h3 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">
                Quick Add Common Subjects
              </h3>
              <div className="flex flex-wrap gap-2">
                {COMMON_SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => addCommonSubject(subject)}
                    disabled={form.watch('subjects').some(s => s.name === subject)}
                    className="px-3 py-1 rounded-full text-sm border border-blue-400/50 text-blue-300 hover:bg-blue-500/10 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-transparent"
                  >
                    + {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Subjects List */}
            <div className="border-t border-[rgba(255,255,255,0.07)] pt-8">
              <h3 className="text-lg font-semibold text-white mb-6">
                Subject List
              </h3>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border border-[rgba(255,255,255,0.07)] rounded-lg p-6 bg-[rgba(255,255,255,0.01)]"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`subjects.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Subject Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Mathematics"
                                className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-600"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`subjects.${index}.code`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Subject Code (optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., MATH101"
                                className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-600"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-gray-500">
                              Optional internal code
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Remove Button */}
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="mt-4 flex items-center gap-2 text-sm text-red-400 hover:text-red-300 font-medium"
                      >
                        <Trash01 className="w-4 h-4" />
                        Remove Subject
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add More Button */}
              <button
                type="button"
                onClick={addSubject}
                className="mt-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Custom Subject
              </button>
            </div>

            {/* Summary */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                <strong>Added {form.watch('subjects').filter(s => s.name).length} subject{form.watch('subjects').filter(s => s.name).length !== 1 ? 's' : ''}:</strong>{' '}
                {form.watch('subjects').filter(s => s.name).map(s => s.name).join(', ') || 'None yet'}
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
                {isLoading ? 'Saving...' : 'Next: Grading System'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
