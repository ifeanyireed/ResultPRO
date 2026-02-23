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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Plus, Trash01 } from '@hugeicons/react';
import { useOnboardingStore, Step5Data } from '@/stores/onboardingStore';

const gradeSchema = z.object({
  grade: z.string().min(1, 'Grade is required'),
  minScore: z.number().min(0).max(100),
  maxScore: z.number().min(0).max(100),
});

const step5Schema = z.object({
  gradingSystem: z.object({
    template: z.string().default('standard'),
    gradeScale: z.array(gradeSchema).min(1, 'At least one grade is required'),
  }),
});

type Step5FormData = z.infer<typeof step5Schema>;

interface Step5Props {
  onNext: (data: Step5Data) => Promise<void>;
  onPrevious: () => void;
  initialData?: Step5Data;
  isLoading?: boolean;
}

const STANDARD_GRADES = [
  { grade: 'A', minScore: 80, maxScore: 100, description: 'Excellent' },
  { grade: 'B', minScore: 70, maxScore: 79, description: 'Very Good' },
  { grade: 'C', minScore: 60, maxScore: 69, description: 'Good' },
  { grade: 'D', minScore: 50, maxScore: 59, description: 'Credit' },
  { grade: 'E', minScore: 40, maxScore: 49, description: 'Pass' },
  { grade: 'F', minScore: 0, maxScore: 39, description: 'Fail' },
];

const WEIGHTED_GRADES = [
  { grade: 'A+', minScore: 95, maxScore: 100 },
  { grade: 'A', minScore: 90, maxScore: 94 },
  { grade: 'A-', minScore: 85, maxScore: 89 },
  { grade: 'B+', minScore: 80, maxScore: 84 },
  { grade: 'B', minScore: 75, maxScore: 79 },
  { grade: 'C+', minScore: 70, maxScore: 74 },
  { grade: 'C', minScore: 60, maxScore: 69 },
  { grade: 'D', minScore: 50, maxScore: 59 },
  { grade: 'F', minScore: 0, maxScore: 49 },
];

export const Step5GradingSystem = ({
  onNext,
  onPrevious,
  initialData,
  isLoading = false,
}: Step5Props) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { setError } = useOnboardingStore();

  const form = useForm<Step5FormData>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      gradingSystem: {
        template: 'standard',
        gradeScale: initialData?.gradingSystem?.gradeScale || STANDARD_GRADES,
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'gradingSystem.gradeScale',
  });

  const onSubmit = async (data: Step5FormData) => {
    try {
      setSubmitError(null);
      setError(null);
      await onNext(data);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to save grading system';
      setSubmitError(errorMessage);
      setError(errorMessage);
    }
  };

  const loadPreset = (preset: typeof STANDARD_GRADES) => {
    // Clear existing and add new
    while (fields.length > 0) {
      remove(0);
    }
    preset.forEach(p => {
      append({ grade: p.grade, minScore: p.minScore, maxScore: p.maxScore });
    });
  };

  const addGrade = () => {
    append({ grade: '', minScore: 0, maxScore: 100 });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Grading System</h2>
        <p className="text-gray-600 mt-2">
          Define the grading scale and criteria for your school.
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
          {/* Template Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Grading Template
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  form.setValue('gradingSystem.template', 'standard');
                  loadPreset(STANDARD_GRADES);
                }}
                className={`p-4 rounded-lg border-2 transition ${
                  form.watch('gradingSystem.template') === 'standard'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900">Standard</h4>
                <p className="text-sm text-gray-600 mt-1">
                  A, B, C, D, E, F (6 grades)
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  form.setValue('gradingSystem.template', 'weighted');
                  loadPreset(WEIGHTED_GRADES);
                }}
                className={`p-4 rounded-lg border-2 transition ${
                  form.watch('gradingSystem.template') === 'weighted'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900">Weighted</h4>
                <p className="text-sm text-gray-600 mt-1">
                  A+ to F (9 grades, more granular)
                </p>
              </button>
            </div>
          </div>

          {/* Grade Scale */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Grade Scale
            </h3>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-4 md:grid-cols-5 gap-2 items-end"
                >
                  <FormField
                    control={form.control}
                    name={`gradingSystem.gradeScale.${index}.grade`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Grade</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., A"
                            {...field}
                            className="text-center font-bold"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`gradingSystem.gradeScale.${index}.minScore`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Min %</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                            className="text-center"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <span className="text-center text-gray-500 pb-2">-</span>

                  <FormField
                    control={form.control}
                    name={`gradingSystem.gradeScale.${index}.maxScore`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Max %</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                            className="text-center"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="pb-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add More Button */}
            <button
              type="button"
              onClick={addGrade}
              className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Grade
            </button>
          </div>

          {/* Preview Table */}
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <h4 className="font-semibold text-sm text-gray-900 mb-3">
              Grade Scale Preview
            </h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-semibold">Grade</th>
                  <th className="text-center py-2 px-3 font-semibold">Range</th>
                </tr>
              </thead>
              <tbody>
                {form.watch('gradingSystem.gradeScale').map((g, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 px-3 font-bold">{g.grade}</td>
                    <td className="text-center py-2 px-3">
                      {g.minScore}% - {g.maxScore}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              {isLoading ? 'Saving...' : 'Next: CSV Upload'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};
