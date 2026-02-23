import React from 'react';
import { TrendingUp, TrendingDown, Users, BookOpen, CheckCircle } from '@hugeicons/react';

const Overview: React.FC = () => {
  const stats = [
    {
      label: 'Total Students',
      value: '843',
      trend: '+12',
      trendDir: 'up' as const,
      color: 'from-blue-400 to-cyan-400',
    },
    {
      label: 'Active Classes',
      value: '28',
      trend: '+2',
      trendDir: 'up' as const,
      color: 'from-purple-400 to-pink-400',
    },
    {
      label: 'Subjects',
      value: '52',
      trend: '0',
      trendDir: 'neutral' as const,
      color: 'from-amber-400 to-orange-400',
    },
    {
      label: 'Graded',
      value: '78%',
      trend: '+5%',
      trendDir: 'up' as const,
      color: 'from-green-400 to-emerald-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-2">{stat.value}</p>
              </div>
              <div className="text-gray-400">
                {stat.label === 'Total Students' && <Users className="w-5 h-5" />}
                {stat.label === 'Active Classes' && <BookOpen className="w-5 h-5" />}
                {stat.label === 'Subjects' && <BookOpen className="w-5 h-5" />}
                {stat.label === 'Graded' && <CheckCircle className="w-5 h-5" />}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {stat.trendDir === 'up' && (
                <>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">{stat.trend}</span>
                </>
              )}
              {stat.trendDir === 'neutral' && (
                <span className="text-xs text-gray-500">{stat.trend}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8 hover:bg-white/5 transition-colors">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Activities</h3>
          <div className="space-y-4">
            {[
              { action: 'CSV Upload', time: '2 hours ago', status: 'completed' },
              { action: 'Results Published', time: '1 day ago', status: 'completed' },
              { action: 'Class Created', time: '3 days ago', status: 'completed' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{item.action}</p>
                  <p className="text-gray-500 text-xs mt-1">{item.time}</p>
                </div>
                <div className="px-3 py-1 bg-green-400/10 rounded-full border border-green-400/20">
                  <span className="text-green-400 text-xs font-medium">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8 hover:bg-white/5 transition-colors">
          <h3 className="text-lg font-semibold text-white mb-6">Current Session</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-gray-400">Session</span>
              <span className="text-white font-medium">2025/2026</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-gray-400">Term</span>
              <span className="text-white font-medium">First Term</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Result Status</span>
              <span className="text-amber-400 font-medium">In Progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8 hover:bg-white/5 transition-colors overflow-x-auto">
        <h3 className="text-lg font-semibold text-white mb-6">Recent Result Entries</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Student</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Class</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Subject</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Score</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {[
              { student: 'Chioma Okafor', class: 'SS3A', subject: 'Mathematics', score: '87', date: 'Today' },
              { student: 'Tunde Adeyemi', class: 'SS3B', subject: 'English', score: '92', date: 'Today' },
              { student: 'Amara Nwosu', class: 'SS2A', subject: 'Physics', score: '78', date: 'Yesterday' },
            ].map((row, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                <td className="py-3 px-4 text-white">{row.student}</td>
                <td className="py-3 px-4 text-gray-400">{row.class}</td>
                <td className="py-3 px-4 text-gray-400">{row.subject}</td>
                <td className="py-3 px-4 text-white font-medium">{row.score}</td>
                <td className="py-3 px-4 text-gray-500 text-xs">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Overview;
