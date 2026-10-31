import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Mic,
  Users2,
  Languages,
  BookOpen,
  History,
  Bookmark,
  LifeBuoy,
  ShieldAlert,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();

  const navigation = [
    { name: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard },
    { name: 'AI Conversation', to: '/app/chat', icon: MessageSquare },
    { name: 'Live Voice Mode', to: '/app/voice', icon: Mic, badge: 'Voice' },
    { name: 'Two-Person Mode', to: '/app/dual-translation', icon: Users2, badge: 'Dual' },
    { name: 'Cultural Translation', to: '/app/translation', icon: Languages },
    { name: 'Knowledge Base (RAG)', to: '/app/knowledge', icon: BookOpen },
    { name: 'Conversation History', to: '/app/history', icon: History },
    { name: 'Saved Chats', to: '/app/saved', icon: Bookmark },
    { name: 'Human Support', to: '/app/support', icon: LifeBuoy },
  ];

  if (isAdmin) {
    navigation.push({ name: 'Admin Dashboard', to: '/app/admin', icon: ShieldAlert, badge: 'Admin' });
  }

  const secondaryNav = [
    { name: 'Settings & Voice', to: '/app/profile', icon: Settings },
    { name: 'Help & Demo Guide', to: '/app/help', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 flex-shrink-0 bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out md:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Main App Navigation */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Conversational AI
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-400">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Secondary / Settings Navigation */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              System & Preferences
            </div>
            <nav className="space-y-1">
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
