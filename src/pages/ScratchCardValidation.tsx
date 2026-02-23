import React, { useState } from 'react';
import { ArrowRight01, CheckSquare, Loading01 } from '@hugeicons/react';
import Navigation from '@/components/Navigation';

const ScratchCardValidation: React.FC = () => {
  const [scratchCode, setScratchCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validatedCode, setValidatedCode] = useState('');
  const [usesRemaining, setUsesRemaining] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!scratchCode.trim()) {
      setError('Please enter your scratch card code');
      return;
    }

    if (scratchCode.length < 6) {
      setError('Scratch card code must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    // Simulate verification delay
    setTimeout(() => {
      // Mock validation logic
      // In production, this would validate against your database
      const isValid = scratchCode.length >= 6 && /^[A-Z0-9]+$/.test(scratchCode.toUpperCase());
      
      if (isValid) {
        // Mock: randomly assign remaining uses (1-3)
        const remaining = Math.floor(Math.random() * 3) + 1;
        setUsesRemaining(remaining);
        setSuccess(true);
        setValidatedCode(scratchCode.toUpperCase());
        setScratchCode('');
      } else {
        setError('Invalid scratch card code. Please check and try again.');
        setLoading(false);
      }
    }, 800);
  };

  if (success) {
    return (
      <div className="w-full bg-black text-white min-h-screen flex flex-col">
        <Navigation />

        {/* Success Section */}
        <section className="relative w-full min-h-screen flex items-center justify-center px-4 md:px-12 lg:px-20 overflow-hidden bg-black pt-20 pb-20">
          {/* Background Image */}
          <img
            src="/Hero.png"
            className="absolute h-full w-full object-cover inset-0"
            alt="Background"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

          <div className="relative z-10 max-w-2xl mx-auto text-center w-full">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <Check className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-tight text-white">
              Scratch Card <span className="text-green-400">Verified!</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              Your scratch card has been successfully verified. You now have access to view exam results.
            </p>

            {/* Success Card */}
            <div className="relative rounded-[30px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-10 shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] mb-8">
              <div className="mb-6 p-6 rounded-[15px] bg-green-500/10 border border-green-500/30">
                <p className="text-gray-300 text-sm mb-2">Verified Code:</p>
                <p className="text-2xl font-mono font-bold text-green-300 mb-4">{validatedCode}</p>
                <p className="text-gray-400 text-sm font-semibold">Accesses Remaining: <span className="text-white text-lg">{usesRemaining} of 3</span></p>
              </div>

              <div className="space-y-4 text-left mb-8">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Scratch card is valid and active</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">Full access to exam results</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{usesRemaining} {usesRemaining === 1 ? 'access' : 'accesses'} remaining this term</span>
                </div>
              </div>

              <button
                onClick={() => setSuccess(false)}
                className="w-full py-4 rounded-[15px] font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 border shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] hover:bg-white/5 text-white"
              >
                Verify Another Card
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <p className="text-center text-gray-400 text-xs">
              You can now proceed to check your exam results
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
  }

  return (
    <div className="w-full bg-black text-white min-h-screen flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center justify-center px-4 md:px-12 lg:px-20 overflow-hidden bg-black pt-20 pb-20">
        {/* Background Image */}
        <img
          src="/Hero.png"
          className="absolute h-full w-full object-cover inset-0"
          alt="Background"
        />
        {/* Gradient Overlay - Dark edges to transparent center */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

        <div className="relative z-10 max-w-2xl mx-auto text-center w-full">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight leading-tight text-white">
            Verify Your <br />
            <span className="text-blue-400">Scratch Card</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-16 leading-relaxed">
            Enter the code from your scratch card to access exam results
          </p>

          {/* Code Entry Card */}
          <div className="relative rounded-[30px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-10 shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="text"
                  value={scratchCode}
                  onChange={(e) => {
                    setScratchCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder=" "
                  autoComplete="off"
                  className="w-full px-6 py-4 rounded-[15px] bg-white/5 border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-lg uppercase tracking-widest font-mono"
                  disabled={loading}
                />
                <label className="absolute left-6 top-4 text-gray-400 text-sm transition-all pointer-events-none"
                  style={scratchCode ? { top: '-8px', fontSize: '12px', color: 'rgb(96, 165, 250)' } : {}}>
                  Scratch Card Code
                </label>
              </div>

              {error && (
                <div className="p-4 rounded-[12px] bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !scratchCode.trim()}
                className="w-full py-4 rounded-[15px] font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 border shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] hover:bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    Verify Code
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-center text-gray-400 text-xs">
                Each card grants 3 accesses to view results per the validity period
              </p>
            </form>
          </div>
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

export default ScratchCardValidation;
