import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight01, Eye, EyeOff, CheckSquare, Loading01, ChevronDown } from '@hugeicons/react';
import Navigation from '@/components/Navigation';
import axios from 'axios';
import { STATES, getLGAsByState } from '@/lib/nigerian-states-lgas';

const API_BASE = 'http://localhost:5000/api';

const Register: React.FC = () => {
  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const lgas = state ? getLGAsByState(state) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!schoolName.trim() || !email.trim() || !phone.trim() || !fullAddress.trim() || !state.trim() || !lga.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    
    try {
      // Call backend registration API
      const response = await axios.post(`${API_BASE}/auth/register`, {
        schoolName: schoolName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        fullAddress: fullAddress.trim(),
        state: state.trim(),
        lga: lga.trim(),
        password,
      });

      // Store email for verification page
      localStorage.setItem('registerEmail', email.trim());

      // Registration successful, redirect to email verification page
      navigate('/auth/verify-email', { 
        state: { email: email.trim() } 
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-black text-white min-h-screen flex flex-col">
      <Navigation />

      {/* Registration Section */}
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
          <h1 className="text-5xl md:text-5xl font-bold mb-2 tracking-tight leading-tight text-white">
            Get Started
          </h1>
          <p className="text-gray-400 text-sm mb-12">Create your school account with Results Pro</p>

          {/* Registration Card */}
          <div className="relative rounded-[30px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-8 shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* School Name Field */}
              <div className="relative">
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => {
                    setSchoolName(e.target.value);
                    setError('');
                  }}
                  placeholder=" "
                  className="w-full px-6 py-3 rounded-[12px] bg-white/5 border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-base"
                  disabled={loading}
                />
                <label className="absolute left-6 top-3 text-gray-400 text-sm transition-all pointer-events-none"
                  style={schoolName ? { top: '-8px', fontSize: '12px', color: 'rgb(96, 165, 250)' } : {}}>
                  School Name
                </label>
              </div>

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
                  className="w-full px-6 py-3 rounded-[12px] bg-white/5 border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-base"
                  disabled={loading}
                />
                <label className="absolute left-6 top-3 text-gray-400 text-sm transition-all pointer-events-none"
                  style={email ? { top: '-8px', fontSize: '12px', color: 'rgb(96, 165, 250)' } : {}}>
                  Email Address
                </label>
              </div>

              {/* Phone Field */}
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError('');
                  }}
                  placeholder=" "
                  className="w-full px-6 py-3 rounded-[12px] bg-white/5 border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-base"
                  disabled={loading}
                />
                <label className="absolute left-6 top-3 text-gray-400 text-sm transition-all pointer-events-none"
                  style={phone ? { top: '-8px', fontSize: '12px', color: 'rgb(96, 165, 250)' } : {}}>
                  Phone Number
                </label>
              </div>

              {/* Address Field */}
              <div className="relative">
                <input
                  type="text"
                  value={fullAddress}
                  onChange={(e) => {
                    setFullAddress(e.target.value);
                    setError('');
                  }}
                  placeholder=" "
                  className="w-full px-6 py-3 rounded-[12px] bg-white/5 border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-base"
                  disabled={loading}
                />
                <label className="absolute left-6 top-3 text-gray-400 text-sm transition-all pointer-events-none"
                  style={fullAddress ? { top: '-8px', fontSize: '12px', color: 'rgb(96, 165, 250)' } : {}}>
                  School Address
                </label>
              </div>

              {/* State Dropdown */}
              <div className="relative">
                <label className="absolute left-6 -top-2 text-gray-400 text-xs transition-all pointer-events-none z-10">
                  State
                </label>
                <select
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setLga(''); // Reset LGA when state changes
                    setError('');
                  }}
                  className="w-full px-6 py-3 rounded-[12px] bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-base appearance-none cursor-pointer"
                  disabled={loading}
                >
                  <option value="">Select State</option>
                  {STATES.map((s) => (
                    <option key={s} value={s} className="bg-gray-900 text-white">
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>

              {/* LGA Dropdown */}
              {state && (
                <div className="relative">
                  <label className="absolute left-6 -top-2 text-gray-400 text-xs transition-all pointer-events-none z-10">
                    LGA
                  </label>
                  <select
                    value={lga}
                    onChange={(e) => {
                      setLga(e.target.value);
                      setError('');
                    }}
                    className="w-full px-6 py-3 rounded-[12px] bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-base appearance-none cursor-pointer"
                    disabled={loading || !state}
                  >
                    <option value="">Select LGA</option>
                    {lgas.map((l) => (
                      <option key={l} value={l} className="bg-gray-900 text-white">
                        {l}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              )}

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
                  className="w-full px-6 py-3 rounded-[12px] bg-white/5 border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-base pr-12"
                  disabled={loading}
                />
                <label className="absolute left-6 top-3 text-gray-400 text-sm transition-all pointer-events-none"
                  style={password ? { top: '-8px', fontSize: '12px', color: 'rgb(96, 165, 250)' } : {}}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  placeholder=" "
                  className="w-full px-6 py-3 rounded-[12px] bg-white/5 border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-base pr-12"
                  disabled={loading}
                />
                <label className="absolute left-6 top-3 text-gray-400 text-sm transition-all pointer-events-none"
                  style={confirmPassword ? { top: '-8px', fontSize: '12px', color: 'rgb(96, 165, 250)' } : {}}>
                  Confirm Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="p-4 rounded-[12px] bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    setError('');
                  }}
                  className="mt-1 rounded border-white/20 bg-white/5"
                  disabled={loading}
                />
                <label htmlFor="terms" className="text-gray-400 text-xs leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !schoolName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !state || !lga || !agreeTerms}
                className="w-full py-4 rounded-[15px] font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 border shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] hover:bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loading01 className="w-5 h-5 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight01 className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-gray-400 text-sm mt-8">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors font-semibold">
              Sign in
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

export default Register;
