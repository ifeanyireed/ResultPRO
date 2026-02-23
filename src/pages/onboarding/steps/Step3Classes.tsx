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
import { AlertCircle, Trash01, Plus } from '@hugeicons/react';
import { useOnboardingStore, Step3Data } from '@/stores/onboardingStore';

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  classLevel: z.string().min(1, 'Class level is required'),
});

const step3Schema = z.object({
  classes: z.array(classSchema).min(1, 'At least one class is required'),
});

type Step3FormData = z.infer<typeof step3Schema>;

interface Step3Props {
  onNext: (data: Step3Data) => Promise<void>;
  onPrevious: () => void;
  initialData?: Step3Data;
  isLoading?: boolean;
}

const CLASS_LEVELS = [
  { label: 'Primary 1 (P1)', value: 'P1' },
  { label: 'Primary 2 (P2)', value: 'P2' },
  { label: 'Primary 3 (P3)', value: 'P3' },
  { label: 'Primary 4 (P4)', value: 'P4' },
  { label: 'Primary 5 (P5)', value: 'P5' },
  { label: 'Primary 6 (P6)', value: 'P6' },
  { label: 'Secondary 1 (SS1)', value: 'SS1' },
  { label: 'Secondary 2 (SS2)', value: 'SS2' },
  { label: 'Secondary 3 (SS3)', value: 'SS3' },
  { label: 'Junior Secondary 1 (JSS1)', value: 'JSS1' },
  { label: 'Junior Secondary 2 (JSS2)', value: 'JSS2' },
  { label: 'Junior Secondary 3 (JSS3)', value: 'JSS3' },
  { label: 'Form 1 (F1)', value: 'F1' },
  { label: 'Form 2 (F2)', value: 'F2' },
  { label: 'Form 3 (F3)', value: 'F3' },
  { label: 'Form 4 (F4)', value: 'F4' },
];

export const Step3Classes = ({
  onNext,
  onPrevious,
  initialData,
  isLoading = false,
}: Step3Props) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { setError } = useOnboardingStore();

  const form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      classes: initialData?.classes || [
        { name: '', classLevel: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'classes',
  });

  const onSubmit = async (data: Step3FormData) => {
    try {
      setSubmitError(null);
      setError(null);
      await onNext(data);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to save classes';
      setSubmitError(errorMessage);
      setError(errorMessage);
    }
  };

  const addClas = () => {
    append({ name: '', classLevel: '' });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Classes</h2>
        <p className="text-gray-600 mt-2">
          Define all the classes in your school. You can add more classes later.
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
          {/* Classes List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Class List
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
                      name={`classes.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., SS1A, Class 3B"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`classes.${index}.classLevel`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select class level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CLASS_LEVELS.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                      Remove Class
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add More Button */}
            <button
              type="button"
              onClick={addClas}
              className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Another Class
            </button>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Added {fields.length} class{fields.length !== 1 ? 'es' : ''}:</strong>{' '}
              {form.watch('classes').filter(c => c.name && c.classLevel).map(c => c.name).join(', ') || 'None yet'}
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
              {isLoading ? 'Saving...' : 'Next: Subjects'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};
