import React, { useState } from 'react';
import { Download01, Share01, Trophy } from '@hugeicons/react';

const LeaderboardManagement: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState('ss3a');

  const leaderboard = [
    { rank: 1, name: 'Chioma Okafor', avg: 92.5, subjects: 5, medal: '🥇' },
    { rank: 2, name: 'Tunde Adeyemi', avg: 89.3, subjects: 5, medal: '🥈' },
    { rank: 3, name: 'Amara Nwosu', avg: 87.8, subjects: 5, medal: '🥉' },
    { rank: 4, name: 'Lekan Bello', avg: 85.2, subjects: 5, medal: '4' },
    { rank: 5, name: 'Nneka Okoro', avg: 84.1, subjects: 5, medal: '5' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Leaderboard Management</h2>
          <p className="text-gray-400 text-sm mt-1">Generate and manage class leaderboards</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 rounded-lg text-purple-400 font-medium transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-400 font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Leaderboard Selection */}
      <div className="flex items-center gap-4">
        <label className="text-gray-400 text-sm font-medium">Select Class:</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
        >
          <option value="ss3a">SS3A</option>
          <option value="ss3b">SS3B</option>
          <option value="ss2a">SS2A</option>
          <option value="ss2b">SS2B</option>
        </select>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 bg-white/2.5">
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Rank</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Student</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Average</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Subjects</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Medal</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded-full bg-blue-400/10 text-blue-400 font-bold text-sm">
                      {row.rank}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-white font-medium">{row.name}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-white/5 rounded-full h-1">
                        <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-1 rounded-full" style={{width: `${(row.avg / 100) * 100}%`}} />
                      </div>
                      <span className="text-white font-medium">{row.avg}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-400">{row.subjects}</td>
                  <td className="py-4 px-6 text-xl">{row.medal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {leaderboard.slice(0, 3).map((student, i) => (
          <div key={i} className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-[20px] border border-blue-400/20 p-6">
            <div className="text-3xl mb-4">{student.medal}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{student.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Average</span>
                <span className="text-white font-bold">{student.avg}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rank</span>
                <span className="text-white font-bold">#{student.rank}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Social Card Settings */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
        <h3 className="text-lg font-semibold text-white mb-6">Social Card Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-white">Allow students to share rank on social media</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-white">Include school logo on cards</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-white">Show average score</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-white">Show subject breakdown</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardManagement;
