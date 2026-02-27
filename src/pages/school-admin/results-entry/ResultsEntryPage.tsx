import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Plus, Archive, Trash2, Eye, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResultsInstance {
  id: string;
  instanceName: string;
  className: string;
  sessionName: string;
  termName: string;
  status: 'active' | 'archived';
  totalStudents: number;
  createdAt: string;
  createdBy?: string;
  csvFileUrl?: string;
}

interface Class {
  id: string;
  name: string;
}

interface Session {
  id: string;
  name: string;
}

export const ResultsEntryPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [instances, setInstances] = useState<ResultsInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredInstances, setFilteredInstances] = useState<ResultsInstance[]>([]);

  // Filter states
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all'); // all, active, archived

  // Modal states
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [showConfirmArchive, setShowConfirmArchive] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [archiving, setArchiving] = useState<string | null>(null);

  // Load instances and metadata
  useEffect(() => {
    loadInstances();
    loadMetadata();
  }, []);

  // Extract unique sessions from instances
  useEffect(() => {
    if (instances.length > 0) {
      const uniqueSessions = Array.from(
        new Map(
          instances
            .filter(inst => inst.sessionName)
            .map(inst => [inst.sessionName, { id: inst.sessionId, name: inst.sessionName }])
        ).values()
      );
      setSessions(uniqueSessions);
    }
  }, [instances]);

  // Filter instances when filters change
  useEffect(() => {
    let filtered = instances;

    if (selectedClass) {
      filtered = filtered.filter(i => i.className === selectedClass);
    }

    if (selectedSession) {
      filtered = filtered.filter(i => i.sessionName === selectedSession);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(i => i.status === selectedStatus);
    }

    setFilteredInstances(filtered);
  }, [instances, selectedClass, selectedSession, selectedStatus]);

  const loadInstances = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      const response = await axios.get(
        'http://localhost:5000/api/results-setup/instances',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Parse instances and extract class/session names from related objects
        const parsed = response.data.data.map((inst: any) => {
          // Try to find session/term names from sessions list, fallback to stored names, then to IDs
          let sessionName = inst.sessionName;
          let termName = inst.termName;
          
          if (!sessionName && inst.sessionId) {
            sessionName = `Session ${inst.sessionId.slice(0, 8)}`;
          }
          if (!termName && inst.termId) {
            termName = `Term ${inst.termId.slice(0, 8)}`;
          }
          
          return {
            ...inst,
            className: inst.class?.name || inst.classId || 'Unknown',
            sessionName: sessionName || 'Unknown Session',
            termName: termName || 'Unknown Term',
          };
        });
        setInstances(parsed.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error: any) {
      console.error('Error loading instances:', error);
      toast({
        title: 'Error',
        description: 'Failed to load results instances',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      
      // Load classes for this school
      try {
        const classRes = await axios.get(
          `http://localhost:5000/api/onboarding/classes`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (classRes.data.success && Array.isArray(classRes.data.data?.classes)) {
          setClasses(classRes.data.data.classes);
        } else if (classRes.data.data?.classes && Array.isArray(classRes.data.data.classes)) {
          setClasses(classRes.data.data.classes);
        } else {
          setClasses([]);
        }
      } catch (err) {
        console.warn('Failed to load classes, will extract from instances:', err);
        setClasses([]);
      }

      // Extract unique sessions from loaded instances instead of making separate API call
      // Sessions will be populated once instances are loaded
    } catch (error) {
      console.error('Error loading metadata:', error);
      setClasses([]);
      setSessions([]);
    }
  };

  const handleArchive = async (instanceId: string) => {
    try {
      setArchiving(instanceId);
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      
      const response = await axios.put(
        `http://localhost:5000/api/results-setup/instances/${instanceId}/archive`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Instance archived successfully',
        });
        
        // Update local state
        setInstances(instances.map(i => 
          i.id === instanceId ? { ...i, status: 'archived' } : i
        ));
        setShowConfirmArchive(null);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to archive instance',
        variant: 'destructive',
      });
    } finally {
      setArchiving(null);
    }
  };

  const handleDelete = async (instanceId: string) => {
    try {
      setDeleting(instanceId);
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      
      const response = await axios.delete(
        `http://localhost:5000/api/results-setup/instances/${instanceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Instance deleted successfully',
        });
        
        // Update local state
        setInstances(instances.filter(i => i.id !== instanceId));
        setShowConfirmDelete(null);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete instance',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleDownloadCSV = async (instance: ResultsInstance) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      
      const response = await axios.get(
        `http://localhost:5000/api/results-setup/instances/${instance.id}/download-csv`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      // Create download link
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${instance.instanceName}-results.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'CSV downloaded successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to download CSV',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-400">Loading instances...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Results Management</h2>
        <p className="text-gray-400 text-sm">View, manage, and export student results</p>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate('/school-admin/results-setup?fresh=true')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Results Instance
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-blue-400 outline-none"
            >
              <option>All Classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-blue-400 outline-none"
            >
              <option>All Sessions</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-blue-400 outline-none"
            >
              <option value="all">All Instances</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">Results</label>
            <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
              {filteredInstances.length} instance{filteredInstances.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

        {/* Instances Table */}
        {filteredInstances.length > 0 ? (
          <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.07)]">
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold text-sm">Instance Name</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold text-sm">Class</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold text-sm">Session</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold text-sm">Students</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold text-sm">Status</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold text-sm">Created</th>
                  <th className="px-6 py-4 text-left text-gray-300 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstances.map((instance, idx) => (
                  <tr key={instance.id} className={`border-t border-[rgba(255,255,255,0.07)] ${idx % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{instance.instanceName}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{instance.className}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{instance.sessionName}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{instance.totalStudents}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {instance.status === 'active' ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm">Active</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-400 text-sm">Archived</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(instance.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/school-admin/results-entry/${instance.id}`)}
                          className="text-blue-400 hover:text-blue-300 p-1 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadCSV(instance)}
                          className="text-green-400 hover:text-green-300 p-1 transition-colors"
                          title="Download CSV"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {instance.status === 'active' && (
                          <button
                            onClick={() => setShowConfirmArchive(instance.id)}
                            className="text-yellow-400 hover:text-yellow-300 p-1 transition-colors"
                            title="Archive"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setShowConfirmDelete(instance.id)}
                          className="text-red-400 hover:text-red-300 p-1 transition-colors"
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
        ) : (
          <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No results instances found</p>
            <button
              onClick={() => navigate('/school-admin/results-setup?fresh=true')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create First Instance
            </button>
          </div>
        )}

      {/* Confirm Delete Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[20px] p-6 max-w-md mx-auto backdrop-blur">
            <h3 className="text-xl font-bold text-white mb-4">Delete Instance?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will permanently delete the results instance. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDelete(null)}
                disabled={deleting === showConfirmDelete}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showConfirmDelete)}
                disabled={deleting === showConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting === showConfirmDelete ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Archive Modal */}
      {showConfirmArchive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-[20px] p-6 max-w-md mx-auto backdrop-blur">
            <h3 className="text-xl font-bold text-white mb-4">Archive Instance?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will archive the instance. You can restore it later from the archived instances list.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmArchive(null)}
                disabled={archiving === showConfirmArchive}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchive(showConfirmArchive)}
                disabled={archiving === showConfirmArchive}
                className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {archiving === showConfirmArchive ? 'Archiving...' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsEntryPage;
