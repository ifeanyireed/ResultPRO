import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const step2Schema = z.object({
  examType: z.string().min(1, 'Please enter exam type'),
  examName: z.string().min(1, 'Please enter exam name'),
  examDate: z.string().min(1, 'Please enter exam date'),
  totalScore: z.number().min(1, 'Total score must be at least 1'),
});

type Step2FormData = z.infer<typeof step2Schema>;

interface Step2Props {
  onNext: (data: any) => Promise<void>;
  onPrevious: () => void;
  initialData?: any;
  isLoading?: boolean;
  sessionTermData?: any;
}

export const Step2ExamConfig = ({
  onNext,
  onPrevious,
  initialData,
  isLoading = false,
  sessionTermData,
}: Step2Props) => {
  const { toast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: initialData || {
      examType: '',
      examName: '',
      examDate: '',
      totalScore: 100,
    },
  });

  const onSubmit = async (data: Step2FormData) => {
    try {
      setSubmitError(null);
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');

      const payload = {
        ...sessionTermData,
        ...data,
      };

      const response = await axios.post(
        'http://localhost:5000/api/results-setup/step/2',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Exam configuration saved',
        });
        await onNext(response.data.data);
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to save exam configuration';
      setSubmitError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Exam Configuration
              </h2>
              <p className="text-gray-400 text-sm">
                Set up the exam details and scoring parameters
              </p>
            </div>

            {submitError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">{submitError}</p>
              </div>
            )}

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="examType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Exam Type *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Continuous Assessment, Mid-term, Final Exam"
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
                name="examName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Exam Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., WAEC, NECO, JAMB"
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
                name="examDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Exam Date *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Total Score *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-600"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                {isLoading ? 'Saving...' : 'Next: Affective Domain'}
              </Button>
            </div>
          </form>
        </Form>
      );
};
