import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { getApiErrorMessage } from '../lib/errorMessage';
import type { Notification } from '../types';
import { Bell, CheckCircle, GitPullRequest, MessageSquare, User, Clock, Filter, Check, X, Settings } from 'lucide-react';
import clsx from 'clsx';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'PR_ASSIGNED': return GitPullRequest;
    case 'PR_REVIEWED': return MessageSquare;
    case 'PR_COMMENT': return MessageSquare;
    case 'PR_MERGED': return CheckCircle;
    case 'USER_MENTION': return User;
    default: return Bell;
  }
};

const getNotificationColor = (type: string, read: boolean) => {
  if (read) return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  
  switch (type) {
    case 'PR_ASSIGNED': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    case 'PR_REVIEWED': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
    case 'PR_COMMENT': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
    case 'PR_MERGED': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'USER_MENTION': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
    default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  }
};

const getTimeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return past.toLocaleDateString();
};

export default function NotificationsPage() {
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('limit', '50');
    if (filter !== 'all') {
      params.set('read', filter === 'read' ? 'true' : 'false');
    }
    
    api.get<{ data: Notification[] }>(`/notifications?${params}`).then((r) => {
      setList(r.data.data || []);
    }).catch((e) => setError(getApiErrorMessage(e, 'Failed to load'))).finally(() => setLoading(false));
  };

  const markAllRead = () => {
    api.patch('/notifications/read-all').then(() => {
      setList((prev) => prev.map((n) => ({ ...n, read: true })));
    }).catch(() => {});
  };

  const markAsRead = (id: string) => {
    api.patch(`/notifications/${id}/read`).then(() => {
      setList((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    }).catch(() => {});
  };

  const deleteNotification = (id: string) => {
    api.delete(`/notifications/${id}`).then(() => {
      setList((prev) => prev.filter((n) => n.id !== id));
    }).catch(() => {});
  };

  const unreadCount = list.filter(n => !n.read).length;
  const readCount = list.filter(n => n.read).length;

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="flex items-center gap-2 text-slate-500">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        Loading notifications...
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-500" />
            Notifications
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Stay updated with your project activities
          </p>
        </div>
        {list.length > 0 && (
          <button 
            type="button" 
            onClick={markAllRead} 
            className="btn-secondary flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#161b22] p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{list.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#161b22] p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Unread</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{unreadCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#161b22] p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <CheckCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Read</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{readCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#161b22] p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={clsx('rounded-lg px-3 py-1.5 text-sm font-medium transition-colors', 
              filter === 'all' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )}
          >
            All ({list.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={clsx('rounded-lg px-3 py-1.5 text-sm font-medium transition-colors', 
              filter === 'unread' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('read')}
            className={clsx('rounded-lg px-3 py-1.5 text-sm font-medium transition-colors', 
              filter === 'read' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )}
          >
            Read ({readCount})
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center py-16 text-center">
            <Bell className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-2">No notifications</p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              {filter === 'unread' ? 'All caught up! No unread notifications.' : 
               filter === 'read' ? 'No read notifications yet.' : 
               'You\'re all caught up! No notifications to show.'}
            </p>
          </div>
        ) : (
          list.map((n) => {
            const Icon = getNotificationIcon(n.type || 'default');
            return (
              <div
                key={n.id}
                className={clsx(
                  'bg-white dark:bg-[#161b22] rounded-xl border p-4 transition-all hover:shadow-md',
                  n.read
                    ? 'border-slate-200 dark:border-slate-700'
                    : 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={clsx('p-2 rounded-lg flex-shrink-0', getNotificationColor(n.type || 'default', n.read))}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <Link
                          to={n.link || '#'}
                          onClick={() => !n.read && markAsRead(n.id)}
                          className="block group"
                        >
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {n.title}
                            {!n.read && (
                              <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </h3>
                          {n.body && (
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                              {n.body}
                            </p>
                          )}
                        </Link>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{getTimeAgo(n.createdAt)}</span>
                          </div>
                          {!n.read && (
                            <button
                              onClick={() => markAsRead(n.id)}
                              className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="flex-shrink-0 p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        aria-label="Delete notification"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Settings */}
      <div className="text-center">
        <Link 
          to="/settings" 
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Manage notification settings
        </Link>
      </div>
    </div>
  );
}
