import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Wallet,
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
  const [isDark, setIsDark] = useState(() =>
  localStorage.getItem('theme') === 'dark'
);

useEffect(() => {
  const syncTheme = (event) => {
    const selectedTheme = event.detail;

    if (selectedTheme === 'light' || selectedTheme === 'dark') {
      setIsDark(selectedTheme === 'dark');
    }
  };

  window.addEventListener('theme-change', syncTheme);

  return () => {
    window.removeEventListener('theme-change', syncTheme);
  };
}, []);

  const menuItems = [
    { id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', path: '/profile', label: 'Profile', icon: User },
    { id: 'wallet', path: '/wallet', label: 'Wallet', icon: Wallet },
    { id: 'locations', path: '/locations', label: 'Locations', icon: MapPin },
    { id: 'chargers', path: '/chargers', label: 'Chargers', icon: Zap },
    { id: 'tariffs', path: '/tariffs', label: "Tariff's", icon: Receipt },
    { id: 'session', path: '/session', label: 'Session', icon: Clock },
    { id: 'complanis', path: '/complaints', label: 'Complaints', icon: AlertCircle },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 h-screen
          ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200/80'}
          border-r flex flex-col justify-between transition-all duration-300
          ease-in-out shrink-0 select-none overflow-y-auto overflow-x-hidden
          ${isOpen
            ? 'w-64 translate-x-0 opacity-100'
            : '-translate-x-full lg:translate-x-0 lg:w-20 opacity-100'}
          lg:sticky lg:top-0 lg:h-screen
        `}
      >
        <div className={`flex flex-col justify-between h-full transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'}`}>
          <div>
            <div
              className={`h-16 flex items-center border-b sticky top-0 z-10 transition-all duration-300
                ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-100 bg-white'}
                ${isOpen ? 'px-6 justify-between' : 'px-0 justify-center'}
              `}
            >
              <Link to="/" className="flex items-center space-x-3 cursor-pointer" title="Ecoplug CPO's">
                <img
                  src="/logo.png"
                  alt="Ecoplug Logo"
                  className={`w-9 h-9 rounded-full object-cover shadow-xs border shrink-0 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}
                />

                {isOpen && (
                  <div className="animate-in fade-in duration-200 whitespace-nowrap overflow-hidden">
                    <span className={`text-xl font-extrabold tracking-tight flex items-center gap-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      ECOPLUG CPO's
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                    </span>
                    <p className="text-[8px] font-medium text-slate-400 tracking-wider uppercase -mt-0.5">
                      Connect. Chargers. Grow.
                    </p>
                  </div>
                )}
              </Link>

              {isOpen && (
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-1.5 rounded-lg lg:hidden ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

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
                      ${isOpen ? 'w-full justify-between px-3.5 py-2.5' : 'w-full justify-center p-3'}
                      ${isActive
                          ? isDark
                            ? 'bg-[#183B32] text-white font-semibold shadow-xs shadow-emerald-900/30'
                            : 'bg-[#f0ffc7] text-slate-900 font-semibold shadow-xs shadow-amber-200/50'
                          : isDark
                            ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                        }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`w-5 h-5 shrink-0 transition-colors ${
                          isActive
                            ? isDark
                              ? 'text-[#A9F28A] stroke-[2.3]'
                              : 'text-slate-900 stroke-[2.3]'
                            : isDark
                              ? 'text-slate-400 group-hover:text-white'
                              : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />

                      {isOpen && (
                        <span className="animate-in fade-in duration-200 whitespace-nowrap">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {isOpen && isActive && (
                          <div
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isDark ? 'bg-[#A9F28A]' : 'bg-slate-900'
                              }`}
                            />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className={`transition-all duration-300 ${isOpen ? 'p-4' : 'p-2 flex justify-center'}`}>
            {isOpen ? (
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 p-4 text-white shadow-md group">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-overlay group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: "url('/assets/ev_sidebar_banner.png')" }}
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
