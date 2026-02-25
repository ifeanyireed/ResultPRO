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
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const step3Schema = z.object({
  affectiveDomain: z.string().optional().default(''),
  affectiveDescription: z.string().optional().default(''),
});

type Step3FormData = z.infer<typeof step3Schema>;

interface Step3Props {
  onNext: (data: any) => Promise<void>;
  onPrevious: () => void;
  initialData?: any;
  isLoading?: boolean;
  sessionTermData?: any;
}

export const Step3AffectiveDomain = ({
  onNext,
  onPrevious,
  initialData,
  isLoading = false,
  sessionTermData,
}: Step3Props) => {
  const { toast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: initialData || {
      affectiveDomain: '',
      affectiveDescription: '',
    },
  });

  const onSubmit = async (data: Step3FormData) => {
    try {
      setSubmitError(null);
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');

      const payload = {
        ...sessionTermData,
        ...data,
      };

      const response = await axios.post(
        'http://localhost:5000/api/results-setup/step/3',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Affective domain configuration saved',
        });
        await onNext(response.data.data);
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to save affective domain';
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
                Affective Domain
              </h2>
              <p className="text-gray-400 text-sm">
                Configure affective domain assessment criteria (attitudes, values, behavior)
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
                name="affectiveDomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Affective Domain Title</FormLabel>
                    <FormControl>
                      <input
                        placeholder="e.g., Core Values Assessment"
                        className="w-full px-4 py-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white rounded-lg focus:outline-none focus:border-blue-400 placeholder:text-gray-600"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="affectiveDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Description</FormLabel>
                    <FormControl>
                      <textarea
                        placeholder="Describe the affective domain assessment criteria..."
                        className="w-full px-4 py-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white rounded-lg focus:outline-none focus:border-blue-400 placeholder:text-gray-600 min-h-32"
                        {...field}
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
                {isLoading ? 'Saving...' : 'Next: Psychomotor Domain'}
              </Button>
            </div>
          </form>
        </Form>
      );
};
