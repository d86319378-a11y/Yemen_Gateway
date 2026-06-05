import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, CheckCircle, XCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

type PhoneResult = {
  phone: string;
  valid: boolean;
  carrier: string;
  type: string;
  formatted: string;
  country: string;
};

export default function PhoneVerifyPage() {
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<PhoneResult | null>(null);
  const [loading, setLoading] = useState(false);

  const verifyPhone = async () => {
    if (!phone.trim()) {
      alert('أدخل رقم الهاتف');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/phone/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': localStorage.getItem('yg_api_key') || '',
        },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.data);
      } else {
        alert(data.error || 'فشل التحقق من الرقم');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">التحقق من الأرقام اليمنية</h1>
        <p className="text-sm text-muted-foreground mt-1">
          تحقق من صحة الرقم ومعرفة شركة الاتصالات
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div>
            <Label>رقم الهاتف</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: 777123456"
            />
          </div>

          <Button onClick={verifyPhone} disabled={loading} className="gap-2">
            <Phone className="h-4 w-4" />
            {loading ? 'جار التحقق...' : 'تحقق من الرقم'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              {result.valid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-bold">
                {result.valid ? 'الرقم صحيح' : 'الرقم غير صحيح'}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <div>الرقم: {result.phone}</div>
              <div>الشركة: {result.carrier}</div>
              <div>النوع: {result.type}</div>
              <div>الدولة: {result.country}</div>
              <div>التنسيق: {result.formatted}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
