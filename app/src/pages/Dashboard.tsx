import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { User } from '@/types';
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle,
  Key,
  TrendingUp,
  Zap,
  RefreshCw,
  Globe,
  Server,
  FileText,
  Receipt,
  Wallet,
  AlertTriangle,
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

interface DashboardProps {
  user: User | null;
}

export default function Dashboard({ user }: DashboardProps) {
  const [invStats, setInvStats] = useState<InvoicingStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const planLimits = { requests: user?.plan === 'free' ? 30 : 50000 };
  const usedRequests = 0;
  const usagePercent = Math.min((usedRequests / planLimits.requests) * 100, 100);

  useEffect(() => {
    const token = localStorage.getItem('yg_token');

    if (!token) {
      setStatsLoading(false);
      setStatsError('No auth token found');
      return;
    }

    fetch(`${API_BASE_URL}/api/v1/invoicing/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load dashboard stats');
        }

        setInvStats(data.data);
        setStatsError(null);
      })
      .catch((error) => {
        setStatsError(error.message || 'Failed to load dashboard stats');
      })
      .finally(() => {
        setStatsLoading(false);
      });
  }, []);

  const overviewStats = [
    {
      title: 'Total Invoices',
      value: invStats ? invStats.total_invoices.toLocaleString() : '0',
      change: '',
      icon: FileText,
      trend: 'neutral',
    },
    {
      title: 'Paid Invoices',
      value: invStats ? invStats.paid_invoices.toLocaleString() : '0',
      change: '',
      icon: CheckCircle,
      trend: 'neutral',
    },
    {
      title: 'Pending Payments',
      value: invStats ? invStats.pending_payments.toLocaleString() : '0',
      change: '',
      icon: Wallet,
      trend: 'neutral',
    },
    {
      title: 'Total Vouchers',
      value: invStats ? invStats.total_vouchers.toLocaleString() : '0',
      change: '',
      icon: Receipt,
      trend: 'neutral',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name || 'Developer'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="capitalize">
            {user?.plan || 'free'} Plan
          </Badge>

          <Link to="/keys">
            <Button size="sm" className="bg-yemen-600 hover:bg-yemen-700 text-white">
              <Key className="mr-1.5 h-4 w-4" />
              New API Key
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

      {statsLoading ? (
        <Card className="border-muted">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Loading dashboard stats...
          </CardContent>
        </Card>
      ) : (
        <>
          {invStats && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" dir="rtl">
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

              <Link to="/invoices?status=paid">
                <Card className="hover:border-yemen-200 transition-all cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold">
                        {invStats.total_revenue?.toLocaleString()} YER
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
                <CardTitle>Usage Overview</CardTitle>
                <CardDescription>Monthly request consumption</CardDescription>
              </div>

              <Link to="/usage">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-yemen-600 hover:text-yemen-700 hover:bg-yemen-50"
                >
                  View Details <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
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

                <span
                  className={`font-medium ${
                    usagePercent > 90
                      ? 'text-red-600'
                      : usagePercent > 75
                        ? 'text-amber-600'
                        : 'text-green-600'
                  }`}
                >
                  {usagePercent.toFixed(1)}%
                </span>
              </div>

              <Progress value={usagePercent} className="h-2" />

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span>Successful: 0</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span>Errors: 0</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium text-foreground">Top Endpoints</h4>

              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No API usage recorded yet.
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              {[
                { label: 'View API Keys', icon: Key, href: '/keys' },
                { label: 'Check Documentation', icon: Globe, href: '/docs' },
                { label: 'Upgrade Plan', icon: TrendingUp, href: '/billing' },
                { label: 'View Logs', icon: Server, href: '/usage' },
              ].map((action) => (
                <Link key={action.label} to={action.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-sm hover:bg-yemen-50 hover:text-yemen-700"
                  >
                    <action.icon className="h-4 w-4 text-muted-foreground" />
                    {action.label}
                    <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your API Keys</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                API keys will appear here after connecting the API Keys page.
              </div>

              <Link to="/keys">
                <Button variant="outline" className="w-full text-sm" size="sm">
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Manage All Keys
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest API calls and events</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No recent activity yet.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
