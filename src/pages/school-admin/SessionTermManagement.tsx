import React, { useState, useEffect } from 'react';
import { Plus, Edit02, Trash01, Calendar, CheckCircle, AlertCircle, Loader } from '@hugeicons/react';
import axios from 'axios';
import { SessionFormModal } from './components/SessionFormModal';
import { useToast } from '@/hooks/use-toast';

interface SessionTerm {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Pending' | 'Completed';
  academicSessionId?: string;
}

interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  terms?: SessionTerm[];
}

const SessionTermManagement: React.FC = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [allTerms, setAllTerms] = useState<SessionTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const currentSessionName = `${currentYear}/${currentYear + 1}`;

  // Fetch sessions and terms on mount
  useEffect(() => {
    fetchSessionsAndTerms();
  }, []);

  const fetchSessionsAndTerms = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      const schoolId = localStorage.getItem('schoolId');

      if (!token || !schoolId) {
        setError('Missing authentication data');
        return;
      }

      // Fetch school data which should contain sessions and terms
      const response = await axios.get(
        `http://localhost:5000/api/onboarding/school/${schoolId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const schoolData = response.data.data;
      const fetchedSessions = schoolData.academicSessions || [];
      
      // Flatten all terms from all sessions
      const flattenedTerms: SessionTerm[] = [];
      fetchedSessions.forEach((session: AcademicSession) => {
        if (session.terms && Array.isArray(session.terms)) {
          session.terms.forEach((term: SessionTerm) => {
            flattenedTerms.push({
              ...term,
              academicSessionId: session.id,
            });
          });
        }
      });

      setSessions(fetchedSessions);
      setAllTerms(flattenedTerms);
      
      // Auto-select the first session if available
      if (fetchedSessions.length > 0) {
        setSelectedSessionId(fetchedSessions[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching sessions:', err);
      setError(err.response?.data?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTerm = () => {
    setIsEditing(false);
    setEditingTermId(null);
    setEditingData(null);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleEditTerm = (term: SessionTerm) => {
    setIsEditing(true);
    setEditingTermId(term.id);
    setEditingData({
      id: term.id,
      name: term.name,
      startDate: term.startDate,
      endDate: term.endDate,
    });
    setSubmitError(null);
    setShowModal(true);
  };

  const handleDeleteTerm = async (termId: string) => {
    if (!confirm('Are you sure you want to delete this term?')) return;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');

      // Delete from backend (adjust endpoint as per your API)
      await axios.delete(
        `http://localhost:5000/api/onboarding/academic-session/term/${termId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: 'Success',
        description: 'Term deleted successfully',
      });

      await fetchSessionsAndTerms();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete term',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitForm = async (formData: any) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
      const schoolId = localStorage.getItem('schoolId');

      if (!selectedSessionId) {
        setSubmitError('No session selected');
        return;
      }

      if (isEditing && editingTermId) {
        // Update existing term
        await axios.patch(
          `http://localhost:5000/api/onboarding/academic-session/term/${editingTermId}`,
          {
            ...formData,
            academicSessionId: selectedSessionId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast({
          title: 'Success',
          description: 'Term updated successfully',
        });
      } else {
        // Create new term
        await axios.post(
          `http://localhost:5000/api/onboarding/academic-session/term`,
          {
            ...formData,
            academicSessionId: selectedSessionId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast({
          title: 'Success',
          description: 'Term created successfully',
        });
      }

      setShowModal(false);
      await fetchSessionsAndTerms();
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setSubmitError(err.response?.data?.message || 'Failed to save term');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate statistics
  const activeSessions = sessions.filter(s => {
    const today = new Date();
    const start = new Date(s.startDate);
    const end = new Date(s.endDate);
    return today >= start && today <= end;
  }).length;

  const activeTerms = allTerms.filter(t => t.status === 'Active').length;
  const pendingTerms = allTerms.filter(t => t.status === 'Pending').length;

  const selectedSession = sessions.find(s => s.id === selectedSessionId);
  const selectedSessionTerms = selectedSession?.terms || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-blue-400 animate-spin" />
        <span className="ml-2 text-gray-400">Loading sessions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Academic Sessions & Terms</h2>
          <p className="text-gray-400 text-sm mt-1">Create and manage academic sessions and terms</p>
        </div>
        <button
          onClick={handleAddTerm}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-400 font-medium transition-colors disabled:opacity-50"
          disabled={!selectedSessionId}
        >
          <Plus className="w-4 h-4" />
          New Term
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Session Selector */}
      {sessions.length > 0 && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <label className="text-gray-300 text-sm font-medium block mb-2">Select Academic Session</label>
          <select
            value={selectedSessionId || ''}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">-- Choose a session --</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Terms Table */}
      {selectedSessionTerms.length > 0 ? (
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5 bg-white/2.5">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Term Name</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Start Date</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">End Date</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedSessionTerms.map((term) => (
                  <tr key={term.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-white font-medium">{term.name}</td>
                    <td className="py-4 px-6 text-gray-400">
                      {new Date(term.startDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      {new Date(term.endDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          term.status === 'Active'
                            ? 'bg-green-400/10 text-green-400 border border-green-400/20'
                            : term.status === 'Pending'
                            ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                            : 'bg-gray-400/10 text-gray-400 border border-gray-400/20'
                        }`}
                      >
                        {term.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEditTerm(term)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit term"
                        >
                          <Edit02 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTerm(term.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete term"
                        >
                          <Trash01 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/50 rounded-lg p-8 text-center border border-dashed border-slate-600">
          <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">
            {selectedSessionId ? 'No terms found for this session. Create one to get started.' : 'Select an academic session to view terms.'}
          </p>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Total Sessions</h3>
          </div>
          <p className="text-3xl font-bold text-white">{sessions.length}</p>
          <p className="text-gray-500 text-xs mt-2">{activeSessions} currently active</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-semibold">Active Terms</h3>
          </div>
          <p className="text-3xl font-bold text-white">{activeTerms}</p>
          <p className="text-gray-500 text-xs mt-2">Out of {allTerms.length} total</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="text-white font-semibold">Pending Terms</h3>
          </div>
          <p className="text-3xl font-bold text-white">{pendingTerms}</p>
          <p className="text-gray-500 text-xs mt-2">Awaiting activation</p>
        </div>
      </div>

      {/* Form Modal */}
      <SessionFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitForm}
        initialData={editingData}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        error={submitError}
        sessionName={selectedSession?.name || currentSessionName}
      />
    </div>
  );
};

export default SessionTermManagement;
