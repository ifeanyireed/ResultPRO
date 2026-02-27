import React, { useState } from 'react';
import { ArrowRight01, CheckSquare, Loading01, Check, AlertCircle } from '@hugeicons/react';
import Navigation from '@/components/Navigation';

interface StudentResult {
  name: string;
  admissionNumber: string;
  className: string;
  sex?: string;
  dateOfBirth?: string;
}

interface ValidationResult {
  student: StudentResult;
  cardStatus: {
    usesRemaining: number;
    usageCount: number;
    isExpired: boolean;
  };
}

const ScratchCardValidation: React.FC = () => {
  const [scratchCode, setScratchCode] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!scratchCode.trim()) {
      setError('Please enter your scratch card PIN');
      return;
    }

    if (!admissionNumber.trim()) {
      setError('Please enter your admission number');
      return;
    }

    try {
      setLoading(true);
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/scratch-cards/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: scratchCode.toUpperCase(),
          studentAdmissionNumber: admissionNumber
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setResult(data.data);
        setScratchCode('');
        setAdmissionNumber('');
      } else {
        setError(data.error || 'Failed to validate scratch card');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success && result) {
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
              {/* Student Info */}
              <div className="mb-6 p-6 rounded-[15px] bg-blue-500/10 border border-blue-500/30">
                <p className="text-gray-300 text-sm mb-2">Student Information:</p>
                <div className="text-left space-y-2">
                  <p className="text-white"><strong>Name:</strong> {result.student.name}</p>
                  <p className="text-white"><strong>Admission No:</strong> {result.student.admissionNumber}</p>
                  <p className="text-white"><strong>Class:</strong> {result.student.className}</p>
                  {result.student.sex && <p className="text-white"><strong>Sex:</strong> {result.student.sex}</p>}
                </div>
              </div>

              {/* Card Status */}
              <div className="mb-6 p-6 rounded-[15px] bg-green-500/10 border border-green-500/30">
                <p className="text-gray-300 text-sm mb-2">Card Status:</p>
                <p className="text-gray-400 text-sm font-semibold">Accesses Remaining: <span className="text-white text-lg">{result.cardStatus.usesRemaining} of 3</span></p>
                <p className="text-gray-400 text-sm">Total Uses: {result.cardStatus.usageCount}</p>
              </div>

              {/* Verification Details */}
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
                  <span className="text-gray-300">{result.cardStatus.usesRemaining} {result.cardStatus.usesRemaining === 1 ? 'access' : 'accesses'} remaining this term</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSuccess(false);
                  setResult(null);
                }}
                className="w-full py-4 rounded-[15px] font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 border shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] hover:bg-white/5 text-white"
              >
                Verify Another Card
                <ArrowRight01 className="w-5 h-5" />
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

      {/* Validation Section */}
      <section className="relative w-full min-h-screen flex items-center justify-center px-4 md:px-12 lg:px-20 overflow-hidden bg-black pt-20 pb-20">
        {/* Background Image */}
        <img
          src="/Hero.png"
          className="absolute h-full w-full object-cover inset-0"
          alt="Background"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

        <div className="relative z-10 max-w-2xl mx-auto w-full">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <CheckSquare className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-tight text-white">
              Validate Your <span className="text-blue-400">Scratch Card</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Enter your scratch card PIN and admission number to access your exam results
            </p>
          </div>

          {/* Validation Form */}
          <form onSubmit={handleSubmit} className="relative rounded-[30px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-10 shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)]">
            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-[15px] bg-red-500/10 border border-red-500/30 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* PIN Input */}
              <div>
                <label htmlFor="pin" className="block text-sm font-semibold text-gray-300 mb-3">
                  Scratch Card PIN
                </label>
                <input
                  id="pin"
                  type="text"
                  placeholder="Enter your 10-digit PIN"
                  value={scratchCode}
                  onChange={(e) => setScratchCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-4 rounded-[12px] bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-all font-mono tracking-wider"
                  disabled={loading}
                />
              </div>

              {/* Admission Number Input */}
              <div>
                <label htmlFor="admission" className="block text-sm font-semibold text-gray-300 mb-3">
                  Admission Number
                </label>
                <input
                  id="admission"
                  type="text"
                  placeholder="Enter your admission number"
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                  className="w-full px-4 py-4 rounded-[12px] bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/15 transition-all"
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !scratchCode || !admissionNumber}
                className="w-full py-4 rounded-[15px] font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 border shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500/50 text-white hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loading01 className="w-5 h-5 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    Validate Card
                    <ArrowRight01 className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-gray-400 text-xs mt-6">
              Your information is secure and will not be shared
            </p>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-6 rounded-[20px] bg-white/5 border border-white/10">
            <h3 className="text-white font-semibold mb-3">How to use:</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">1.</span>
                <span>Locate your scratch card PIN (10-digit code)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">2.</span>
                <span>Enter your admission number</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">3.</span>
                <span>Click "Validate Card" to access your results</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400 font-bold">4.</span>
                <span>Each card has 3 uses per term</span>
              </li>
            </ul>
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
