import React, { useEffect, useState } from 'react';
import { Trophy, Star, Medal, Award, Zap, Crown } from '@/lib/hugeicons-compat';
import { useAgentRewards } from '@/hooks/useAgentAnalytics';

const BADGE_ICONS: Record<string, React.ReactNode> = {
  FIRST_SCHOOL: <Star className="w-8 h-8 text-yellow-400" />,
  FIVE_SCHOOLS: <Medal className="w-8 h-8 text-blue-400" />,
  TEN_SCHOOLS: <Trophy className="w-8 h-8 text-purple-400" />,
  REFERRAL_MASTER: <Award className="w-8 h-8 text-green-400" />,
  TOP_PERFORMER: <Trophy className="w-8 h-8 text-red-400" />,
  POWER_AGENT: <Zap className="w-8 h-8 text-orange-400" />,
  PREMIUM_SUBSCRIBER: <Crown className="w-8 h-8 text-yellow-500" />,
};

export const Rewards: React.FC = () => {
  const { rewards, leaderboard, loading, fetchRewards, fetchLeaderboard } = useAgentRewards('');
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    fetchRewards();
    setLeaderboardLoading(true);
    fetchLeaderboard(100).finally(() => setLeaderboardLoading(false));
  }, [fetchRewards, fetchLeaderboard]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Rewards & Gamification</h1>
        <p className="text-gray-300">Track your points, badges, and ranking</p>
      </div>

      {rewards && (
        <>
          {/* Points Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 text-white border border-blue-700">
              <div className="text-sm text-blue-200 mb-2">Current Balance</div>
              <div className="text-4xl font-bold mb-4">{rewards.pointsBalance}</div>
              <div className="text-xs text-blue-200">Points</div>
            </div>

            <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg p-6 text-white border border-purple-700">
              <div className="text-sm text-purple-200 mb-2">Lifetime Points</div>
              <div className="text-4xl font-bold mb-4">{rewards.lifetimePoints}</div>
              <div className="text-xs text-purple-200">All Time</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg p-6 text-white border border-yellow-700">
              <div className="text-sm text-yellow-200 mb-2">Leaderboard Rank</div>
              <div className="text-4xl font-bold mb-4">
                {rewards.leaderboardRank ? `#${rewards.leaderboardRank}` : '—'}
              </div>
              <div className="text-xs text-yellow-200">Top Agents</div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Your Badges ({rewards.badges?.length || 0})
            </h2>

            {rewards.badges && rewards.badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {rewards.badges.map((badge: any, idx: number) => (
                  <div
                    key={idx}
                    className="text-center bg-slate-900 rounded p-4 border border-slate-700 hover:border-slate-600 transition"
                  >
                    <div className="flex justify-center mb-2">
                      {BADGE_ICONS[badge.badgeType] || <Award className="w-8 h-8 text-gray-400" />}
                    </div>
                    <div className="text-xs font-semibold text-white">{badge.badgeType}</div>
                    <div className="text-xs text-gray-400 mt-1">{badge.description}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p>No badges earned yet. Keep working to unlock achievements!</p>
              </div>
            )}
          </div>

          {/* Points Breakdown */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">How Points Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 rounded p-4 border border-slate-700">
                <div className="text-blue-400 font-semibold text-sm mb-1">School Signup</div>
                <div className="text-2xl font-bold text-white">50 pts</div>
              </div>
              <div className="bg-slate-900 rounded p-4 border border-slate-700">
                <div className="text-green-400 font-semibold text-sm mb-1">Referral Completed</div>
                <div className="text-2xl font-bold text-white">100 pts</div>
              </div>
              <div className="bg-slate-900 rounded p-4 border border-slate-700">
                <div className="text-yellow-400 font-semibold text-sm mb-1">Referral Approved</div>
                <div className="text-2xl font-bold text-white">150 pts</div>
              </div>
              <div className="bg-slate-900 rounded p-4 border border-slate-700">
                <div className="text-purple-400 font-semibold text-sm mb-1">Monthly Goal Hit</div>
                <div className="text-2xl font-bold text-white">300 pts</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Leaderboard */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Top 100 Agents
          </h2>
        </div>

        {leaderboardLoading ? (
          <div className="p-8 text-center text-gray-400">Loading leaderboard...</div>
        ) : leaderboard.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No agents on leaderboard</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Lifetime Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Badges
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">
                    Schools
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {leaderboard.map((agent: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {idx === 0 && <Trophy className="w-5 h-5 text-yellow-400" />}
                        {idx === 1 && <Medal className="w-5 h-5 text-gray-400" />}
                        {idx === 2 && <Medal className="w-5 h-5 text-orange-400" />}
                        <span className="font-semibold text-white">#{idx + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">
                        {agent.user?.firstName} {agent.user?.lastName}
                      </div>
                      <div className="text-xs text-gray-400">{agent.specialization}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-bold text-lg">{agent.lifetimePoints}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-blue-400 font-semibold">
                        {agent.badges?.length || 0} badges
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">
                        {agent.schoolAssignments?.length || 0} schools
                      </span>
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

export default Rewards;
