import { api } from '../lib/api';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
  metadata?: any;
}

export interface SSEMessage {
  type: string;
  data?: any;
  userId?: string;
}

class NotificationService {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  connect(userId: string) {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const token = localStorage.getItem('accessToken');
    const sseUrl = `https://git-clone-backend-3.onrender.com/api/v1/sse/notifications?token=${token}`;
    
    this.eventSource = new EventSource(sseUrl);

    this.eventSource.onmessage = (event) => {
      try {
        const message: SSEMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        this.connect(userId);
      }, 5000);
    };

    this.eventSource.onopen = () => {
      console.log('SSE connection established');
    };
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  private handleMessage(message: SSEMessage) {
    const { type, data } = message;
    
    // Notify all listeners for this message type
    const typeListeners = this.listeners.get(type) || [];
    typeListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in SSE listener:', error);
      }
    });

    // Also notify general message listeners
    const generalListeners = this.listeners.get('message') || [];
    generalListeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        console.error('Error in SSE listener:', error);
      }
    });
  }

  // Subscribe to specific message types
  subscribe(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);

    // Return unsubscribe function
    return () => {
      const typeListeners = this.listeners.get(type);
      if (typeListeners) {
        const index = typeListeners.indexOf(callback);
        if (index > -1) {
          typeListeners.splice(index, 1);
        }
      }
    };
  }

  // API methods for notifications
  async getNotifications(page = 1, limit = 20) {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data;
  }

  async markAsRead(notificationId: string) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  }

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  }
}

export const notificationService = new NotificationService();
