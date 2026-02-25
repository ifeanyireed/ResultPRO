import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const step1Schema = z.object({
  sessionId: z.string().min(1, 'Please select a session'),
  termId: z.string().min(1, 'Please select a term'),
});

type Step1FormData = z.infer<typeof step1Schema>;

interface Step1Props {
  onNext: (data: any) => Promise<void>;
  onPrevious: () => void;
  initialData?: any;
  isLoading?: boolean;
}

export const Step1SelectSessionTerm = ({
  onNext,
  onPrevious,
  initialData,
  isLoading = false,
}: Step1Props) => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: initialData || {
      sessionId: '',
      termId: '',
    },
  });

  // Fetch sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
        const response = await axios.get('http://localhost:5000/api/onboarding/sessions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSessions(response.data.data?.sessions || []);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load sessions',
          variant: 'destructive',
        });
      } finally {
        setLoadingSessions(false);
      }
    };
    fetchSessions();
  }, [toast]);

  // Fetch terms when session changes
  const selectedSessionId = form.watch('sessionId');
  useEffect(() => {
    if (selectedSessionId) {
      const fetchTerms = async () => {
        try {
          const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
          const response = await axios.get(
            `http://localhost:5000/api/onboarding/sessions/${selectedSessionId}/terms`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setTerms(response.data.data?.terms || []);
          form.setValue('termId', ''); // Reset term when session changes
        } catch (error) {
          console.error('Failed to fetch terms:', error);
          toast({
            title: 'Error',
            description: 'Failed to load terms',
            variant: 'destructive',
          });
        }
      };
      fetchTerms();
    }
  }, [selectedSessionId, form, toast]);

  const onSubmit = async (data: Step1FormData) => {
    try {
      setSubmitError(null);
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      
      // Get session and term details
      const selectedSession = sessions.find(s => s.id === data.sessionId);
      const selectedTerm = terms.find(t => t.id === data.termId);

      const payload = {
        sessionId: data.sessionId,
        termId: data.termId,
        sessionName: selectedSession?.name,
        termName: selectedTerm?.name,
        startDate: selectedTerm?.startDate,
        endDate: selectedTerm?.endDate,
      };

      const response = await axios.post(
        'http://localhost:5000/api/results-setup/step/1',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Session and term configured successfully',
        });
        await onNext(response.data.data);
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to save session configuration';
      setSubmitError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-8">
      <div className="max-w-2xl mx-auto px-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-lg bg-[rgba(255,255,255,0.02)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] p-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Select Session & Term
              </h2>
              <p className="text-gray-400 text-sm">
                Choose the academic session and term for which you're setting up results
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
                name="sessionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Academic Session *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={loadingSessions}
                        className="w-full px-4 py-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white rounded-lg focus:outline-none focus:border-blue-400 disabled:opacity-50"
                      >
                        <option value="">Select a session...</option>
                        {sessions.map((session) => (
                          <option key={session.id} value={session.id}>
                            {session.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="termId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Term *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={!selectedSessionId || terms.length === 0}
                        className="w-full px-4 py-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white rounded-lg focus:outline-none focus:border-blue-400 disabled:opacity-50"
                      >
                        <option value="">Select a term...</option>
                        {terms.map((term) => (
                          <option key={term.id} value={term.id}>
                            {term.name || `Term ${term.termNumber}`}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormDescription className="text-gray-500 text-xs">
                      {selectedSessionId && terms.length === 0 ? 'No terms available for this session' : ''}
                    </FormDescription>
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
                {isLoading ? 'Saving...' : 'Next: Exam Config'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
