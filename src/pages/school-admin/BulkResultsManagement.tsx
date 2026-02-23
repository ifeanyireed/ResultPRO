import React, { useState } from 'react';
import { Edit02, Trash01, Download01 } from '@hugeicons/react';

const BulkResultsManagement: React.FC = () => {
  const [results] = useState([
    { id: 1, class: 'SS3A', subject: 'Mathematics', students: 42, entered: 38, pending: 4, status: 'In Progress' },
    { id: 2, class: 'SS3A', subject: 'English', students: 42, entered: 42, pending: 0, status: 'Complete' },
    { id: 3, class: 'SS3B', subject: 'Mathematics', students: 39, entered: 35, pending: 4, status: 'In Progress' },
    { id: 4, class: 'SS3B', subject: 'Physics', students: 39, entered: 39, pending: 0, status: 'Complete' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Bulk Results Management</h2>
        <p className="text-gray-400 text-sm mt-1">Edit and manage uploaded results</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Total Entries</p>
          <p className="text-3xl font-bold text-white">3,264</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Completed</p>
          <p className="text-3xl font-bold text-green-400">2,940</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Pending</p>
          <p className="text-3xl font-bold text-amber-400">324</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Completion</p>
          <p className="text-3xl font-bold text-blue-400">90%</p>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 bg-white/2.5">
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Class</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Subject</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Total Students</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Entered</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Pending</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4 px-6 text-white font-medium">{row.class}</td>
                  <td className="py-4 px-6 text-white">{row.subject}</td>
                  <td className="py-4 px-6 text-gray-400">{row.students}</td>
                  <td className="py-4 px-6 text-green-400 font-medium">{row.entered}</td>
                  <td className="py-4 px-6 text-amber-400 font-medium">{row.pending}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      row.status === 'Complete'
                        ? 'bg-green-400/10 text-green-400 border border-green-400/20'
                        : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-blue-400 hover:text-blue-300"><Edit2 className="w-4 h-4" /></button>
                      <button className="text-purple-400 hover:text-purple-300"><Download className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Items */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
        <h3 className="text-lg font-semibold text-white mb-6">Pending Entries by Class</h3>
        <div className="space-y-4">
          {[
            { class: 'SS3A', pending: 4, reason: 'Incomplete scores' },
            { class: 'SS3B', pending: 4, reason: 'Incomplete scores' },
            { class: 'SS2A', pending: 8, reason: 'Missing subject assign' },
            { class: 'SS2B', pending: 6, reason: 'Data validation' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-white/5 hover:bg-white/5">
              <div className="flex-1">
                <p className="text-white font-medium">{item.class}</p>
                <p className="text-gray-500 text-xs">{item.reason}</p>
              </div>
              <div className="text-right">
                <p className="text-amber-400 font-medium">{item.pending}</p>
                <p className="text-gray-500 text-xs">pending</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BulkResultsManagement;
