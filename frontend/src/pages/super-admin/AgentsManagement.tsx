import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import {
  Plus,
  Search,
  MoreVertical,
  Download01,
  Upload01,
  Trash01,
  Shield,
  Eye,
  Edit02,
  ChevronDown,
} from '@/lib/hugeicons-compat';
import { agentAPI } from '@/lib/api-user-management';
import { Agent, BulkInvitePayload } from '@/types/user-management';

const AgentsManagement: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterTier, setFilterTier] = useState<string>('ALL');

  // Load agents
  useEffect(() => {
    loadAgents();
  }, [page, searchTerm, filterStatus, filterTier]);

  const loadAgents = async () => {
    try {
      setLoading(true);
      const response = await agentAPI.listAgents(page, 20, {
        search: searchTerm,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        tier: filterTier !== 'ALL' ? filterTier : undefined,
      });

      const agentsData = Array.isArray(response) ? response : (response.data || []);
      setAgents(agentsData as Agent[]);
      const pages = Array.isArray(response) ? 1 : (response.pagination?.pages || 1);
      setTotalPages(pages);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (agentId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      await agentAPI.toggleAgentStatus(agentId, newStatus as any);
      loadAgents();
    } catch (error) {
      console.error('Failed to update agent status:', error);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      try {
        await agentAPI.deleteAgent(agentId);
        loadAgents();
      } catch (error) {
        console.error('Failed to delete agent:', error);
      }
    }
  };

  const handleBulkInvite = async (emails: string[], specialization: string) => {
    try {
      const payload: BulkInvitePayload = {
        emails,
        role: 'AGENT',
        department: specialization,
        message: `You have been invited to join ResultsPRO as an Agent with specialization: ${specialization}`,
      };

      const result = await agentAPI.bulkInviteAgents(payload);
      setShowBulkModal(false);
      loadAgents();

      alert(`Successfully invited ${result.data.success} agents. ${result.data.failed} failed.`);
    } catch (error) {
      console.error('Failed to bulk invite agents:', error);
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
        const specializationIndex = headers.indexOf('specialization');

        if (emailIndex === -1 || specializationIndex === -1) {
          alert('CSV must have "email" and "specialization" columns');
          return;
        }

        const emails = lines.slice(1).map((line) => line.split(',')[emailIndex]?.trim()).filter(Boolean);
        const specializations = lines.slice(1).map((line) => line.split(',')[specializationIndex]?.trim()).filter(Boolean);

        if (emails.length > 0) {
          await handleBulkInvite(emails, specializations[0] || 'General');
        }
      } catch (error) {
        console.error('Failed to process CSV:', error);
        alert('Failed to process CSV file');
      }
    };
    reader.readAsText(file);
  };

  const filteredAgents = agents.filter((agent) =>
    agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agent.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    agent.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Agents Management</h1>
            <p className="text-gray-400">Manage agents, assignments, and permissions</p>
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
              Add Agent
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Total Agents</p>
            <p className="text-3xl font-bold text-white">{agents.length}</p>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Active</p>
            <p className="text-3xl font-bold text-green-400">
              {agents.filter((a) => a.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Suspended</p>
            <p className="text-3xl font-bold text-red-400">
              {agents.filter((a) => a.status === 'SUSPENDED').length}
            </p>
          </div>
          <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Pro Tier</p>
            <p className="text-3xl font-bold text-purple-400">
              {agents.filter((a) => a.subscriptionTier === 'Pro').length}
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents by name, email, or specialization..."
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

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="ALL">All Tiers</option>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>

        {/* Agents Table */}
        <div className="relative rounded-[30px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.07)] bg-white/5">
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Agent Name</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Email</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Specialization</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Tier</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Earnings</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Status</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      Loading agents...
                    </td>
                  </tr>
                ) : filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      No agents found
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => (
                    <tr key={agent.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-white/5">
                      <td className="py-4 px-6 text-white font-medium">
                        {agent.firstName} {agent.lastName || ''}
                      </td>
                      <td className="py-4 px-6 text-gray-400 text-sm">{agent.email}</td>
                      <td className="py-4 px-6 text-gray-300">{agent.specialization}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            agent.subscriptionTier === 'Enterprise'
                              ? 'bg-purple-500/20 text-purple-300'
                              : agent.subscriptionTier === 'Pro'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-gray-500/20 text-gray-300'
                          }`}
                        >
                          {agent.subscriptionTier}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-white">₦{agent.totalCommissionEarned.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            agent.status === 'ACTIVE'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {agent.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedAgent(agent);
                              setShowPermissionModal(true);
                            }}
                            title="Manage Permissions"
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(agent.id, agent.status)}
                            title={agent.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            className={agent.status === 'ACTIVE' ? 'text-yellow-400' : 'text-green-400'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAgent(agent.id)}
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
      {showBulkModal && <BulkInviteModal onClose={() => setShowBulkModal(false)} onInvite={handleBulkInvite} onCSVUpload={handleCSVUpload} />}

      {/* Permission Management Modal */}
      {showPermissionModal && selectedAgent && (
        <PermissionModal
          agent={selectedAgent}
          onClose={() => {
            setShowPermissionModal(false);
            setSelectedAgent(null);
          }}
          onSave={() => {
            setShowPermissionModal(false);
            loadAgents();
          }}
        />
      )}
    </SuperAdminLayout>
  );
};

interface BulkInviteModalProps {
  onClose: () => void;
  onInvite: (emails: string[], specialization: string) => Promise<void>;
  onCSVUpload: (file: File) => Promise<void>;
}

const BulkInviteModal: React.FC<BulkInviteModalProps> = ({ onClose, onInvite, onCSVUpload }) => {
  const [emailText, setEmailText] = useState('');
  const [specialization, setSpecialization] = useState('General');
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
      await onInvite(emails, specialization);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-[20px] p-8 max-w-md w-full border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Bulk Invite Agents</h2>

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
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Upload01 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-400">Click to upload CSV or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">CSV must have "email" and "specialization" columns</p>
            </label>
          </div>

          <div className="text-center text-gray-500">or</div>

          {/* Manual Entry */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Specialization</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
            >
              <option>General</option>
              <option>Setup</option>
              <option>Training</option>
              <option>Maintenance</option>
              <option>Full-Stack</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Addresses (one per line)</label>
            <textarea
              value={emailText}
              onChange={(e) => setEmailText(e.target.value)}
              placeholder="agent1@example.com&#10;agent2@example.com"
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
  agent: Agent;
  onClose: () => void;
  onSave: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ agent, onClose, onSave }) => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const allPermissions = [
    { id: 'VIEW_REFERRALS', label: 'View Referrals' },
    { id: 'MANAGE_EARNINGS', label: 'Manage Earnings' },
    { id: 'WITHDRAW_FUNDS', label: 'Withdraw Funds' },
    { id: 'VIEW_LEADERBOARD', label: 'View Leaderboard' },
    { id: 'EDIT_PROFILE', label: 'Edit Profile' },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await agentAPI.updateAgentPermissions(agent.id, permissions);
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-[20px] p-8 max-w-md w-full border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Agent Permissions</h2>
        <p className="text-gray-400 mb-6">{agent.email}</p>

        <div className="space-y-3 mb-6">
          {allPermissions.map((perm) => (
            <label key={perm.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
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

export default AgentsManagement;
