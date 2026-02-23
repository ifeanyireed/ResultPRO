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
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    <Card className="w-full max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Subjects</h2>
        <p className="text-gray-600 mt-2">
          Add all the subjects taught in your school.
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
          {/* Quick Add Common Subjects */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Quick Add Common Subjects
            </h3>
            <div className="flex flex-wrap gap-2">
              {COMMON_SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => addCommonSubject(subject)}
                  disabled={form.watch('subjects').some(s => s.name === subject)}
                  className="px-3 py-1 rounded-full text-sm border border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  + {subject}
                </button>
              ))}
            </div>
          </div>

          {/* Subjects List */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Subject List
            </h3>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`subjects.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Mathematics"
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
                          <FormLabel>Subject Code (optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., MATH101"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
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
                      className="mt-4 flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
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
              className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Custom Subject
            </button>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Added {form.watch('subjects').filter(s => s.name).length} subject{form.watch('subjects').filter(s => s.name).length !== 1 ? 's' : ''}:</strong>{' '}
              {form.watch('subjects').filter(s => s.name).map(s => s.name).join(', ') || 'None yet'}
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
              {isLoading ? 'Saving...' : 'Next: Grading System'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};
