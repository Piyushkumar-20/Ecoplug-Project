
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ProfileView from './components/ProfileView';
import LocationsView from './components/LocationsView';
import ChargersView from './components/ChargersView';
import TariffsView from './components/TariffsView';
import SessionsView from './components/SessionsView';
import ComplaintsView from './components/ComplaintsView';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCpo, setSelectedCpo] = useState('All CPOs');

  // Only Light and Dark themes
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  });

  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  // Apply theme globally
  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;

    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for theme changes from Header
  useEffect(() => {
    const handleThemeChange = (event) => {
      if (event.detail === 'light' || event.detail === 'dark') {
        setTheme(event.detail);
      }
    };

    window.addEventListener('theme-change', handleThemeChange);

    return () => {
      window.removeEventListener('theme-change', handleThemeChange);
    };
  }, []);

  // Existing session expiry handling
  useEffect(() => {
    const token = localStorage.getItem('token');
    const tokenExpiry = Number(localStorage.getItem('tokenExpiry'));

    if (!token) return;

    if (!tokenExpiry || Date.now() >= tokenExpiry) {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('user');
      window.location.replace('/login');
      return;
    }

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('user');
      window.location.replace('/login');
    };

    const remainingTime = tokenExpiry - Date.now();

    if (remainingTime <= 0) {
      logout();
      return;
    }

    const timer = window.setTimeout(logout, remainingTime);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans flex overflow-hidden antialiased selection:bg-amber-200">
      {!isLoginPage && (
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />
      )}

      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden transition-all duration-300">
        {!isLoginPage && (
          <Header
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            selectedCpo={selectedCpo}
            setSelectedCpo={setSelectedCpo}
          />
        )}

        <main
          className={
            isLoginPage
              ? 'flex-1 overflow-y-auto'
              : 'flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto'
          }
        >
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route
                path="/"
                element={<DashboardView selectedCpo={selectedCpo} />}
              />

              <Route
                path="/dashboard"
                element={<Navigate to="/" replace />}
              />

              <Route path="/profile" element={<ProfileView />} />
              <Route path="/locations" element={<LocationsView />} />
              <Route path="/chargers" element={<ChargersView />} />
              <Route path="/tariffs" element={<TariffsView />} />
              <Route path="/session" element={<SessionsView />} />

              <Route
                path="/sessions"
                element={<Navigate to="/session" replace />}
              />

              <Route path="/complaints" element={<ComplaintsView />} />

              <Route
                path="/complanis"
                element={<Navigate to="/complaints" replace />}
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
