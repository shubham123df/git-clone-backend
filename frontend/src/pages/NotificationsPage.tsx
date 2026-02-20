import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { getApiErrorMessage } from '../lib/errorMessage';
import type { Notification } from '../types';
import { Bell } from 'lucide-react';
import clsx from 'clsx';

export default function NotificationsPage() {
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<{ data: Notification[] }>('/notifications?limit=50').then((r) => {
      setList(r.data.data || []);
    }).catch((e) => setError(getApiErrorMessage(e, 'Failed to load'))).finally(() => setLoading(false));
  }, []);

  const markAllRead = () => {
    api.patch('/notifications/read-all').then(() => {
      setList((prev) => prev.map((n) => ({ ...n, read: true })));
    }).catch(() => {});
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Notifications</h1>
        {list.length > 0 && (
          <button type="button" onClick={markAllRead} className="btn-secondary text-sm">
            Mark all as read
          </button>
        )}
      </div>
      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">{error}</div>
      )}
      <div className="mt-6 space-y-2">
        {list.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center dark:border-slate-700 dark:bg-[#161b22]">
            <Bell className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-4 text-slate-600 dark:text-slate-400">No notifications yet</p>
          </div>
        ) : (
          list.map((n) => (
            <Link
              key={n.id}
              to={n.link || '#'}
              onClick={() => {
                if (!n.read) api.patch(`/notifications/${n.id}/read`).then(() => setList((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))));
              }}
              className={clsx(
                'block rounded-xl border p-4 transition-colors',
                n.read
                  ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-[#161b22]'
                  : 'border-slate-200 bg-sky-50/50 dark:border-slate-700 dark:bg-sky-900/10'
              )}
            >
              <p className="font-medium text-slate-900 dark:text-slate-100">{n.title}</p>
              {n.body && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{n.body}</p>}
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">{new Date(n.createdAt).toLocaleString()}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
