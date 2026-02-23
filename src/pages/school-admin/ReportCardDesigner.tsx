import React, { useState } from 'react';
import { Plus, Eye, Edit02, Trash01 } from '@hugeicons/react';

const ReportCardDesigner: React.FC = () => {
  const [templates] = useState([
    { id: 1, name: 'Standard Report Card', classes: 'SS3A, SS3B', form: ['Scores', 'Grades', 'Remarks'], status: 'Active' },
    { id: 2, name: 'Detailed Report', classes: 'SS2A, SS2B', form: ['Scores', 'Grades', 'Class Position', 'Comments'], status: 'Active' },
    { id: 3, name: 'Summary Report', classes: 'All', form: ['Summary Score', 'Overall Grade'], status: 'Inactive' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Report Card Designer</h2>
          <p className="text-gray-400 text-sm mt-1">Create and customize report card templates</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-400 font-medium transition-colors">
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {/* Templates Table */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 bg-white/2.5">
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Template Name</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Classes</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Fields</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4 px-6 text-white font-medium">{row.name}</td>
                  <td className="py-4 px-6 text-gray-400">{row.classes}</td>
                  <td className="py-4 px-6 text-gray-400">{row.form.join(', ')}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      row.status === 'Active'
                        ? 'bg-green-400/10 text-green-400 border border-green-400/20'
                        : 'bg-gray-400/10 text-gray-400 border border-gray-400/20'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-blue-400 hover:text-blue-300"><Eye className="w-4 h-4" /></button>
                      <button className="text-purple-400 hover:text-purple-300"><Edit2 className="w-4 h-4" /></button>
                      <button className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Template Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
          <h3 className="text-lg font-semibold text-white mb-6">Available Fields</h3>
          <div className="space-y-3">
            {[
              'Student Name',
              'Student ID',
              'Class & Section',
              'Subject Scores',
              'Grades',
              'Class Position',
              'Total Score',
              'Average Score',
              'Teacher Comments',
              'Principal\'s Remarks',
            ].map((field, i) => (
              <label key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4" />
                <span className="text-white">{field}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
          <h3 className="text-lg font-semibold text-white mb-6">Template Preview</h3>
          <div className="bg-white text-black rounded-lg p-6 aspect-video flex items-center justify-center border-2 border-dashed border-white/20">
            <div className="text-center">
              <p className="font-bold mb-2">Report Card Preview</p>
              <p className="text-sm text-gray-600">Configure fields to update preview</p>
            </div>
          </div>
        </div>
      </div>

      {/* Branding Options */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
        <h3 className="text-lg font-semibold text-white mb-6">Branding</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-3">School Logo</label>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-blue-400 cursor-pointer">
              <p className="text-gray-400 text-sm">Upload logo image</p>
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-3">Header Color</label>
            <div className="flex items-center gap-3">
              <input type="color" defaultValue="#3B82F6" className="w-16 h-10 rounded-lg cursor-pointer" />
              <span className="text-white">#3B82F6</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportCardDesigner;
