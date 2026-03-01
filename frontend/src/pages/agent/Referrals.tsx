import React, { useEffect, useState } from 'react';
import { TrendingUp, Building2, Users, Target } from '@/lib/hugeicons-compat';
import { useAgentReferrals } from '@/hooks/useAgentAnalytics';

export const Referrals: React.FC = () => {
  const { referrals, stats, loading, fetchReferrals, fetchStats } = useAgentReferrals('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchStats();
    fetchReferrals((page - 1) * 10, 10);
  }, [page, fetchReferrals, fetchStats]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'APPROVED':
        return 'text-green-400 bg-green-900/20';
      case 'PAID':
        return 'text-blue-400 bg-blue-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Referral Tracking</h1>
        <p className="text-gray-300">Monitor your referrals and earnings</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Referrals</span>
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalReferrals}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Pending</span>
              <Building02 className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.pendingReferrals}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Approved</span>
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.approvedReferrals}</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Clicks</span>
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalClicks}</div>
          </div>
        </div>
      )}

      {/* Referrals Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Recent Referrals</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading referrals...</div>
        ) : referrals.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No referrals found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    School
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {referrals.map((referral: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition">
                    <td className="px-6 py-4">
                      <span className="text-white font-semibold">
                        {referral.school?.name || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{referral.referredByEmail}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(referral.status)}`}>
                        {referral.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-semibold">
                      ${referral.commissionAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-700 flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-gray-700 text-white text-sm rounded transition"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-gray-300">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
