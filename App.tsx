import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Assignments from './pages/Assignments';
import Employees from './pages/Employees';
import Maintenance from './pages/Maintenance';
import Requests from './pages/Requests';
import { Loader2 } from 'lucide-react';

const App = () => {
  const { loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium tracking-wide">Initializing AssetGuard...</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto scroll-smooth">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;