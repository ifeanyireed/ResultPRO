import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { Plus, Download01, Copy, Eye, X, Play, Pause, Trash2, Loading01 } from '@hugeicons/react';

interface Batch {
  id: string;
  batchCode: string;
  schoolId: string;
  quantity: number;
  status: string;
  generated: string;
  usedCount: number;
  stats?: {
    totalCards: number;
    usedCount: number;
    activeCount: number;
    depletedCount: number;
  };
}

interface SystemStats {
  batches: {
    total: number;
    pending: number;
    assigned: number;
    active: number;
    depleted: number;
    deactivated: number;
  };
  cards: {
    totalGenerated: number;
    totalUsed: number;
    totalRemaining: number;
    activeCards: number;
    depletedCards: number;
    usageRate: number;
  };
}

const ScratchCardManagement: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [generatingBatch, setGeneratingBatch] = useState(false);
  const [quantity, setQuantity] = useState('100');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [schools, setSchools] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  // Fetch batches and stats
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch batches
      const batchRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/scratch-cards/batches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const batchData = await batchRes.json();
      
      // Fetch stats
      const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/scratch-cards/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      
      if (batchData.success) setBatches(batchData.data.batches);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBatch = async () => {
    try {
      setGeneratingBatch(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/scratch-cards/batches/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: parseInt(quantity) })
      });

      const data = await res.json();
      if (data.success) {
        setShowGenerateModal(false);
        setQuantity('100');
        fetchData();
      }
    } catch (error) {
      console.error('Error generating batch:', error);
    } finally {
      setGeneratingBatch(false);
    }
  };

  const handleAssignBatch = async () => {
    if (!selectedBatch || !selectedSchool) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/scratch-cards/batches/${selectedBatch.id}/assign`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ schoolId: selectedSchool })
        }
      );

      const data = await res.json();
      if (data.success) {
        setShowAssignModal(false);
        setSelectedSchool('');
        fetchData();
      }
    } catch (error) {
      console.error('Error assigning batch:', error);
    }
  };

  const handleActivateBatch = async (batchId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/scratch-cards/batches/${batchId}/activate`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await res.json();
      if (data.success) fetchData();
    } catch (error) {
      console.error('Error activating batch:', error);
    }
  };

  const handleExportBatch = async (batchId: string, batchCode: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/scratch-cards/batches/${batchId}/export?format=csv`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `batch_${batchCode}.csv`;
      a.click();
    } catch (error) {
      console.error('Error exporting batch:', error);
    }
  };

  const filteredBatches = batches.filter(b => 
    filter === 'all' || b.status.toLowerCase() === filter.toLowerCase()
  );

  if (loading) return (
    <SuperAdminLayout>
      <div className="flex items-center justify-center h-full">
        <Loading01 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    </SuperAdminLayout>
  );

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Scratch Card Management</h1>
            <p className="text-gray-400">Generate, assign, and manage scratch card batches</p>
          </div>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Generate Batch
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative rounded-[20px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-4 hover:bg-white/5 transition-all">
              <p className="text-gray-400 text-sm mb-1">Total Generated</p>
              <p className="text-2xl font-bold">{stats.cards.totalGenerated.toLocaleString()}</p>
            </div>
            <div className="relative rounded-[20px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-4 hover:bg-white/5 transition-all">
              <p className="text-gray-400 text-sm mb-1">Total Used</p>
              <p className="text-2xl font-bold text-green-400">{stats.cards.totalUsed.toLocaleString()}</p>
            </div>
            <div className="relative rounded-[20px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-4 hover:bg-white/5 transition-all">
              <p className="text-gray-400 text-sm mb-1">Total Remaining</p>
              <p className="text-2xl font-bold text-blue-400">{stats.cards.totalRemaining.toLocaleString()}</p>
            </div>
            <div className="relative rounded-[20px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-4 hover:bg-white/5 transition-all">
              <p className="text-gray-400 text-sm mb-1">Usage Rate</p>
              <p className="text-2xl font-bold">{stats.cards.usageRate}%</p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'pending', 'assigned', 'active', 'deactivated'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize font-medium transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Batches Table */}
        <div className="relative rounded-[30px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] overflow-hidden hover:bg-white/5 transition-all">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.07)] bg-white/5">
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Batch Code</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">School</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Total</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Used/Active</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Status</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-white font-mono font-bold">{batch.batchCode}</td>
                    <td className="py-4 px-6 text-gray-400">{batch.schoolId === 'SYSTEM' ? 'Unassigned' : 'Assigned'}</td>
                    <td className="py-4 px-6 text-white">{batch.quantity}</td>
                    <td className="py-4 px-6 text-white">
                      {batch.stats?.usedCount}/{batch.stats?.activeCount}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        batch.status === 'ACTIVE' ? 'bg-green-500/20 text-green-300' :
                        batch.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedBatch(batch);
                          setShowAssignModal(true);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Assign to school"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleActivateBatch(batch.id)}
                        disabled={batch.status === 'ACTIVE'}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Activate batch"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExportBatch(batch.id, batch.batchCode)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Export as CSV"
                      >
                        <Download01 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Generate Batch Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-[20px] border border-white/10 p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Generate New Batch</h3>
              <button onClick={() => setShowGenerateModal(false)} className="p-1 hover:bg-white/10 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Number of Cards</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  max="10000"
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateBatch}
                  disabled={generatingBatch}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {generatingBatch ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Batch Modal */}
      {showAssignModal && selectedBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-[20px] border border-white/10 p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Assign Batch to School</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1 hover:bg-white/10 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-3">
                  Batch: <span className="font-mono text-white">{selectedBatch.batchCode}</span>
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Cards: <span className="font-bold text-white">{selectedBatch.quantity}</span>
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignBatch}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
};

export default ScratchCardManagement;