import React, { useState, useEffect } from 'react';
import { BarChart01, TrendingUp, Users, BookOpen, AlertTriangle, Target } from '@/lib/hugeicons-compat';
import { KPICard } from '@/components/analytics/KPICard';
import { RiskLevelBadge, PerformanceBar, DistributionGauge } from '@/components/analytics/Badges';
import { useAnalyticsDashboard, useAtRiskStudents } from '@/hooks/useAnalytics';

interface AnalyticsDashboardProps {
  classId?: string;
  sessionId?: string;
  termId?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  classId = '',
  sessionId = '',
  termId = '',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'at-risk' | 'subjects'>('overview');
  const { data: dashboardData, loading: dashLoading } = useAnalyticsDashboard(classId, sessionId, termId);
  const { data: atRiskData, loading: riskLoading } = useAtRiskStudents(classId, sessionId, termId);

  if (dashLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin">
            <Target className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-gray-400 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-gray-400 text-sm mt-1">School performance metrics and insights</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'overview'
                ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('at-risk')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'at-risk'
                ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            At-Risk
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'subjects'
                ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
                : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            Subjects
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboardData && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Class Average"
              value={`${dashboardData.classAverage.toFixed(1)}%`}
              icon={<BarChart01 className="w-4 h-4" />}
              color="blue"
              trend={dashboardData.termTrend.length > 1 ? 
                dashboardData.termTrend[dashboardData.termTrend.length - 1].average - 
                dashboardData.termTrend[0].average : 0
              }
            />
            <KPICard
              label="Pass Rate"
              value={`${dashboardData.passRate.toFixed(1)}%`}
              icon={<TrendingUp className="w-4 h-4" />}
              color="green"
            />
            <KPICard
              label="Distinction"
              value={dashboardData.excellenceCount}
              icon={<Users className="w-4 h-4" />}
              color="purple"
            />
            <KPICard
              label="At Risk"
              value={dashboardData.atRiskCount}
              icon={<AlertTriangle className="w-4 h-4" />}
              color={dashboardData.atRiskCount > 5 ? 'red' : 'amber'}
            />
          </div>

          {/* Performance Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution by Tier */}
            <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
              <h3 className="text-lg font-semibold text-white mb-6">Student Distribution</h3>
              <div className="grid grid-cols-4 gap-4">
                <DistributionGauge
                  label="Excellent"
                  value={dashboardData.studentTierDistribution.excellent}
                  maxValue={Math.max(
                    dashboardData.studentTierDistribution.excellent,
                    dashboardData.studentTierDistribution.good,
                    dashboardData.studentTierDistribution.average,
                    dashboardData.studentTierDistribution.atRisk,
                    1
                  )}
                  color="#3b82f6"
                />
                <DistributionGauge
                  label="Good"
                  value={dashboardData.studentTierDistribution.good}
                  maxValue={Math.max(
                    dashboardData.studentTierDistribution.excellent,
                    dashboardData.studentTierDistribution.good,
                    dashboardData.studentTierDistribution.average,
                    dashboardData.studentTierDistribution.atRisk,
                    1
                  )}
                  color="#10b981"
                />
                <DistributionGauge
                  label="Average"
                  value={dashboardData.studentTierDistribution.average}
                  maxValue={Math.max(
                    dashboardData.studentTierDistribution.excellent,
                    dashboardData.studentTierDistribution.good,
                    dashboardData.studentTierDistribution.average,
                    dashboardData.studentTierDistribution.atRisk,
                    1
                  )}
                  color="#f59e0b"
                />
                <DistributionGauge
                  label="At Risk"
                  value={dashboardData.studentTierDistribution.atRisk}
                  maxValue={Math.max(
                    dashboardData.studentTierDistribution.excellent,
                    dashboardData.studentTierDistribution.good,
                    dashboardData.studentTierDistribution.average,
                    dashboardData.studentTierDistribution.atRisk,
                    1
                  )}
                  color="#ef4444"
                />
              </div>
            </div>

            {/* Top and Bottom Subjects */}
            <div className="space-y-4">
              {/* Top Subjects */}
              <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Top Performers</h3>
                <div className="space-y-3">
                  {dashboardData.topSubjects.slice(0, 3).map((subject, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-white">{subject.subjectName}</span>
                        <span className="text-sm font-bold text-green-400">
                          {subject.average.toFixed(1)}%
                        </span>
                      </div>
                      <PerformanceBar value={subject.average} maxValue={100} color="green" showLabel={false} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Worst Subjects */}
              <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Needs Support</h3>
                <div className="space-y-3">
                  {dashboardData.worstSubjects.slice(0, 3).map((subject, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-white">{subject.subjectName}</span>
                        <span className="text-sm font-bold text-amber-400">
                          {subject.average.toFixed(1)}%
                        </span>
                      </div>
                      <PerformanceBar value={subject.average} maxValue={100} color="amber" showLabel={false} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Term Trend */}
          {dashboardData.termTrend.length > 0 && (
            <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
              <h3 className="text-lg font-semibold text-white mb-6">Performance Trend</h3>
              <div className="space-y-4">
                {dashboardData.termTrend.map((term, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">{term.term}</span>
                      <span className="text-sm font-bold text-white">{term.average.toFixed(1)}%</span>
                    </div>
                    <PerformanceBar value={term.average} maxValue={100} color="blue" showLabel={false} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* At-Risk Tab */}
      {activeTab === 'at-risk' && atRiskData && (
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">At-Risk Students Summary</h3>
            <div className="grid grid-cols-5 gap-4 mb-6">
              <KPICard label="Total" value={atRiskData.summary.totalAtRisk} icon={<Users className="w-4 h-4" />} />
              <KPICard label="Critical" value={atRiskData.summary.critical} icon={<AlertTriangle className="w-4 h-4" />} color="red" />
              <KPICard label="High" value={atRiskData.summary.high} icon={<AlertTriangle className="w-4 h-4" />} color="orange" />
              <KPICard label="Medium" value={atRiskData.summary.medium} icon={<AlertTriangle className="w-4 h-4" />} color="amber" />
              <KPICard label="Low" value={atRiskData.summary.low} icon={<AlertTriangle className="w-4 h-4" />} color="green" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Risk Score</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Current Avg</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Class Avg</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400">Gap</th>
                </tr>
              </thead>
              <tbody>
                {atRiskData.students.slice(0, 10).map((student) => (
                  <tr key={student.studentId} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-sm text-white">{student.studentName}</td>
                    <td className="py-3 px-4">
                      <RiskLevelBadge level={student.riskLevel} score={student.riskScore} />
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-white">{student.currentAverage.toFixed(1)}%</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{student.classAverage.toFixed(1)}%</td>
                    <td className="py-3 px-4 text-sm text-red-400">
                      {(student.currentAverage - student.classAverage).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dashboardData.topSubjects.map((subject) => (
            <div key={subject.subjectId} className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-6">
              <h4 className="text-base font-semibold text-white mb-4">{subject.subjectName}</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">Class Average</span>
                    <span className="text-sm font-bold text-white">{subject.average.toFixed(1)}%</span>
                  </div>
                  <PerformanceBar value={subject.average} maxValue={100} color="blue" showLabel={false} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-400">Pass Rate</span>
                    <span className="text-sm font-bold text-green-400">{subject.passRate.toFixed(1)}%</span>
                  </div>
                  <PerformanceBar value={subject.passRate} maxValue={100} color="green" showLabel={false} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
