import React, { useEffect, useState } from 'react';
import { Building2, Plus, MoreVertical, BarChart01, Users, TrendingUp, Trophy, DollarSign, Calendar, User, LogOut } from '@/lib/hugeicons-compat';
import { useNavigate } from 'react-router-dom';

export const SchoolsManaged: React.FC = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch schools managed by agent
    setLoading(false);
  }, []);

  return (
    <div className="w-full bg-black text-white min-h-screen flex flex-col relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/Hero.png"
          className="w-full h-full object-cover"
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <main className="relative z-10 flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] p-6 text-white border border-[rgba(255,255,255,0.07)]">
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
              <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] p-4 border border-[rgba(255,255,255,0.07)]">
                <div className="text-gray-400 text-sm mb-1">Total Schools</div>
                <div className="text-3xl font-bold text-white">{schools.length}</div>
              </div>
              <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] p-4 border border-[rgba(255,255,255,0.07)]">
                <div className="text-gray-400 text-sm mb-1">Active</div>
                <div className="text-3xl font-bold text-green-400">
                  {schools.filter((s: any) => s.status === 'ACTIVE').length}
                </div>
              </div>
              <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] p-4 border border-[rgba(255,255,255,0.07)]">
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
            <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-400">Loading schools...</div>
              ) : schools.length === 0 ? (
                <div className="p-12 text-center">
                  <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Schools Yet</h3>
                  <p className="text-gray-400 mb-4">You haven't been assigned to manage any schools yet.</p>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition">
                    Request School Assignment
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[rgba(0,0,0,0.40)]">
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
                    <tbody className="divide-y divide-[rgba(255,255,255,0.07)]">
                      {schools.map((school: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
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
                            <button className="p-2 hover:bg-[rgba(255,255,255,0.10)] rounded transition">
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
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md border-t border-white/10" style={{
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 50%, rgba(0, 0, 0, 0.2) 100%)'
      }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-center gap-2 py-4 flex-wrap">
            {[
              { label: 'Dashboard', icon: BarChart01, href: '/agent/dashboard' },
              { label: 'Schools', icon: Users, href: '/agent/schools' },
              { label: 'Referrals', icon: TrendingUp, href: '/agent/referrals' },
              { label: 'Rewards', icon: Trophy, href: '/agent/rewards' },
              { label: 'Withdrawals', icon: DollarSign, href: '/agent/withdrawals' },
              { label: 'Plans', icon: Calendar, href: '/agent/subscription-plans' },
              { label: 'Profile', icon: User, href: '/agent/profile' },
              { label: 'Logout', icon: LogOut, href: '#logout' },
            ].map((item) => {
              const Icon = item.icon;
              const active = window.location.pathname === item.href;
              const isLogout = item.href === '#logout';
              
              return (
                <div key={item.href} className="relative group">
                  <button
                    onClick={() => {
                      if (isLogout) {
                        localStorage.clear();
                        navigate('/auth/login');
                      } else {
                        navigate(item.href);
                      }
                    }}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                      active && !isLogout
                        ? 'text-white bg-white/15 border border-white/30 shadow-lg shadow-blue-500/20'
                        : isLogout
                        ? 'text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-transparent'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon size={24} strokeWidth={1.5} />
                  </button>
                  {hoveredItem === item.href && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 text-white text-xs py-1 px-2 rounded whitespace-nowrap pointer-events-none border border-white/10">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolsManaged;
