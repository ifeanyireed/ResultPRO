import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Plus, Trash01 } from '@hugeicons/react';

interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  className: string;
}

interface Step6Props {
  onNext: (data: any) => Promise<void>;
  onPrevious: () => void;
  initialData?: any;
  isLoading?: boolean;
  sessionTermData?: any;
}

export const Step6AssignStudents = ({
  onNext,
  onPrevious,
  initialData,
  isLoading = false,
  sessionTermData,
}: Step6Props) => {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>(initialData?.students || []);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
        const response = await axios.get('http://localhost:5000/api/onboarding/classes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClasses(response.data.data?.classes || []);
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

  // Fetch students when class changes
  useEffect(() => {
    if (selectedClass) {
      const fetchStudents = async () => {
        try {
          const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
          const response = await axios.get(
            `http://localhost:5000/api/results-setup/classes/${selectedClass}/students`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setClassStudents(response.data.data?.students || []);
        } catch (error) {
          console.error('Failed to fetch students:', error);
          toast({
            title: 'Error',
            description: 'Failed to load students',
            variant: 'destructive',
          });
        }
      };
      fetchStudents();
    }
  }, [selectedClass, toast]);

  const addStudent = (student: Student) => {
    if (!students.find(s => s.id === student.id)) {
      setStudents([...students, student]);
    }
  };

  const removeStudent = (studentId: string) => {
    setStudents(students.filter(s => s.id !== studentId));
  };

  const handleSubmit = async () => {
    try {
      setSubmitError(null);
      if (students.length === 0) {
        setSubmitError('Please assign at least one student');
        return;
      }

      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');

      const payload = {
        ...sessionTermData,
        students: students.map(s => s.id),
      };

      const response = await axios.post(
        'http://localhost:5000/api/results-setup/step/6',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: `${students.length} students assigned`,
        });
        await onNext(response.data.data);
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to assign students';
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="rounded-lg bg-[rgba(255,255,255,0.02)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Assign Students
            </h2>
            <p className="text-gray-400 text-sm">
              Select students from each class to participate in this results session
            </p>
          </div>

          {submitError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{submitError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Available Students */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Available Students</h3>
              
              <div className="mb-4">
                <label className="text-gray-300 text-sm">Select Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  disabled={loadingClasses}
                  className="w-full px-4 py-2 mt-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white rounded-lg focus:outline-none focus:border-blue-400"
                >
                  <option value="">Select a class...</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {classStudents.length === 0 ? (
                  <p className="text-gray-500 text-sm">No students available</p>
                ) : (
                  classStudents.map(student => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-gray-500 text-xs">{student.admissionNumber}</p>
                      </div>
                      <button
                        onClick={() => addStudent(student)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Assigned Students */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Assigned Students ({students.length})
              </h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.length === 0 ? (
                  <p className="text-gray-500 text-sm">No students assigned yet</p>
                ) : (
                  students.map(student => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-[rgba(34, 197, 94, 0.1)] border border-emerald-400/20 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-gray-500 text-xs">{student.admissionNumber}</p>
                      </div>
                      <button
                        onClick={() => removeStudent(student.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash01 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
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
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Saving...' : 'Next: Results CSV'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
