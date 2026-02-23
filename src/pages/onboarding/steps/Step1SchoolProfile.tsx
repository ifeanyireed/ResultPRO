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
import { AlertCircle } from '@hugeicons/react';
import { useOnboardingStore, Step1Data } from '@/stores/onboardingStore';

const step1Schema = z.object({
  motto: z.string().optional().default(''),
  logoEmoji: z.string().optional().default(''),
  logoUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
    .default('#1e40af'),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
    .default('#0ea5e9'),
  accentColor: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
    .default('#f59e0b'),
  contactPersonName: z.string().optional().default(''),
  contactPhone: z.string().optional().default(''),
  altContactEmail: z.string().email().optional().or(z.literal('')),
});

type Step1FormData = z.infer<typeof step1Schema>;

interface Step1Props {
  onNext: (data: Step1Data) => Promise<void>;
  onPrevious: () => void;
  initialData?: Step1Data;
  isLoading?: boolean;
}

export const Step1SchoolProfile = ({
  onNext,
  onPrevious,
  initialData,
  isLoading = false,
}: Step1Props) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { setError } = useOnboardingStore();

  const form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: initialData || {
      motto: '',
      logoEmoji: '',
      logoUrl: '',
      primaryColor: '#1e40af',
      secondaryColor: '#0ea5e9',
      accentColor: '#f59e0b',
      contactPersonName: '',
      contactPhone: '',
      altContactEmail: '',
    },
  });

  const onSubmit = async (data: Step1FormData) => {
    try {
      setSubmitError(null);
      setError(null);
      await onNext(data);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to save school profile';
      setSubmitError(errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-8 backdrop-blur-xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">School Profile</h2>
          <p className="text-gray-400 mt-2">
            Let's start by setting up your school's basic information and branding.
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
            {/* School Branding Section */}
            <div className="border-t border-[rgba(255,255,255,0.07)] pt-8">
              <h3 className="text-lg font-semibold text-white mb-6">
                Branding
              </h3>

              <FormField
                control={form.control}
                name="logoEmoji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Logo Emoji</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., 🏫"
                          maxLength={2}
                          className="flex-1 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-600"
                          {...field}
                        />
                        <div className="text-4xl flex items-center">
                          {field.value || '🏫'}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      A single emoji to represent your school
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel className="text-gray-300">Logo URL (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/logo.png"
                        className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-600"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Full URL to your school's logo image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="motto"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel className="text-gray-300">School Motto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Excellence in Education"
                        className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-600"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Your school's official motto or tagline
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Color Scheme Section */}
            <div className="border-t border-[rgba(255,255,255,0.07)] pt-8">
              <h3 className="text-lg font-semibold text-white mb-6">
                Color Scheme
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Primary Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="#1e40af"
                            className="flex-1 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-600"
                            {...field}
                          />
                          <input
                            type="color"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-12 h-10 rounded border border-[rgba(255,255,255,0.1)] cursor-pointer"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Secondary Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="#0ea5e9"
                            className="flex-1 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-600"
                            {...field}
                          />
                          <input
                            type="color"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-12 h-10 rounded border border-[rgba(255,255,255,0.1)] cursor-pointer"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accentColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Accent Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="#f59e0b"
                            className="flex-1 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-600"
                            {...field}
                          />
                          <input
                            type="color"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="w-12 h-10 rounded border border-[rgba(255,255,255,0.1)] cursor-pointer"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="border-t border-[rgba(255,255,255,0.07)] pt-8">
              <h3 className="text-lg font-semibold text-white mb-6">
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contactPersonName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Contact Person Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Dr. John Smith"
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
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Contact Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-600"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="altContactEmail"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel className="text-gray-300">Alternate Contact Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@school.edu"
                        className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-600"
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
                {isLoading ? 'Saving...' : 'Next: Academic Session'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
