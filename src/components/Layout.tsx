import React from 'react';
import { Home, Wallet, Receipt, Users, Settings, LogOut } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'accounts', icon: Wallet, label: 'My Accounts' },
    { id: 'transactions', icon: Receipt, label: 'Activity' },
    { id: 'groups', icon: Users, label: 'Shared Bills' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shadow-sm">
        <div className="p-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center relative">
               <div className="w-4 h-1 bg-white rounded-full rotate-45"></div>
               <div className="w-4 h-1 bg-white rounded-full -rotate-45 absolute"></div>
            </div>
            <span className="text-xl font-bold text-blue-900 tracking-tight">Splitify</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === item.id 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="flex items-center p-2 bg-slate-50 rounded-lg mb-4">
            <img 
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=3b82f6&color=fff`} 
              className="h-9 w-9 rounded-full border border-white shadow-sm"
              alt="Avatar"
            />
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.displayName}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative">
        <div className="max-w-5xl mx-auto px-4 py-8 md:px-10 md:py-12">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center z-50 shadow-lg">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-lg transition-all",
              activeTab === item.id ? "text-blue-600" : "text-slate-400"
            )}
          >
            <item.icon className={cn("h-5 w-5", activeTab === item.id && "scale-110")} />
            <span className="text-[10px] mt-1 font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
