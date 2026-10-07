import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  MapPin,
  Zap,
  Receipt,
  Clock,
  AlertCircle,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', path: '/profile', label: 'Profile', icon: User },
    { id: 'locations', path: '/locations', label: 'Locations', icon: MapPin },
    { id: 'chargers', path: '/chargers', label: 'Chargers', icon: Zap },
    { id: 'tariffs', path: '/tariffs', label: "Tariff's", icon: Receipt },
    { id: 'session', path: '/session', label: 'Session', icon: Clock },
    { id: 'complanis', path: '/complaints', label: 'Complaints', icon: AlertCircle },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container - Expandable (w-64) & Collapsible Icon-Only (w-20) */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 h-screen bg-white border-r border-slate-200/80 
        flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 select-none overflow-y-auto overflow-x-hidden
        ${isOpen
          ? 'w-64 translate-x-0 opacity-100'
          : '-translate-x-full lg:translate-x-0 lg:w-20 opacity-100'}
        lg:sticky lg:top-0 lg:h-screen
      `}>
        <div className={`flex flex-col justify-between h-full transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
          {/* Top Header & Brand Logo */}
          <div>
            <div className={`h-16 flex items-center border-b border-slate-100 sticky top-0 bg-white z-10 transition-all duration-300 ${isOpen ? 'px-6 justify-between' : 'px-0 justify-center'
              }`}>
              <Link to="/" className="flex items-center space-x-3 cursor-pointer" title="Ecoplug CPO's">
                <img
                  src="/logo.png"
                  alt="Ecoplug Logo"
                  className="w-9 h-9 rounded-full object-cover shadow-xs border border-slate-100 shrink-0"
                />
                {isOpen && (
                  <div className="animate-in fade-in duration-200 whitespace-nowrap overflow-hidden">
                    <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
                      ECOPLUG CPO's <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                    </span>
                    <p className="text-[8px] font-medium text-slate-400 tracking-wider uppercase -mt-0.5">
                      Connect. Chargers. Grow.
                    </p>
                  </div>
                )}
              </Link>

              {/* Mobile close button */}
              {isOpen && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Navigation Links */}
            <nav className={`space-y-1.5 transition-all duration-300 ${isOpen ? 'p-4' : 'p-2'}`}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    title={item.label}
                    onClick={() => {
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className={`
                      flex items-center rounded-xl font-medium text-sm transition-all duration-150 group cursor-pointer
                      ${isOpen
                        ? 'w-full justify-between px-3.5 py-2.5'
                        : 'w-full justify-center p-3'}
                      ${isActive
                        ? 'bg-[#FEF0A6] text-slate-900 font-semibold shadow-xs shadow-amber-200/50'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-slate-900 stroke-[2.3]' : 'text-slate-400 group-hover:text-slate-600'
                        }`} />
                      {isOpen && <span className="animate-in fade-in duration-200 whitespace-nowrap">{item.label}</span>}
                    </div>

                    {isOpen && isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Banner Card */}
          <div className={`transition-all duration-300 ${isOpen ? 'p-4' : 'p-2 flex justify-center'}`}>
            {isOpen ? (
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 p-4 text-white shadow-md group">
                {/* Background EV image with overlay */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-overlay group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url('/assets/ev_sidebar_banner.png')` }}
                />
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                    <Sparkles className="w-3 h-3" />
                    <span>Eco Network</span>
                  </div>

                  <h4 className="text-xs font-bold leading-snug text-white/95">
                    Cleaner Mobility <br />
                    Happier Tomorrow
                  </h4>

                  <p className="text-[10px] text-emerald-100/70 leading-relaxed">
                    Smart charging infrastructure monitoring platform.
                  </p>

                  <Link
                    to="/locations"
                    onClick={() => {
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className="mt-1.5 w-full flex items-center justify-center space-x-1 text-[11px] font-semibold bg-white/10 hover:bg-white/20 text-white py-1.5 px-3 rounded-lg backdrop-blur-xs transition-colors border border-white/15 cursor-pointer"
                  >
                    <span>View Locations</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ) : (
              <Link
                to="/locations"
                title="Eco Network - View Locations"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-900 to-slate-900 text-emerald-400 flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer border border-emerald-500/30"
              >
                <Sparkles className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

