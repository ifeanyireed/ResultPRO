import React from 'react';
import { BarChart01, TrendingUp, Users, BookOpen } from '@hugeicons/react';

const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <p className="text-gray-400 text-sm mt-1">School performance metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart01 className="w-4 h-4 text-blue-400" />
            <p className="text-gray-400 text-xs uppercase tracking-wider">Avg Score</p>
          </div>
          <p className="text-3xl font-bold text-white">78.4</p>
          <p className="text-green-400 text-xs mt-2">+2.1 from last term</p>
        </div>

        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <p className="text-gray-400 text-xs uppercase tracking-wider">Pass Rate</p>
          </div>
          <p className="text-3xl font-bold text-white">92%</p>
          <p className="text-green-400 text-xs mt-2">+5% from last term</p>
        </div>

        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-400" />
            <p className="text-gray-400 text-xs uppercase tracking-wider">Distinction</p>
          </div>
          <p className="text-3xl font-bold text-white">24%</p>
          <p className="text-green-400 text-xs mt-2">+3% from last term</p>
        </div>

        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <p className="text-gray-400 text-xs uppercase tracking-wider">Completion</p>
          </div>
          <p className="text-3xl font-bold text-white">89%</p>
          <p className="text-amber-400 text-xs mt-2">-2% from last term</p>
        </div>
      </div>

      {/* Performance by Class */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
        <h3 className="text-lg font-semibold text-white mb-6">Performance by Class</h3>
        <div className="space-y-4">
          {[
            { class: 'SS3A', avg: 82, passRate: 95, distinction: 28, students: 42 },
            { class: 'SS3B', avg: 79, passRate: 92, distinction: 23, students: 39 },
            { class: 'SS2A', avg: 76, passRate: 90, distinction: 21, students: 41 },
            { class: 'SS2B', avg: 75, passRate: 88, distinction: 18, students: 40 },
          ].map((row, i) => (
            <div key={i} className="p-4 rounded-lg border border-white/5 hover:bg-white/5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-medium">{row.class}</p>
                <p className="text-gray-400 text-sm">{row.students} students</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-gray-400 text-xs mb-1">Average</p>
                  <div className="w-full bg-white/5 rounded-full h-1">
                    <div className="bg-blue-400 h-1 rounded-full" style={{width: `${row.avg}%`}} />
                  </div>
                  <p className="text-white text-sm font-medium mt-1">{row.avg}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Pass Rate</p>
                  <div className="w-full bg-white/5 rounded-full h-1">
                    <div className="bg-green-400 h-1 rounded-full" style={{width: `${row.passRate}%`}} />
                  </div>
                  <p className="text-white text-sm font-medium mt-1">{row.passRate}%</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Distinction</p>
                  <div className="w-full bg-white/5 rounded-full h-1">
                    <div className="bg-purple-400 h-1 rounded-full" style={{width: `${row.distinction}%`}} />
                  </div>
                  <p className="text-white text-sm font-medium mt-1">{row.distinction}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Analysis */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
        <h3 className="text-lg font-semibold text-white mb-6">Subject Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { subject: 'Mathematics', avg: 76, passRate: 88 },
            { subject: 'English Language', avg: 82, passRate: 96 },
            { subject: 'Physics', avg: 74, passRate: 85 },
            { subject: 'Chemistry', avg: 79, passRate: 91 },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-lg border border-white/5">
              <p className="text-white font-medium mb-3">{item.subject}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Score</span>
                  <span className="text-white font-medium">{item.avg}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pass Rate</span>
                  <span className="text-white font-medium">{item.passRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
