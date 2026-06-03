import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Smartphone,
  Mail,
  CreditCard,
  Wallet,
} from 'lucide-react';

const requestData = [
  { day: 'Mon', requests: 8200, errors: 45 },
  { day: 'Tue', requests: 9100, errors: 32 },
  { day: 'Wed', requests: 7800, errors: 28 },
  { day: 'Thu', requests: 10200, errors: 51 },
  { day: 'Fri', requests: 8900, errors: 38 },
  { day: 'Sat', requests: 6500, errors: 22 },
  { day: 'Sun', requests: 7200, errors: 29 },
];

const latencyData = [
  { time: '00:00', p50: 45, p95: 120, p99: 250 },
  { time: '04:00', p50: 38, p95: 98, p99: 200 },
  { time: '08:00', p50: 62, p95: 180, p99: 380 },
  { time: '12:00', p50: 78, p95: 220, p99: 450 },
  { time: '16:00', p50: 85, p95: 250, p99: 520 },
  { time: '20:00', p50: 55, p95: 150, p99: 310 },
];

const endpointData = [
  { name: 'Currency', value: 45, color: '#dc2626' },
  { name: 'Phone', value: 28, color: '#16a34a' },
  { name: 'SMS', value: 15, color: '#7c3aed' },
  { name: 'Wallet', value: 8, color: '#d97706' },
  { name: 'Payment', value: 4, color: '#db2777' },
];

const stats = [
  { label: 'Total Requests', value: '57,800', change: '+12.3%', up: true, icon: Activity },
  { label: 'Success Rate', value: '99.6%', change: '+0.1%', up: true, icon: CheckCircle },
  { label: 'Avg Latency', value: '62ms', change: '-5ms', up: false, icon: Clock },
  { label: 'Error Rate', value: '0.4%', change: '-0.1%', up: false, icon: XCircle },
];

const endpointStats = [
  { endpoint: 'GET /v1/currency/rates', calls: 26010, avgTime: '45ms', errorRate: '0.2%', icon: CreditCard },
  { endpoint: 'POST /v1/phone/verify', calls: 16184, avgTime: '23ms', errorRate: '0.5%', icon: Smartphone },
  { endpoint: 'POST /v1/sms/send', calls: 8670, avgTime: '120ms', errorRate: '0.8%', icon: Mail },
  { endpoint: 'GET /v1/wallets', calls: 4624, avgTime: '38ms', errorRate: '0.1%', icon: Wallet },
  { endpoint: 'POST /v1/payment/create', calls: 2312, avgTime: '180ms', errorRate: '1.2%', icon: CreditCard },
];

export default function UsagePage() {
  const [period, setPeriod] = useState('7d');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Usage & Analytics</h1>
          <p className="text-muted-foreground mt-1">Monitor your API consumption and performance</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-muted">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="h-5 w-5 text-yemen-600" />
                <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.up ? 'text-green-600' : 'text-green-600'}`}>
                  {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Request Volume</CardTitle>
            <CardDescription>Daily requests and errors</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={requestData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="requests" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="errors" fill="#fca5a5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Response Latency</CardTitle>
            <CardDescription>P50, P95, P99 percentiles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} unit="ms" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="p50" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="p99" stroke="#6b7280" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-muted">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">API Distribution</CardTitle>
            <CardDescription>Usage by service</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={endpointData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {endpointData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {endpointData.map((ep) => (
                <div key={ep.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ep.color }} />
                  <span className="text-muted-foreground">{ep.name} ({ep.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-muted">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Endpoint Performance</CardTitle>
            <CardDescription>Detailed metrics per endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {endpointStats.map((ep) => (
                <div key={ep.endpoint} className="flex items-center justify-between rounded-lg border p-4 hover:border-yemen-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yemen-50">
                      <ep.icon className="h-4.5 w-4.5 text-yemen-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground font-mono">{ep.endpoint}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground">{ep.calls.toLocaleString()} calls</span>
                        <span className="text-xs text-muted-foreground">Avg: {ep.avgTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {ep.errorRate} errors
                    </Badge>
                    <div className="mt-1 w-24">
                      <Progress value={100 - parseFloat(ep.errorRate) * 10} className="h-1.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-base">Plan Usage</CardTitle>
          <CardDescription>Current billing period consumption</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">API Requests</span>
                <span className="font-medium">57,800 / 50,000</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-yemen-500 to-yemen-600" style={{ width: '100%' }} />
              </div>
              <p className="text-xs text-red-600 mt-1">You have exceeded your monthly limit. Upgrade your plan to avoid rate limiting.</p>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">API Keys</span>
                <span className="font-medium">2 / 5</span>
              </div>
              <Progress value={40} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Rate Limit</span>
                <span className="font-medium">100 req/min</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
