import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Wallet, Pencil, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

function getAPIKey() {
  return localStorage.getItem('yg_api_key') || '';
}

interface Voucher {
  id: string;
  number: string;
  type: string;
  party_name: string;
  party_phone?: string;
  amount: number;
  currency: string;
  method?: string;
  reference?: string;
  description?: string;
  status: string;
  created_at: string;
}

export default function PaymentVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    party_name: '',
    party_phone: '',
    amount: 0,
    currency: 'YER',
    method: 'cash',
    reference: '',
    description: '',
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/vouchers?type=payment`, {
        headers: { 'X-API-Key': getAPIKey() },
      });

      const data = await res.json();

      if (data.success) {
        setVouchers(data.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const submitVoucher = async () => {
    if (!form.party_name.trim()) {
      alert('أدخل اسم المستلم');
      return;
    }

    if (!form.amount || form.amount <= 0) {
      alert('أدخل مبلغ صحيح');
      return;
    }

    const payload = {
      type: 'payment',
      party_name: form.party_name,
      party_phone: form.party_phone,
      amount: Number(form.amount),
      currency: form.currency,
      method: form.method,
      reference: form.reference,
      description: form.description,
    };

    const res = await fetch(`${API_BASE_URL}/api/v1/payment-vouchers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': getAPIKey(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      setOpen(false);
      setForm({
        party_name: '',
        party_phone: '',
        amount: 0,
        currency: 'YER',
        method: 'cash',
        reference: '',
        description: '',
      });
      fetchVouchers();
    } else {
      alert(data.error || 'فشل إنشاء سند الصرف');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">سندات الصرف</h1>
          <p className="text-muted-foreground text-sm mt-1">
            إنشاء وإدارة سندات الصرف
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              سند صرف جديد
            </Button>
          </DialogTrigger>

          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء سند صرف</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>اسم المستلم *</Label>
                <Input
                  value={form.party_name}
                  onChange={(e) => setForm({ ...form, party_name: e.target.value })}
                  placeholder="مثال: شركة النقل"
                />
              </div>

              <div>
                <Label>رقم الهاتف</Label>
                <Input
                  value={form.party_phone}
                  onChange={(e) => setForm({ ...form, party_phone: e.target.value })}
                  placeholder="777123456"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>المبلغ *</Label>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>العملة</Label>
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YER">ريال يمني</SelectItem>
                      <SelectItem value="SAR">ريال سعودي</SelectItem>
                      <SelectItem value="USD">دولار</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>طريقة الصرف</Label>
                <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">نقدًا</SelectItem>
                    <SelectItem value="wallet">محفظة</SelectItem>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>المرجع</Label>
                <Input
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  placeholder="رقم العملية أو المرجع"
                />
              </div>

              <div>
                <Label>البيان</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="سبب الصرف"
                />
              </div>

              <Button className="w-full" onClick={submitVoucher}>
                إنشاء سند الصرف
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جار التحميل...</div>
      ) : vouchers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد سندات صرف</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {vouchers.map((v) => (
            <Card key={v.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">{v.number}</div>
                    <div className="text-sm text-muted-foreground">{v.party_name}</div>
                    <div className="text-xs text-muted-foreground">{v.description || 'بدون بيان'}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold">
                        {Number(v.amount || 0).toLocaleString()} {v.currency}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(v.created_at).toLocaleDateString('ar-YE')}
                      </div>
                    </div>

                    <Badge>{v.status || 'issued'}</Badge>

                    <Button size="sm" variant="outline" onClick={() => alert('تعديل السند يحتاج Endpoint في Backend')}>
                      <Pencil className="h-4 w-4 ml-1" />
                      تعديل
                    </Button>

                    <Button size="sm" variant="destructive" onClick={() => alert('الحذف يحتاج Endpoint في Backend')}>
                      <Trash2 className="h-4 w-4 ml-1" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
