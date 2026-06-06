import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/constants';

type EndpointStat = {
  method: string;
  path: string;
  count: number;
  avg_latency: number;
};

type AnalyticsOverview = {
  period: number;
  total_requests: number;
  success_count: number;
  error_count: number;
  success_rate: number;
  error_rate: number;
  avg_latency: number;
  top_endpoints: EndpointStat[];
};

const colors = ['#dc2626', '#16a34a', '#2563eb', '#d97706', '#7c3aed', '#0891b2'];

function getToken() {
  return localStorage.getItem('auth_token') || localStorage.getItem('yg_token') || '';
}

export default function UsagePage() {
  const [period, setPeriod] = useState('7');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);

  const fetchOverview = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/analytics/overview?days=${period}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setOverview(data.data);
      } else {
        alert(data.error || 'فشل تحميل الإحصائيات');
      }
    } catch (err) {
      console.error(err);
      alert('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [period]);

  const endpointChartData = useMemo(() => {
    return (overview?.top_endpoints || []).slice(0, 6).map((item, index) => ({
      name: `${item.method} ${item.path}`,
      shortName: item.path.replace('/api/v1/', ''),
      value: Number(item.count || 0),
      color: colors[index % colors.length],
      avg_latency: Number(item.avg_latency || 0),
      method: item.method,
      path: item.path,
    }));
  }, [overview]);

  const totalRequests = overview?.total_requests || 0;
  const successRate = overview?.success_rate || 0;
  const errorRate = overview?.error_rate || 0;
  const avgLatency = overview?.avg_latency || 0;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">الاستخدام والتحليلات</h1>
          <p className="text-muted-foreground mt-1">
            إحصائيات حقيقية من سجلات API في قاعدة البيانات
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">آخر 24 ساعة</SelectItem>
              <SelectItem value="7">آخر 7 أيام</SelectItem>
              <SelectItem value="30">آخر 30 يوم</SelectItem>
              <SelectItem value="90">آخر 90 يوم</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchOverview} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">
          جار تحميل الإحصائيات...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Activity className="h-5 w-5 text-red-600" />
                  <Badge variant="secondary">{period} يوم</Badge>
                </div>
                <p className="text-2xl font-bold">{totalRequests.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <Badge className="bg-green-100 text-green-800">
                    {successRate.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{overview?.success_count || 0}</p>
                <p className="text-sm text-muted-foreground">طلبات ناجحة</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <Badge className="bg-red-100 text-red-800">
                    {errorRate.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{overview?.error_count || 0}</p>
                <p className="text-sm text-muted-foreground">طلبات فاشلة</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <Badge variant="outline">متوسط</Badge>
                </div>
                <p className="text-2xl font-bold">{avgLatency.toFixed(1)}ms</p>
                <p className="text-sm text-muted-foreground">زمن الاستجابة</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">أكثر Endpoints استخدامًا</CardTitle>
                <CardDescription>
                  حسب عدد الطلبات الفعلية المسجلة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={endpointChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="shortName" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">توزيع الاستخدام</CardTitle>
                <CardDescription>
                  نسبة استخدام كل خدمة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={endpointChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {endpointChartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {endpointChartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">
                        {item.shortName} ({item.value})
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">أداء Endpoints</CardTitle>
              <CardDescription>
                تفاصيل الأداء حسب كل مسار API
              </CardDescription>
            </CardHeader>

            <CardContent>
              {endpointChartData.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">
                  لا توجد بيانات كافية بعد. جرّب استخدام API Playground ثم عُد هنا.
                </div>
              ) : (
                <div className="space-y-3">
                  {endpointChartData.map((ep) => (
                    <div
                      key={ep.name}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="text-sm font-medium font-mono" dir="ltr">
                          {ep.method} {ep.path}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {ep.value.toLocaleString()} طلب · متوسط {ep.avg_latency.toFixed(1)}ms
                        </p>
                      </div>

                      <div className="w-32">
                        <Progress
                          value={totalRequests > 0 ? (ep.value / totalRequests) * 100 : 0}
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">ملخص الخطة</CardTitle>
              <CardDescription>
                استهلاك API الحالي بناءً على سجلاتك
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">API Requests</span>
                    <span className="font-medium">
                      {totalRequests.toLocaleString()} / 50,000
                    </span>
                  </div>
                  <Progress
                    value={Math.min((totalRequests / 50000) * 100, 100)}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-medium">{successRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={successRate} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Error Rate</span>
                    <span className="font-medium">{errorRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={errorRate} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
