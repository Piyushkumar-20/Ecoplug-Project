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
            {profile.user.name
              .split(" ")
              .filter(Boolean)
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {profile.user.name}
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              {profile.company.name}
            </p>
            <p className="text-xs font-bold text-amber-600">
              {profile.user.role}
            </p>
          </div>
_
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{profile.user.email}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{profile.admin.mobile || "Not provided"}</span>
            </div>

            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>
                {[
                  profile.company.city,
                  profile.company.state,
                  profile.company.pin,
                ].filter(Boolean).join(", ") || "Not provided"}
              </span>
            </div>
          </div>
        </div>
      </div>


      
      
      {/* Company & Admin Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>Company Details</span>
          </h3>

          <div className="space-y-2 text-xs">
            {[
              ["Company Name", profile.company.name],
              ["Company ID", profile.company.id],
              ["Party ID", profile.company.partyId],
              ["Company Role", profile.company.role],
              ["Address", profile.company.address],
              ["City", profile.company.city],
              ["State", profile.company.state],
              ["PIN Code", profile.company.pin],
              ["GSTIN", profile.company.gstin],
              ["CIN", profile.company.cin],
              ["PAN", profile.company.pan],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2 border-b border-slate-100">
                <span className="text-slate-500">{label}</span>
                <span className="font-bold text-slate-900 text-right break-all">
                  {value || "Not provided"}
                </span>
              </div>
            ))}
          </div>
        </div>
     
        {profile.user.role === "ADMIN" && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-500" />
            <span>Admin Details</span>
          </h3>

          <div className="space-y-2 text-xs">
            {[
              ["Admin Name", profile.admin.name],
              ["Admin Email", profile.admin.email],
              ["Admin Mobile", profile.admin.mobile],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2 border-b border-slate-100">
                <span className="text-slate-500">{label}</span>
                <span className="font-bold text-slate-900 text-right break-all">
                  {value || "Not provided"}
                </span>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

    </div>
  );
};

export default ProfileView;
