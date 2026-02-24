import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar,
  BookOpen,
  Layers,
  BarChart01,
  Upload01,
  Users,
  Settings,
  CreditCard,
  ClipboardList,
  Trophy,
  FileText,
  Mail,
  PieChart01,
  User,
  Bell,
  LogOut,
} from '@hugeicons/react';

interface NavItem {
  label: string;
  icon: React.ComponentType<any>;
  href: string;
}

const SchoolAdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [schoolName, setSchoolName] = useState<string>('');
  const [schoolMotto, setSchoolMotto] = useState<string>('');
  const navigate = useNavigate();

  // Load school info
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.school?.name) {
          setSchoolName(user.school.name);
          setSchoolMotto(user.school.motto || '');
        }
      } catch (error) {
        console.error('Error loading school info:', error);
      }
    }
  }, []);

  // Check if user is a super admin or if school is rejected
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        
        // Redirect super admins to super-admin dashboard
        if (user.role === 'SUPER_ADMIN' || user.role?.toUpperCase() === 'SUPER_ADMIN') {
          console.log('🔐 Super admin detected in SchoolAdminLayout, redirecting to super-admin dashboard');
          navigate('/super-admin/verifications', { replace: true });
          return;
        }

        // Check if school is rejected
        if (user.school?.status === 'REJECTED') {
          console.error('❌ School account rejected, redirecting to rejection page');
          navigate('/school-admin/school-rejected', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/auth/login');
  };

  const navItems: NavItem[] = [
    { label: 'Overview', icon: LayoutDashboard, href: '/school-admin/overview' },
    { label: 'Sessions', icon: Calendar, href: '/school-admin/sessions' },
    { label: 'Classes', icon: BookOpen, href: '/school-admin/classes' },
    { label: 'Subjects', icon: Layers, href: '/school-admin/subjects' },
    { label: 'Grading', icon: BarChart01, href: '/school-admin/grading' },
    { label: 'CSV Upload', icon: Upload01, href: '/school-admin/csv-upload' },
    { label: 'CSV Preview', icon: ClipboardList, href: '/school-admin/csv-preview' },
    { label: 'Students', icon: Users, href: '/school-admin/students' },
    { label: 'Results Entry', icon: PieChart01, href: '/school-admin/results-entry' },
    { label: 'Bulk Results', icon: Upload01, href: '/school-admin/bulk-results' },
    { label: 'Publishing', icon: Mail, href: '/school-admin/publishing' },
    { label: 'Analytics', icon: BarChart01, href: '/school-admin/analytics' },
    { label: 'Leaderboard', icon: Trophy, href: '/school-admin/leaderboard' },
    { label: 'Parents', icon: Users, href: '/school-admin/parents' },
    { label: 'Report Cards', icon: FileText, href: '/school-admin/report-cards' },
    { label: 'Settings', icon: Settings, href: '/school-admin/settings' },
    { label: 'Billing', icon: CreditCard, href: '/school-admin/billing' },
  ];

  const isActive = (href: string) => window.location.pathname === href;

  return (
    <div className="w-full bg-black text-white min-h-screen flex flex-col relative">
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
                <div className="text-sm font-semibold text-white">School Admin</div>
              </div>
            </div>

            {/* Center Section - School Name and Motto */}
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="text-center">
                <div className="text-lg font-bold text-white">{schoolName}</div>
                {schoolMotto && (
                  <div className="text-xs text-gray-400 italic mt-1">{schoolMotto}</div>
                )}
              </div>
            </div>

            {/* Right Section - User Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => navigate('/school-admin/profile')}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-200 text-gray-400 hover:text-white"
                title="Profile"
              >
                <User size={20} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => navigate('/school-admin/notifications')}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 border border-transparent hover:border-white/20 transition-all duration-200 text-gray-400 hover:text-white"
                title="Notifications"
              >
                <Bell size={20} strokeWidth={1.5} />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 text-gray-400 hover:text-red-400"
                title="Logout"
              >
                <LogOut size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 overflow-auto pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md border-t border-white/10" style={{
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.05) 50%, rgba(0, 0, 0, 0.2) 100%)'
      }}>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-center gap-2 py-4 flex-wrap">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <div key={item.href} className="relative">
                  <Link
                    to={item.href}
                    onMouseEnter={() => setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                      active
                        ? 'text-white bg-white/15 border border-white/30 shadow-lg shadow-blue-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <Icon size={24} strokeWidth={1.5} />
                  </Link>
                  {hoveredItem === item.href && (
                    <div className="nav-tooltip">{item.label}</div>
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

export default SchoolAdminLayout;
