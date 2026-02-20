import { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, Info, GitPullRequest, MessageSquare } from 'lucide-react';
import { notificationService, type Notification } from '../services/notificationService';
import { useAuthStore } from '../store/authStore';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkRead }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'pull_request_created':
      case 'pull_request_updated':
        return <GitPullRequest className="w-4 h-4" />;
      case 'reviewer_assigned':
        return <MessageSquare className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'pull_request_created':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'pull_request_updated':
        return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'reviewer_assigned':
        return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
      case 'error':
        return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div
      className={`p-3 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
        !notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
      }`}
      onClick={() => onMarkRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${getColor(notification.type)}`}>
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {notification.title}
          </p>
          {notification.body && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {notification.body}
            </p>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
            {new Date(notification.createdAt).toLocaleTimeString()}
          </p>
        </div>
        {!notification.read && (
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
        )}
      </div>
    </div>
  );
};

export const RealTimeNotifications: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    // Connect to SSE
    notificationService.connect(user.id);

    // Load initial notifications
    loadNotifications();

    // Subscribe to real-time notifications
    const unsubscribe = notificationService.subscribe('notification', (data) => {
      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.title, {
          body: data.body,
          icon: '/favicon.ico',
        });
      }
    });

    // Subscribe to connection events
    const unsubscribeConnection = notificationService.subscribe('connected', () => {
      console.log('Connected to notification service');
    });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      unsubscribe();
      unsubscribeConnection();
      notificationService.disconnect();
    };
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.data);
      setUnreadCount(data.data.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-12 w-80 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-80">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    window.location.href = '/notifications';
                  }}
                  className="w-full text-xs text-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 py-2"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
