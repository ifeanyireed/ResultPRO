import React, { useState, useEffect } from 'react';
import SchoolAdminLayout from '@/components/SchoolAdminLayout';
import {
  Plus,
  Search,
  MoreVertical,
  Upload01,
  Trash01,
  Shield,
  Eye,
  Edit02,
} from '@/lib/hugeicons-compat';
import { teacherAPI } from '@/lib/api-user-management';
import { Teacher, BulkInvitePayload } from '@/types/user-management';
import { useParams } from 'react-router-dom';

const TeachersManagement: React.FC = () => {
  const { schoolId = '' } = useParams();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Load teachers
  useEffect(() => {
    loadTeachers();
  }, [page, searchTerm, filterStatus]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const schoolId = localStorage.getItem('schoolId') || '';
      const response = await teacherAPI.listTeachers(schoolId, page, 20, {
        search: searchTerm,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
      });

      const teachersData = Array.isArray(response) ? response : (response.data || []);
      setTeachers(teachersData as Teacher[]);
      const pages = Array.isArray(response) ? 1 : (response.pagination?.pages || 1);
      setTotalPages(pages);
    } catch (error) {
      console.error('Failed to load teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (teacherId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await teacherAPI.toggleTeacherStatus(teacherId, newStatus as any);
      loadTeachers();
    } catch (error) {
      console.error('Failed to update teacher status:', error);
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
      try {
        await teacherAPI.deleteTeacher(teacherId);
        loadTeachers();
      } catch (error) {
        console.error('Failed to delete teacher:', error);
      }
    }
  };

  const handleBulkInvite = async (emails: string[], subject: string) => {
    try {
      const schoolId = localStorage.getItem('schoolId') || '';
      const payload: BulkInvitePayload = {
        emails,
        role: 'TEACHER',
        schoolId,
        message: `You have been invited to teach ${subject}.`,
      };

      const result = await teacherAPI.bulkInviteTeachers(payload);
      setShowBulkModal(false);
      loadTeachers();

      alert(`Successfully invited ${result.data.success} teachers. ${result.data.failed} failed.`);
    } catch (error) {
      console.error('Failed to bulk invite teachers:', error);
      alert('Failed to send bulk invites');
    }
  };

  const handleCSVUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const emailIndex = headers.indexOf('email');
        const subjectIndex = headers.indexOf('subject');

        if (emailIndex === -1 || subjectIndex === -1) {
          alert('CSV must have "email" and "subject" columns');
          return;
        }

        const emails = lines.slice(1).map((line) => line.split(',')[emailIndex]?.trim()).filter(Boolean);
        const subjectList = lines.slice(1).map((line) => line.split(',')[subjectIndex]?.trim()).filter(Boolean);

        if (emails.length > 0) {
          await handleBulkInvite(emails, subjectList[0] || 'General');
        }
      } catch (error) {
        console.error('Failed to process CSV:', error);
        alert('Failed to process CSV file');
      }
    };
    reader.readAsText(file);
  };

  const handleAssignClass = async (teacherId: string, classId: string) => {
    try {
      await teacherAPI.assignClass(teacherId, classId);
      loadTeachers();
    } catch (error) {
      console.error('Failed to assign class:', error);
    }
  };

  const handleAssignSubject = async (teacherId: string, subject: string) => {
    try {
      await teacherAPI.assignSubject(teacherId, subject);
      loadTeachers();
    } catch (error) {
      console.error('Failed to assign subject:', error);
    }
  };

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (teacher.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <SchoolAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Teachers Management</h1>
            <p className="text-gray-400">Manage teachers, subject assignments, and permissions</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-400 font-medium transition-all"
            >
              <Upload01 className="w-5 h-5" />
              Bulk Invite
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Teacher
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Total Teachers</p>
            <p className="text-3xl font-bold text-white">{teachers.length}</p>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Active</p>
            <p className="text-3xl font-bold text-green-400">
              {teachers.filter((t) => t.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Assigned Classes</p>
            <p className="text-3xl font-bold text-blue-400">
              {teachers.filter((t) => t.classId).length}
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search teachers by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        {/* Teachers Table */}
        <div className="relative rounded-[30px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.07)] bg-white/5">
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Teacher Name</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Email</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Subject</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Class</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Status</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      Loading teachers...
                    </td>
                  </tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      No teachers found
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-white/5">
                      <td className="py-4 px-6 text-white font-medium">
                        {teacher.firstName} {teacher.lastName || ''}
                      </td>
                      <td className="py-4 px-6 text-gray-400 text-sm">{teacher.email}</td>
                      <td className="py-4 px-6 text-gray-300">{teacher.subjectId || 'Unassigned'}</td>
                      <td className="py-4 px-6 text-gray-300">{teacher.classId || 'Unassigned'}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            teacher.status === 'ACTIVE'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {teacher.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setShowPermissionModal(true);
                            }}
                            title="Manage Permissions"
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(teacher.id, teacher.status)}
                            title={teacher.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            className={teacher.status === 'ACTIVE' ? 'text-yellow-400' : 'text-green-400'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(teacher.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash01 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 rounded-lg ${
                  page === p
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Bulk Invite Modal */}
      {showBulkModal && (
        <BulkInviteModal
          onClose={() => setShowBulkModal(false)}
          onInvite={handleBulkInvite}
          onCSVUpload={handleCSVUpload}
        />
      )}

      {/* Permission Management Modal */}
      {showPermissionModal && selectedTeacher && (
        <TeacherPermissionModal
          teacher={selectedTeacher}
          onClose={() => {
            setShowPermissionModal(false);
            setSelectedTeacher(null);
          }}
          onSave={() => {
            setShowPermissionModal(false);
            loadTeachers();
          }}
        />
      )}
    </SchoolAdminLayout>
  );
};

interface BulkInviteModalProps {
  onClose: () => void;
  onInvite: (emails: string[], subject: string) => Promise<void>;
  onCSVUpload: (file: File) => Promise<void>;
}

const BulkInviteModal: React.FC<BulkInviteModalProps> = ({ onClose, onInvite, onCSVUpload }) => {
  const [emailText, setEmailText] = useState('');
  const [subject, setSubject] = useState('General');
  const [uploading, setUploading] = useState(false);

  const handleInvite = async () => {
    const emails = emailText
      .split('\n')
      .map((e) => e.trim())
      .filter((e) => e && e.includes('@'));

    if (emails.length === 0) {
      alert('Please enter at least one valid email');
      return;
    }

    setUploading(true);
    try {
      await onInvite(emails, subject);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-[20px] p-8 max-w-md w-full border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Bulk Invite Teachers</h2>

        <div className="space-y-4">
          {/* CSV Upload */}
          <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  onCSVUpload(e.target.files[0]);
                  onClose();
                }
              }}
              className="hidden"
              id="csv-upload-teachers"
            />
            <label htmlFor="csv-upload-teachers" className="cursor-pointer">
              <Upload01 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-400">Click to upload CSV or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">CSV must have "email" and "subject" columns</p>
            </label>
          </div>

          <div className="text-center text-gray-500">or</div>

          {/* Manual Entry */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option>General</option>
              <option>Mathematics</option>
              <option>English</option>
              <option>Science</option>
              <option>History</option>
              <option>Geography</option>
              <option>Economics</option>
              <option>Physical Education</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Addresses (one per line)</label>
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="teacher1@example.com&#10;teacher2@example.com"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 h-32"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleInvite}
              disabled={uploading}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {uploading ? 'Sending...' : 'Invite'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TeacherPermissionModalProps {
  teacher: Teacher;
  onClose: () => void;
  onSave: () => void;
}

const TeacherPermissionModal: React.FC<TeacherPermissionModalProps> = ({
  teacher,
  onClose,
  onSave,
}) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const allPermissions = [
    { id: 'ENTER_RESULTS', label: 'Enter Student Results' },
    { id: 'VIEW_RESULTS', label: 'View Results' },
    { id: 'MANAGE_CLASS', label: 'Manage Class Info' },
    { id: 'UPLOAD_GRADES', label: 'Upload Bulk Grades' },
    { id: 'VIEW_ANALYTICS', label: 'View Analytics' },
    { id: 'EDIT_PROFILE', label: 'Edit Profile' },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await teacherAPI.updatePermissions(teacher.id, permissions);
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-[20px] p-8 max-w-md w-full border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Teacher Permissions</h2>
        <p className="text-gray-400 mb-6">{teacher.email}</p>

        <div className="space-y-3 mb-6">
          {allPermissions.map((perm) => (
            <label
              key={perm.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={permissions.includes(perm.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setPermissions([...permissions, perm.id]);
                  } else {
                    setPermissions(permissions.filter((p) => p !== perm.id));
                  }
                }}
                className="w-4 h-4"
              />
              <span className="text-gray-300">{perm.label}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeachersManagement;
