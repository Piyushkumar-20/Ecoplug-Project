import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, LogOut } from 'lucide-react';
import { apiRequest } from '../services/api';
import {
  Search,
  Bell,
  Grid,
  ChevronDown,
  Menu,
  Building2,
  Check,
  Zap,
  SlidersHorizontal,
  PanelLeft
} from 'lucide-react';

const Header = ({ onOpenSidebar, onToggleSidebar, isSidebarOpen, selectedCpo, setSelectedCpo }) => {
  const [isCpoOpen, setIsCpoOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const userName = user.name || "User";
  const userRole = user.role || "User";
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout API error:", error.message);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsProfileOpen(false);
      navigate("/login", { replace: true });
    }
  };


  const handleToggle = onToggleSidebar || onOpenSidebar;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs select-none">
      {/* Left Area: Sidebar Toggle & Search */}
      <div className="flex items-center space-x-3 lg:space-x-4 flex-1 max-w-2xl">
        <button
          onClick={handleToggle}
          className="p-2 rounded-xl text-slate-600 hover:bg-amber-50 hover:text-amber-900 border border-slate-200/80 hover:border-amber-300 transition-all cursor-pointer flex items-center justify-center shadow-2xs group"
          title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          aria-label="Toggle sidebar"
        >
          <PanelLeft className={`w-5 h-5 transition-transform duration-300 ${isSidebarOpen ? 'text-slate-700' : 'text-amber-600 rotate-180'}`} />
        </button>

        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stations, chargers, transactions, tickets..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400/40 focus:bg-white focus:border-amber-400 transition-all"
          />
        </div>
      </div>

      {/* Right Area: Tools, Notifications & Admin User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 relative transition-colors cursor-pointer"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-800">System Alerts</h4>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold">4 New</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto my-1">
                <div className="py-2.5 text-xs">
                  <p className="font-medium text-slate-800">Statiq added 5 new stations</p>
                  <span className="text-[10px] text-slate-400">10 minutes ago</span>
                </div>
                <div className="py-2.5 text-xs">
                  <p className="font-medium text-slate-800 text-rose-600">Tata Power charger offline</p>
                  <span className="text-[10px] text-slate-400">25 minutes ago</span>
                </div>
                <div className="py-2.5 text-xs">
                  <p className="font-medium text-slate-800">New roaming request</p>
                  <span className="text-[10px] text-slate-400">1 hour ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grid Icon */}
        <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors hidden sm:flex cursor-pointer">
          <Grid className="w-4.5 h-4.5" />
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User Profile */}
        
        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2.5 text-left rounded-xl hover:bg-slate-50 p-1.5 transition-colors"
            aria-expanded={isProfileOpen}
            aria-label="Open user profile menu"
          >
            <div className="w-8.5 h-8.5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold text-xs shadow-xs">
              {initials}
            </div>

            <div className="hidden sm:block text-left">
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                {userName}
              </h4>
              <p className="text-[10px] font-semibold text-slate-400">
                {userRole}
              </p>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900">
                  {userName}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {userRole}
                </p>
                {user.email && (
                  <p className="text-xs text-slate-400 mt-1 break-all">
                    {user.email}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate("/profile");
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-slate-700 hover:bg-amber-50 transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                My Profile
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
