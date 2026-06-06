import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Trash2, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
};

type NotificationsResponse = {
  notifications: Notification[];
  unread_count: number;
};

function getToken() {
  return localStorage.getItem('auth_token') || localStorage.getItem('yg_token') || '';
}

function iconForType(type: string) {
  if (type.includes('approved') || type.includes('paid')) return CheckCircle;
  if (type.includes('rejected') || type.includes('error')) return AlertCircle;
  return Info;
}

function colorForType(type: string) {
  if (type.includes('approved') || type.includes('paid')) return 'text-green-600 bg-green-50';
  if (type.includes('rejected') || type.includes('error')) return 'text-red-600 bg-red-50';
  if (type.includes('invoice')) return 'text-blue-600 bg-blue-50';
  if (type.includes('payment')) return 'text-amber-600 bg-amber-50';
  return 'text-slate-600 bg-slate-50';
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/notifications`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        const payload = data.data as NotificationsResponse;
        setNotifications(payload.notifications || []);
        setUnreadCount(payload.unread_count || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    await fetch(`${API_BASE_URL}/api/v1/notifications/${id}/read`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    loadNotifications();
  };

  const markAllAsRead = async () => {
    await fetch(`${API_BASE_URL}/api/v1/notifications/read-all`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    loadNotifications();
  };

  const deleteNotification = async (id: string) => {
    await fetch(`${API_BASE_URL}/api/v1/notifications/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    loadNotifications();
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الإشعارات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            متابعة آخر الأحداث والتنبيهات داخل المنصة
          </p>
        </div>

        <div className="flex gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            غير مقروءة: {unreadCount}
          </Badge>

          <Button variant="outline" onClick={markAllAsRead} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            تعليم الكل كمقروء
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          جار تحميل الإشعارات...
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">لا توجد إشعارات حالياً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const Icon = iconForType(item.type);
            return (
              <Card
                key={item.id}
                className={`transition-all ${
                  item.read ? 'bg-white' : 'border-red-200 bg-red-50/20'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`rounded-xl p-2 ${colorForType(item.type)}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{item.title}</h3>
                          {!item.read && (
                            <Badge className="bg-red-100 text-red-800">جديد</Badge>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {item.message}
                        </p>

                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleString('ar-YE')}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!item.read && (
                        <Button size="sm" variant="outline" onClick={() => markAsRead(item.id)}>
                          مقروء
                        </Button>
                      )}

                      <Button size="sm" variant="ghost" onClick={() => deleteNotification(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
