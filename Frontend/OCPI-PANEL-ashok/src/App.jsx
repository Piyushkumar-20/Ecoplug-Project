import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] text-slate-900 font-sans flex overflow-hidden antialiased selection:bg-amber-200">
      {/* Fixed/Collapsible Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Right Column: Header + Independently Scrollable Dashboard Container */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden transition-all duration-300">
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          selectedCpo={selectedCpo}
          setSelectedCpo={setSelectedCpo}
        />

        {/* Dashboard Main Content Area (Independent Scroll Container) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardView selectedCpo={selectedCpo} />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/dashboard" 
              element={
                <Navigate to="/" replace />
                } 
            />
            <Route 
              path="/profile" 
              element={
                <ProfileView />
                } 
            />
            <Route 
              path="/locations" 
              element={
                <LocationsView />
              } 
            />
            <Route 
              path="/chargers" 
              element={<ChargersView />
              } 
            />
            <Route 
              path="/tariffs" 
              element={<TariffsView />             
              } 
            />
            <Route 
              path="/session" 
              element={
                <SessionsView />
              } 
            />
            <Route 
              path="/sessions" 
              element={
                <Navigate to="/session" replace />
              } 
            />
            <Route 
              path="/complaints" 
              element={
                <ComplaintsView />
              } 
            />
            <Route 
              path="/complanis" 
              element={
                <Navigate to="/complaints" replace />
              } 
            />
            <Route 
              path="*" 
              element={
                <Navigate to="/" replace />
              } 
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;