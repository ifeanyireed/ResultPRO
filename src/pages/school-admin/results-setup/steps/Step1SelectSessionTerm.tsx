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
        const schoolId = localStorage.getItem('schoolId');
        
        if (!schoolId) {
          throw new Error('School ID not found');
        }

        const response = await axios.get(
          `http://localhost:5000/api/onboarding/school/${schoolId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        // Extract academic sessions from school data
        const academicSessions = response.data.data?.academicSessions || [];
        setSessions(academicSessions);
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
      // Find the selected session and get its terms
      const selectedSession = sessions.find(s => s.id === selectedSessionId);
      if (selectedSession?.terms) {
        setTerms(selectedSession.terms);
      } else {
        setTerms([]);
      }
      form.setValue('termId', ''); // Reset term when session changes
    }
  }, [selectedSessionId, sessions, form]);

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                    className="w-full px-4 py-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white rounded-lg focus:outline-none focus:border-blue-400 disabled:opacity-50 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '16px 12px',
                      paddingRight: '2.5rem',
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Select a session...</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id} style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>
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
                    className="w-full px-4 py-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white rounded-lg focus:outline-none focus:border-blue-400 disabled:opacity-50 appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '16px 12px',
                      paddingRight: '2.5rem',
                    }}
                  >
                    <option value="" style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>Select a term...</option>
                    {terms.map((term) => (
                      <option key={term.id} value={term.id} style={{ backgroundColor: '#1f2937', color: '#ffffff' }}>
                        {term.name}
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
  );
};
