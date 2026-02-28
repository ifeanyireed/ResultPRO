import React, { useState } from 'react';
import { MessageCircle, HelpCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import TicketSubmissionModal from '@/components/TicketSubmissionModal';
import axios from 'axios';
import { toast } from 'sonner';

const Support: React.FC = () => {
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatStep, setChatStep] = useState<'welcome' | 'category' | 'response'>('welcome');
  const [selectedCategory, setSelectedCategory] = useState('');

  const faqs = [
    {
      question: 'How do I reset my password?',
      answer:
        'Click the "Forgot Password" link on the login page. Enter your email address and follow the instructions sent to your inbox.',
      category: 'account',
    },
    {
      question: 'How do I submit exam results?',
      answer:
        'Go to the Results section in your dashboard, click "Add Results", and upload the CSV file with your exam data.',
      category: 'technical',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept credit cards, debit cards, and bank transfers. All payments are processed securely.',
      category: 'billing',
    },
    {
      question: 'How do I add new staff members?',
      answer:
        'School admins can navigate to Staff Management and click "Add New Staff". You can also bulk upload via CSV.',
      category: 'technical',
    },
    {
      question: 'Is my data secure?',
      answer:
        'Yes, we use industry-standard encryption and comply with data protection regulations. Your data is backed up regularly.',
      category: 'account',
    },
  ];

  const categories = [
    { id: 'billing', label: '💰 Billing & Subscription' },
    { id: 'technical', label: '🔧 Technical Issues' },
    { id: 'account', label: '👤 Account & Login' },
    { id: 'features', label: '⭐ Features & Requests' },
    { id: 'general', label: '❓ General Inquiry' },
  ];

  const handleChatSubmit = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage.toLowerCase();
    setChatMessage('');

    // Simple chatbot logic - match keywords
    let response = '';

    if (
      userMessage.includes('password') ||
      userMessage.includes('forgot') ||
      userMessage.includes('login')
    ) {
      response =
        'To reset your password, click "Forgot Password" on the login page and follow the email instructions.';
      setSelectedCategory('account');
    } else if (
      userMessage.includes('upload') ||
      userMessage.includes('results') ||
      userMessage.includes('csv')
    ) {
      response =
        'You can upload results via the Results section in your dashboard. Supports CSV format.';
      setSelectedCategory('technical');
    } else if (
      userMessage.includes('payment') ||
      userMessage.includes('bill') ||
      userMessage.includes('cost')
    ) {
      response = 'We accept credit cards, debit cards, and bank transfers. All payments are secure.';
      setSelectedCategory('billing');
    } else if (
      userMessage.includes('staff') ||
      userMessage.includes('user') ||
      userMessage.includes('add')
    ) {
      response =
        'To add staff members, go to Staff Management and click "Add New Staff". Bulk uploads are also supported.';
      setSelectedCategory('technical');
    } else {
      response =
        "I'm not sure about that. Could you provide more details? Or you can submit a support ticket for faster assistance.";
    }

    setChatStep('response');
    setTimeout(() => {
      setChatMessage(response);
    }, 500);
  };

  const handleNewChat = () => {
    setChatMessage('');
    setChatStep('welcome');
    setSelectedCategory('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Support Center</h1>
          </div>
          <p className="text-blue-100 text-lg">
            We're here to help. Find answers or submit a ticket.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Support Options */}
          <div className="lg:col-span-2">
            {/* Quick Actions */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get Help</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => setTicketModalOpen(true)}
                  className="h-auto p-6 justify-start hover:shadow-lg transition-shadow"
                  variant="outline"
                >
                  <Send className="w-5 h-5 mr-3 text-blue-600" />
                  <div className="text-left">
                    <div className="font-semibold">Submit a Ticket</div>
                    <div className="text-xs text-gray-600">Get direct support from our team</div>
                  </div>
                </Button>

                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-3 p-6 border rounded-lg hover:shadow-lg transition-shadow h-auto"
                >
                  <div className="text-2xl">💬</div>
                  <div className="text-left">
                    <div className="font-semibold">WhatsApp Support</div>
                    <div className="text-xs text-gray-600">Chat with us directly</div>
                  </div>
                </a>
              </div>
            </div>

            {/* FAQs */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6" />
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <details
                    key={idx}
                    className="group border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between">
                      <span>{faq.question}</span>
                      <span className="text-gray-400 group-open:text-blue-600">▼</span>
                    </summary>
                    <p className="text-gray-600 mt-3">{faq.answer}</p>
                    <span className="text-xs text-gray-400 mt-2 inline-block">
                      Category: {faq.category}
                    </span>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Chat */}
          <div>
            <div className="sticky top-4">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {/* Chat Header */}
                <div className="bg-blue-600 text-white p-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Quick Help
                  </h3>
                  <p className="text-xs text-blue-100 mt-1">Ask a question or browse FAQs</p>
                </div>

                {/* Chat Body */}
                <div className="h-64 overflow-y-auto p-4 bg-gray-50">
                  {chatStep === 'welcome' && (
                    <div className="space-y-3">
                      <div className="bg-blue-100 text-blue-900 p-3 rounded-lg text-sm">
                        👋 Hi! How can we help you today? You can ask a question below.
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        Or submit a ticket for priority support →
                      </div>
                    </div>
                  )}

                  {chatStep === 'response' && (
                    <div className="space-y-3">
                      <div className="bg-gray-200 text-gray-900 p-3 rounded-lg text-sm ml-auto w-4/5">
                        {chatMessage.split('?')[0] + '?'}
                      </div>
                      <div className="bg-blue-100 text-blue-900 p-3 rounded-lg text-sm">
                        {chatMessage}
                      </div>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        <button
                          onClick={handleNewChat}
                          className="text-blue-600 hover:underline"
                        >
                          Ask another question
                        </button>
                      </p>
                    </div>
                  )}
                </div>

                {/* Chat Footer */}
                {chatStep !== 'response' && (
                  <div className="border-t p-3 space-y-2">
                    <Input
                      placeholder="Ask a question..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleChatSubmit();
                      }}
                      className="text-sm"
                    />
                    <Button
                      onClick={handleChatSubmit}
                      disabled={!chatMessage.trim()}
                      className="w-full text-sm"
                      size="sm"
                    >
                      Send
                    </Button>
                  </div>
                )}

                {chatStep === 'response' && (
                  <div className="border-t p-3">
                    <Button
                      onClick={handleNewChat}
                      variant="outline"
                      className="w-full text-sm"
                      size="sm"
                    >
                      New Question
                    </Button>
                  </div>
                )}
              </div>

              {/* Contact Info Card */}
              <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Need more help?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Email us or submit a support ticket for detailed assistance.
                </p>
                <Button
                  onClick={() => setTicketModalOpen(true)}
                  className="w-full"
                  size="sm"
                >
                  Submit Ticket
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Modal */}
      <TicketSubmissionModal
        open={ticketModalOpen}
        onOpenChange={setTicketModalOpen}
        schoolId="public"
        onSuccess={() => {
          toast.success('Ticket submitted! We will get back to you soon.');
        }}
      />
    </div>
  );
};

export default Support;
