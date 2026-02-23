import React from 'react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { TrendingUp, Users, Building2, DollarSign, ArrowUp, ArrowDown } from '@hugeicons/react';

interface StatCard {
  label: string;
  value: string;
  change: number;
  icon: React.ComponentType<any>;
  color: string;
}

const SuperAdminOverview: React.FC = () => {
  const stats: StatCard[] = [
    {
      label: 'Total Schools',
      value: '1,234',
      change: 12.5,
      icon: Building2,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Active Users',
      value: '45,892',
      change: 8.2,
      icon: Users,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Monthly Revenue',
      value: '₦8.2M',
      change: 15.3,
      icon: DollarSign,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Growth Rate',
      value: '23.5%',
      change: 4.1,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const recentSchools = [
    { id: 1, name: 'Lagos Central High School', plan: 'Enterprise', revenue: '₦500,000', students: 2500, status: 'active' },
    { id: 2, name: 'Abuja International School', plan: 'Pro', revenue: '₦150,000', students: 800, status: 'active' },
    { id: 3, name: 'Ibadan Secondary School', plan: 'Free', revenue: '₦0', students: 150, status: 'active' },
    { id: 4, name: 'Port Harcourt Academy', plan: 'Pro', revenue: '₦120,000', students: 600, status: 'pending' },
    { id: 5, name: 'Kano Educational Institute', plan: 'Enterprise', revenue: '₦450,000', students: 2200, status: 'active' },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome back, Super Admin</h1>
          <p className="text-gray-400">Here's what's happening with your platform today</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const isPositive = stat.change >= 0;
            return (
              <div
                key={idx}
                className="relative rounded-[30px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-6 hover:bg-white/5 transition-all duration-300"
              >
                <Icon className="w-5 h-5 text-gray-400 mb-2" />
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold mb-2">{stat.value}</p>
                <p className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? <ArrowUp className="w-3 h-3 inline mr-1" /> : <ArrowDown className="w-3 h-3 inline mr-1" />}
                  {Math.abs(stat.change)}%
                </p>
              </div>
            );
          })}
        </div>

        {/* Recent Schools */}
        <div className="relative rounded-[30px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] hover:bg-white/5 transition-all duration-300">
          <div className="p-6 border-b border-[rgba(255,255,255,0.07)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Recent Schools</h2>
              <a href="/super-admin/schools" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                View all →
              </a>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.07)]">
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">School Name</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Plan</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Revenue</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Students</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSchools.map((school) => (
                  <tr key={school.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-white font-medium">{school.name}</td>
                    <td className="py-4 px-6 text-gray-400">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        school.plan === 'Enterprise' ? 'bg-purple-500/20 text-purple-300' :
                        school.plan === 'Pro' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {school.plan}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white font-medium">{school.revenue}</td>
                    <td className="py-4 px-6 text-gray-400">{school.students.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        school.status === 'active' ? 'bg-green-500/20 text-green-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {school.status === 'active' ? 'Active' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Section (placeholder) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="relative rounded-[30px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-6 hover:bg-white/5 transition-all duration-300">
            <h3 className="text-lg font-bold mb-6">Revenue Trend</h3>
            <div className="h-48 flex items-end justify-around gap-2">
              {[65, 78, 92, 81, 88, 95, 102].map((height, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-400">Week {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Distribution */}
          <div className="relative rounded-[30px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-6 hover:bg-white/5 transition-all duration-300">
            <h3 className="text-lg font-bold mb-6">Subscription Distribution</h3>
            <div className="space-y-4">
              {[
                { label: 'Enterprise', value: 450, color: 'bg-purple-500' },
                { label: 'Pro', value: 650, color: 'bg-blue-500' },
                { label: 'Free', value: 134, color: 'bg-gray-500' }
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">{item.label}</span>
                    <span className="text-sm font-bold text-white">{item.value}</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${(item.value / 834) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminOverview;
