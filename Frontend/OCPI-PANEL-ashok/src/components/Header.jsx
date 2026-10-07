import React, { useState } from 'react';
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
        <div className="flex items-center space-x-2.5">
          <div className="w-8.5 h-8.5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold text-xs shadow-xs">
            AK
          </div>
          <div className="hidden sm:block text-left">
            <h4 className="text-xs font-bold text-slate-900 leading-tight">Ashok Kumar</h4>
            <p className="text-[10px] font-semibold text-slate-400">eMSP Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
