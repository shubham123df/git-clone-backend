import { Outlet } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { GitPullRequest, FileText, Moon, Sun, Bell, LogOut, ClipboardList, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { Notification } from '../types';
import clsx from 'clsx';

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    api.get<{ data: Notification[] }>('/notifications?limit=10').then((r) => setNotifications(r.data.data)).catch(() => {});
  }, [location.pathname]);

  const unread = notifications.filter((n) => !n.read).length;

  const nav = [
    { to: '/pull-requests', label: 'Pull requests', icon: GitPullRequest },
    { to: '/assigned-reviews', label: 'Assigned reviews', icon: ClipboardList },
    ...(user?.role === 'ADMIN' || user?.role === 'RELEASE_MANAGER' ? [{ to: '/audit-logs', label: 'Audit logs', icon: FileText }] : []),
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-[#f6f8fa] dark:bg-[#0d1117]">
      {/* Left sidebar - GitHub-like */}
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-56 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-[#161b22]">
        <Link to="/pull-requests" className="flex h-14 items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-700">
          <GitPullRequest className="h-6 w-6 text-[#238636] dark:text-[#3fb950]" />
          <span className="font-semibold text-slate-800 dark:text-slate-100">PR Review</span>
        </Link>
        <nav className="flex-1 space-y-0.5 p-2">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={clsx(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                location.pathname === to || (to !== '/pull-requests' && location.pathname.startsWith(to))
                  ? 'bg-slate-100 text-slate-900 dark:bg-slate-700/50 dark:text-slate-100'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/30'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-2 dark:border-slate-700">
          <div className="rounded-md px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
            {user?.email}
          </div>
          <div className="flex items-center gap-1 px-3">
            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium dark:bg-slate-700">{user?.role}</span>
          </div>
        </div>
      </aside>

      {/* Main + top bar */}
      <div className="flex flex-1 flex-col pl-56">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-end gap-2 border-b border-slate-200 bg-white/95 px-6 backdrop-blur dark:border-slate-700 dark:bg-[#0d1117]/95">
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <div className="relative">
            <Link
              to="/notifications"
              className="relative flex rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          </div>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </header>
        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
