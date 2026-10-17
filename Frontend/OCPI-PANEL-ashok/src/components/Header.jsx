
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCircle,
  LogOut,
  Sun,
  Moon,
  Search,
  Bell,
  Grid,
  ChevronDown,
  PanelLeft,
} from 'lucide-react';
import { apiRequest } from '../services/api';

const Header = ({
  onOpenSidebar,
  onToggleSidebar,
  isSidebarOpen,
  selectedCpo,
  setSelectedCpo,
}) => {
  const [isCpoOpen, setIsCpoOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [theme, setTheme] = useState(() =>
    localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  );

  const navigate = useNavigate();
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const isDark = theme === 'dark';

  const handleThemeChange = (selectedTheme) => {
    if (selectedTheme !== 'light' && selectedTheme !== 'dark') return;

    setTheme(selectedTheme);
    localStorage.setItem('theme', selectedTheme);

    window.dispatchEvent(
      new CustomEvent('theme-change', {
        detail: selectedTheme,
      })
    );
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // Keep Header synchronized with the globally selected theme.
  useEffect(() => {
    const syncTheme = () => {
      setTheme(
        localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
      );
    };

    window.addEventListener('storage', syncTheme);

    return () => {
      window.removeEventListener('storage', syncTheme);
    };
  }, []);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const userName = user.name || 'User';
  const userRole = user.role || 'User';

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API error:', error.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('user');
      setIsProfileOpen(false);
      navigate('/login', { replace: true });
    }
  };

  const handleToggle = onToggleSidebar || onOpenSidebar;

  return (
    <header
      className={`h-16 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 border-b shadow-xs select-none transition-colors ${
        isDark
          ? 'bg-slate-900 border-slate-700'
          : 'bg-white border-slate-200/80'
      }`}
    >
      {/* Sidebar Toggle and Search */}
      <div className="flex items-center space-x-3 lg:space-x-4 flex-1 max-w-2xl">
        <button
          onClick={handleToggle}
          className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
            isDark
              ? 'text-slate-300 border-slate-700 hover:bg-slate-800 hover:border-amber-500'
              : 'text-slate-600 hover:bg-amber-50 hover:text-amber-900 border-slate-200/80 hover:border-amber-300'
          }`}
          title={isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
          aria-label="Toggle sidebar"
        >
          <PanelLeft
            className={`w-5 h-5 transition-transform duration-300 ${
              isSidebarOpen
                ? isDark
                  ? 'text-slate-300'
                  : 'text-slate-700'
                : 'text-amber-600 rotate-180'
            }`}
          />
        </button>

        <div className="relative flex-1">
          <Search
            className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-slate-400' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            placeholder="Search stations, chargers, transactions, tickets..."
            className={`w-full pl-9 pr-4 py-1.5 border rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400 focus:bg-slate-800'
                : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white'
            }`}
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setIsProfileOpen(false);
            }}
            className={`p-2 rounded-xl relative transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-300 hover:bg-slate-800'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span
              className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse ${
                isDark ? 'ring-2 ring-slate-900' : 'ring-2 ring-white'
              }`}
            />
          </button>

          {showNotifications && (
            <div
              className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-xl border p-4 z-50 ${
                isDark
                  ? 'bg-slate-900 border-slate-700'
                  : 'bg-white border-slate-100'
              }`}
            >
              <div
                className={`flex items-center justify-between pb-3 border-b ${
                  isDark ? 'border-slate-700' : 'border-slate-100'
                }`}
              >
                <h4
                  className={`text-xs font-bold ${
                    isDark ? 'text-slate-100' : 'text-slate-800'
                  }`}
                >
                  System Alerts
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold">
                  4 New
                </span>
              </div>

              <div
                className={`divide-y max-h-64 overflow-y-auto my-1 ${
                  isDark ? 'divide-slate-700' : 'divide-slate-100'
                }`}
              >
                <div className="py-2.5 text-xs">
                  <p
                    className={`font-medium ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    Statiq added 5 new stations
                  </p>
                  <span className="text-[10px] text-slate-400">
                    10 minutes ago
                  </span>
                </div>

                <div className="py-2.5 text-xs">
                  <p className="font-medium text-rose-500">
                    Tata Power charger offline
                  </p>
                  <span className="text-[10px] text-slate-400">
                    25 minutes ago
                  </span>
                </div>

                <div className="py-2.5 text-xs">
                  <p
                    className={`font-medium ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    New roaming request
                  </p>
                  <span className="text-[10px] text-slate-400">
                    1 hour ago
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grid Icon */}
        <button
          className={`p-2 rounded-xl transition-colors hidden sm:flex cursor-pointer ${
            isDark
              ? 'text-slate-300 hover:bg-slate-800'
              : 'text-slate-500 hover:bg-slate-100'
          }`}
          aria-label="Applications"
        >
          <Grid className="w-4.5 h-4.5" />
        </button>

        <div
          className={`h-6 w-px hidden sm:block ${
            isDark ? 'bg-slate-700' : 'bg-slate-200'
          }`}
        />

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setShowNotifications(false);
            }}
            className={`flex items-center space-x-2.5 text-left rounded-xl p-1.5 transition-colors ${
              isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
            }`}
            aria-expanded={isProfileOpen}
            aria-label="Open user profile menu"
          >
            <div className="w-8.5 h-8.5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-bold text-xs shadow-xs">
              {initials}
            </div>

            <div className="hidden sm:block text-left">
              <h4
                className={`text-xs font-bold leading-tight ${
                  isDark ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                {userName}
              </h4>
              <p className="text-[10px] font-semibold text-slate-400">
                {userRole}
              </p>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div
              className={`absolute right-0 top-full mt-2 w-60 rounded-xl shadow-lg border py-2 z-50 ${
                isDark
                  ? 'bg-slate-900 border-slate-700'
                  : 'bg-white border-slate-200'
              }`}
            >
              {/* Profile Information */}
              <div
                className={`px-4 py-3 border-b ${
                  isDark ? 'border-slate-700' : 'border-slate-100'
                }`}
              >
                <p
                  className={`text-sm font-bold ${
                    isDark ? 'text-slate-100' : 'text-slate-900'
                  }`}
                >
                  {userName}
                </p>
                <p className="text-xs text-slate-500 mt-1">{userRole}</p>

                {user.email && (
                  <p className="text-xs text-slate-400 mt-1 break-all">
                    {user.email}
                  </p>
                )}
              </div>

              {/* Appearance Selector */}
              <div
                className={`px-4 py-3 border-b ${
                  isDark ? 'border-slate-700' : 'border-slate-100'
                }`}
              >
                <p
                  className={`text-xs font-semibold mb-2 ${
                    isDark ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  Appearance
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs transition-colors ${
                      theme === 'light'
                        ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                        : isDark
                          ? 'text-slate-300 hover:bg-slate-800'
                          : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs transition-colors ${
                      theme === 'dark'
                        ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                        : isDark
                          ? 'text-slate-300 hover:bg-slate-800'
                          : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </button>
                </div>
              </div>

              {/* My Profile */}
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/profile');
                }}
                className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                  isDark
                    ? 'text-slate-200 hover:bg-slate-800'
                    : 'text-slate-700 hover:bg-amber-50'
                }`}
              >
                <UserCircle className="w-4 h-4" />
                My Profile
              </button>

              {/* Logout */}
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
