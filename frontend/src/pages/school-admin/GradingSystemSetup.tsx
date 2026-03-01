import React, { useState } from 'react';
import { Plus, Edit02, Trash01 } from '@hugeicons/react';

const GradingSystemSetup: React.FC = () => {
  const [gradeBoundaries] = useState([
    { grade: 'A', minScore: 80, maxScore: 100, remark: 'Excellent', color: 'bg-green-400' },
    { grade: 'B', minScore: 70, maxScore: 79, remark: 'Very Good', color: 'bg-blue-400' },
    { grade: 'C', minScore: 60, maxScore: 69, remark: 'Good', color: 'bg-cyan-400' },
    { grade: 'D', minScore: 50, maxScore: 59, remark: 'Fair', color: 'bg-amber-400' },
    { grade: 'E', minScore: 40, maxScore: 49, remark: 'Poor', color: 'bg-orange-400' },
    { grade: 'F', minScore: 0, maxScore: 39, remark: 'Fail', color: 'bg-red-400' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Grading System Setup</h2>
          <p className="text-gray-400 text-sm mt-1">Customize grade boundaries and scale</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-400 font-medium transition-colors">
          <Plus className="w-4 h-4" />
          Add Grade
        </button>
      </div>

      {/* Grade Boundaries Table */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5 bg-white/2.5">
              <tr>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Grade</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Min Score</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Max Score</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Remark</th>
                <th className="text-left py-4 px-6 text-gray-400 font-medium">Color</th>
                <th className="text-right py-4 px-6 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {gradeBoundaries.map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-white/10 text-white">
                      {row.grade}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-white">{row.minScore}</td>
                  <td className="py-4 px-6 text-white">{row.maxScore}</td>
                  <td className="py-4 px-6 text-gray-400">{row.remark}</td>
                  <td className="py-4 px-6">
                    <div className={`w-8 h-8 rounded-full ${row.color} opacity-30 border ${row.color}`} />
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

      {/* Grading Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
          <h3 className="text-lg font-semibold text-white mb-6">Grading Scale Options</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5">
              <span className="text-gray-400">Percentage Scale</span>
              <input type="radio" name="scale" defaultChecked className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5">
              <span className="text-gray-400">Point Scale</span>
              <input type="radio" name="scale" className="w-4 h-4" />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5">
              <span className="text-gray-400">4.0 GPA Scale</span>
              <input type="radio" name="scale" className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
          <h3 className="text-lg font-semibold text-white mb-6">Passing Grade</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-2">Minimum Passing Grade</p>
              <div className="flex items-center gap-3">
                <select className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
                  <option>C (60%)</option>
                  <option>D (50%)</option>
                  <option>E (40%)</option>
                </select>
              </div>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-2">Distinction Grade</p>
              <div className="flex items-center gap-3">
                <select className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white">
                  <option>A (80%)</option>
                  <option>B (70%)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingSystemSetup;
