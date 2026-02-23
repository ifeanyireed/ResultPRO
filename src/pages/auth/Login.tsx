import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight01, Eye, EyeOff, Loading01 } from '@hugeicons/react';
import Navigation from '@/components/Navigation';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      // Call backend login API
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });

      // Backend returns: { success: true, message: "...", data: { token, refreshToken, user, school } }
      const { token, refreshToken, user, school } = response.data.data;
      localStorage.setItem('accessToken', token);
      localStorage.setItem('authToken', token); // Also store as authToken for API calls
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('schoolId', school?.id);
      localStorage.setItem('schoolName', school?.name);

      console.log('✅ Login successful for user:', user.email, 'Role:', user.role, 'Type:', typeof user.role);

      // Check if user is a super admin - redirect to super admin dashboard
      if (user.role === 'SUPER_ADMIN' || user.role?.toUpperCase() === 'SUPER_ADMIN') {
        console.log('🔐 Super admin detected, redirecting to /super-admin/verifications');
        setLoading(false);
        navigate('/super-admin/verifications');
        return;
      }

      console.log('📋 User role is:', user.role, '- checking other conditions...');

      // Check if school is awaiting approval after document submission
      if (user.awaitingApproval) {
        setLoading(false);
        navigate('/auth/pending-verification', {
          state: {
            schoolId: school?.id,
            schoolName: school?.name,
          },
        });
        return;
      }
      // Check if school requires verification documents
      if (user.requiresVerification) {
        // Check if documents have already been submitted
        if (user.documentsSubmitted) {
          // Redirect to pending verification page
          setLoading(false);
          navigate('/auth/pending-verification', {
            state: {
              schoolId: school?.id,
              schoolName: school?.name,
            },
          });
          return;
        } else {
          // Redirect to document upload page
          setLoading(false);
          navigate('/auth/school-verification', {
            state: {
              schoolId: school?.id,
              schoolName: school?.name,
              documentsSubmitted: false,
            },
          });
          return;
        }
      }
      
      if (user && user.isOnboardingComplete === false) {
        // If onboarding is not complete, redirect to onboarding
        setLoading(false);
        navigate('/onboarding');
        return;
      }
      
      // Otherwise redirect to school admin dashboard
      setLoading(false);
      navigate('/school-admin/overview');
    } catch (err: any) {
      const errorCode = err.response?.data?.code;
      const errorMessage = err.response?.data?.message || 'Invalid email or password';

      // Handle email not verified - redirect to verification page
      if (errorCode === 'EMAIL_NOT_VERIFIED') {
        navigate('/auth/verify-email', {
          state: { email, fromLogin: true },
        });
        return;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-black text-white min-h-screen flex flex-col">
      <Navigation />

      {/* Login Section */}
      <section className="relative w-full min-h-screen flex items-center justify-center px-4 md:px-12 lg:px-20 overflow-hidden bg-black pt-20 pb-20">
        {/* Background Image */}
        <img
          src="/Hero.png"
          className="absolute h-full w-full object-cover inset-0"
          alt="Background"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

        <div className="relative z-10 max-w-md mx-auto text-center w-full">
          <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-tight leading-tight text-white">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-sm mb-12">Sign in to your Results Pro account</p>

          {/* Login Card */}
          <div className="relative rounded-[30px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-8 shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder=" "
                  className="w-full px-6 py-4 rounded-[15px] bg-white/5 border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-base"
                  disabled={loading}
                />
                <label className="absolute left-6 top-4 text-gray-400 text-sm transition-all pointer-events-none"
                  style={email ? { top: '-8px', fontSize: '12px', color: 'rgb(96, 165, 250)' } : {}}>
                  Email Address
                </label>
              </div>

              {/* Password Field */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder=" "
                  className="w-full px-6 py-4 rounded-[15px] bg-white/5 border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-base pr-12"
                  disabled={loading}
                />
                <label className="absolute left-6 top-4 text-gray-400 text-sm transition-all pointer-events-none"
                  style={password ? { top: '-8px', fontSize: '12px', color: 'rgb(96, 165, 250)' } : {}}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {error && (
                <div className="p-4 rounded-[12px] bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim() || !password.trim()}
                className="w-full py-4 rounded-[15px] font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 border shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] hover:bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loading01 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight01 className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-sm">
                <Link to="/auth/password-reset" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </form>
          </div>

          <p className="text-center text-gray-400 text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-blue-400 hover:text-blue-300 transition-colors font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-500/10 bg-black py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Results Pro</h4>
              <p className="text-gray-400 text-sm">Modern results management for Nigerian schools.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4 text-white">Product</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/" className="hover:text-blue-400 transition-colors">Home</a></li>
                <li><a href="/features" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-blue-400 transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4 text-white">Company</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/about" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="/contact" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4 text-white">Legal</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-500/10 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2026 Results Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
