import React, { useState } from 'react';
import { Plus, Edit02, Trash01, Calendar, CheckCircle } from '@hugeicons/react';

const SessionTermManagement: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [sessions] = useState([
    { id: 1, session: '2025/2026', term: 'First Term', startDate: 'Sep 1, 2025', endDate: 'Nov 30, 2025', status: 'Active' },
    { id: 2, session: '2025/2026', term: 'Second Term', startDate: 'Jan 5, 2026', endDate: 'Mar 31, 2026', status: 'Pending' },
    { id: 3, session: '2025/2026', term: 'Third Term', startDate: 'Apr 15, 2026', endDate: 'Jun 30, 2026', status: 'Pending' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Academic Sessions & Terms</h2>
          <p className="text-gray-400 text-sm mt-1">Create and manage academic sessions and terms</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-400 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Session
        </button>
      </div>

      {/* Sessions Table */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 bg-white/2.5">
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Session</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Term</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Start Date</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">End Date</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4 px-6 text-white font-medium">{row.session}</td>
                  <td className="py-4 px-6 text-white">{row.term}</td>
                  <td className="py-4 px-6 text-gray-400">{row.startDate}</td>
                  <td className="py-4 px-6 text-gray-400">{row.endDate}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      row.status === 'Active' 
                        ? 'bg-green-400/10 text-green-400 border border-green-400/20'
                        : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-blue-400 hover:text-blue-300"><Edit2 className="w-4 h-4" /></button>
                      <button className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Total Sessions</h3>
          </div>
          <p className="text-3xl font-bold text-white">1</p>
          <p className="text-gray-500 text-xs mt-2">Currently active</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h3 className="text-white font-semibold">Active Terms</h3>
          </div>
          <p className="text-3xl font-bold text-white">1</p>
          <p className="text-gray-500 text-xs mt-2">Out of 3 total</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="text-white font-semibold">Pending Terms</h3>
          </div>
          <p className="text-3xl font-bold text-white">2</p>
          <p className="text-gray-500 text-xs mt-2">Awaiting activation</p>
        </div>
      </div>
    </div>
  );
};

export default SessionTermManagement;
