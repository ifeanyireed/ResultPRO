import { useState, useRef } from 'react';
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
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Upload01, CheckCircle } from '@hugeicons/react';
import { useOnboardingStore, Step6Data } from '@/stores/onboardingStore';

const step6Schema = z.object({
  csvFile: z.instanceof(File).optional(),
});

type Step6FormData = z.infer<typeof step6Schema>;

interface Step6Props {
  onNext: (data: Step6Data) => Promise<void>;
  onPrevious: () => void;
  initialData?: Step6Data;
  isLoading?: boolean;
}

export const Step6CsvUpload = ({
  onNext,
  onPrevious,
  initialData,
  isLoading = false,
}: Step6Props) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setError } = useOnboardingStore();

  const form = useForm<Step6FormData>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      csvFile: undefined,
    },
  });

  const onSubmit = async (data: Step6FormData) => {
    try {
      setSubmitError(null);
      setError(null);
      
      // If no file was selected, just mark as complete without file
      if (!data.csvFile && !form.watch('csvFile')) {
        await onNext({ csvFile: undefined });
        setUploadComplete(true);
      } else {
        await onNext({ csvFile: data.csvFile });
        setUploadComplete(true);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to upload CSV';
      setSubmitError(errorMessage);
      setError(errorMessage);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        setSubmitError('Please select a CSV file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('File size must be less than 5MB');
        return;
      }

      setSubmitError(null);
      form.setValue('csvFile', file);
    }
  };

  const fileName = form.watch('csvFile')?.name;

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">CSV Upload (Optional)</h2>
        <p className="text-gray-600 mt-2">
          Bulk import student and teacher data using a CSV file. You can skip this and add users manually later.
        </p>
      </div>

      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {uploadComplete && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Onboarding complete! Your school is now set up and ready to use.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* File Upload Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Import Data
            </h3>

            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile) {
                  handleFileChange({
                    target: { files: [droppedFile] },
                  } as any);
                }
              }}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-900 font-medium">
                Drag and drop your CSV file here
              </p>
              <p className="text-gray-600 text-sm mt-1">
                or click to browse
              </p>
              <p className="text-gray-500 text-xs mt-3">
                CSV files up to 5MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* File Info */}
          {fileName && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">{fileName}</p>
                  <p className="text-sm text-gray-600">
                    {(form.watch('csvFile')?.size || 0) / 1024 < 1024
                      ? `${((form.watch('csvFile')?.size || 0) / 1024).toFixed(1)} KB`
                      : `${((form.watch('csvFile')?.size || 0) / (1024 * 1024)).toFixed(1)} MB`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CSV Format Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">
              CSV File Format
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              Your CSV file should contain the following columns:
            </p>
            <div className="bg-white rounded p-3 font-mono text-xs overflow-x-auto">
              <div className="text-gray-600">
                <div>firstName,lastName,email,role,class</div>
                <div className="text-gray-400 mt-2">John,Doe,john.doe@example.com,student,SS1</div>
                <div className="text-gray-400">Jane,Smith,jane.smith@example.com,teacher,</div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              For students: role=&quot;student&quot;, class=class name (e.g., SS1A)<br/>
              For teachers: role=&quot;teacher&quot;, class can be empty
            </p>
          </div>

          {/* Skip Option */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Can't find the file?</strong> Don't worry! You can skip this step 
              and add users manually later from the admin dashboard.
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
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onNext({ csvFile: undefined })}
                disabled={isLoading}
              >
                Skip & Complete
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !fileName}
              >
                {isLoading ? 'Uploading...' : 'Upload & Complete'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </Card>
  );
};
