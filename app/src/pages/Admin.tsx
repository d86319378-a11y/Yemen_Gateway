import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Key,
  Activity,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  Globe,
  Server,
  Smartphone,
  CreditCard,
  Ban,
  RefreshCw,
} from 'lucide-react';

const users = [
  { id: 1, name: 'Ahmed Al-Yemeni', email: 'ahmed@yemencode.dev', plan: 'business', status: 'active', requests: 45000, joined: '2024-01-10' },
  { id: 2, name: 'Sara Tech', email: 'sara@saratech.ye', plan: 'starter', status: 'active', requests: 12000, joined: '2024-01-15' },
  { id: 3, name: 'Mohammed Dev', email: 'moh@devstudio.ye', plan: 'enterprise', status: 'active', requests: 180000, joined: '2023-12-01' },
  { id: 4, name: 'Fatima Start', email: 'fatima@startup.ye', plan: 'free', status: 'suspended', requests: 980, joined: '2024-02-20' },
  { id: 5, name: 'Yemen Digital', email: 'info@yemendigital.co', plan: 'business', status: 'active', requests: 67000, joined: '2023-11-15' },
];

const requestsChart = [
  { hour: '00', requests: 1200, errors: 12 },
  { hour: '04', requests: 800, errors: 5 },
  { hour: '08', requests: 3200, errors: 28 },
  { hour: '12', requests: 5400, errors: 42 },
  { hour: '16', requests: 4800, errors: 35 },
  { hour: '20', requests: 2800, errors: 18 },
];

const systemHealth = [
  { service: 'API Gateway', status: 'operational', uptime: 99.98, icon: Server },
  { service: 'Currency API', status: 'operational', uptime: 99.95, icon: CreditCard },
  { service: 'Phone Service', status: 'operational', uptime: 99.90, icon: Smartphone },
  { service: 'SMS Service', status: 'degraded', uptime: 98.50, icon: Activity },
  { service: 'Wallet API', status: 'operational', uptime: 99.99, icon: Globe },
  { service: 'Auth Service', status: 'operational', uptime: 100, icon: Shield },
];

const recentErrors = [
  { id: 1, endpoint: 'POST /v1/sms/send', error: 'Gateway timeout', count: 23, time: '2 min ago', severity: 'high' },
  { id: 2, endpoint: 'GET /v1/currency/rates', error: 'Rate limit exceeded', count: 156, time: '5 min ago', severity: 'medium' },
  { id: 3, endpoint: 'POST /v1/payment/create', error: 'Invalid API key', count: 8, time: '12 min ago', severity: 'low' },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Platform management and monitoring</p>
        </div>
        <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" /> Admin Access</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Users', value: '2,847', change: '+124 this week', icon: Users, color: 'bg-blue-50 text-blue-600' },
          { label: 'Active Keys', value: '4,231', change: '+89 this week', icon: Key, color: 'bg-green-50 text-green-600' },
          { label: 'Requests Today', value: '1.2M', change: '+15% vs yesterday', icon: Activity, color: 'bg-yemen-50 text-yemen-600' },
          { label: 'Error Rate', value: '0.3%', change: '-0.1% vs yesterday', icon: AlertTriangle, color: 'bg-amber-50 text-amber-600' },
        ].map((stat) => (
          <Card key={stat.label} className="border-muted">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Request Traffic (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={requestsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="requests" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="errors" fill="#fca5a5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemHealth.map((svc) => (
                <div key={svc.service} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svc.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{svc.service}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={svc.status === 'operational' ? 'outline' : 'secondary'} className="text-[10px] capitalize">
                      {svc.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground w-12 text-right">{svc.uptime}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle>Users Management</CardTitle>
          <CardDescription>Manage developer accounts and subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-lg border p-4 hover:border-yemen-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yemen-100 text-yemen-700 font-bold text-sm">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="capitalize text-[10px]">{u.plan}</Badge>
                    <Badge variant={u.status === 'active' ? 'default' : 'secondary'} className="text-[10px] capitalize">
                      {u.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground w-16 text-right">{u.requests.toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Ban className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-muted">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Error Logs</CardTitle>
              <CardDescription>Recent errors and exceptions</CardDescription>
            </div>
            <Button variant="outline" size="sm"><RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentErrors.map((err) => (
              <div key={err.id} className={`flex items-center justify-between rounded-lg border p-4 ${
                err.severity === 'high' ? 'bg-red-50 border-red-200' : err.severity === 'medium' ? 'bg-amber-50 border-amber-200' : ''
              }`}>
                <div className="flex items-center gap-3">
                  {err.severity === 'high' ? <XCircle className="h-5 w-5 text-red-500" /> : 
                   err.severity === 'medium' ? <AlertTriangle className="h-5 w-5 text-amber-500" /> : 
                   <Clock className="h-5 w-5 text-blue-500" />}
                  <div>
                    <p className="text-sm font-medium font-mono">{err.endpoint}</p>
                    <p className="text-xs text-muted-foreground">{err.error}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="destructive" className="text-xs">{err.count} occurrences</Badge>
                  <span className="text-xs text-muted-foreground">{err.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
