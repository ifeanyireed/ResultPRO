import React from 'react';

const Profile: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Profile</h1>
        <p className="text-gray-400">Manage your account settings and profile information</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[20px] p-8">
        <h2 className="text-xl font-semibold text-white mb-6">Account Information</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <p className="text-white">
              {user.email || 'Not available'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
            <p className="text-white">
              {user.role ? user.role.replace(/_/g, ' ') : 'Not available'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">School Name</label>
            <p className="text-white">
              {localStorage.getItem('schoolName') || 'Not available'}
            </p>
          </div>

          <div className="pt-6 border-t border-white/10">
            <p className="text-sm text-gray-400">
              For more detailed profile management, please contact your school administrator or visit Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
