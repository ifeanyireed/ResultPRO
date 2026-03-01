import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, BookOpen, CheckCircle } from '@/lib/hugeicons-compat';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { toast } from 'sonner';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

interface DashboardData {
  totalStudents: number;
  totalClasses: number;
  totalSubjects: number;
  gradedPercentage: number;
  recentActivities: Array<{
    action: string;
    time: string;
    status: string;
  }>;
  currentSession: {
    year: string;
    term: string;
    resultStatus: string;
  };
  recentResults: Array<{
    student: string;
    class: string;
    subject: string;
    score: number;
    date: string;
  }>;
}

const Overview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const schoolId = localStorage.getItem('schoolId');

      if (!token || !schoolId) {
        setError('Authentication required');
        return;
      }

      // Fetch school dashboard analytics
      const dashboardRes = await axios.get(`${API_BASE}/analytics/school-dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch session info
      const sessionRes = await axios.get(`${API_BASE}/results-setup/session`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch classes count
      const classesRes = await axios.get(`${API_BASE}/onboarding/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch students count
      const studentsRes = await axios.get(`${API_BASE}/results-setup/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch results instances (recent entries)
      const resultsRes = await axios.get(`${API_BASE}/results-setup/instances`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 3 },
      });

      const dashData = dashboardRes.data.data || {};
      const sessionData = sessionRes.data.data || {};
      const classesData = classesRes.data.data || [];
      const studentsData = studentsRes.data.data || [];
      const resultsData = resultsRes.data.data || [];

      setData({
        totalStudents: studentsData.length || 0,
        totalClasses: classesData.length || 0,
        totalSubjects: dashData.subjectCount || 0,
        gradedPercentage: dashData.gradedPercentage || 0,
        recentActivities: [
          {
            action: 'Dashboard Loaded',
            time: 'Just now',
            status: 'completed',
          },
          {
            action: 'Session Active',
            time: `${sessionData.year || '2025/2026'}`,
            status: 'completed',
          },
        ],
        currentSession: {
          year: sessionData.year || '2025/2026',
          term: sessionData.term || 'First Term',
          resultStatus: dashData.resultStatus || 'In Progress',
        },
        recentResults: resultsData.slice(0, 3).map((result: any) => ({
          student: result.studentName || 'N/A',
          class: result.className || 'N/A',
          subject: result.subjectName || 'N/A',
          score: result.score || 0,
          date: new Date(result.createdAt).toLocaleDateString(),
        })),
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // If API fails, fall back to default values
      setData({
        totalStudents: 0,
        totalClasses: 0,
        totalSubjects: 0,
        gradedPercentage: 0,
        recentActivities: [
          { action: 'Dashboard Ready', time: 'Just now', status: 'completed' },
        ],
        currentSession: {
          year: '2025/2026',
          term: 'First Term',
          resultStatus: 'Awaiting Data',
        },
        recentResults: [],
      });
      setError('Unable to load some data, showing defaults');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load dashboard data</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Students',
      value: data.totalStudents.toString(),
      trend: '+0',
      trendDir: 'neutral' as const,
      color: 'from-blue-400 to-cyan-400',
    },
    {
      label: 'Active Classes',
      value: data.totalClasses.toString(),
      trend: '+0',
      trendDir: 'neutral' as const,
      color: 'from-purple-400 to-pink-400',
    },
    {
      label: 'Subjects',
      value: data.totalSubjects.toString(),
      trend: '0',
      trendDir: 'neutral' as const,
      color: 'from-amber-400 to-orange-400',
    },
    {
      label: 'Graded',
      value: `${data.gradedPercentage}%`,
      trend: '+0%',
      trendDir: 'neutral' as const,
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
            {data.recentActivities.map((item, i) => (
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
              <span className="text-white font-medium">{data.currentSession.year}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-gray-400">Term</span>
              <span className="text-white font-medium">{data.currentSession.term}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Result Status</span>
              <span className="text-amber-400 font-medium">{data.currentSession.resultStatus}</span>
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
            {data.recentResults.length > 0 ? (
              data.recentResults.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white">{row.student}</td>
                  <td className="py-3 px-4 text-gray-400">{row.class}</td>
                  <td className="py-3 px-4 text-gray-400">{row.subject}</td>
                  <td className="py-3 px-4 text-white font-medium">{row.score}</td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{row.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No recent result entries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Overview;
