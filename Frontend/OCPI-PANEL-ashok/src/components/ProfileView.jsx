import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Shield, Building2, MapPin, Key, Award, CheckCircle } from 'lucide-react';
import { apiRequest } from '../services/api';

const ProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiRequest("/api/companies/profile");
        setProfile(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4">
        {error}
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">Manage your eMSP network administrator profile & settings.</p>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-amber-100 border-4 border-amber-300 flex items-center justify-center text-amber-900 font-black text-2xl shadow-md">
            AK
          </div>
          <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">{profile.user.name}</h2>
              <p className="text-xs font-semibold text-slate-500">
                {profile.company.name}
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full inline-block self-center md:self-start">
              Verified Partner
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center space-x-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{profile.user.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{profile.admin.mobile || "Not provided"}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{[
                profile.company.city,
                profile.company.state,
                profile.company.pin,
              ].filter(Boolean).join(", ") || "Not provided"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            <span>Role & Permissions</span>
          </h3>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Access Level</span>
              <span className="font-bold text-slate-900">
                {profile.user.role}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Roaming Protocol</span>
              <span className="font-bold text-slate-900">OCPI v2.2.1</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Managed CPOs</span>
              <span className="font-bold text-slate-900">52 Active Partners</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Two-Factor Authentication</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Enabled
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-500" />
            <span>API & Credentials</span>
          </h3>
          
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-500 text-[11px] font-semibold block mb-1">eMSP Roaming API Key</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="password" 
                  value="emsp_live_99812489124891248912" 
                  readOnly 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-slate-700"
                />
                <button className="px-3 py-1.5 bg-[#FEF0A6] hover:bg-amber-300 font-bold rounded-xl text-slate-900 transition-colors">
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-500 text-[11px] font-semibold block mb-1">CPO Endpoint Token</label>
              <div className="flex items-center space-x-2">
                <input 
                  type="password" 
                  value="cpo_token_secret_x88921" 
                  readOnly 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-slate-700"
                />
                <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl text-slate-700 transition-colors">
                  Show
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
