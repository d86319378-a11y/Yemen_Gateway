import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { PLANS } from '@/lib/constants';
import type { User } from '@/types';
import {
  CreditCard,
  Check,
  Zap,
  Calendar,
  Receipt,
  AlertTriangle,
} from 'lucide-react';

interface BillingProps {
  user: User | null;
}

const invoices = [
  { id: 'INV-2024-001', date: '2024-01-01', amount: 19.00, status: 'paid', plan: 'Starter' },
  { id: 'INV-2024-002', date: '2024-02-01', amount: 19.00, status: 'paid', plan: 'Starter' },
  { id: 'INV-2024-003', date: '2024-03-01', amount: 79.00, status: 'paid', plan: 'Business' },
  { id: 'INV-2024-004', date: '2024-04-01', amount: 79.00, status: 'pending', plan: 'Business' },
];

export default function BillingPage({ user }: BillingProps) {
  const [yearly, setYearly] = useState(false);
  const currentPlan = PLANS.find(p => p.id === user?.plan) || PLANS[0];
  const usagePercent = 115;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and payments</p>
      </div>

      <Card className={`border-muted ${usagePercent > 100 ? 'border-amber-300 bg-amber-50/50' : ''}`}>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yemen-100">
                <Zap className="h-6 w-6 text-yemen-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{currentPlan.name} Plan</span>
                  <Badge variant="secondary" className="capitalize">{user?.plan}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  ${currentPlan.price}/month · Renews on May 1, 2024
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">Cancel Plan</Button>
              <Button size="sm" className="bg-yemen-600 hover:bg-yemen-700 text-white">
                Change Plan
              </Button>
            </div>
          </div>
          {usagePercent > 100 && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-100 border border-amber-200 p-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800">
                You have exceeded your monthly request limit. <Link to="/usage" className="underline font-medium">View usage</Link> or upgrade to avoid service interruption.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-muted">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Receipt className="h-4 w-4" />
              <span className="text-sm">Next Invoice</span>
            </div>
            <p className="text-2xl font-bold">${currentPlan.price.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Due May 1, 2024</p>
          </CardContent>
        </Card>
        <Card className="border-muted">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Billing Period</span>
            </div>
            <p className="text-lg font-bold">Apr 1 - Apr 30</p>
            <p className="text-xs text-muted-foreground">Monthly billing</p>
          </CardContent>
        </Card>
        <Card className="border-muted">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <CreditCard className="h-4 w-4" />
              <span className="text-sm">Payment Method</span>
            </div>
            <p className="text-lg font-bold">Visa ****4242</p>
            <p className="text-xs text-muted-foreground">Expires 12/25</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted">
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-end mb-4">
            <div className="flex items-center gap-2">
              <span className={`text-sm ${!yearly ? 'font-medium' : 'text-muted-foreground'}`}>Monthly</span>
              <Switch checked={yearly} onCheckedChange={setYearly} />
              <span className={`text-sm ${yearly ? 'font-medium' : 'text-muted-foreground'}`}>Yearly</span>
              {yearly && <Badge variant="secondary" className="text-xs">Save 20%</Badge>}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <Card key={plan.id} className={`border ${plan.id === user?.plan ? 'border-yemen-400 ring-1 ring-yemen-200' : 'border-muted'} ${plan.highlighted ? 'shadow-lg' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{plan.name}</span>
                    {plan.id === user?.plan && <Badge className="bg-yemen-600 text-[10px]">Current</Badge>}
                  </div>
                  <div className="mb-3">
                    <span className="text-2xl font-bold">${yearly ? (plan.price * 0.8 * 12).toFixed(0) : plan.price}</span>
                    <span className="text-muted-foreground">/{yearly ? 'year' : 'mo'}</span>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {plan.features.slice(0, 4).map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.id === user?.plan ? 'outline' : 'default'}
                    className={`w-full text-xs ${plan.highlighted && plan.id !== user?.plan ? 'bg-yemen-600 hover:bg-yemen-700 text-white' : ''}`}
                    size="sm"
                    disabled={plan.id === user?.plan}
                  >
                    {plan.id === user?.plan ? 'Current Plan' : 'Upgrade'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-muted">
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>Your past billing statements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg border p-4 hover:border-yemen-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{inv.id}</p>
                    <p className="text-xs text-muted-foreground">{inv.date} · {inv.plan}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">${inv.amount.toFixed(2)}</span>
                  <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'} className="text-xs capitalize">
                    {inv.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-8">
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
