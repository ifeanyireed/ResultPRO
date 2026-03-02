import React, { useState } from 'react';
import { AlertTriangle, Users, Award, LogOut, ArrowRight, User, BarChart01 } from '@/lib/hugeicons-compat';
import { useParentDashboard, useParentChildren } from '@/hooks/useParentAnalytics';
import { KPICard } from '@/components/analytics/KPICard';
import { RiskLevelBadge } from '@/components/analytics/Badges';
import { useNavigate } from 'react-router-dom';

const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: dashboardData, loading: dashLoading } = useParentDashboard();
  const { children } = useParentChildren();
  const [selectedChild, setSelectedChild] = useState<string | null>(
    children.length > 0 ? children[0].id : null
  );
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    navigate('/auth/login');
  };

  const handleViewChildDetails = (studentId: string) => {
    navigate(`/parent/child/${studentId}`);
  };

  if (dashLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black text-white min-h-screen flex flex-col relative pb-20">
      <style>{`
        .nav-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          margin-bottom: 8px;
          pointer-events: none;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
      {/* Background Effects - Fixed/Static */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/Hero.png"
          className="w-full h-full object-cover"
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      {/* Header with Logo and User Actions */}
      <div className="sticky top-0 z-20 backdrop-blur-md px-4 md:px-8" style={{
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.05) 50%, rgba(0, 0, 0, 0) 100%)'
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between py-4 relative">
            {/* Left Section - Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <img src="/logo.png" alt="Results Pro" className="h-10 w-auto" />
              <div>
                <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Results Pro</div>
                <div className="text-sm font-semibold text-white">Parent Portal</div>
              </div>
            </div>

            {/* Center Section */}
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="text-center">
                <div className="text-lg font-bold text-white">Parents Dashboard</div>
                <div className="text-xs text-gray-400 italic mt-1">Monitor your child's academic progress</div>
              </div>
            </div>

            {/* Right Section - User Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => navigate('/parent/dashboard')}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-200 text-gray-400 hover:text-white"
                title="Profile"
              >
                <User size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-auto pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="space-y-6">
        <div className="text-lg font-bold text-white mb-6">Welcome, {dashboardData.parentName}</div>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <KPICard
            label="Total Children"
            value={dashboardData.totalChildren}
            icon={<Users className="w-5 h-5" />}
            color="blue"
          />
          <KPICard
            label="At Risk (Critical)"
            value={dashboardData.alerts.critical}
            icon={<AlertTriangle className="w-5 h-5" />}
            color={dashboardData.alerts.critical > 0 ? 'red' : 'green'}
            trend={dashboardData.alerts.critical > 0 ? 10 : -5}
          />
          <KPICard
            label="High Attention Needed"
            value={dashboardData.alerts.high}
            icon={<Award className="w-5 h-5" />}
            color={dashboardData.alerts.high > 0 ? 'amber' : 'green'}
          />
          <KPICard
            label="Medium Attention"
            value={dashboardData.alerts.medium}
            icon={<Award className="w-5 h-5" />}
            color="purple"
          />
        </div>

        {/* Children Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Children List */}
          <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8 hover:bg-white/5 transition-colors">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              My Children
            </h2>

            {dashboardData.children.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No children linked to your account yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.children.map((child) => (
                  <div
                    key={child.studentId}
                    onClick={() => setSelectedChild(child.studentId)}
                    className={`p-4 rounded-lg cursor-pointer transition ${
                      selectedChild === child.studentId
                        ? 'bg-blue-500/20 border border-blue-400/50'
                        : 'bg-[rgba(0,0,0,0.40)] border border-[rgba(255,255,255,0.07)] hover:bg-[rgba(255,255,255,0.05)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-white">{child.studentName}</h3>
                        <p className="text-xs text-slate-400">{child.className}</p>
                      </div>
                      {child.riskLevel && (
                        <RiskLevelBadge level={child.riskLevel as any} />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-500">Average</p>
                        <p className="text-blue-400 font-semibold">{child.average.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Position</p>
                        <p className="text-green-400 font-semibold">#{child.position}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8 hover:bg-white/5 transition-colors">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-400" />
              Performance Overview
            </h2>

            {selectedChild && dashboardData.children.length > 0 ? (
              <div className="space-y-4">
                {(() => {
                  const child = dashboardData.children.find((c) => c.studentId === selectedChild);
                  if (!child) return null;

                  return (
                    <>
                      <div className="bg-[rgba(0,0,0,0.40)] rounded-[15px] p-4 border border-[rgba(255,255,255,0.07)]">
                        <p className="text-slate-400 text-sm mb-1">Overall Average</p>
                        <p className="text-3xl font-bold text-blue-400">{child.average.toFixed(1)}%</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Class Position: <span className="text-green-400">#{child.position}</span>
                        </p>
                      </div>

                      <div className="bg-[rgba(0,0,0,0.40)] rounded-[15px] p-4 border border-[rgba(255,255,255,0.07)]">
                        <p className="text-slate-400 text-sm mb-2">Risk Assessment</p>
                        {child.riskLevel ? (
                          <RiskLevelBadge level={child.riskLevel as any} score={0} />
                        ) : (
                          <p className="text-slate-400 text-sm">No risk data available</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleViewChildDetails(child.studentId)}
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        View Full Profile
                      </button>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">Select a child to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Alert Summary */}
        {(dashboardData.alerts.critical > 0 || dashboardData.alerts.high > 0) && (
          <div className="mt-8 bg-red-500/10 border border-red-500/30 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-400 mb-2">Attention Required</h3>
                <p className="text-slate-300 text-sm">
                  {dashboardData.alerts.critical > 0 && (
                    <>
                      {dashboardData.alerts.critical} child{dashboardData.alerts.critical > 1 ? 'ren' : ''} {dashboardData.alerts.critical > 1 ? 'are' : 'is'} at critical risk.{' '}
                    </>
                  )}
                  {dashboardData.alerts.high > 0 && (
                    <>
                      {dashboardData.alerts.high} child{dashboardData.alerts.high > 1 ? 'ren' : ''} {dashboardData.alerts.high > 1 ? 'need' : 'needs'} high attention.
                    </>
                  )}
                </p>
                <button className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition">
                  View At-Risk Children
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8 text-center hover:bg-white/5 transition-colors">
          <p className="text-slate-400">
            Need help? <a href="#" className="text-blue-400 hover:text-blue-300 underline">Contact support</a>
          </p>
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
              { label: 'Dashboard', icon: BarChart01, href: '/parent/dashboard' },
              { label: 'Children', icon: Users, href: '/parent/dashboard' },
              { label: 'Profile', icon: User, href: '/parent/dashboard' },
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

export default ParentDashboard;
