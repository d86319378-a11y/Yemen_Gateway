import { Link, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Phone, DollarSign } from 'lucide-react';
import { Activity } from 'lucide-react';
import {
  LayoutDashboard,
  Key,
  BarChart3,
  Settings,
  Code2,
  LogOut,
  CreditCard,
  Shield,
  FileText,
  Receipt,
  ArrowUpDown,
  Wallet,
  Code,
  TrendingUp,
  Users,
  Terminal,
  Bell,
} from 'lucide-react';
import type { User } from '@/types';

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
}

const menuItems = [
  { label: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard },
  { label: 'الفواتير', href: '/invoices', icon: FileText },
  { label: 'العملاء', href: '/customers', icon: Users },
  { label: 'سندات القبض', href: '/receipts', icon: Receipt },
  { label: 'سندات الصرف', href: '/payment-vouchers', icon: ArrowUpDown },
  { label: 'المدفوعات', href: '/payments', icon: Wallet },
  { label: 'مفاتيح API', href: '/keys', icon: Key },
  { label: 'تجربة API', href: '/playground', icon: Terminal },
  { label: 'الإحصائيات', href: '/usage', icon: BarChart3 },
  { label: 'المطورون', href: '/developers', icon: Code },
  { label: 'الاشتراك', href: '/billing', icon: CreditCard },
  { label: 'أسعار الصرف', href: '/exchange-rates', icon: DollarSign },
{ label: 'التحقق من الأرقام', href: '/phone-verify', icon: Phone },
  { label: 'الإشعارات', href: '/notifications', icon: Bell },
  {
  label: 'سجلات API',
  href: '/api-logs',
  icon: Activity,
},
];

const bottomItems = [
  { label: 'الإعدادات', href: '/settings', icon: Settings },
];

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (href: string) => {
    if (href === '/dashboard') return currentPath === '/dashboard';
    return currentPath.startsWith(href);
  };

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/20">
      <div className="flex h-16 items-center gap-2.5 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yemen-600 to-yemen-800">
            <Code2 className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-foreground">Yemen API</span>
            <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">Gateway</span>
          </div>
        </Link>
      </div>

      <Separator />

      <ScrollArea className="flex-1 py-3">
        <div className="flex flex-col gap-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-yemen-50 text-yemen-700 shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-yemen-600' : ''}`} />
                {item.label}
                {item.href === '/billing' && (
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                    {user?.plan || 'free'}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>

        {user?.role === 'admin' && (
          <>
            <div className="mt-6 px-4 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">الإدارة</span>
            </div>
            <div className="flex flex-col gap-1 px-3">
              <Link
                to="/admin"
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                  currentPath === '/admin'
                    ? 'bg-yemen-50 text-yemen-700 shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Shield className={`h-4 w-4 ${currentPath === '/admin' ? 'text-yemen-600' : ''}`} />
                لوحة الإدارة
              </Link>
              <Link
                to="/admin/payments"
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                  currentPath.startsWith('/admin/payments')
                    ? 'bg-yemen-50 text-yemen-700 shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <TrendingUp className={`h-4 w-4 ${currentPath.startsWith('/admin/payments') ? 'text-yemen-600' : ''}`} />
                مراجعة المدفوعات
              </Link>
            </div>
          </>
        )}
      </ScrollArea>

      <Separator />

      <div className="p-3 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-yemen-50 text-yemen-700 shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-yemen-600' : ''}`} />
              {item.label}
            </Link>
          );
        })}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );
}
