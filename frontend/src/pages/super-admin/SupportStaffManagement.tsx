import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
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
import { supportStaffAPI } from '@/lib/api-user-management';
import { SupportStaff, BulkInvitePayload } from '@/types/user-management';

const SupportStaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<SupportStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<SupportStaff | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  // Load support staff
  useEffect(() => {
    loadStaff();
  }, [page, searchTerm, filterDepartment, filterLevel]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await supportStaffAPI.listStaff(page, 20, {
        search: searchTerm,
        department: filterDepartment !== 'ALL' ? filterDepartment : undefined,
        permissionLevel: filterLevel !== 'ALL' ? filterLevel : undefined,
      });

      const staffData = Array.isArray(response) ? response : (response.data || []);
      setStaff(staffData as SupportStaff[]);
      const pages = Array.isArray(response) ? 1 : (response.pagination?.pages || 1);
      setTotalPages(pages);
    } catch (error) {
      console.error('Failed to load support staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (staffId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await supportStaffAPI.toggleStaffStatus(staffId, newStatus as any);
      loadStaff();
    } catch (error) {
      console.error('Failed to update staff status:', error);
    }
  };

  const handleUpdatePermissionLevel = async (staffId: string, newLevel: string) => {
    try {
      await supportStaffAPI.updatePermissionLevel(staffId, newLevel);
      loadStaff();
    } catch (error) {
      console.error('Failed to update permission level:', error);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      try {
        await supportStaffAPI.deleteStaffMember(staffId);
        loadStaff();
      } catch (error) {
        console.error('Failed to delete staff member:', error);
      }
    }
  };

  const handleBulkInvite = async (emails: string[], department: string) => {
    try {
      const payload: BulkInvitePayload = {
        emails,
        role: 'SUPPORT_AGENT',
        department,
        message: `You have been invited to join ResultsPRO Support Team in the ${department} department.`,
      };

      const result = await supportStaffAPI.bulkInviteStaff(payload);
      setShowBulkModal(false);
      loadStaff();

      alert(`Successfully invited ${result.data.success} staff members. ${result.data.failed} failed.`);
    } catch (error) {
      console.error('Failed to bulk invite staff:', error);
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
        const departmentIndex = headers.indexOf('department');

        if (emailIndex === -1 || departmentIndex === -1) {
          alert('CSV must have "email" and "department" columns');
          return;
        }

        const emails = lines.slice(1).map((line) => line.split(',')[emailIndex]?.trim()).filter(Boolean);
        const departments = lines.slice(1).map((line) => line.split(',')[departmentIndex]?.trim()).filter(Boolean);

        if (emails.length > 0) {
          await handleBulkInvite(emails, departments[0] || 'Support');
        }
      } catch (error) {
        console.error('Failed to process CSV:', error);
        alert('Failed to process CSV file');
      }
    };
    reader.readAsText(file);
  };

  const filteredStaff = staff.filter((member) =>
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const departments = Array.from(new Set(staff.map((s) => s.department)));

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Support Staff Management</h1>
            <p className="text-gray-400">Manage support team members and permissions</p>
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
              Add Staff
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Total Staff</p>
            <p className="text-3xl font-bold text-white">{staff.length}</p>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Active</p>
            <p className="text-3xl font-bold text-green-400">
              {staff.filter((s) => s.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Departments</p>
            <p className="text-3xl font-bold text-blue-400">{departments.length}</p>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Admin Level</p>
            <p className="text-3xl font-bold text-purple-400">
              {staff.filter((s) => s.permissionLevel === 'ADMIN').length}
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="ALL">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="ALL">All Levels</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="AGENT">Agent</option>
            <option value="VIEWER">Viewer</option>
          </select>
        </div>

        {/* Staff Table */}
        <div className="relative rounded-[30px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.07)] bg-white/5">
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Name</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Email</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Department</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Permission Level</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Tickets</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Status</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      Loading staff...
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No staff members found
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => (
                    <tr key={member.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-white/5">
                      <td className="py-4 px-6 text-white font-medium">
                        {member.firstName} {member.lastName || ''}
                      </td>
                      <td className="py-4 px-6 text-gray-400 text-sm">{member.email}</td>
                      <td className="py-4 px-6 text-gray-300">{member.department}</td>
                      <td className="py-4 px-6">
                        <select
                          value={member.permissionLevel}
                          onChange={(e) => handleUpdatePermissionLevel(member.id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs font-semibold border-0 focus:outline-none cursor-pointer ${
                            member.permissionLevel === 'ADMIN'
                              ? 'bg-red-500/20 text-red-300'
                              : member.permissionLevel === 'MANAGER'
                              ? 'bg-orange-500/20 text-orange-300'
                              : member.permissionLevel === 'AGENT'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-gray-500/20 text-gray-300'
                          }`}
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="MANAGER">Manager</option>
                          <option value="AGENT">Agent</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-white">{member.assignedTicketCount || 0}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            member.status === 'ACTIVE'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedStaff(member);
                              setShowPermissionModal(true);
                            }}
                            title="Manage Permissions"
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(member.id, member.status)}
                            title={member.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            className={member.status === 'ACTIVE' ? 'text-yellow-400' : 'text-green-400'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(member.id)}
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
      {showPermissionModal && selectedStaff && (
        <PermissionModal
          staff={selectedStaff}
          onClose={() => {
            setShowPermissionModal(false);
            setSelectedStaff(null);
          }}
          onSave={() => {
            setShowPermissionModal(false);
            loadStaff();
          }}
        />
      )}
    </SuperAdminLayout>
  );
};

interface BulkInviteModalProps {
  onClose: () => void;
  onInvite: (emails: string[], department: string) => Promise<void>;
  onCSVUpload: (file: File) => Promise<void>;
}

const BulkInviteModal: React.FC<BulkInviteModalProps> = ({ onClose, onInvite, onCSVUpload }) => {
  const [emailText, setEmailText] = useState('');
  const [department, setDepartment] = useState('Support');
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
      await onInvite(emails, department);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-[20px] p-8 max-w-md w-full border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Bulk Invite Support Staff</h2>

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
              id="csv-upload-staff"
            />
            <label htmlFor="csv-upload-staff" className="cursor-pointer">
              <Upload01 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-400">Click to upload CSV or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">CSV must have "email" and "department" columns</p>
            </label>
          </div>

          <div className="text-center text-gray-500">or</div>

          {/* Manual Entry */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option>Support</option>
              <option>Technical</option>
              <option>Billing</option>
              <option>Training</option>
              <option>Quality Assurance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Addresses (one per line)</label>
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="staff1@example.com&#10;staff2@example.com"
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

interface PermissionModalProps {
  staff: SupportStaff;
  onClose: () => void;
  onSave: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ staff, onClose, onSave }) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const allPermissions = [
    { id: 'VIEW_TICKETS', label: 'View Support Tickets' },
    { id: 'MANAGE_TICKETS', label: 'Manage Support Tickets' },
    { id: 'MANAGE_USERS', label: 'Manage Users' },
    { id: 'VIEW_ANALYTICS', label: 'View Analytics' },
    { id: 'MANAGE_SETTINGS', label: 'Manage Settings' },
    { id: 'MANAGE_STAFF', label: 'Manage Other Staff' },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await supportStaffAPI.updatePermissions(staff.id, permissions);
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-[20px] p-8 max-w-md w-full border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Staff Permissions</h2>
        <p className="text-gray-400 mb-2">{staff.email}</p>
        <p className="text-gray-500 text-sm mb-6">Permission Level: {staff.permissionLevel}</p>

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

export default SupportStaffManagement;
