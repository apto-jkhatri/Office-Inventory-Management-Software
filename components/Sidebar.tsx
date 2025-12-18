import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Box, Users, ClipboardList, Wrench, Inbox, ShieldCheck } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/assets', icon: Box, label: 'Assets' },
    { to: '/employees', icon: Users, label: 'Employees' },
    { to: '/assignments', icon: ClipboardList, label: 'Assignments' },
    { to: '/maintenance', icon: Wrench, label: 'Maintenance' },
    { to: '/requests', icon: Inbox, label: 'Requests' },
  ];

  return (
    <div className="w-72 bg-[#0F172A] text-slate-300 flex flex-col h-full border-r border-slate-800 shadow-2xl z-20">
      <div className="p-8 mb-4">
        <div className="flex items-center space-x-3 group cursor-default">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">AssetGuard</h1>
            <span className="text-[10px] text-slate-500 tracking-widest uppercase font-bold mt-1 block">Enterprise ITAM</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group select-none ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
              }`
            }
          >
            <item.icon size={20} className="mr-3 shrink-0" />
            <span className="font-medium tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold shadow-inner">
              SA
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">System Admin</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Full Access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;