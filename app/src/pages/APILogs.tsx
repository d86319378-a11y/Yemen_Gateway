import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Activity, Search } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

interface ApiLog {
  id?: string;
  method: string;
  path: string;
  status_code: number;
  latency: number;
  ip: string;
  user_agent?: string;
  error?: string;
  created_at?: string;
}

export default function APILogsPage() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      const token =
        localStorage.getItem('auth_token') ||
        localStorage.getItem('yg_token') ||
        '';

      const res = await fetch(
        `${API_BASE_URL}/api/v1/analytics/logs`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setLogs(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.path?.toLowerCase().includes(search.toLowerCase()) ||
      log.method?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300)
      return 'bg-green-100 text-green-800';

    if (status >= 400 && status < 500)
      return 'bg-yellow-100 text-yellow-800';

    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">
          سجلات API
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          جميع الطلبات المرسلة إلى خدمات Yemen Gateway
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />

            <Input
              className="pr-10"
              placeholder="ابحث عن Endpoint أو Method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          جار تحميل السجلات...
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />

            <p className="text-muted-foreground">
              لا توجد سجلات API حتى الآن
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log, index) => (
            <Card
              key={log.id || index}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="font-semibold">
                      {log.path}
                    </div>

                    <div className="text-xs text-muted-foreground mt-1">
                      {log.created_at
                        ? new Date(
                            log.created_at
                          ).toLocaleString('ar-YE')
                        : '-'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">
                      {log.method}
                    </Badge>

                    <Badge
                      className={getStatusColor(
                        log.status_code
                      )}
                    >
                      {log.status_code}
                    </Badge>

                    <Badge variant="secondary">
                      {log.latency} ms
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 text-sm text-muted-foreground">
                  IP: {log.ip}
                </div>

                {log.error && (
                  <div className="mt-2 text-red-600 text-sm">
                    Error: {log.error}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
