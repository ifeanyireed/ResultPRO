import React, { useState } from 'react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { Plus, Download01, Copy } from '@hugeicons/react';

const ScratchCardManagement: React.FC = () => {
  const batches = [
    { id: 'SCB001', school: 'Lagos Central High School', quantity: 500, generated: '2024-02-10', used: 245, remaining: 255, status: 'active' },
    { id: 'SCB002', school: 'Kano Educational Institute', quantity: 400, generated: '2024-02-08', used: 156, remaining: 244, status: 'active' },
    { id: 'SCB003', school: 'Abuja International School', quantity: 300, generated: '2024-02-05', used: 298, remaining: 2, status: 'depleted' },
    { id: 'SCB004', school: 'Port Harcourt Academy', quantity: 250, generated: '2024-02-01', used: 0, remaining: 250, status: 'active' },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Scratch Card Management</h1>
            <p className="text-gray-400">Generate, track, and manage scratch card batches</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all">
            <Plus className="w-5 h-5" />
            Generate Batch
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative rounded-[20px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-4 hover:bg-white/5 transition-all duration-300">
            <p className="text-gray-400 text-sm mb-1">Total Generated</p>
            <p className="text-2xl font-bold">1,450</p>
          </div>
          <div className="relative rounded-[20px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-4 hover:bg-white/5 transition-all duration-300">
            <p className="text-gray-400 text-sm mb-1">Used</p>
            <p className="text-2xl font-bold text-green-400">699</p>
          </div>
          <div className="relative rounded-[20px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-4 hover:bg-white/5 transition-all duration-300">
            <p className="text-gray-400 text-sm mb-1">Remaining</p>
            <p className="text-2xl font-bold text-blue-400">751</p>
          </div>
          <div className="relative rounded-[20px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-4 hover:bg-white/5 transition-all duration-300">
            <p className="text-gray-400 text-sm mb-1">Usage Rate</p>
            <p className="text-2xl font-bold">48.3%</p>
          </div>
        </div>

        {/* Batches Table */}
        <div className="relative rounded-[30px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] overflow-hidden hover:bg-white/5 transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.07)] bg-white/5">
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Batch ID</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">School</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Quantity</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Generated</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Used</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Remaining</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-white font-mono font-bold">{batch.id}</td>
                    <td className="py-4 px-6 text-gray-400">{batch.school}</td>
                    <td className="py-4 px-6 text-white">{batch.quantity}</td>
                    <td className="py-4 px-6 text-gray-400">{batch.generated}</td>
                    <td className="py-4 px-6 text-white">{batch.used}</td>
                    <td className="py-4 px-6 text-white font-medium">{batch.remaining}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        batch.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {batch.status === 'active' ? 'Active' : 'Depleted'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default ScratchCardManagement;