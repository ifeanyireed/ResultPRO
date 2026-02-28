import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Upload } from 'lucide-react';
import { LoadingSpinner, InlineLoadingSpinner } from '@/components/LoadingSpinner';

interface TeacherSignature {
  classId: string;
  className: string;
  teacherName: string;
  teacherSignatureUrl?: string;
}

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
  const [principalName, setPrincipalName] = useState(initialData?.principalName || '');
  const [principalSignatureUrl, setPrincipalSignatureUrl] = useState<string | null>(
    initialData?.principalSignatureUrl || null
  );
  const [principalS3Key, setPrincipalS3Key] = useState<string | null>(
    initialData?.principalS3Key || null
  );
  const [teacherSignatures, setTeacherSignatures] = useState<TeacherSignature[]>(
    initialData?.staffData || []
  );
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
        console.log('Fetching classes with token:', token ? 'Present' : 'Missing');
        const response = await axios.get('http://localhost:5000/api/onboarding/classes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Classes response:', response.data);
        const fetchedClasses = response.data.data?.classes || [];
        console.log('Fetched classes:', fetchedClasses);
        setClasses(fetchedClasses);

        // Initialize teacher signatures for each class if not already present
        if (teacherSignatures.length === 0 && fetchedClasses.length > 0) {
          const initialized = fetchedClasses.map((cls: any) => ({
            classId: cls.id,
            className: cls.name,
            teacherName: '',
            teacherSignatureUrl: null,
          }));
          setTeacherSignatures(initialized);
        }
      } catch (error) {
        console.error('Failed to fetch classes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load classes',
          variant: 'destructive',
        });
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [toast]);

  // Update teacher signatures when initialData changes (page reload)
  useEffect(() => {
    if (initialData?.staffData && initialData.staffData.length > 0) {
      setTeacherSignatures(initialData.staffData);
    }
  }, [initialData?.staffData]);

  const handlePrincipalNameChange = async (name: string) => {
    setPrincipalName(name);
    // Real-time save
    try {
      await axios.patch(
        'http://localhost:5000/api/results-setup/staff-data',
        {
          principalName: name,
          principalSignatureUrl,
          principalS3Key,
          staffData: teacherSignatures,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('accessToken')}`,
          },
        }
      );
    } catch (error) {
      console.error('Failed to save principal name:', error);
    }
  };

  const handleTeacherNameChange = async (classId: string, teacherName: string) => {
    const updated = teacherSignatures.map(sig =>
      sig.classId === classId ? { ...sig, teacherName } : sig
    );
    setTeacherSignatures(updated);

    // Real-time save
    try {
      await axios.patch(
        'http://localhost:5000/api/results-setup/staff-data',
        {
          principalName,
          principalSignatureUrl,
          principalS3Key,
          staffData: updated,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('accessToken')}`,
          },
        }
      );
    } catch (error) {
      console.error('Failed to save teacher name:', error);
    }
  };

  const handleSignatureUpload = async (
    file: File,
    signatureType: 'principal' | 'teacher',
    classId?: string
  ) => {
    try {
      setUploading(signatureType === 'principal' ? 'principal' : classId || '');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signatureType', signatureType);
      if (classId) {
        formData.append('classId', classId);
      }

      const response = await axios.post(
        'http://localhost:5000/api/results-setup/upload-signature',
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('accessToken')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        const signatureUrl = response.data.s3Url;
        const s3Key = response.data.s3Key;

        if (signatureType === 'principal') {
          setPrincipalSignatureUrl(signatureUrl);
          setPrincipalS3Key(s3Key);
          // Real-time save
          await axios.patch(
            'http://localhost:5000/api/results-setup/staff-data',
            {
              principalName,
              principalSignatureUrl: signatureUrl,
              principalS3Key: s3Key,
              staffData: teacherSignatures,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('accessToken')}`,
              },
            }
          );
        } else if (classId) {
          const updated = teacherSignatures.map(sig =>
            sig.classId === classId ? { ...sig, teacherSignatureUrl: signatureUrl } : sig
          );
          setTeacherSignatures(updated);
          // Real-time save
          await axios.patch(
            'http://localhost:5000/api/results-setup/staff-data',
            {
              principalName,
              principalSignatureUrl,
              principalS3Key,
              staffData: updated,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('accessToken')}`,
              },
            }
          );
        }

        toast({
          title: 'Success',
          description: `${signatureType === 'principal' ? 'Principal' : 'Teacher'} signature uploaded`,
        });
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to upload signature',
        variant: 'destructive',
      });
    } finally {
      setUploading(null);
    }
  };

  const onSubmit = async () => {
    try {
      setSubmitError(null);

      if (!principalName.trim()) {
        setSubmitError('Principal name is required');
        return;
      }

      if (!principalSignatureUrl) {
        setSubmitError('Principal signature is required');
        return;
      }

      const allTeachersComplete = teacherSignatures.every(sig => sig.teacherName && sig.teacherSignatureUrl);
      if (!allTeachersComplete) {
        setSubmitError('All teachers must have name and signature');
        return;
      }

      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');

      const payload = {
        ...sessionTermData,
        principalName,
        principalSignatureUrl,
        principalS3Key,
        staffData: teacherSignatures,
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
          description: 'Staff uploads completed',
        });
        await onNext(response.data.data);
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to save staff uploads';
      setSubmitError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  if (loadingClasses) {
    return (
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-white">Staff Uploads</h2>
        <div className="text-center text-gray-400">Loading classes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Staff Uploads</h2>
        <p className="text-gray-400 text-sm">
          Add principal details and assign form teachers with their signatures
        </p>
      </div>

      {submitError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{submitError}</p>
        </div>
      )}

      {/* Principal Section */}
      <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Principal</h3>

        {/* Principal Name */}
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Principal Name *</label>
          <input
            type="text"
            value={principalName}
            onChange={(e) => handlePrincipalNameChange(e.target.value)}
            placeholder="Enter principal name"
            className="w-full px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Principal Signature */}
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Principal Signature *</label>
          {principalSignatureUrl ? (
            <div className="space-y-3">
              <div className="border border-[rgba(255,255,255,0.1)] rounded-lg p-4 bg-[rgba(255,255,255,0.02)]">
                <img
                  src={principalSignatureUrl}
                  alt="Principal signature"
                  className="h-32 object-contain mx-auto"
                />
              </div>
              <button
                onClick={() =>
                  document.getElementById('principal-sig-upload')?.click()
                }
                disabled={uploading === 'principal'}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center justify-center gap-2"
              >
                {uploading === 'principal' ? (
                  <>
                    <InlineLoadingSpinner size="sm" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Change Signature
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={() =>
                document.getElementById('principal-sig-upload')?.click()
              }
              disabled={uploading === 'principal'}
              className="w-full py-3 px-4 border-2 border-dashed border-[rgba(255,255,255,0.2)] rounded-lg text-gray-300 hover:border-[rgba(255,255,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {uploading === 'principal' ? (
                <>
                  <InlineLoadingSpinner size="md" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Principal Signature
                </>
              )}
            </button>
          )}
          <input
            id="principal-sig-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleSignatureUpload(e.target.files[0], 'principal');
              }
            }}
            hidden
          />
        </div>
      </div>

      {/* Teachers Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Form Teachers by Class</h3>

        {teacherSignatures.length === 0 ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-200 space-y-3">
            <p>No classes found. Please complete the onboarding process and create classes first.</p>
            <p className="text-sm text-yellow-200/70">Classes found: {classes.length}</p>
            <button
              type="button"
              onClick={async () => {
                try {
                  const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
                  const response = await axios.post(
                    'http://localhost:5000/api/results-setup/debug/create-sample-classes',
                    {},
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );
                  if (response.data.success) {
                    toast({
                      title: 'Success',
                      description: 'Sample classes created! Refresh to see them.',
                    });
                    // Reload classes
                    window.location.reload();
                  }
                } catch (error: any) {
                  console.error('Failed to create sample classes:', error);
                  toast({
                    title: 'Error',
                    description: error.response?.data?.error || 'Failed to create sample classes',
                    variant: 'destructive',
                  });
                }
              }}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
            >
              Create Sample Classes (Debug)
            </button>
          </div>
        ) : (
          teacherSignatures.map((teacher) => (
            <div
              key={teacher.classId}
              className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-lg p-6 space-y-4"
            >
              <h4 className="font-medium text-white">{teacher.className}</h4>

            {/* Teacher Name */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Form Teacher Name *</label>
              <input
                type="text"
                value={teacher.teacherName}
                onChange={(e) => handleTeacherNameChange(teacher.classId, e.target.value)}
                placeholder="Enter teacher name"
                className="w-full px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Teacher Signature */}
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Teacher Signature *</label>
              {teacher.teacherSignatureUrl ? (
                <div className="space-y-3">
                  <div className="border border-[rgba(255,255,255,0.1)] rounded-lg p-4 bg-[rgba(255,255,255,0.02)]">
                    <img
                      src={teacher.teacherSignatureUrl}
                      alt={`${teacher.className} signature`}
                      className="h-32 object-contain mx-auto"
                    />
                  </div>
                  <button
                    onClick={() =>
                      document.getElementById(`teacher-sig-${teacher.classId}`)?.click()
                    }
                    disabled={uploading === teacher.classId}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg flex items-center justify-center gap-2"
                  >
                    {uploading === teacher.classId ? (
                      <>
                        <InlineLoadingSpinner size="sm" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Change Signature
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() =>
                    document.getElementById(`teacher-sig-${teacher.classId}`)?.click()
                  }
                  disabled={uploading === teacher.classId}
                  className="w-full py-3 px-4 border-2 border-dashed border-[rgba(255,255,255,0.2)] rounded-lg text-gray-300 hover:border-[rgba(255,255,255,0.4)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading === teacher.classId ? (
                    <>
                      <InlineLoadingSpinner size="md" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Teacher Signature
                    </>
                  )}
                </button>
              )}
              <input
                id={`teacher-sig-${teacher.classId}`}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleSignatureUpload(e.target.files[0], 'teacher', teacher.classId);
                  }
                }}
                hidden
              />
            </div>
          </div>
          ))
        )}
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
          onClick={onSubmit}
          disabled={isLoading || uploading !== null}
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Next: Assign Students'}
        </Button>
      </div>
    </div>
  );
};
