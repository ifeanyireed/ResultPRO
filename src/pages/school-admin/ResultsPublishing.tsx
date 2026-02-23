import React, { useState } from 'react';
import { Send, Clock, CheckCircle, AlertCircle } from '@hugeicons/react';

const ResultsPublishing: React.FC = () => {
  const [publishQueue] = useState([
    { id: 1, class: 'SS3A', subject: 'Mathematics', status: 'published', recipients: 42, date: '2 days ago' },
    { id: 2, class: 'SS3A', subject: 'English', status: 'published', recipients: 42, date: '1 day ago' },
    { id: 3, class: 'SS3B', subject: 'Physics', status: 'queued', recipients: 39, date: 'Today' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Results Publishing</h2>
          <p className="text-gray-400 text-sm mt-1">Queue results for email & SMS delivery to parents</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-400 font-medium transition-colors">
          <Send className="w-4 h-4" />
          Publish Results
        </button>
      </div>

      {/* Publishing Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Total Published</p>
          <p className="text-3xl font-bold text-white">2,940</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Queued</p>
          <p className="text-3xl font-bold text-amber-400">324</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Total Recipients</p>
          <p className="text-3xl font-bold text-purple-400">843</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Delivery Rate</p>
          <p className="text-3xl font-bold text-green-400">98.5%</p>
        </div>
      </div>

      {/* Publishing Queue */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 bg-white/2.5">
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Class</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Subject</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Recipients</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {publishQueue.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4 px-6 text-white font-medium">{row.class}</td>
                  <td className="py-4 px-6 text-white">{row.subject}</td>
                  <td className="py-4 px-6 text-gray-400">{row.recipients}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {row.status === 'published' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-xs font-medium">Published</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-400 text-xs font-medium">Queued</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-400 text-xs">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publishing Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
          <h3 className="text-lg font-semibold text-white mb-6">Email Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-white">Send to parents</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-white">Send to students</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-white">Send to teachers</span>
            </label>
          </div>
        </div>

        <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
          <h3 className="text-lg font-semibold text-white mb-6">SMS Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-white">Send score summary</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-white">Include grade only</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-white">Send link to portal</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPublishing;
