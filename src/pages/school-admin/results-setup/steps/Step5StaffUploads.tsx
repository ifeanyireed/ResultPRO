import { useState, useEffect } from 'react';
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
import { Upload02 } from '@hugeicons/react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const step5Schema = z.object({
  principalSignature: z.string().optional().default(''),
  classTeacherSignature: z.string().optional().default(''),
});

type Step5FormData = z.infer<typeof step5Schema>;

interface Step5Props {
  onNext: (data: any) => Promise<void>;
  onPrevious: () => void;
  initialData?: any;
  isLoading?: boolean;
  sessionTermData?: any;
}

export const Step5StaffUploads = ({
  onNext,
  onPrevious,
  initialData,
  isLoading = false,
  sessionTermData,
}: Step5Props) => {
  const { toast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [principalSigUrl, setPrincipalSigUrl] = useState<string | null>(initialData?.principalSignature || null);
  const [classTeacherSigUrl, setClassTeacherSigUrl] = useState<string | null>(initialData?.classTeacherSignature || null);

  const form = useForm<Step5FormData>({
    resolver: zodResolver(step5Schema),
    defaultValues: initialData || {
      principalSignature: '',
      classTeacherSignature: '',
    },
  });

  // Update form when initialData changes (e.g., on page refresh when data loads from DB)
  useEffect(() => {
    if (initialData) {
      setPrincipalSigUrl(initialData.principalSignatureUrl || null);
      setClassTeacherSigUrl(initialData.teacherSignatureUrl || null);
      form.reset({
        principalSignature: initialData.principalSignatureUrl || '',
        classTeacherSignature: initialData.teacherSignatureUrl || '',
      });
    }
  }, [initialData, form]);

  const handleFileUpload = async (file: File, signatureType: 'principal' | 'classTeacher') => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('signature', file);
      formData.append('signatureType', signatureType);

      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      const response = await axios.post(
        'http://localhost:5000/api/results-setup/upload-signature',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const url = response.data.data?.url;
      if (signatureType === 'principal') {
        setPrincipalSigUrl(url);
        form.setValue('principalSignature', url);
      } else {
        setClassTeacherSigUrl(url);
        form.setValue('classTeacherSignature', url);
      }

      toast({
        title: 'Success',
        description: `${signatureType === 'principal' ? 'Principal' : 'Class Teacher'} signature uploaded`,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to upload signature';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: Step5FormData) => {
    try {
      setSubmitError(null);
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');

      const payload = {
        ...sessionTermData,
        ...data,
      };

      const response = await axios.post(
        'http://localhost:5000/api/results-setup/step/5',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Staff signatures uploaded',
        });
        await onNext(response.data.data);
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to upload signatures';
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
                Staff Uploads
              </h2>
              <p className="text-gray-400 text-sm">
                Upload digital signatures or initials from the Principal and Class Teacher
              </p>
            </div>

            {submitError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">{submitError}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Principal Signature */}
              <FormField
                control={form.control}
                name="principalSignature"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Principal Signature</FormLabel>
                    <FormControl>
                      <div className="border-2 border-dashed border-[rgba(255,255,255,0.2)] rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        {principalSigUrl ? (
                          <div className="flex flex-col items-center gap-4">
                            <img src={principalSigUrl} alt="Principal Signature" className="max-h-24" />
                            <label className="cursor-pointer text-blue-400 hover:text-blue-300 text-sm">
                              Change
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'principal')}
                                disabled={uploading}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload02 className="w-8 h-8 text-gray-400" />
                            <span className="text-gray-300 text-sm">Click to upload or drag and drop</span>
                            <span className="text-gray-500 text-xs">PNG, JPG, GIF up to 5MB</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'principal')}
                              disabled={uploading}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Class Teacher Signature */}
              <FormField
                control={form.control}
                name="classTeacherSignature"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Class Teacher Signature</FormLabel>
                    <FormControl>
                      <div className="border-2 border-dashed border-[rgba(255,255,255,0.2)] rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        {classTeacherSigUrl ? (
                          <div className="flex flex-col items-center gap-4">
                            <img src={classTeacherSigUrl} alt="Class Teacher Signature" className="max-h-24" />
                            <label className="cursor-pointer text-blue-400 hover:text-blue-300 text-sm">
                              Change
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'classTeacher')}
                                disabled={uploading}
                                className="hidden"
                              />
                            </label>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload02 className="w-8 h-8 text-gray-400" />
                            <span className="text-gray-300 text-sm">Click to upload or drag and drop</span>
                            <span className="text-gray-500 text-xs">PNG, JPG, GIF up to 5MB</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'classTeacher')}
                              disabled={uploading}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
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
                disabled={isLoading || uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? 'Saving...' : 'Next: Assign Students'}
              </Button>
            </div>
          </form>
        </Form>
      );
};
