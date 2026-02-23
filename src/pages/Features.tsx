import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import FeatureCard from '@/components/ui/FeatureCard';
import { ArrowRight01, Check } from '@hugeicons/react';

const Features: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const featureCategories = [
    {
      id: 'all',
      name: 'All Features',
    },
    {
      id: 'core',
      name: 'Core Features',
    },
    {
      id: 'engagement',
      name: 'Engagement',
    },
    {
      id: 'analytics',
      name: 'Analytics',
    },
    {
      id: 'integration',
      name: 'Integration',
    },
  ];

  const allFeatures = [
    {
      category: 'core',
      title: 'Zero Teacher Login',
      description: 'CSV upload system means teachers never need an account. Simple, fast, secure. Streamline your workflow.',
      icon: null,
      image: '/Score.png',
      features: ['CSV Import', 'Auto-processing', 'Secure upload', 'Bulk operations'],
    },
    {
      category: 'core',
      title: 'Result Management',
      description: 'Comprehensive results system with publishing, archiving, and version control built-in.',
      icon: null,
      image: '/Results.png',
      features: ['Publish instantly', 'Archive results', 'Version control', 'Backup options'],
    },
    {
      category: 'engagement',
      title: 'Social-First Design',
      description: 'Auto-generated shareable achievement graphics that parents love. Transform success into celebration.',
      icon: null,
      image: '/Social.png',
      features: ['Auto-graphics', 'Shareable cards', 'Social media ready', 'Custom branding'],
    },
    {
      category: 'engagement',
      title: 'Mobile App',
      description: 'Real-time academic monitoring. Parents stay engaged on the go with push notifications.',
      icon: null,
      image: '/video.png',
      features: ['Real-time updates', 'Push notifications', 'Offline access', 'Native apps'],
    },
    {
      category: 'analytics',
      title: 'Beautiful Analytics',
      description: 'Disney-inspired glassomorphic dashboards with engaging visualizations and insights.',
      icon: null,
      image: '/LessonDashboard.png',
      features: ['Performance tracking', 'Trend analysis', 'Custom reports', 'Data export'],
    },
    {
      category: 'analytics',
      title: 'Advanced Reporting',
      description: 'Generate comprehensive reports instantly. Track metrics, trends, and student progress.',
      icon: null,
      image: '/Payment.png',
      features: ['Instant reports', 'Scheduled exports', 'PDF generation', 'Email reports'],
    },
    {
      category: 'engagement',
      title: 'Result Checker',
      description: 'Innovative scratch card system for result verification. Gamify the result-checking experience.',
      icon: null,
      image: '/Results.png',
      features: ['Scratch cards', 'Gamification', 'Verification', 'Engagement tracking'],
    },
    {
      category: 'integration',
      title: 'Built-In Monetization',
      description: 'Premium features that generate revenue while helping schools. Create income streams.',
      icon: null,
      image: '/Payment.png',
      features: ['Premium tiers', 'Payment gateway', 'Subscription mgmt', 'Revenue tracking'],
    },
  ];

  const displayedFeatures = selectedCategory === 'all' 
    ? allFeatures 
    : allFeatures.filter(f => f.category === selectedCategory);

  return (
    <div className="w-full bg-black text-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative w-full min-h-[600px] flex items-center justify-center px-4 md:px-12 lg:px-20 overflow-hidden bg-black pt-32 pb-20">
        {/* Background Image */}
        <img
          src="/Hero.png"
          className="absolute h-full w-full object-cover inset-0"
          alt="Background"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight text-white">
            Powerful Features
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
            Everything you need to manage, publish, and engage with student results. Built for modern schools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register" className="glow-button items-center border shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] flex gap-2 overflow-hidden px-6 py-3 rounded-lg border-solid border-[rgba(255,255,255,0.07)] hover:bg-white/5 transition-colors text-white text-sm font-medium inline-flex">
              Get Started
              <ArrowRight01 className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="relative py-16 px-4 md:px-8 bg-black overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {featureCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20 px-4 md:px-8 bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl top-0 left-1/4 -translate-x-1/2" />
          <div className="absolute w-96 h-96 bg-gradient-to-tl from-blue-500/10 to-purple-500/10 rounded-full blur-3xl bottom-0 right-1/4 translate-x-1/2" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedFeatures.map((feature, index) => {
              return (
                <FeatureCard
                  key={index}
                  preview={
                    feature.image ? (
                      <img 
                        src={feature.image} 
                        alt={feature.title}
                        className={`h-auto rounded-md object-cover ${feature.image === '/Score.png' ? 'w-1/2 mx-auto' : 'w-full'}`}
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex w-8 h-8 shrink-0 rounded-lg items-center justify-center bg-[#3395FF]">
                          <feature.icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-xs">
                          <div className="text-gray-300 font-medium">Feature {index + 1}</div>
                          <div className="text-gray-500">Learn more →</div>
                        </div>
                      </div>
                    )
                  }
                  isImagePreview={!!feature.image}
                  title={feature.title}
                  description={feature.description}
                  buttonText="Learn more →"
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed Features Section */}
      <section className="relative py-20 px-4 md:px-8 bg-black overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Deep Dive Into <span className="text-blue-400">Capabilities</span>
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Explore the comprehensive toolset designed for modern education management
          </p>

          <div className="space-y-8">
            {/* Feature Detail 1 */}
            <div className="relative rounded-[30px] border shadow-[0_1px_3px_0_rgba(199,220,255,0.60)_inset,0_0_60px_0_rgba(198,204,255,0.45)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] backdrop-blur-[10px] bg-[rgba(255,255,255,0.05)] p-8 overflow-hidden hover:bg-white/10 transition-all duration-300 border-solid border-[rgba(255,255,255,0.07)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-3xl font-bold mb-4 text-white">
                    Instant Result Publishing
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    Publish student results instantly with auto-formatted documents. One-click PDF generation, email distribution, and archive management.
                  </p>
                  <ul className="space-y-3">
                    {['Auto-formatting', 'Batch processing', 'Email integration', 'Archive management'].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-center rounded-2xl min-h-[300px]">
                  <img 
                    src="/Results.png" 
                    alt="Result Publishing"
                    className="h-auto rounded-md object-cover w-full"
                  />
                </div>
              </div>
            </div>

            {/* Feature Detail 2 */}
            <div className="relative rounded-[30px] border shadow-[0_1px_3px_0_rgba(199,220,255,0.60)_inset,0_0_60px_0_rgba(198,204,255,0.45)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] backdrop-blur-[10px] bg-[rgba(255,255,255,0.05)] p-8 overflow-hidden hover:bg-white/10 transition-all duration-300 border-solid border-[rgba(255,255,255,0.07)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center justify-center rounded-2xl min-h-[300px]">
                  <img 
                    src="/Social.png" 
                    alt="Parent Engagement"
                    className="h-auto rounded-md object-cover w-full"
                  />
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-4 text-white">
                    Parent Engagement Hub
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    Keep parents in the loop with real-time notifications, shared achievements, and progress tracking on mobile and web.
                  </p>
                  <ul className="space-y-3">
                    {['Push notifications', 'Achievement sharing', 'Progress tracking', 'Mobile app'].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature Detail 3 */}
            <div className="relative rounded-[30px] border shadow-[0_1px_3px_0_rgba(199,220,255,0.60)_inset,0_0_60px_0_rgba(198,204,255,0.45)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] backdrop-blur-[10px] bg-[rgba(255,255,255,0.05)] p-8 overflow-hidden hover:bg-white/10 transition-all duration-300 border-solid border-[rgba(255,255,255,0.07)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-3xl font-bold mb-4 text-white">
                    Advanced Security
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    Enterprise-grade security with encryption, role-based access, audit trails, and compliance certifications.
                  </p>
                  <ul className="space-y-3">
                    {['End-to-end encryption', 'Role-based access', 'Audit logging', 'GDPR compliant'].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center justify-center rounded-2xl min-h-[300px]">
                  <img 
                    src="/LessonDashboard.png" 
                    alt="Security"
                    className="h-auto rounded-md object-cover w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="relative py-20 px-4 md:px-8 bg-black overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Compare Plans & Features
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Everything you need, from starter to enterprise
          </p>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-white font-semibold">Feature</th>
                  <th className="text-center py-4 px-6 text-gray-300 font-semibold">Starter</th>
                  <th className="text-center py-4 px-6 text-gray-300 font-semibold">Pro</th>
                  <th className="text-center py-4 px-6 text-gray-300 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Result Publishing', starter: true, pro: true, enterprise: true },
                  { name: 'CSV Import', starter: true, pro: true, enterprise: true },
                  { name: 'Mobile App', starter: false, pro: true, enterprise: true },
                  { name: 'Advanced Analytics', starter: false, pro: true, enterprise: true },
                  { name: 'Social Sharing', starter: false, pro: true, enterprise: true },
                  { name: 'Scratch Card Verification', starter: false, pro: false, enterprise: true },
                  { name: 'API Access', starter: false, pro: false, enterprise: true },
                  { name: 'Premium Support', starter: false, pro: false, enterprise: true },
                ].map((item, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-gray-300">{item.name}</td>
                    <td className="text-center py-4 px-6">
                      {item.starter ? (
                        <Check className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <div className="w-5 h-5 border border-gray-600 rounded mx-auto" />
                      )}
                    </td>
                    <td className="text-center py-4 px-6">
                      {item.pro ? (
                        <Check className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <div className="w-5 h-5 border border-gray-600 rounded mx-auto" />
                      )}
                    </td>
                    <td className="text-center py-4 px-6">
                      {item.enterprise ? (
                        <Check className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        <div className="w-5 h-5 border border-gray-600 rounded mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative py-20 px-4 md:px-8 bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute w-96 h-96 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl top-1/2 left-0 -translate-y-1/2" />
          <div className="absolute w-96 h-96 bg-gradient-to-tl from-blue-500/5 to-purple-500/5 rounded-full blur-3xl bottom-0 right-0" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Real-World <span className="text-blue-400">Use Cases</span>
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            See how schools use Results Pro to streamline their workflows
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Publishing Term Results',
                description: 'Upload CSV files, auto-generate result slips, and distribute to parents in one click. What takes hours now takes minutes.',
                steps: ['Upload results CSV', 'Auto-format documents', 'Email to parents', 'Archive for records'],
                image: '/Results.png'
              },
              {
                title: 'Parent Achievement Sharing',
                description: 'Create branded achievement graphics automatically. Parents love sharing their child\'s success on social media.',
                steps: ['Generate graphics', 'Customize branding', 'Parents share online', 'Track engagement'],
                image: '/Social.png'
              },
              {
                title: 'Result Verification',
                description: 'Students use innovative scratch cards to check results. Gamified experience reduces anxious queries to admin.',
                steps: ['Student login', 'Scratch virtual card', 'View results securely', 'Share with parents'],
                image: '/video.png'
              }
            ].map((useCase, idx) => (
              <div
                key={idx}
                className="relative rounded-[20px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] hover:bg-white/5 transition-all duration-300 border-solid border-[rgba(255,255,255,0.07)] overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="w-full h-40 overflow-hidden">
                  <img 
                    src={useCase.image} 
                    alt={useCase.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-semibold mb-3 text-white">{useCase.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">{useCase.description}</p>
                  <div className="space-y-2">
                    {useCase.steps.map((step, stepIdx) => (
                      <div key={stepIdx} className="flex items-center gap-3">
                        <div className="flex w-6 h-6 rounded-full items-center justify-center bg-blue-500/30 text-blue-300 text-xs font-semibold flex-shrink-0">
                          {stepIdx + 1}
                        </div>
                        <span className="text-sm text-gray-300">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Training & Support Section */}
      <section className="relative py-20 px-4 md:px-8 bg-black overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Training & <span className="text-blue-400">Support</span>
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            We're here to help you succeed every step of the way
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Video Tutorials',
                description: 'Step-by-step guides for every feature. Watch at your own pace.',
                icon: '🎥',
                image: '/video.png'
              },
              {
                title: 'Live Support',
                description: 'Chat with our team. Real people, real help. Available 9am-5pm GMT.',
                icon: '💬',
                image: '/Social.png'
              },
              {
                title: 'Knowledge Base',
                description: 'Browse our extensive documentation and searchable article library.',
                icon: '📚',
                image: '/LessonDashboard.png'
              },
              {
                title: 'Webinars & Training',
                description: 'Weekly live sessions covering best practices and new features.',
                icon: '🎓',
                image: '/Results.png'
              },
              {
                title: 'Email Support',
                description: '24-hour response time for all support inquiries. Detailed solutions.',
                icon: '✉️',
                image: '/Payment.png'
              },
              {
                title: 'Community Forum',
                description: 'Connect with other schools. Share tips and learn from peers.',
                icon: '👥',
                image: '/Score.png'
              },
              {
                title: 'Onboarding Sessions',
                description: 'Get personalized setup assistance from our implementation team.',
                icon: '🚀',
                image: '/Results.png'
              },
              {
                title: 'Dedicated Account Manager',
                description: 'Enterprise clients get a dedicated point of contact for everything.',
                icon: '⭐',
                image: '/Social.png'
              }
            ].map((support, idx) => (
              <div
                key={idx}
                className="relative rounded-[20px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] hover:bg-white/5 transition-all duration-300 border-solid border-[rgba(255,255,255,0.07)] overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="w-full h-32 overflow-hidden">
                  <img 
                    src={support.image} 
                    alt={support.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold mb-2 text-white">{support.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{support.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-4 md:px-8 bg-black overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl top-0 left-1/4 -translate-x-1/2" />
          <div className="absolute w-96 h-96 bg-gradient-to-tl from-blue-500/10 to-purple-500/10 rounded-full blur-3xl bottom-0 right-1/4 translate-x-1/2" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Frequently Asked <span className="text-blue-400">Questions</span>
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Find answers to common questions about Results Pro
          </p>

          <div className="space-y-4">
            {[
              {
                q: 'How long does it take to set up Results Pro?',
                a: 'Most schools are up and running within 24-48 hours. Our implementation team handles the CSV import and customization. You can start publishing results on day one.'
              },
              {
                q: 'Is Results Pro secure? What about data privacy?',
                a: 'Yes. We use end-to-end encryption, role-based access controls, and maintain full GDPR compliance. All data is backed up daily and stored securely on enterprise-grade servers.'
              },
              {
                q: 'Can teachers upload results themselves?',
                a: 'Yes! Teachers can use our intuitive CSV template or upload directly through the dashboard. No coding knowledge needed. Our system validates data automatically.'
              },
              {
                q: 'What if we have an issue during result publishing?',
                a: 'Our support team is available 24/7. Enterprise clients get priority support with a 1-hour response guarantee. We also have automated failover systems to prevent interruptions.'
              },
              {
                q: 'Can we integrate Results Pro with our school\'s existing system?',
                a: 'Yes. We offer API access and integrations with popular LMS platforms, attendance systems, and payment gateways. Contact us for custom integration options.'
              },
              {
                q: 'What happens to our data if we stop using Results Pro?',
                a: 'Your data is always yours. We can export everything to CSV format at any time. You have full control and can migrate away anytime without penalties.'
              },
              {
                q: 'Do you offer discounts for multiple schools?',
                a: 'Yes. School districts and education groups qualify for volume discounts. Contact our sales team for a custom quote.'
              },
              {
                q: 'Can parents check results on mobile?',
                a: 'Absolutely. We have native iOS and Android apps plus a responsive mobile web version. Parents can check results, view analytics, and share achievements from anywhere.'
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="relative rounded-[20px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] hover:bg-white/5 transition-all duration-300 border-solid border-[rgba(255,255,255,0.07)] overflow-hidden"
              >
                <details className="group p-6">
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-white hover:text-blue-300 transition-colors">
                    <span className="text-base md:text-lg">{faq.q}</span>
                    <span className="transition group-open:rotate-180">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 9l7 7 7-7" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-4 text-gray-400 leading-relaxed text-sm md:text-base">{faq.a}</p>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 md:px-8 bg-gradient-to-b from-black to-blue-950/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Experience All Features?
          </h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Start your free trial today. No credit card required. Full access to all features for 30 days.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register" className="glow-button items-center border shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] flex gap-2 overflow-hidden px-6 py-3 rounded-lg border-solid border-[rgba(255,255,255,0.07)] hover:bg-white/5 transition-colors text-white text-sm font-medium inline-flex">
              Start Free Trial
              <ArrowRight01 className="w-5 h-5" />
            </Link>
            <Link to="/" className="glow-button items-center border shadow-[0_1px_3px_0_rgba(199,220,255,0.35)_inset,0_0_20px_0_rgba(198,204,255,0.20)_inset,0_1px_22px_0_rgba(255,255,255,0.10),0_4px_4px_0_rgba(0,0,0,0.05),0_10px_10px_0_rgba(0,0,0,0.10)] backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] flex gap-2 overflow-hidden px-6 py-3 rounded-lg border-solid border-[rgba(255,255,255,0.07)] hover:bg-white/5 transition-colors text-white text-sm font-medium inline-flex">
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-500/10 bg-black py-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Results Pro</h4>
              <p className="text-gray-400 text-sm">
                Modern results management for Nigerian schools.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4 text-white">Product</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/features" className="hover:text-blue-400 transition-colors">Features</Link></li>
                <li><Link to="/" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4 text-white">Company</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
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

export default Features;
