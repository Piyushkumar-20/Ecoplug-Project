
import React, { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
} from 'lucide-react';
import { apiRequest } from '../services/api';

const ProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiRequest('/api/companies/profile');
        setProfile(data.data);
      } catch (error) {
        setError(error.message || 'Failed to load profile');
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

  const companyDetails = [
    ['Company Name', profile.company.name],
    ['Company ID', profile.company.id],
    ['Party ID', profile.company.partyId],
    ['Company Role', profile.company.role],
    ['Address', profile.company.address],
    ['City', profile.company.city],
    ['State', profile.company.state],
    ['PIN Code', profile.company.pin],
    ['GSTIN', profile.company.gstin],
    ['CIN', profile.company.cin],
    ['PAN', profile.company.pan],
  ];

  const location = [
    profile.company.city,
    profile.company.state,
    profile.company.pin,
  ]
    .filter(Boolean)
    .join(', ');

  const initials = (profile.user.name || 'U')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const renderDetails = (details) =>
    details.map(([label, value]) => (
      <div
        key={label}
        className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4 py-3 border-b border-slate-100 last:border-b-0"
      >
        <span className="text-sm text-slate-500 shrink-0">
          {label}
        </span>
        <span className="text-sm font-bold text-slate-900 text-left sm:text-right break-words [overflow-wrap:anywhere]">
          {value || 'Not provided'}
        </span>
      </div>
    ));

  return (
    <div className="relative -mt-6 -mx-6 min-h-screen pb-12 bg-[#F3F6FC]">

      {/* Header */}
      <header className="relative isolate overflow-hidden bg-gradient-to-r from-[#0D1B35] via-[#153966] to-[#24528B] px-6 sm:px-10 pt-6 pb-20 sm:pb-24">
        <div className="absolute -top-32 right-10 w-96 h-96 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -top-20 right-24 w-72 h-72 rounded-full border border-white/10 pointer-events-none" />

        <div className="relative z-10">
          
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            User Profile
          </h1>

        </div>
      </header>

      {/* Main Profile Card */}
      <section className="relative z-10 -mt-16 mx-4 sm:mx-8 lg:mx-12 bg-white p-6 sm:p-5 rounded-3xl border border-slate-200/70 shadow-lg">

        <div className="flex flex-col items-center gap-5 md:flex-row md:items-start md:gap-7">

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border-4 border-white ring-1 ring-blue-100 flex items-center justify-center text-blue-800 font-black text-3xl shadow-lg">
              {initials}
            </div>
          </div>

          {/* Profile Information */}
          <div className="flex-1 min-w-0 w-full text-center md:text-left">

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
             <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {profile.user.name}
              </h2>

              <span className="inline-flex items-center rounded-full bg-orange-100 px-3.5 py-1.5 text-xs font-bold tracking-wide text-orange-800">
                {profile.user.role}
              </span>
            </div>

            <p className="text-base sm:text-lg font-semibold text-slate-500">
              {profile.company.name}
            </p>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mt-6 pt-6 border-t border-slate-100">

              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-blue-50 shrink-0">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-400 mb-1">
                    Email
                  </p>
                  <p className="text-sm font-semibold text-slate-700 break-all">
                    {profile.user.email || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-blue-50 shrink-0">
                  <Phone className="w-5 h-5 text-blue-500" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-400 mb-1">
                    Mobile
                  </p>
                  <p className="text-sm font-semibold text-slate-700 break-words">
                    {profile.admin.mobile || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-blue-50 shrink-0">
                  <MapPin className="w-5 h-5 text-blue-500" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-400 mb-1">
                    Location
                  </p>
                  <p className="text-sm font-semibold text-slate-700 break-words">
                    {location || 'Not provided'}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Company and Admin Details */}
     <section className="grid grid-cols-1 items-start gap-5 mt-5 px-4 sm:px-8 lg:px-12">

        {/* Company Details */}
        <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-3 mb-5">
            <Building2 className="w-5 h-5 text-orange-500" />
            <span>Company Details</span>
          </h3>

          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {companyDetails.map(([label, value]) => (
              <div
                key={label}
                className={`rounded-xl border border-slate-100 bg-slate-50/70 p-4 min-w-0 ${
                  label === "Address" ? "sm:col-span-2" : ""
                }`}
              >
                <p className="text-xs font-medium text-slate-500 mb-2">
                  {label}
                </p>

                <p className="text-sm font-semibold text-slate-800 break-words [overflow-wrap:anywhere]">
                  {value || "Not provided"}
                </p>
              </div>
            ))}
          </div>

        </div>

      </section>
    </div>
  );
};

export default ProfileView;
