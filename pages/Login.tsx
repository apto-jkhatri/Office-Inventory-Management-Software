import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Box, Lock, Loader2, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, isAuthLoading } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Simple Admin Password Simulation
    // In a real desktop app, this might authenticate against the DB users table
    if (password === 'admin' || password === 'password') {
        const success = await login();
        if (!success) {
          setError('System Error. Please restart.');
        }
    } else {
        setError('Invalid Administrator Password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        
        <div className="p-8 text-center pt-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/30">
            <Box size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AssetGuard Desktop</h1>
          <p className="text-slate-400 mt-2 text-sm">Enterprise Asset Management</p>
          <div className="mt-2 inline-block px-2 py-1 bg-slate-800 rounded border border-slate-700 text-[10px] text-slate-500 uppercase tracking-widest">
            Offline Mode
          </div>
        </div>

        <div className="p-8 pt-2">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                   Administrator Access
                 </label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="password"
                      placeholder="Enter Admin Password (try: admin)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-slate-600"
                    />
                 </div>
            </div>

            {error && (
              <div className="text-red-400 text-xs bg-red-900/20 p-3 rounded border border-red-900/50 text-center">
                {error}
              </div>
            )}

            <button
            type="submit"
            disabled={isAuthLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center group disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
            >
            {isAuthLoading ? (
                <Loader2 size={20} className="animate-spin text-white/50" />
            ) : (
                <>
                <span>Unlock System</span>
                <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
            )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
             <p className="text-xs text-slate-600">
               Version 2.4.0 (Offline Desktop)
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;