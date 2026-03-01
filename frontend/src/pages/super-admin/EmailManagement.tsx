import React, { useState, useEffect } from 'react';
import {
  Mail,
  Plus,
  Send,
  Settings,
  Users,
  FileText,
  BarChart3,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Download,
  Upload,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import axios from 'axios';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: 'DRAFT' | 'SENDING' | 'SENT' | 'FAILED';
  recipientSegment: string;
  sentAt?: Date;
  sentCount: number;
  createdAt: Date;
}

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  source: string;
  isActive: boolean;
  createdAt: Date;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  category?: string;
  isActive: boolean;
}

export default function EmailManagement() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'subscribers' | 'inbox' | 'templates' | 'settings'>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    htmlBody: '',
    templateId: '',
    recipientSegment: 'ALL',
  });

  const [subscriberFormData, setSubscriberFormData] = useState({
    email: '',
    name: '',
    source: 'MANUAL',
  });

  useEffect(() => {
    loadCampaigns();
    loadSubscribers();
    loadTemplates();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/super-admin/email/campaigns', {
        params: { skip: 0, take: 20 },
      });
      if (response.data.success) {
        setCampaigns(response.data.data);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscribers = async () => {
    try {
      const response = await axios.get('/api/super-admin/email/subscribers', {
        params: { skip: 0, take: 20, status: 'all' },
      });
      if (response.data.success) {
        setSubscribers(response.data.data);
      }
    } catch (error) {
      console.error('Error loading subscribers:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await axios.get('/api/super-admin/email/templates');
      if (response.data.success) {
        setTemplates(response.data.data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/super-admin/email/campaigns', formData);
      if (response.data.success) {
        setCampaigns([response.data.data, ...campaigns]);
        setShowCreateModal(false);
        setFormData({
          name: '',
          subject: '',
          body: '',
          htmlBody: '',
          templateId: '',
          recipientSegment: 'ALL',
        });
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      const response = await axios.post(`/api/super-admin/email/campaigns/${campaignId}/send`);
      if (response.data.success) {
        loadCampaigns();
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        const response = await axios.delete(`/api/super-admin/email/campaigns/${campaignId}`);
        if (response.data.success) {
          setCampaigns(campaigns.filter((c) => c.id !== campaignId));
        }
      } catch (error) {
        console.error('Error deleting campaign:', error);
      }
    }
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/super-admin/email/subscribers', subscriberFormData);
      if (response.data.success) {
        setSubscribers([response.data.data, ...subscribers]);
        setSubscriberFormData({ email: '', name: '', source: 'MANUAL' });
      }
    } catch (error) {
      console.error('Error adding subscriber:', error);
    }
  };

  const handleToggleSubscriber = async (subscriberId: string) => {
    try {
      const response = await axios.patch(
        `/api/super-admin/email/subscribers/${subscriberId}/status`
      );
      if (response.data.success) {
        loadSubscribers();
      }
    } catch (error) {
      console.error('Error toggling subscriber:', error);
    }
  };

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (confirm('Are you sure you want to delete this subscriber?')) {
      try {
        const response = await axios.delete(
          `/api/super-admin/email/subscribers/${subscriberId}`
        );
        if (response.data.success) {
          setSubscribers(subscribers.filter((s) => s.id !== subscriberId));
        }
      } catch (error) {
        console.error('Error deleting subscriber:', error);
      }
    }
  };

  const handleUploadSubscribers = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation for CSV upload
    setShowUploadModal(false);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-800';
      case 'SENDING':
        return 'bg-blue-100 text-blue-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircle className="w-4 h-4" />;
      case 'SENDING':
        return <Clock className="w-4 h-4" />;
      case 'FAILED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage campaigns, subscribers, and email communications
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {[
              { id: 'campaigns', label: 'Campaigns', icon: Send },
              { id: 'subscribers', label: 'Subscribers', icon: Users },
              { id: 'inbox', label: 'Inbox', icon: Mail },
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon as any;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="animate-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Email Campaigns</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                New Campaign
              </button>
            </div>

            {/* Campaign Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Campaigns', value: campaigns.length, color: 'purple' },
                {
                  label: 'Sent',
                  value: campaigns.filter((c) => c.status === 'SENT').length,
                  color: 'green',
                },
                {
                  label: 'Drafts',
                  value: campaigns.filter((c) => c.status === 'DRAFT').length,
                  color: 'gray',
                },
                {
                  label: 'Total Recipients',
                  value: campaigns.reduce((sum, c) => sum + c.sentCount, 0),
                  color: 'blue',
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className={`p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all`}
                >
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-2 bg-gradient-to-r from-${stat.color}-600 to-${stat.color}-400 bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Campaigns List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                </div>
              </div>

              {campaigns.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No campaigns yet. Create your first campaign to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Campaign Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Segment
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Sent
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => (
                        <tr
                          key={campaign.id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {campaign.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {campaign.subject}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                              {campaign.recipientSegment}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                campaign.status
                              )}`}
                            >
                              {getStatusIcon(campaign.status)}
                              {campaign.status}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {campaign.sentCount} / {subscribers.length}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {campaign.status === 'DRAFT' && (
                                <>
                                  <button
                                    onClick={() => handleSendCampaign(campaign.id)}
                                    className="p-2 hover:bg-green-50 text-green-600 rounded transition-colors"
                                    title="Send Campaign"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                  <button
                                    className="p-2 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                                    title="Edit Campaign"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteCampaign(campaign.id)}
                                className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
                                title="Delete Campaign"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscribers Tab */}
        {activeTab === 'subscribers' && (
          <div className="animate-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Subscribers</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Bulk Import
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Subscriber
                </button>
              </div>
            </div>

            {/* Subscriber Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Subscribers', value: subscribers.length, color: 'purple' },
                {
                  label: 'Active',
                  value: subscribers.filter((s) => s.isActive).length,
                  color: 'green',
                },
                {
                  label: 'Inactive',
                  value: subscribers.filter((s) => !s.isActive).length,
                  color: 'red',
                },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
                >
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-2 bg-gradient-to-r from-${stat.color}-600 to-${stat.color}-400 bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Add Subscriber Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Subscriber</h3>
              <form onSubmit={handleAddSubscriber} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={subscriberFormData.email}
                      onChange={(e) =>
                        setSubscriberFormData({ ...subscriberFormData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="subscriber@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={subscriberFormData.name}
                      onChange={(e) =>
                        setSubscriberFormData({ ...subscriberFormData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source
                    </label>
                    <select
                      value={subscriberFormData.source}
                      onChange={(e) =>
                        setSubscriberFormData({ ...subscriberFormData, source: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="MANUAL">Manual</option>
                      <option value="BLOG">Blog</option>
                      <option value="SCHOOL">School</option>
                      <option value="IMPORT">Import</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Add Subscriber
                </button>
              </form>
            </div>

            {/* Subscribers List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search subscribers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                </div>
              </div>

              {subscribers.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No subscribers yet. Add your first subscriber to get started.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Source
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((subscriber) => (
                        <tr
                          key={subscriber.id}
                          className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {subscriber.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {subscriber.name || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                              {subscriber.source}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                subscriber.isActive
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-gray-50 text-gray-600'
                              }`}
                            >
                              {subscriber.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleSubscriber(subscriber.id)}
                                className="p-2 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                                title={subscriber.isActive ? 'Deactivate' : 'Activate'}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubscriber(subscriber.id)}
                                className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Inbox Tab */}
        {activeTab === 'inbox' && (
          <div className="animate-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Email Inbox</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Incoming emails from AWS S3 will appear here.</p>
              <p className="text-sm mt-2">Configure AWS S3 SES receipt rule to enable email forwarding.</p>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="animate-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Email Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.length === 0 ? (
                <div className="col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No templates yet. Create your first template to get started.</p>
                </div>
              ) : (
                templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-2 truncate">{template.subject}</p>
                    {template.category && (
                      <span className="inline-block mt-3 px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded">
                        {template.category}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="animate-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Email Settings</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">AWS Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AWS Region
                    </label>
                    <input
                      type="text"
                      defaultValue="us-east-1"
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      S3 Bucket Name
                    </label>
                    <input
                      type="text"
                      defaultValue="results-pro-email-inbox"
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SES From Email
                    </label>
                    <input
                      type="email"
                      defaultValue="noreply@resultspro.ng"
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Email Rate Limiting</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delay Between Emails (ms)
                    </label>
                    <input
                      type="number"
                      defaultValue="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Default: 100ms to avoid AWS SES throttling limits
                    </p>
                  </div>
                </div>
              </div>

              <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create New Campaign</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Summer Promo 2026"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Important Update"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Body *
                </label>
                <textarea
                  required
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-32"
                  placeholder="Message content..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Segment
                </label>
                <select
                  value={formData.recipientSegment}
                  onChange={(e) => setFormData({ ...formData, recipientSegment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ALL">All Subscribers</option>
                  <option value="SCHOOL">Schools Only</option>
                  <option value="BLOG">Blog Subscribers</option>
                  <option value="ACTIVE">Active Only</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Create Campaign
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Subscribers Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Bulk Import Subscribers</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubscribers} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Drag and drop CSV file here or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Format: email, name (headers optional)
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
