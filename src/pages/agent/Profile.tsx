import React, { useEffect } from 'react';
import {
  User,
  Award,
  Mail,
  Briefcase,
  CheckCircle,
  Clock,
  Edit02,
} from '@/lib/hugeicons-compat';
import { useAgentProfile } from '@/hooks/useAgentAnalytics';

export const Profile: React.FC = () => {
  const { profile, loading, fetchProfile, updateProfile } = useAgentProfile();
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    bio: '',
    avatarUrl: '',
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">No profile found</div>
      </div>
    );
  }

  const getVerificationBadge = (status: string) => {
    if (status === 'VERIFIED') {
      return (
        <div className="flex items-center gap-1 text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          Verified
        </div>
      );
    }
    if (status === 'PENDING') {
      return (
        <div className="flex items-center gap-1 text-yellow-400 text-sm">
          <Clock className="w-4 h-4" />
          Pending Verification
        </div>
      );
    }
    return (
      <div className="text-red-400 text-sm">Not Verified</div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.specialization}
                className="h-24 w-24 rounded-full object-cover border-2 border-blue-400"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold mb-2">{profile.specialization}</h1>
              <p className="text-gray-300 mb-2">ID: {profile.id.substring(0, 8)}...</p>
              {getVerificationBadge(profile.verificationStatus)}
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
          >
            <Edit2 className="w-4 h-4" />
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Bio Section */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-400" />
              About
            </h2>
            {isEditing ? (
              <div className="space-y-4">
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white placeholder-gray-400 focus:border-blue-500 outline-none"
                />
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="Avatar URL..."
                  className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-white placeholder-gray-400 focus:border-blue-500 outline-none"
                />
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-300">
                  {profile.bio || 'No bio added yet. Edit your profile to add one.'}
                </p>
              </div>
            )}
          </div>

          {/* Credentials Section */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Credentials & Certifications
            </h2>
            {profile.credentials ? (
              <div className="space-y-2 text-gray-300">
                <p>Credentials on file</p>
              </div>
            ) : (
              <p className="text-gray-400">No credentials uploaded yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Account Info */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-sm font-semibold text-white mb-4">Account Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-400">Email</div>
                <div className="text-white font-semibold">user@example.com</div>
              </div>
              <div>
                <div className="text-gray-400">Specialization</div>
                <div className="text-white font-semibold">{profile.specialization}</div>
              </div>
              <div>
                <div className="text-gray-400">Member Since</div>
                <div className="text-white font-semibold">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-sm font-semibold text-white mb-4">Subscription</h3>
            <div className="space-y-2">
              <div className="text-center py-3 bg-slate-900 rounded">
                <div className="text-2xl font-bold text-blue-400">
                  {profile.subscriptionTier}
                </div>
                <div className="text-xs text-gray-400 mt-1">Current Plan</div>
              </div>
              <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition">
                Upgrade Plan
              </button>
            </div>
          </div>

          {/* Verification Status */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-sm font-semibold text-white mb-4">Verification Status</h3>
            <div className="flex items-center justify-center py-4">
              {getVerificationBadge(profile.verificationStatus)}
            </div>
            <p className="text-xs text-gray-400 text-center">
              {profile.verificationStatus === 'VERIFIED'
                ? 'Your account is verified'
                : 'Complete verification to unlock full features'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
