import React, { useState } from 'react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { Plus, Search, MoreVertical, Eye, Pause, Trash01 } from '@hugeicons/react';

interface School {
  id: number;
  name: string;
  email: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  students: number;
  revenue: number;
  joinDate: string;
  status: 'active' | 'suspended' | 'pending';
}

const SchoolsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [schools, setSchools] = useState<School[]>([
    { id: 1, name: 'Lagos Central High School', email: 'admin@lagoscentral.edu.ng', plan: 'Enterprise', students: 2500, revenue: 500000, joinDate: 'Jan 15, 2024', status: 'active' },
    { id: 2, name: 'Abuja International School', email: 'admin@abujaints.edu.ng', plan: 'Pro', students: 800, revenue: 150000, joinDate: 'Feb 20, 2024', status: 'active' },
    { id: 3, name: 'Ibadan Secondary School', email: 'admin@ibadansec.edu.ng', plan: 'Free', students: 150, revenue: 0, joinDate: 'Mar 10, 2024', status: 'active' },
    { id: 4, name: 'Port Harcourt Academy', email: 'admin@phaacademy.edu.ng', plan: 'Pro', students: 600, revenue: 120000, joinDate: 'Mar 25, 2024', status: 'pending' },
    { id: 5, name: 'Kano Educational Institute', email: 'admin@kanoedu.edu.ng', plan: 'Enterprise', students: 2200, revenue: 450000, joinDate: 'Feb 5, 2024', status: 'active' },
  ]);

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSuspend = (id: number) => {
    setSchools(schools.map(s => 
      s.id === id ? { ...s, status: s.status === 'suspended' ? 'active' : 'suspended' } : s
    ));
  };

  const handleDelete = (id: number) => {
    setSchools(schools.filter(s => s.id !== id));
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Schools Management</h1>
            <p className="text-gray-400">Manage all registered schools and their accounts</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add School
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search schools by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
          />
        </div>

        {/* Schools Table */}
        <div className="relative rounded-[30px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] overflow-hidden hover:bg-white/5 transition-all duration-300">

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.07)] bg-white/5">
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">School Name</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Email</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Plan</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Students</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Revenue</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Status</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.map((school) => (
                  <tr key={school.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 text-white font-medium">{school.name}</td>
                    <td className="py-4 px-6 text-gray-400 text-sm">{school.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        school.plan === 'Enterprise' ? 'bg-purple-500/20 text-purple-300' :
                        school.plan === 'Pro' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {school.plan}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400">{school.students.toLocaleString()}</td>
                    <td className="py-4 px-6 text-white font-medium">₦{school.revenue.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        school.status === 'active' ? 'bg-green-500/20 text-green-300' :
                        school.status === 'suspended' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {school.status === 'active' ? 'Active' : school.status === 'suspended' ? 'Suspended' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSuspend(school.id)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-yellow-400"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(school.id)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative rounded-[20px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-4 hover:bg-white/5 transition-all duration-300">
            <p className="text-gray-400 text-sm mb-1">Total Schools</p>
            <p className="text-2xl font-bold">{schools.length}</p>
          </div>
          <div className="relative rounded-[20px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-4 hover:bg-white/5 transition-all duration-300">
            <p className="text-gray-400 text-sm mb-1">Active</p>
            <p className="text-2xl font-bold text-green-400">{schools.filter(s => s.status === 'active').length}</p>
          </div>
          <div className="relative rounded-[20px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-4 hover:bg-white/5 transition-all duration-300">
            <p className="text-gray-400 text-sm mb-1">Suspended</p>
            <p className="text-2xl font-bold text-red-400">{schools.filter(s => s.status === 'suspended').length}</p>
          </div>
          <div className="relative rounded-[20px] border backdrop-blur-[10px] bg-[rgba(255,255,255,0.02)] border-solid border-[rgba(255,255,255,0.07)] p-4 hover:bg-white/5 transition-all duration-300">
            <p className="text-gray-400 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{schools.filter(s => s.status === 'pending').length}</p>
          </div>
        </div>
      </div>

      {/* Add School Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-950 border border-blue-500/20 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Add New School</h2>
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="School Name"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
              />
              <input
                type="email"
                placeholder="School Email"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
              />
              <select className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50">
                <option value="">Select Plan</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all font-medium"
              >
                Add School
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
};

export default SchoolsManagement;
