import React, { useEffect, useState } from 'react';
import { Building2, Plus, MoreVertical } from '@/lib/hugeicons-compat';

export const SchoolsManaged: React.FC = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch schools managed by agent
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Schools Managed</h1>
            <p className="text-gray-300">Manage your assigned schools</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition">
            <Plus className="w-4 h-4" />
            Add School
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-gray-400 text-sm mb-1">Total Schools</div>
          <div className="text-3xl font-bold text-white">{schools.length}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-gray-400 text-sm mb-1">Active</div>
          <div className="text-3xl font-bold text-green-400">
            {schools.filter((s: any) => s.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-gray-400 text-sm mb-1">Avg. Commission</div>
          <div className="text-3xl font-bold text-blue-400">
            {schools.length > 0
              ? (
                  schools.reduce((sum: number, s: any) => sum + (s.commissionRate || 0), 0) /
                  schools.length
                ).toFixed(1)
              : '—'}
            %
          </div>
        </div>
      </div>

      {/* Schools List */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading schools...</div>
        ) : schools.length === 0 ? (
          <div className="p-12 text-center">
            <Building02 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Schools Yet</h3>
            <p className="text-gray-400 mb-4">You haven't been assigned to manage any schools yet.</p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition">
              Request School Assignment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    School Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Commission Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Assigned Date
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {schools.map((school: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition">
                    <td className="px-6 py-4">
                      <span className="text-white font-semibold">{school.name}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{school.role}</td>
                    <td className="px-6 py-4">
                      <span className="text-blue-400 font-semibold">{school.commissionRate}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          school.status === 'ACTIVE'
                            ? 'text-green-400 bg-green-900/20'
                            : 'text-yellow-400 bg-yellow-900/20'
                        }`}
                      >
                        {school.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(school.assignedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 hover:bg-slate-700 rounded transition">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolsManaged;
