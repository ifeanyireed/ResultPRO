import React, { useState } from 'react';
import { Plus, Edit02, Trash01, BookOpen } from '@hugeicons/react';

const SubjectManagement: React.FC = () => {
  const [subjects] = useState([
    { id: 1, name: 'Mathematics', code: 'MAT101', classes: 4, teacher: 'Mr. Adeyemi', status: 'Active' },
    { id: 2, name: 'English Language', code: 'ENG101', classes: 4, teacher: 'Miss Eze', status: 'Active' },
    { id: 3, name: 'Physics', code: 'PHY101', classes: 3, teacher: 'Mr. Okafor', status: 'Active' },
    { id: 4, name: 'Chemistry', code: 'CHM101', classes: 3, teacher: 'Mrs. Bello', status: 'Active' },
    { id: 5, name: 'Biology', code: 'BIO101', classes: 3, teacher: 'Mr. Nwosu', status: 'Active' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Subject Management</h2>
          <p className="text-gray-400 text-sm mt-1">Create and manage subjects offered in your school</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-400 font-medium transition-colors">
          <Plus className="w-4 h-4" />
          New Subject
        </button>
      </div>

      {/* Subjects Table */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 bg-white/2.5">
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Subject Name</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Code</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Classes</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Lead Teacher</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4 px-6 text-white font-medium">{row.name}</td>
                  <td className="py-4 px-6 text-gray-400">{row.code}</td>
                  <td className="py-4 px-6 text-white">{row.classes}</td>
                  <td className="py-4 px-6 text-white">{row.teacher}</td>
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
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold">Total Subjects</h3>
          </div>
          <p className="text-3xl font-bold text-white">12</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">Core Subjects</h3>
          </div>
          <p className="text-3xl font-bold text-white">5</p>
        </div>
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[20px] border border-[rgba(255,255,255,0.07)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-white font-semibold">Elective</h3>
          </div>
          <p className="text-3xl font-bold text-white">7</p>
        </div>
      </div>
    </div>
  );
};

export default SubjectManagement;
