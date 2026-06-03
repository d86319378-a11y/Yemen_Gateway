import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { User, Activity, ApiKey } from '@/types';
import {
  ArrowUpRight, BarChart3, Clock, Copy, CheckCircle, AlertTriangle,
  Key, TrendingUp, Zap, RefreshCw, Globe, Server,
  FileText, Receipt, Wallet,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

interface InvoicingStats {
  total_invoices: number; paid_invoices: number; unpaid_invoices: number;
  cancelled_invoices: number; total_revenue: number; pending_payments: number; total_vouchers: number;
}

interface DashboardProps {
  user: User | null;
}

const recentActivity: Activity[] = [
  { id: '1', action: 'API Key Created', details: 'Production key for mobile app', timestamp: '2024-01-15 10:30:00', status: 'success' },
  { id: '2', action: 'Rate Limit Warning', details: 'Key yag_live_... exceeded 80% of limit', timestamp: '2024-01-15 09:15:00', status: 'warning' },
  { id: '3', action: 'Currency API Called', details: 'GET /v1/currency/rates - 45ms', timestamp: '2024-01-15 08:45:00', status: 'success' },
  { id: '4', action: 'Phone Verify', details: 'POST /v1/phone/verify - 23ms', timestamp: '2024-01-15 07:20:00', status: 'success' },
  { id: '5', action: 'SMS Sent', details: 'POST /v1/sms/send - 120ms', timestamp: '2024-01-15 06:00:00', status: 'success' },
  { id: '6', action: 'Auth Error', details: 'Invalid API key attempted', timestamp: '2024-01-15 05:30:00', status: 'error' },
];

const apiKeys: ApiKey[] = [
  { id: '1', name: 'Production Mobile', key: 'yag_live_abc123def456', prefix: 'yag_live', status: 'active', permissions: ['currency', 'phone'], createdAt: '2024-01-10', lastUsedAt: '2024-01-15 10:00', usageCount: 45231 },
  { id: '2', name: 'Development Test', key: 'yag_test_xyz789uvw012', prefix: 'yag_test', status: 'active', permissions: ['all'], createdAt: '2024-01-12', lastUsedAt: '2024-01-15 09:30', usageCount: 8912 },
];

const stats = [
  { title: 'Total Requests', value: '54,143', change: '+12.5%', icon: BarChart3, trend: 'up' },
  { title: 'Success Rate', value: '99.7%', change: '+0.2%', icon: CheckCircle, trend: 'up' },
  { title: 'Avg Latency', value: '62ms', change: '-8ms', icon: Zap, trend: 'down' },
  { title: 'Active Keys', value: '2 / 5', change: '', icon: Key, trend: 'neutral' },
];

export default function Dashboard({ user }: DashboardProps) {
  const planLimits = { requests: 50000 };
  const usedRequests = 54143;
  const usagePercent = Math.min((usedRequests / planLimits.requests) * 100, 100);
  const [invStats, setInvStats] = useState<InvoicingStats | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/v1/invoicing/stats`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}` },
    }).then(r => r.json()).then(d => { if (d.success) setInvStats(d.data); }).catch(() => {});
  }, []);

  const getStatusIcon = (status: Activity['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBg = (status: Activity['status']) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'error': return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.name || 'Developer'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="capitalize">{user?.plan || 'free'} Plan</Badge>
          <Link to="/keys">
            <Button size="sm" className="bg-yemen-600 hover:bg-yemen-700 text-white">
              <Key className="mr-1.5 h-4 w-4" />
              New API Key
            </Button>
          </Link>
        </div>
      </div>

      {/* Invoicing Stats */}
      {invStats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" dir="rtl">
          <Link to="/invoices">
            <Card className="hover:border-yemen-200 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center"><FileText className="h-5 w-5 text-blue-600" /></div>
                <div><div className="text-lg font-bold">{invStats.total_invoices}</div><div className="text-xs text-muted-foreground">إجمالي الفواتير</div></div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/invoices?status=paid">
            <Card className="hover:border-yemen-200 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-green-600" /></div>
                <div><div className="text-lg font-bold">{invStats.total_revenue?.toLocaleString()} YER</div><div className="text-xs text-muted-foreground">الإيرادات المحصلة</div></div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/payments">
            <Card className="hover:border-yemen-200 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-yellow-50 flex items-center justify-center"><Wallet className="h-5 w-5 text-yellow-600" /></div>
                <div><div className="text-lg font-bold">{invStats.pending_payments}</div><div className="text-xs text-muted-foreground">مدفوعات معلقة</div></div>
              </CardContent>
            </Card>
          </Link>
          <Link to="/receipts">
            <Card className="hover:border-yemen-200 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center"><Receipt className="h-5 w-5 text-purple-600" /></div>
                <div><div className="text-lg font-bold">{invStats.total_vouchers}</div><div className="text-xs text-muted-foreground">إجمالي السندات</div></div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
              {stat.change && (
                <div className="mt-2 flex items-center gap-1">
                  <TrendingUp className={`h-3.5 w-3.5 ${stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <span className={`text-xs font-medium ${stat.trend === 'up' || stat.trend === 'down' ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-muted">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Usage Overview</CardTitle>
                <CardDescription>Monthly request consumption</CardDescription>
              </div>
              <Link to="/usage">
                <Button variant="ghost" size="sm" className="text-yemen-600 hover:text-yemen-700 hover:bg-yemen-50">
                  View Details <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{usedRequests.toLocaleString()} / {planLimits.requests.toLocaleString()} requests</span>
                <span className={`font-medium ${usagePercent > 90 ? 'text-red-600' : usagePercent > 75 ? 'text-amber-600' : 'text-green-600'}`}>
                  {usagePercent.toFixed(1)}%
                </span>
              </div>
              <Progress value={usagePercent} className="h-2" />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span>Successful: 53,980</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span>Errors: 163</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium text-foreground">Top Endpoints</h4>
              {[
                { endpoint: 'GET /v1/currency/rates', pct: 45 },
                { endpoint: 'POST /v1/phone/verify', pct: 28 },
                { endpoint: 'POST /v1/sms/send', pct: 15 },
                { endpoint: 'GET /v1/wallets', pct: 8 },
                { endpoint: 'Others', pct: 4 },
              ].map((ep) => (
                <div key={ep.endpoint} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-40 truncate">{ep.endpoint}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yemen-500 to-yemen-600 rounded-full transition-all" style={{ width: `${ep.pct}%` }} />
                  </div>
                  <span className="text-xs font-medium w-8 text-right">{ep.pct}%</span>
                </div>
              ))}
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
                  <Button variant="ghost" className="w-full justify-start gap-3 text-sm hover:bg-yemen-50 hover:text-yemen-700">
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
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{key.name}</span>
                      <Badge variant={key.status === 'active' ? 'default' : 'secondary'} className="text-[10px] h-5">
                        {key.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{key.prefix}_****</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigator.clipboard.writeText(key.key)}>
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
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
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {recentActivity.map((activity) => (
                <div key={activity.id} className={`flex items-center gap-3 rounded-lg border p-3 ${getStatusBg(activity.status)}`}>
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.details}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {activity.timestamp.split(' ')[1]}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
