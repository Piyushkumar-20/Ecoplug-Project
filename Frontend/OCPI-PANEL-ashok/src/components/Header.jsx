import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCircle,
  LogOut,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  PanelLeft,
  Wallet,
} from 'lucide-react';
import {
  apiRequest,
  clearAccessToken,
  restoreSession
} from '../services/api';
import { socket } from '../services/socket';

const Header = ({
  onOpenSidebar,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const [isCpoOpen, setIsCpoOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Wallet state
  const [walletData, setWalletData] = useState(null);

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

  // Fetch wallet balance
  useEffect(() => {
  const loadWalletBalance = async () => {
    try {
      const isSessionValid = await restoreSession();

      if (!isSessionValid) {
        setWalletData(null);
        return;
      }

      const response = await apiRequest('/api/wallet/balance');
      const wallet = response?.data ?? response;

      if (wallet?.billingType?.toUpperCase() === 'PREPAID') {
        setWalletData(wallet);
      } else {
        setWalletData(null);
      }
    } catch (error) {
      console.error('Unable to load wallet balance:', error);
      setWalletData(null);
    }
  };

  loadWalletBalance();
}, []);

  const loadNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError("");

    try {
      const response = await apiRequest("/api/notifications?limit=20&offset=0");
      setNotifications(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setNotificationsError(error.message || "Unable to load notifications");
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    const handleNewNotification = (notification) => {
      setNotifications((current) => {
        if (current.some((item) => String(item.id) === String(notification.id))) {
          return current;
        }
        return [notification, ...current].slice(0, 20);
      });
    };

    const handleSocketConnect = () => {
      void loadNotifications();
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("connect", handleSocketConnect);

    if (socket.connected) {
      void loadNotifications();
    }

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("connect", handleSocketConnect);
    };
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      setNotifications((current) =>
        current.map((notification) =>
          String(notification.id) === String(notificationId)
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      setNotificationsError(error.message || "Unable to update notification");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiRequest("/api/notifications/read-all", { method: "PATCH" });
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      setNotificationsError(error.message || "Unable to update notifications");
    }
  };

  const formatNotificationTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API error:', error.message);
    } finally {
      socket.disconnect();
      clearAccessToken();
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
      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-2 sm:space-x-4">

        {/* Prepaid Wallet Balance */}
          {walletData?.billingType?.toUpperCase() === 'PREPAID' && (
            <button
              type="button"
              onClick={() => navigate('/wallet')}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-xl transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
              title="Open Wallet"
            >
              <Wallet className="w-4 h-4 shrink-0" />

              <div className="flex flex-col text-left">
                <span className="text-[9px] font-medium opacity-70 leading-tight">
                  Wallet Balance
                </span>

                <span className="text-xs font-bold leading-tight">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: walletData.currency || 'INR',
                    maximumFractionDigits: 2,
                  }).format(Number(walletData.availableBalance ?? 0))}
                </span>
              </div>
            </button>
          )}
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={() => {
              const willOpen = !showNotifications;
              setShowNotifications(willOpen);
              setIsProfileOpen(false);
              if (willOpen) void loadNotifications();
            }}
            className={`p-2 rounded-xl relative transition-colors cursor-pointer ${
              isDark
                ? 'text-slate-300 hover:bg-slate-800'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
            aria-expanded={showNotifications}
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] leading-4 font-bold text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className={`absolute right-0 mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-2xl shadow-xl border p-4 z-50 ${
                isDark
                  ? 'bg-slate-900 border-slate-700'
                  : 'bg-white border-slate-100'
              }`}
            >
              <div
                className={`flex items-center justify-between gap-3 pb-3 border-b ${
                  isDark ? 'border-slate-700' : 'border-slate-100'
                }`}
              >
                <div>
                  <h4 className={`text-sm font-bold ${
                    isDark ? 'text-slate-100' : 'text-slate-800'
                  }`}>
                    Notifications
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {unreadCount} unread
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void handleMarkAllRead()}
                    className="text-[11px] font-semibold text-amber-600 hover:text-amber-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {notificationsError && (
                <p role="alert" className="text-xs text-rose-500 py-3">
                  {notificationsError}
                </p>
              )}

              <div className={`max-h-80 overflow-y-auto divide-y ${
                isDark ? 'divide-slate-700' : 'divide-slate-100'
              }`}>
                {notificationsLoading && notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">
                    Loading notifications…
                  </p>
                ) : notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-400">
                    You’re all caught up.
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`py-3 flex items-start gap-2 ${
                        !notification.is_read
                          ? isDark ? 'bg-slate-800/50' : 'bg-amber-50/60'
                          : ''
                      }`}
                    >
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        !notification.is_read ? 'bg-amber-500' : 'bg-transparent'
                      }`} />
                      <button
                        type="button"
                        onClick={() => {
                          if (!notification.is_read) {
                            void handleMarkNotificationRead(notification.id);
                          }
                        }}
                        className="text-left flex-1 min-w-0"
                      >
                        <p className={`text-xs font-semibold ${
                          isDark ? 'text-slate-100' : 'text-slate-800'
                        }`}>
                          {notification.title}
                        </p>
                        <p className={`text-xs mt-1 break-words ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}>
                          {notification.message}
                        </p>
                        <span className="block text-[10px] text-slate-400 mt-1.5">
                          {formatNotificationTime(notification.created_at)}
                        </span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
