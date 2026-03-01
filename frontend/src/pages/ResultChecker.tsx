import React, { useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { getSchool, getSchoolResults, School } from '@/lib/schoolData';
import { getTemplate, getEnabledSections } from '@/lib/gradebookTemplates';
import { CompactGradebook } from '@/components/gradebook';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ArrowRight01, Download01, Share01 } from '@hugeicons/react';

const ResultChecker: React.FC = () => {
  const { schoolSlug } = useParams<{ schoolSlug: string }>();
  const school = getSchool(schoolSlug);
  const mockResults = getSchoolResults(schoolSlug);
  
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState<number | null>(0);
  const resultsRefSectionRef = useRef<HTMLDivElement>(null);
  
  // Modal state
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImage, setShareImage] = useState<string | null>(null);
  const [gradesheetRef, setGradesheetRef] = useState<HTMLDivElement | null>(null);
  const [achievementCardRef, setAchievementCardRef] = useState<HTMLDivElement | null>(null);
  const [selectedSharePlatform, setSelectedSharePlatform] = useState<string | null>(null);

  if (!school) {
    return (
      <div className="w-full bg-black text-white min-h-screen flex flex-col items-center justify-center px-4">
        <Navigation />
        <div className="flex flex-col items-center gap-4 mt-20">
          <AlertCircle className="w-16 h-16 text-red-400" />
          <h1 className="text-2xl font-bold">School Not Found</h1>
          <p className="text-gray-400">The school "{schoolSlug}" could not be found.</p>
          <Link to="/results" className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
            Return to Results
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (admissionNumber && pin) {
        setSubmitted(true);
        setLoading(false);
      } else {
        setError('Please enter both admission number and PIN.');
        setLoading(false);
      }
    }, 1500);
  };

  const handleDownloadPDF = async () => {
    if (!gradesheetRef) return;
    
    try {
      const canvas = await html2canvas(gradesheetRef, {
        backgroundColor: '#ffffff',
        scale: 1,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${mockResults.studentName}_gradesheet.pdf`);
      
      setShowDownloadModal(false);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF');
    }
  };

  const handleGenerateShareImage = async () => {
    if (!achievementCardRef) return;
    
    try {
      // Set default platform for initial preview
      setSelectedSharePlatform('SHARE');
      
      // Give React time to update the DOM
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(achievementCardRef, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const imgData = canvas.toDataURL('image/png');
      setShareImage(imgData);
      setShowShareModal(true);
    } catch (err) {
      console.error('Error generating share image:', err);
      alert('Failed to generate share image');
    }
  };

  const handleShare = async (platform: string) => {
    if (!achievementCardRef) return;
    
    try {
      // Set the platform for the achievement card
      setSelectedSharePlatform(platform.toUpperCase());
      
      // Give React time to update the DOM
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Regenerate image with new platform name
      const canvas = await html2canvas(achievementCardRef, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Share text
      const text = `Check out my achievements from ${school.name}! 🎓`;
      
      // Open share URL
      if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
      } else if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
      } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`);
      } else if (platform === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`);
      }
      
      setShowShareModal(false);
    } catch (err) {
      console.error('Error sharing:', err);
      alert('Failed to share');
    }
  };

  const handleEmailParent = () => {
    const subject = `${mockResults.studentName}'s Results from ${school.name}`;
    const body = `Dear Parent,\n\nPlease find attached ${mockResults.studentName}'s results from ${school.name}.\n\nBest regards,\n${school.name}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="w-full bg-black text-white">
      <Navigation />

      {!submitted || !mockResults ? (
        <>
          {/* Hero Section with Form */}
          <section className="relative w-full min-h-screen flex items-center justify-center px-4 md:px-12 lg:px-20 overflow-hidden bg-black pt-20 pb-20">
            <div className="absolute inset-0 z-0">
              <img 
                src="/Hero.png" 
                alt="" 
                className="absolute h-full w-full object-cover inset-0"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto text-center w-full">
              <div className="flex items-center justify-start gap-6 mb-6">
                {school.logo && (
                  <img 
                    src={school.logo} 
                    alt="School Logo"
                    style={{ maxWidth: '144px', maxHeight: '144px', flexShrink: 0 }}
                    className="object-cover"
                  />
                )}
                <div className="border-l border-white/20 pl-6">
                  <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '1.1' }}>
                    {school.name}
                  </h1>
                </div>
              </div>

              {/* Form Card */}
              <div className="relative rounded-[30px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-10 shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={admissionNumber}
                      onChange={(e) => setAdmissionNumber(e.target.value)}
                      placeholder=" "
                      className="w-full px-6 py-4 rounded-[15px] bg-white/5 border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-lg"
                      required
                    />
                    <label className="absolute left-6 top-4 text-gray-400 text-sm transition-all pointer-events-none"
                      style={admissionNumber ? { top: '-8px', fontSize: '12px', color: 'rgb(96, 165, 250)' } : {}}>
                      Admission Number
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="password"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder=" "
                      className="w-full px-6 py-4 rounded-[15px] bg-white/5 border border-white/10 text-white placeholder-transparent focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-lg"
                      required
                    />
                    <label className="absolute left-6 top-4 text-gray-400 text-sm transition-all pointer-events-none"
                      style={pin ? { top: '-8px', fontSize: '12px', color: 'rgb(96, 165, 250)' } : {}}>
                      PIN
                    </label>
                  </div>

                  {error && (
                    <div className="p-4 rounded-[12px] bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !admissionNumber.trim() || !pin.trim()}
                    className="w-full py-4 rounded-[15px] font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 border shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] hover:bg-white/5 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        View Results
                        <ArrowRight01 className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-gray-400 text-xs">
                    Enter your admission number and PIN to view your results
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
                    <li><Link to="/features" className="hover:text-blue-400 transition-colors">Features</Link></li>
                    <li><Link to="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-4 text-white">Company</h5>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                    <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
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
        </>
      ) : (
        <>
          {/* Results View */}
          <section className="relative py-20 px-4 md:px-8 bg-black overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div 
                className="absolute w-96 h-96 rounded-full blur-3xl top-0 left-1/4 -translate-x-1/2 opacity-20"
                style={{ background: `linear-gradient(135deg, ${school.primaryColor}33, ${school.accentColor}33)` }}
              />
              <div 
                className="absolute w-96 h-96 rounded-full blur-3xl bottom-0 right-1/4 translate-x-1/2 opacity-20"
                style={{ background: `linear-gradient(135deg, ${school.secondaryColor}33, ${school.primaryColor}33)` }}
              />
            </div>

            <div className="max-w-4xl mx-auto relative z-10" ref={resultsRefSectionRef}>
              <div className="flex items-center justify-center gap-4 mb-12 relative">
                {school.logo && (
                  <div className="absolute left-0">
                    <img 
                      src={school.logo} 
                      alt="School Logo"
                      style={{ maxWidth: '150px', maxHeight: '150px' }}
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="text-center flex-1">
                  <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>{school.name}</h1>
                  <p className="text-gray-400 italic text-sm">{school.motto}</p>
                </div>
              </div>

              <div className="relative rounded-[20px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-6 shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Student Name</p>
                    <p className="text-white font-semibold">{mockResults.studentName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Admission No.</p>
                    <p className="text-white font-semibold">{mockResults.admissionNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Class</p>
                    <p className="text-white font-semibold">{mockResults.classLevel}</p>
                  </div>
                </div>
                <div className="border-t border-white/10 mt-4 pt-4">
                  <p className="text-gray-400 text-xs mb-2 text-center">{mockResults.term}</p>
                  <p className="text-gray-300 text-sm text-center">{mockResults.resultType}</p>
                </div>
              </div>

              <div 
                className="relative rounded-[20px] border backdrop-blur-[10px] p-8 shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] mb-8"
                style={{
                  background: `linear-gradient(135deg, ${school.primaryColor}20, ${school.secondaryColor}10)`,
                  border: `1px solid ${school.primaryColor}4d`
                }}
              >
                <h2 className="text-xl font-bold text-center mb-8">Overall Performance</h2>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center mb-3 relative"
                      style={{ background: `${school.primaryColor}40` }}
                    >
                      <div className="text-2xl font-bold" style={{ color: school.primaryColor }}>
                        {Math.round(mockResults.subjects.reduce((sum, s) => sum + s.score, 0) / mockResults.subjects.length)}
                      </div>
                      <svg className="w-20 h-20 absolute" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="45" 
                          fill="none" 
                          stroke={school.primaryColor}
                          strokeWidth="3"
                          strokeDasharray={`${(mockResults.subjects.reduce((sum, s) => sum + s.score, 0) / mockResults.subjects.length / 100) * 282.7} 282.7`}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm">Average</p>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold mb-2" style={{ color: school.accentColor }}>{mockResults.position}</div>
                    <p className="text-gray-400 text-sm">Position</p>
                    <p className="text-gray-500 text-xs">Out of {mockResults.totalStudents}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="text-4xl font-bold mb-2" style={{ color: school.primaryColor }}>{mockResults.subjects.length}</div>
                    <p className="text-gray-400 text-sm">Subjects</p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-4">Subject Results</h2>
              <div className="space-y-3 mb-8">
                {mockResults.subjects.map((subject, idx) => {
                  const gradeColors: { [key: string]: string } = {
                    'A': '#22c55e',
                    'B': '#3b82f6',
                    'C': '#eab308',
                    'D': '#f97316',
                    'F': '#ef4444'
                  };

                  return (
                    <button
                      key={idx}
                      onClick={() => setExpandedSubject(expandedSubject === idx ? null : idx)}
                      className={`w-full text-left relative rounded-[15px] border backdrop-blur-[10px] transition-all duration-300 p-6 shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] hover:shadow-[0_1px_3px_0_rgba(199,220,255,0.60)_inset,0_0_30px_0_rgba(198,204,255,0.30)_inset]`}
                      style={{
                        background: `linear-gradient(135deg, ${gradeColors[subject.grade]}20, ${gradeColors[subject.grade]}10)`,
                        border: `1px solid ${gradeColors[subject.grade]}4d`
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">{subject.name}</h3>
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold" style={{ color: gradeColors[subject.grade] }}>{subject.grade}</div>
                          <div className="text-3xl font-bold text-white">{subject.score}</div>
                          <span className={`transition-transform duration-300 ${expandedSubject === idx ? 'rotate-180' : ''}`}>▼</span>
                        </div>
                      </div>

                      {expandedSubject === idx && (
                        <div className="mt-6 pt-6 border-t border-white/10 space-y-3 animate-in fade-in">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400 mb-1">Score</p>
                              <p className="text-white font-semibold">{subject.score}/100</p>
                            </div>
                            <div>
                              <p className="text-gray-400 mb-1">Grade</p>
                              <p className="font-semibold" style={{ color: gradeColors[subject.grade] }}>{subject.grade}</p>
                            </div>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1 mt-4">
                            <div 
                              className="h-full rounded-full"
                              style={{ width: `${subject.score}%`, backgroundColor: gradeColors[subject.grade] }}
                            />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <button
                  onClick={() => setShowDownloadModal(true)}
                  className="relative rounded-[12px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] hover:bg-white/5 transition-all duration-300 border-solid border-[rgba(255,255,255,0.07)] p-4 shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset] group overflow-hidden"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Download01 className="w-5 h-5 text-blue-300 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-gray-300 text-center">Download</span>
                  </div>
                </button>

                <button
                  onClick={handleGenerateShareImage}
                  className="relative rounded-[12px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] hover:bg-white/5 transition-all duration-300 border-solid border-[rgba(255,255,255,0.07)] p-4 shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset] group overflow-hidden"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Share01 className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-gray-300 text-center">Share</span>
                  </div>
                </button>

                <button
                  onClick={handleEmailParent}
                  className="relative rounded-[12px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] hover:bg-white/5 transition-all duration-300 border-solid border-[rgba(255,255,255,0.07)] p-4 shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset] group overflow-hidden"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Mail className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-gray-300 text-center">Email Parent</span>
                  </div>
                </button>
              </div>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setAdmissionNumber('');
                  setPin('');
                  setError('');
                }}
                className="w-full px-6 py-3 rounded-[12px] border border-white/10 text-gray-300 hover:text-white hover:border-blue-500/30 transition-colors text-sm font-medium"
              >
                Check Another Student
              </button>

              {/* Hidden Achievement Card for Share Image Generation */}
              <div 
                ref={setAchievementCardRef}
                className="fixed"
                style={{
                  left: '-9999px',
                  top: '-9999px',
                  width: '644px',
                  height: '618px'
                }}
              >
                {/* Background Card Image - Uses natural dimensions */}
                <div className="relative" style={{width: '644px', height: '618px'}}>
                  <img 
                    src="/share.png" 
                    alt="Share Card"
                    className="block w-full h-full"
                  />
                  
                  {/* Overlaid Content - Positioned absolutely over image */}
                  <div className="absolute inset-0 flex flex-col" style={{paddingTop: '8px', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '20px'}}>
                    {/* Row 1: Student Info + School Logo */}
                    <div className="flex justify-between items-start mb-auto gap-4">
                      {/* Left: School Logo */}
                      <img 
                        src="/AOIC.png" 
                        alt="School Logo"
                        style={{
                          width: '120px',
                          height: '120px',
                          flexShrink: 0
                        }}
                        className="object-cover rounded-lg"
                      />
                      
                      {/* Right: Student Name and Details */}
                      <div className="flex-1">
                        <h1 
                          className="text-white font-semibold"
                          style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '47.8px',
                            fontWeight: 600,
                            lineHeight: '0.9',
                            letterSpacing: '-0.5px'
                          }}
                        >
                          {mockResults.studentName}
                        </h1>
                        <p 
                          className="text-gray-300"
                          style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '21px',
                            fontWeight: 200,
                            letterSpacing: '-0.3px',
                            marginTop: '4px',
                            paddingLeft: '8px'
                          }}
                        >
                          {mockResults.classLevel}, {mockResults.subjects.length} subjects
                        </p>
                      </div>
                    </div>

                    {/* Row 2: Overall Performance */}
                    <div className="absolute flex items-center gap-16" style={{left: '110px', top: '215px', justifyContent: 'flex-start'}}>
                      {/* Percentage */}
                      <span 
                        className="text-white font-semibold"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '47.8px',
                          fontWeight: 600,
                          letterSpacing: '-0.5px',
                          textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                        }}
                      >
                        {Math.round(mockResults.subjects.reduce((sum, s) => sum + s.score, 0) / mockResults.subjects.length)}%
                      </span>
                    </div>

                    {/* Row 3: Positions - Show each only if <= 10 */}
                    <div className="absolute flex justify-between w-full" style={{top: '420px', left: '0', paddingLeft: '20px', paddingRight: '20px'}}>
                        {/* Position in Class - Only if <= 10 */}
                        <div style={{flex: '1', display: 'flex', justifyContent: 'center'}}>
                        {(() => {
                          const positionInClass = parseInt(mockResults.position.replace(/(\d+)(.*)/, '$1'));
                          return positionInClass <= 10;
                        })() && (
                          <div className="flex flex-col items-center">
                            <div style={{
                              backgroundImage: 'url(/position-holder.png)',
                              backgroundSize: 'contain',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'center',
                              width: '162px',
                              height: '166px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative'
                            }}>
                              <span 
                                className="text-white font-semibold"
                                style={{ 
                                  fontFamily: 'Inter, sans-serif',
                                  fontSize: '53.11px',
                                  fontWeight: 600,
                                  letterSpacing: '-0.5px',
                                  textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                  margin: '0',
                                  lineHeight: '0.9',
                                  display: 'block',
                                  transform: 'translateY(-40px)'
                                }}
                              >
                                {mockResults.position.replace(/(\d+)(.*)/, '$1')}
                              </span>
                            </div>
                            <p style={{fontFamily: 'Inter, sans-serif', fontSize: '21px', fontWeight: 200, color: '#999', marginTop: '-46px'}}>
                              # in Class
                            </p>
                          </div>
                        )}
                        </div>

                        {/* Position in School - Only if <= 10 */}
                        <div style={{flex: '1', display: 'flex', justifyContent: 'center'}}>
                        {mockResults.positionInSchool <= 10 && (
                        <div className="flex flex-col items-center">
                          <div style={{
                            backgroundImage: 'url(/position-holder.png)',
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            width: '162px',
                            height: '166px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                          }}>
                            <span 
                              className="text-white font-semibold"
                              style={{ 
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '53.11px',
                                fontWeight: 600,
                                letterSpacing: '-0.5px',
                                textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                margin: '0',
                                lineHeight: '0.9',
                                display: 'block',
                                transform: 'translateY(-40px)'
                              }}
                            >
                              {mockResults.positionInSchool}
                            </span>
                          </div>
                          <p style={{fontFamily: 'Inter, sans-serif', fontSize: '21px', fontWeight: 200, color: '#999', marginTop: '-46px'}}>
                            # in School
                          </p>
                        </div>
                        )}
                        </div>

                        {/* Position in State - Only if <= 10 */}
                        <div style={{flex: '1', display: 'flex', justifyContent: 'center'}}>
                        {mockResults.positionInState && mockResults.positionInState <= 10 && (
                        <div className="flex flex-col items-center">
                          <div style={{
                            backgroundImage: 'url(/position-holder.png)',
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            width: '162px',
                            height: '166px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                          }}>
                            <span 
                              className="text-white font-semibold"
                              style={{ 
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '53.11px',
                                fontWeight: 600,
                                letterSpacing: '-0.5px',
                                textShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                margin: '0',
                                lineHeight: '0.9',
                                display: 'block',
                                transform: 'translateY(-40px)'
                              }}
                            >
                              {mockResults.positionInState}
                            </span>
                          </div>
                          <p style={{fontFamily: 'Inter, sans-serif', fontSize: '21px', fontWeight: 200, color: '#999', marginTop: '-46px'}}>
                            # in State
                          </p>
                        </div>
                        )}
                        </div>
                      </div>

                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Download Modal */}
          {showDownloadModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-black border border-white/10 rounded-[20px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 flex justify-between items-center p-6 border-b border-white/10 bg-black">
                  <h2 className="text-xl font-bold text-white">Download Report Card</h2>
                  <button
                    onClick={() => setShowDownloadModal(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                <div className="p-6">
                  {/* Report Card - Compact Single Page Format */}
                  {(() => {
                    const templateSlug = mockResults.gradebookTemplate || 'standard';
                    const template = getTemplate(templateSlug);
                    return (
                      <div ref={setGradesheetRef}>
                        <CompactGradebook school={school} result={mockResults} template={template} />
                      </div>
                    );
                  })()}
                </div>

                <div className="sticky bottom-0 flex gap-3 p-6 border-t border-white/10 bg-black">
                  <button
                    onClick={() => setShowDownloadModal(false)}
                    className="flex-1 px-4 py-3 rounded-[12px] border border-white/10 text-white hover:bg-white/5 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 px-4 py-3 rounded-[12px] bg-blue-600 hover:bg-blue-700 text-white transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Download01 className="w-5 h-5" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Share Modal */}
          {showShareModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-black border border-white/10 rounded-[20px] max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="sticky top-0 flex justify-between items-center p-6 border-b border-white/10 bg-black">
                  <h2 className="text-xl font-bold text-white">Share Results</h2>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>

                <div className="p-6 space-y-6 flex-1">
                  {shareImage && (
                    <div className="flex justify-center">
                      <img 
                        src={shareImage} 
                        alt="Share preview" 
                        className="max-w-full max-h-96 rounded-lg border border-white/20"
                      />
                    </div>
                  )}

                  <div>
                    <p className="text-gray-300 text-sm mb-4">Share your achievements on:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="p-3 rounded-[12px] border border-white/10 hover:bg-green-500/20 hover:border-green-500/50 transition-all text-white font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.01-4.82 5.21-4.82 8.659C2.004 15.309 3.94 20 8.522 20h.004c1.659 0 3.288-.494 4.744-1.425l.423-.254 4.389 1.149-1.175-4.279.27-.43a9.865 9.865 0 001.903-5.864c0-5.289-4.318-9.592-9.618-9.592"/>
                        </svg>
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="p-3 rounded-[12px] border border-white/10 hover:bg-sky-500/20 hover:border-sky-500/50 transition-all text-white font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.627l-5.1-6.694-5.867 6.694h-3.31l7.732-8.835L2.882 2.25h6.791l4.771 6.318 5.486-6.318zM15.369 18.602h1.921L7.282 4.188H5.28l10.089 14.414z"/>
                        </svg>
                        Twitter
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="p-3 rounded-[12px] border border-white/10 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all text-white font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a1 1 0 011-1h3z"/>
                        </svg>
                        Facebook
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="p-3 rounded-[12px] border border-white/10 hover:bg-blue-600/20 hover:border-blue-600/50 transition-all text-white font-medium flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                          <circle cx="4" cy="4" r="2"/>
                        </svg>
                        LinkedIn
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = shareImage || '';
                      link.download = `${mockResults.studentName}_results.png`;
                      link.click();
                    }}
                    className="w-full px-4 py-3 rounded-[12px] border border-white/20 text-gray-300 hover:text-white hover:border-white/40 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Download01 className="w-5 h-5" />
                    Download Image
                  </button>
                </div>

                <div className="p-6 border-t border-white/10">
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="w-full px-4 py-3 rounded-[12px] border border-white/10 text-white hover:bg-white/5 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

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
                    <li><Link to="/features" className="hover:text-blue-400 transition-colors">Features</Link></li>
                    <li><Link to="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-4 text-white">Company</h5>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
                    <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
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
        </>
      )}
    </div>
  );
};

export default ResultChecker;
