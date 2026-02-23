import React, { useState } from 'react';
import { Save } from '@hugeicons/react';

const SchoolSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    schoolName: 'Excellence Academy',
    registrationNumber: 'EXC-2020-001',
    phone: '+234 812 345 6789',
    email: 'admin@excellenceacademy.edu',
    website: 'https://excellenceacademy.edu',
    address: '123 Education Avenue, Lagos',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">School Settings</h2>
        <p className="text-gray-400 text-sm mt-1">Manage school profile and general settings</p>
      </div>

      {/* School Information */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
        <h3 className="text-lg font-semibold text-white mb-6">School Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">School Name</label>
            <input
              type="text"
              value={settings.schoolName}
              onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Registration Number</label>
            <input
              type="text"
              value={settings.registrationNumber}
              onChange={(e) => setSettings({ ...settings, registrationNumber: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Website</label>
            <input
              type="url"
              value={settings.website}
              onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
        <h3 className="text-lg font-semibold text-white mb-6">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-gray-400 text-sm font-medium mb-2">Street Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">City</label>
            <input
              type="text"
              value={settings.city}
              onChange={(e) => setSettings({ ...settings, city: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">State</label>
            <input
              type="text"
              value={settings.state}
              onChange={(e) => setSettings({ ...settings, state: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Country</label>
            <input
              type="text"
              value={settings.country}
              onChange={(e) => setSettings({ ...settings, country: e.target.value })}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-[rgba(255,255,255,0.02)] rounded-[30px] border border-[rgba(255,255,255,0.07)] p-8">
        <h3 className="text-lg font-semibold text-white mb-6">Branding</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-3">School Logo</label>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-blue-400 cursor-pointer">
              <p className="text-gray-400 text-sm">Upload school logo</p>
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-3">Primary Color</label>
            <div className="flex items-center gap-3">
              <input type="color" defaultValue="#3B82F6" className="w-16 h-10 rounded-lg cursor-pointer" />
              <span className="text-white">#3B82F6</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium hover:bg-white/10 transition-colors">
          Cancel
        </button>
        <button className="flex items-center gap-2 px-6 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-400 font-medium transition-colors">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SchoolSettings;
