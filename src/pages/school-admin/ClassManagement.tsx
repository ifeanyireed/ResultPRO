import React, { useState } from 'react';
import { Plus, Edit02, Trash01, Users } from '@hugeicons/react';

const ClassManagement: React.FC = () => {
  const [classes] = useState([
    { id: 1, name: 'SS3A', form: 'Senior 3', adviser: 'Mrs. Adeyemi', students: 42, status: 'Active' },
    { id: 2, name: 'SS3B', form: 'Senior 3', adviser: 'Mr. Okonkwo', students: 39, status: 'Active' },
    { id: 3, name: 'SS2A', form: 'Senior 2', adviser: 'Miss Eze', students: 41, status: 'Active' },
    { id: 4, name: 'SS2B', form: 'Senior 2', adviser: 'Mr. Bello', students: 40, status: 'Active' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Class Management</h2>
          <p className="text-gray-400 text-sm mt-1">Create and manage classes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-400 font-medium transition-colors">
          <Plus className="w-4 h-4" />
          New Class
        </button>
      </div>

      {/* Classes Table */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 bg-white/2.5">
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Class Name</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Form</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Class Adviser</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Students</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4 px-6 text-white font-medium">{row.name}</td>
                  <td className="py-4 px-6 text-gray-400">{row.form}</td>
                  <td className="py-4 px-6 text-white">{row.adviser}</td>
                  <td className="py-4 px-6 text-white">{row.students}</td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-400/10 text-green-400 border border-green-400/20">
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-blue-400 hover:text-blue-300"><Edit02 className="w-4 h-4" /></button>
                      <button className="text-red-400 hover:text-red-300"><Trash01 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Total Classes</h3>
          </div>
          <p className="text-3xl font-bold text-white">4</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">Total Students</h3>
          </div>
          <p className="text-3xl font-bold text-white">162</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="text-white font-semibold">Avg. Class Size</h3>
          </div>
          <p className="text-3xl font-bold text-white">40.5</p>
        </div>
      </div>
    </div>
  );
};

export default ClassManagement;
