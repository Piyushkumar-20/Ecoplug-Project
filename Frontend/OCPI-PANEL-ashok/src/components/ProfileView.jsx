import React, { useEffect, useState } from "react";
import { Mail, Building2, MapPin, Wallet, Info } from "lucide-react";
import { apiRequest } from "../services/api";

const ProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiRequest("/api/companies/profile");
        setProfile(response.data);
      } catch (error) {
        setError(error.message || "Failed to load profile");
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
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
        {error}
      </div>
    );
  }

  if (!profile?.user || !profile?.company) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-600">
        Profile information is unavailable.
      </div>
    );
  }

  const { user, company } = profile;
  const isAdmin = user.role === "ADMIN";

  const initials = (user.name || "U")
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const location = [company.city, company.state, company.pin]
    .filter(Boolean)
    .join(", ");

  // Basic company information visible to both roles.
  const companyDetails = [
    ["Company Name", company.name],
    ["Company ID", company.id],
    ["Party ID", company.partyId],
    ["Company Role", company.role],
    ["Billing Type", company.billingType],
    ["City", company.city],
    ["State", company.state],
    ["PIN Code", company.pin],
    ["Address", company.address],
  ];

  // Sensitive information is displayed only for ADMIN.
  if (isAdmin) {
    companyDetails.push(
      ["GSTIN", company.gstin],
      ["CIN", company.cin],
      ["PAN", company.pan],
    );
  }

  const renderValue = (value) =>
    value !== null && value !== undefined && value !== ""
      ? value
      : "Not provided";

  return (
    <div className="relative -mt-6 -mx-6 min-h-screen bg-[#F3F6FC] pb-12 transition-colors duration-300 dark:bg-slate-950">
      {/* Header */}
      <header className="relative isolate overflow-hidden bg-gradient-to-r from-[#0D1B35] via-[#153966] to-[#24528B] px-6 pb-20 pt-6 sm:px-10 sm:pb-24">
        <div className="pointer-events-none absolute -top-32 right-10 h-96 w-96 rounded-full border border-white/10" />

        <div className="pointer-events-none absolute -top-20 right-24 h-72 w-72 rounded-full border border-white/10" />

        <h1 className="relative z-10 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          User Profile
        </h1>
      </header>

      {/* User Profile Card */}
      <section className="relative z-10 -mt-16 mx-4 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-lg transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900 sm:mx-8 sm:p-6 lg:mx-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-7">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-blue-100 to-blue-200 text-3xl font-black text-blue-800 shadow-lg ring-1 ring-blue-100">
              {initials}
            </div>
          </div>

          {/* User Information */}
          <div className="min-w-0 w-full flex-1">
            <div className="mb-2 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                {user.name}
              </h2>

              <span
                className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold tracking-wide ${
                  isAdmin
                    ? "bg-blue-100 text-blue-800"
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                {user.role}
              </span>
            </div>

            <p className="text-base font-semibold text-slate-500 sm:text-lg">
              {company.name}
            </p>

            {/* Billing Status */}
            <div className="mt-3 flex justify-center md:justify-start">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold tracking-wide ${
                  company.billingType === "PREPAID"
                    ? "bg-emerald-100 text-emerald-800"
                    : company.billingType === "POSTPAID"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                <Wallet className="h-4 w-4" />

                {company.billingType === "PREPAID"
                  ? "Prepaid Account"
                  : company.billingType === "POSTPAID"
                    ? "Postpaid Account"
                    : "Billing type not set"}
              </span>
            </div>

            {/* Contact Information */}
            <div className="mt-6 grid grid-cols-1 gap-5 border-t border-slate-100 pt-5 dark:border-slate-700 sm:grid-cols-2">
              {/* Email */}
              <div className="flex min-w-0 items-start gap-3">
                <div className="shrink-0 rounded-xl bg-blue-50 p-2 dark:bg-slate-800">
                  <Mail className="h-5 w-5 text-blue-500" />
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs text-slate-400">Email</p>

                  <p className="break-all text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {renderValue(user.email)}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex min-w-0 items-start gap-3">
                <div className="shrink-0 rounded-xl bg-blue-50 p-2 dark:bg-slate-800">
                  <MapPin className="h-5 w-5 text-blue-500" />
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs text-slate-400">Location</p>

                  <p className="break-words text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {location || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Details */}
      <section className="mt-5 px-4 sm:px-8 lg:px-12">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900 sm:p-7">
          <h3 className="mb-5 flex items-center gap-3 text-base font-bold text-slate-900 dark:text-white">
            <Building2 className="h-5 w-5 text-orange-500" />

            <span>Company Details</span>
          </h3>

          {/* Aligned Information Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {companyDetails.map(([label, value]) => (
              <div
                key={label}
                className={`flex min-h-[76px] min-w-0 flex-col justify-center rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800 ${
                  label === "Address" ? "sm:col-span-2" : ""
                }`}
              >
                <p className="mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {label}
                </p>

                <p className="break-words text-sm font-semibold text-slate-800 dark:text-slate-100 [overflow-wrap:anywhere]">
                  {renderValue(value)}
                </p>
              </div>
            ))}
          </div>

          {/* Employee Information Notice */}
          {!isAdmin && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 dark:border-blue-900 dark:bg-blue-950/40">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />

              <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-200">
                Restricted company information (GSTIN, PAN, CIN, and
                administrator contact details) is available to Administrators
                only.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfileView;
