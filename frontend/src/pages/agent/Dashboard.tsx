import React, { useEffect, useState } from 'react';
import {
  BarChart01,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Trophy,
  Calendar,
  Copy,
  CheckCircle,
} from '@/lib/hugeicons-compat';
import { useAgentDashboard } from '@/hooks/useAgentAnalytics';

interface AgentDashboardProps {
  agentId?: string;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ agentId = '' }) => {
  const { data, loading, fetchDashboard } = useAgentDashboard(agentId);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (agentId) {
      fetchDashboard();
    }
  }, [agentId, fetchDashboard]);

  const copyReferralCode = () => {
    if (data?.agent.uniqueReferralCode) {
      navigator.clipboard.writeText(data.agent.uniqueReferralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">No agent data found</div>
      </div>
    );
  }

  const { agent, referralStats, rewards, withdrawalStats } = data;
  const subscriptionTierColor = {
    Free: 'text-gray-400',
    Pro: 'text-blue-400',
    Premium: 'text-yellow-400',
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Agent Dashboard</h1>
            <p className={`text-lg font-semibold ${subscriptionTierColor[agent.subscriptionTier as 'Free' | 'Pro' | 'Premium']}`}>
              {agent.subscriptionTier} Plan
            </p>
            <div className="mt-2 text-sm text-gray-300">
              Status: <span className="text-green-400">{agent.verificationStatus}</span>
            </div>
          </div>
          {agent.avatarUrl && (
            <img
              src={agent.avatarUrl}
              alt={agent.specialization}
              className="h-16 w-16 rounded-full object-cover"
            />
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Commission Earned */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Earned</span>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${agent.totalCommissionEarned.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Pending: ${agent.pendingCommission.toFixed(2)}
          </div>
        </div>

        {/* Points Balance */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Points Balance</span>
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{rewards.pointsBalance}</div>
          <div className="text-xs text-gray-400 mt-1">
            Lifetime: {rewards.lifetimePoints}
          </div>
        </div>

        {/* Active Referrals */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Referrals</span>
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {referralStats.approvedReferrals}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Pending: {referralStats.pendingReferrals}
          </div>
        </div>

        {/* Leaderboard Rank */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Leaderboard Rank</span>
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            #{rewards.leaderboardRank || '—'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {rewards.badges?.length || 0} badges
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" />
          Your Referral Code
        </h2>
        <div className="flex items-center gap-3 bg-slate-900 rounded p-4">
          <code className="text-white font-mono text-lg flex-1">
            {agent.uniqueReferralCode}
          </code>
          <button
            onClick={copyReferralCode}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {referralStats.totalClicks}
            </div>
            <div className="text-xs text-gray-400">Referral Clicks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {referralStats.approvedReferrals}
            </div>
            <div className="text-xs text-gray-400">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">
              ${referralStats.totalCommissionPaid.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">Commission Paid</div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      {rewards.badges && rewards.badges.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Your Badges
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rewards.badges.map((badge: any, idx: number) => (
              <div
                key={idx}
                className="text-center bg-slate-900 rounded p-4 border border-slate-700"
              >
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-sm font-semibold text-white">{badge.badgeType}</div>
                <div className="text-xs text-gray-400 mt-1">{badge.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Withdrawal Stats */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-white mb-3">Withdrawals</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Pending:</span>
              <span className="text-yellow-400 font-semibold">{withdrawalStats.pending}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Approved:</span>
              <span className="text-blue-400 font-semibold">{withdrawalStats.approved}</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Total Withdrawn:</span>
              <span className="text-green-400 font-semibold">
                ${withdrawalStats.totalWithdrawn.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Referral Stats */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-white mb-3">Referral Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Total:</span>
              <span className="text-blue-400 font-semibold">
                {referralStats.totalReferrals}
              </span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Conversion Rate:</span>
              <span className="text-green-400 font-semibold">
                {referralStats.totalClicks > 0
                  ? ((referralStats.approvedReferrals / referralStats.totalClicks) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-white mb-3">Quick Links</h3>
          <div className="space-y-2">
            <button className="w-full text-left text-xs text-blue-400 hover:text-blue-300 transition">
              → View Referrals
            </button>
            <button className="w-full text-left text-xs text-blue-400 hover:text-blue-300 transition">
              → Request Withdrawal
            </button>
            <button className="w-full text-left text-xs text-blue-400 hover:text-blue-300 transition">
              → Upgrade Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
