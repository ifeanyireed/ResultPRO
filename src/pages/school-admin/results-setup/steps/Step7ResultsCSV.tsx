import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Upload02, Download01, AlertCircle } from '@hugeicons/react';

interface Step7Props {
  onNext: (data: any) => Promise<void>;
  onPrevious: () => void;
  initialData?: any;
  isLoading?: boolean;
  sessionTermData?: any;
}

export const Step7ResultsCSV = ({
  onNext,
  onPrevious,
  initialData,
  isLoading = false,
  sessionTermData,
}: Step7Props) => {
  const { toast } = useToast();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      const response = await axios.get(
        'http://localhost:5000/api/results-setup/csv-template',
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'results-template.csv');
      document.body.appendChild(link);
      link.click();
      link.parentElement?.removeChild(link);
    } catch (error) {
      console.error('Failed to download template:', error);
      toast({
        title: 'Error',
        description: 'Failed to download template',
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setCsvFile(file);
      
      // Parse CSV for preview
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const rows = lines.slice(1, 6).map(line => line.split(','));
      
      setPreview({
        headers,
        rows: rows.filter(r => r.some(cell => cell.trim())),
      });
    } catch (error) {
      console.error('Failed to read file:', error);
      toast({
        title: 'Error',
        description: 'Failed to read CSV file',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      if (!csvFile) {
        setSubmitError('Please select a CSV file');
        return;
      }

      setUploading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');

      const formData = new FormData();
      formData.append('csvFile', csvFile);
      formData.append('sessionId', sessionTermData?.sessionId);
      formData.append('termId', sessionTermData?.termId);

      const response = await axios.post(
        'http://localhost:5000/api/results-setup/step/7',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Results CSV uploaded and processed successfully',
        });
        await onNext(response.data.data);
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to upload results CSV';
      setSubmitError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Results CSV Upload
        </h2>
        <p className="text-gray-400 text-sm">
          Upload a CSV file containing student results and scores
        </p>
      </div>

      {submitError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{submitError}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Download Template */}
        <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold mb-1">CSV Template</h3>
              <p className="text-gray-400 text-sm">Download the template to see the required format</p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download01 className="w-4 h-4" />
              Download Template
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="text-gray-300 text-sm font-medium mb-3 block">Upload Results CSV *</label>
          <div
            className="border-2 border-dashed border-[rgba(255,255,255,0.2)] rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file?.name.endsWith('.csv')) {
                handleFileSelect(file);
              } else {
                toast({
                  title: 'Error',
                  description: 'Please select a CSV file',
                  variant: 'destructive',
                });
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {csvFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="text-green-400">✓</div>
                <p className="text-white text-sm font-medium">{csvFile.name}</p>
                <p className="text-gray-500 text-xs">{(csvFile.size / 1024).toFixed(2)} KB</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-400 hover:text-blue-300 text-xs mt-2"
                >
                  Choose Different File
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-2">
                <Upload02 className="w-10 h-10 text-gray-400" />
                <span className="text-gray-300 text-sm">Click to upload or drag and drop</span>
                <span className="text-gray-500 text-xs">CSV files only</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Preview */}
        {preview && preview.headers && (
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-lg p-4">
            <h3 className="text-white text-sm font-semibold mb-3">Preview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {preview.headers.map((header, idx) => (
                      <th key={idx} className="px-3 py-2 text-left text-gray-400 font-medium text-xs">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, idx) => (
                    <tr key={idx} className="border-t border-[rgba(255,255,255,0.05)]">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-3 py-2 text-gray-300 text-xs">
                          {cell.trim()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-[rgba(255,255,255,0.07)] pt-8 flex gap-4 justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isLoading || uploading}
          className="bg-transparent border-[rgba(255,255,255,0.2)] text-gray-300 hover:bg-white/5 hover:text-white"
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || uploading || !csvFile}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {uploading ? 'Uploading...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
};
