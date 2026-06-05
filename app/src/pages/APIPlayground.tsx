import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Code2, Phone, DollarSign, FileText, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

type ApiResult = {
  status?: number;
  success?: boolean;
  data?: unknown;
  error?: string;
};

const examples = {
  rates: {
    title: 'أسعار الصرف',
    method: 'GET',
    url: '/api/v1/currency/rates',
  },
  phone: {
    title: 'التحقق من رقم',
    method: 'POST',
    url: '/api/v1/phone/verify',
  },
  invoice: {
    title: 'إنشاء فاتورة تجريبية',
    method: 'POST',
    url: '/api/v1/invoices',
  },
};

export default function APIPlaygroundPage() {
  const [type, setType] = useState<'rates' | 'phone' | 'invoice'>('rates');
  const [phone, setPhone] = useState('777123456');
  const [customerName, setCustomerName] = useState('عميل تجريبي');
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResult | null>(null);

  const apiKey = localStorage.getItem('yg_api_key') || '';

  const runRequest = async () => {
    if (!apiKey) {
      alert('يرجى إنشاء أو حفظ API Key أولاً من صفحة مفاتيح API');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let response: Response;

      if (type === 'rates') {
        response = await fetch(`${API_BASE_URL}/api/v1/currency/rates`, {
          headers: {
            'X-API-Key': apiKey,
          },
        });
      } else if (type === 'phone') {
        response = await fetch(`${API_BASE_URL}/api/v1/phone/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
          },
          body: JSON.stringify({ phone }),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/v1/invoices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
          },
          body: JSON.stringify({
            customer_name: customerName,
            customer_phone: phone,
            customer_email: 'demo@example.com',
            currency: 'YER',
            tax: 0,
            discount: 0,
            notes: 'فاتورة تجريبية من API Playground',
            items: [
              {
                description: 'خدمة تجريبية',
                quantity: 1,
                unit_price: Number(amount),
              },
            ],
          }),
        });
      }

      const data = await response.json();

      setResult({
        status: response.status,
        ...data,
      });
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'فشل تنفيذ الطلب',
      });
    } finally {
      setLoading(false);
    }
  };

  const active = examples[type];

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">تجربة API</h1>
        <p className="text-sm text-muted-foreground mt-1">
          جرّب خدمات Yemen Gateway مباشرة باستخدام API Key الخاص بك.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5 space-y-5">
            <div>
              <Label>نوع التجربة</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'rates' | 'phone' | 'invoice')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rates">أسعار الصرف</SelectItem>
                  <SelectItem value="phone">التحقق من رقم</SelectItem>
                  <SelectItem value="invoice">إنشاء فاتورة تجريبية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold">{active.title}</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">
                  {active.method}
                </span>
              </div>
              <div className="mt-2 font-mono text-xs text-muted-foreground ltr:text-left" dir="ltr">
                {active.url}
              </div>
            </div>

            {(type === 'phone' || type === 'invoice') && (
              <div>
                <Label>رقم الهاتف</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="777123456"
                />
              </div>
            )}

            {type === 'invoice' && (
              <>
                <div>
                  <Label>اسم العميل</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>المبلغ</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>
              </>
            )}

            <Button onClick={runRequest} disabled={loading} className="w-full gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جار التنفيذ...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  تنفيذ الطلب
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              {type === 'rates' && <DollarSign className="h-5 w-5 text-green-600" />}
              {type === 'phone' && <Phone className="h-5 w-5 text-blue-600" />}
              {type === 'invoice' && <FileText className="h-5 w-5 text-red-600" />}
              <h2 className="font-bold">النتيجة</h2>
            </div>

            <div className="rounded-xl bg-slate-950 p-4 text-sm text-green-400 overflow-auto max-h-[500px]" dir="ltr">
              <pre>
                {result
                  ? JSON.stringify(result, null, 2)
                  : 'اضغط "تنفيذ الطلب" لعرض النتيجة هنا'}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Code2 className="mt-1 h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-semibold">ملاحظة للمطورين</div>
              <p className="text-sm text-muted-foreground mt-1">
                جميع الطلبات في هذه الصفحة تستخدم نفس الـ API Key المحفوظ في المتصفح من صفحة مفاتيح API.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
