import React, { useState } from 'react';
import { Plus, Mail, MoreVertical, CheckCircle, Clock } from '@hugeicons/react';

const ParentAccountsManagement: React.FC = () => {
  const [parents] = useState([
    { id: 1, name: 'Mr. Okafor Chukwu', email: 'okafor@email.com', phone: '+234 812 345 6789', child: 'Chioma Okafor', status: 'Active' },
    { id: 2, name: 'Mrs. Adeyemi Tayo', email: 'adeyemi@email.com', phone: '+234 802 987 6543', child: 'Tunde Adeyemi', status: 'Active' },
    { id: 3, name: 'Mr. Nwosu Chukwuma', email: 'nwosu@email.com', phone: '+234 810 547 3210', child: 'Amara Nwosu', status: 'Pending' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Parent Accounts</h2>
          <p className="text-gray-400 text-sm mt-1">Invite and manage parent accounts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-400 font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Invite Parent
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Total Parents</p>
          <p className="text-3xl font-bold text-white">823</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Active</p>
          <p className="text-3xl font-bold text-green-400">812</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Pending</p>
          <p className="text-3xl font-bold text-amber-400">11</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Activation Rate</p>
          <p className="text-3xl font-bold text-blue-400">98.7%</p>
        </div>
      </div>

      {/* Parents Table */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 bg-white/2.5">
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Parent Name</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Email</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Phone</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Child</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parents.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4 px-6 text-white font-medium">{row.name}</td>
                  <td className="py-4 px-6 text-gray-400">{row.email}</td>
                  <td className="py-4 px-6 text-gray-400">{row.phone}</td>
                  <td className="py-4 px-6 text-white">{row.child}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {row.status === 'Active' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-xs font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-400 text-xs font-medium">Pending</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-blue-400 hover:text-blue-300"><Mail className="w-4 h-4" /></button>
                      <button className="text-gray-400 hover:text-white"><MoreVertical className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Communication Settings */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
        <h3 className="text-lg font-semibold text-white mb-6">Communication Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-white">Send results via email</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-white">Send results via SMS</span>
            </label>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-white">Send portal access</span>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-white">Send notifications</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentAccountsManagement;
