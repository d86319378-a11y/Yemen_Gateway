import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { User } from '@/types';
import {
  ArrowUpRight,
  CheckCircle,
  Key,
  TrendingUp,
  Globe,
  Server,
  FileText,
  Receipt,
  Wallet,
  AlertTriangle,
  Activity,
  XCircle,
  Clock,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

interface InvoicingStats {
  total_invoices: number;
  paid_invoices: number;
  unpaid_invoices: number;
  cancelled_invoices: number;
  total_revenue: number;
  pending_payments: number;
  total_vouchers: number;
}

interface EndpointStat {
  method: string;
  path: string;
  count: number;
  avg_latency: number;
}

interface AnalyticsOverview {
  total_requests: number;
  success_count: number;
  error_count: number;
  success_rate: number;
  error_rate: number;
  avg_latency: number;
  top_endpoints: EndpointStat[];
}

interface DashboardProps {
  user: User | null;
}

export default function Dashboard({ user }: DashboardProps) {
  const [invStats, setInvStats] = useState<InvoicingStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const planLimits = { requests: user?.plan === 'free' ? 30 : 50000 };
  const usedRequests = analytics?.total_requests || 0;
  const usagePercent = Math.min((usedRequests / planLimits.requests) * 100, 100);

  const getToken = () =>
    localStorage.getItem('yg_token') || localStorage.getItem('auth_token') || '';

  const fetchDashboardData = async () => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      setStatsError('No auth token found');
      return;
    }

    setLoading(true);
    setStatsError(null);

    try {
      const [statsRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/invoicing/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/v1/analytics/overview?days=30`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const statsData = await statsRes.json();
      const analyticsData = await analyticsRes.json();

      if (!statsRes.ok || !statsData.success) {
        throw new Error(statsData.error || 'Failed to load invoicing stats');
      }

      if (!analyticsRes.ok || !analyticsData.success) {
        throw new Error(analyticsData.error || 'Failed to load analytics overview');
      }

      setInvStats(statsData.data);
      setAnalytics(analyticsData.data);
    } catch (error) {
      setStatsError(error instanceof Error ? error.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const overviewStats = [
    {
      title: 'إجمالي الفواتير',
      value: invStats ? invStats.total_invoices.toLocaleString() : '0',
      icon: FileText,
    },
    {
      title: 'طلبات API',
      value: analytics ? analytics.total_requests.toLocaleString() : '0',
      icon: Activity,
    },
    {
      title: 'نسبة النجاح',
      value: analytics ? `${analytics.success_rate.toFixed(1)}%` : '0%',
      icon: CheckCircle,
    },
    {
      title: 'متوسط الاستجابة',
      value: analytics ? `${analytics.avg_latency.toFixed(1)}ms` : '0ms',
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            لوحة التحكم
          </h1>
          <p className="text-muted-foreground mt-1">
            مرحبًا، {user?.name || 'Developer'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="capitalize">
            {user?.plan || 'free'} Plan
          </Badge>

          <Link to="/keys">
            <Button size="sm" className="bg-yemen-600 hover:bg-yemen-700 text-white">
              <Key className="ml-1.5 h-4 w-4" />
              مفتاح API جديد
            </Button>
          </Link>
        </div>
      </div>

      {statsError && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{statsError}</span>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            جار تحميل بيانات لوحة التحكم...
          </CardContent>
        </Card>
      ) : (
        <>
          {invStats && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Link to="/invoices">
                <Card className="hover:border-yemen-200 transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">{invStats.total_invoices}</div>
                      <div className="text-xs text-muted-foreground">إجمالي الفواتير</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/invoices">
                <Card className="hover:border-yemen-200 transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        {Number(invStats.total_revenue || 0).toLocaleString()} YER
                      </div>
                      <div className="text-xs text-muted-foreground">الإيرادات المحصلة</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/payments">
                <Card className="hover:border-yemen-200 transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-yellow-50 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">{invStats.pending_payments}</div>
                      <div className="text-xs text-muted-foreground">مدفوعات معلقة</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/receipts">
                <Card className="hover:border-yemen-200 transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">{invStats.total_vouchers}</div>
                      <div className="text-xs text-muted-foreground">إجمالي السندات</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {overviewStats.map((stat) => (
              <Card key={stat.title} className="border-muted hover:border-yemen-200 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yemen-50">
                      <stat.icon className="h-5 w-5 text-yemen-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-muted">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>استخدام API</CardTitle>
                <CardDescription>استهلاك الطلبات خلال آخر 30 يوم</CardDescription>
              </div>

              <Link to="/usage">
                <Button variant="ghost" size="sm">
                  التفاصيل <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {usedRequests.toLocaleString()} / {planLimits.requests.toLocaleString()} requests
                </span>

                <span className="font-medium">
                  {usagePercent.toFixed(1)}%
                </span>
              </div>

              <Progress value={usagePercent} className="h-2" />

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                  <span>Successful: {analytics?.success_count || 0}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                  <span>Errors: {analytics?.error_count || 0}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium text-foreground">أكثر Endpoints استخدامًا</h4>

              {analytics?.top_endpoints?.length ? (
                <div className="space-y-2">
                  {analytics.top_endpoints.slice(0, 5).map((ep, index) => (
                    <div
                      key={`${ep.method}-${ep.path}-${index}`}
                      className="flex items-center justify-between rounded-lg border p-3 text-sm"
                    >
                      <div dir="ltr" className="font-mono text-xs">
                        {ep.method} {ep.path}
                      </div>
                      <Badge variant="secondary">{ep.count} طلب</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  لا توجد طلبات API مسجلة بعد.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">إجراءات سريعة</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              {[
                { label: 'مفاتيح API', icon: Key, href: '/keys' },
                { label: 'تجربة API', icon: Server, href: '/playground' },
                { label: 'التوثيق', icon: Globe, href: '/docs' },
                { label: 'الإحصائيات', icon: TrendingUp, href: '/usage' },
              ].map((action) => (
                <Link key={action.label} to={action.href}>
                  <Button variant="ghost" className="w-full justify-start gap-3 text-sm">
                    <action.icon className="h-4 w-4 text-muted-foreground" />
                    {action.label}
                    <ArrowUpRight className="mr-auto h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">ملخص الفواتير</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">مدفوعة</span>
                <span className="font-bold">{invStats?.paid_invoices || 0}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">غير مدفوعة</span>
                <span className="font-bold">{invStats?.unpaid_invoices || 0}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">ملغاة</span>
                <span className="font-bold">{invStats?.cancelled_invoices || 0}</span>
              </div>

              <Link to="/invoices">
                <Button variant="outline" className="w-full text-sm" size="sm">
                  عرض الفواتير
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle>آخر النشاطات</CardTitle>
          <CardDescription>مختصر من استخدام API</CardDescription>
        </CardHeader>

        <CardContent>
          {analytics?.top_endpoints?.length ? (
            <div className="space-y-2">
              {analytics.top_endpoints.slice(0, 6).map((ep, index) => (
                <div
                  key={`activity-${index}`}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <span dir="ltr" className="font-mono text-xs">
                    {ep.method} {ep.path}
                  </span>
                  <span className="text-muted-foreground">
                    متوسط {Number(ep.avg_latency || 0).toFixed(1)}ms
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              لا توجد نشاطات حديثة بعد.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
