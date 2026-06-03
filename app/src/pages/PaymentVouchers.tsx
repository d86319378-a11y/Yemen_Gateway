import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ArrowUpDown, Download } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

function getToken() {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
}

interface Voucher {
  id: string; number: string; type: string; party_name: string;
  amount: number; currency: string; method: string;
  description: string; status: string; created_at: string;
}

export default function PaymentVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    party_name: '', party_phone: '', amount: 0, currency: 'YER',
    method: 'cash', reference: '', description: '',
  });

  useEffect(() => { fetchVouchers(); }, []);

  const fetchVouchers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/vouchers?type=payment`, { headers: { 'X-API-Key': getToken() } });
      const data = await res.json();
      if (data.success) setVouchers(data.data || []);
    } finally { setLoading(false); }
  };

  const createVoucher = async () => {
    const res = await fetch(`${API_BASE_URL}/api/v1/payment-vouchers`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': getToken() },
      body: JSON.stringify({ ...form, type: 'payment' }),
    });
    const data = await res.json();
    if (data.success) { setOpen(false); fetchVouchers(); }
    else alert(data.error || 'فشل إنشاء السند');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">سندات الصرف</h1>
          <p className="text-muted-foreground text-sm mt-1">توثيق المبالغ المصروفة</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />سند جديد</Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader><DialogTitle>إنشاء سند صرف</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>اسم المستفيد *</Label><Input value={form.party_name} onChange={e => setForm({...form, party_name: e.target.value})} /></div>
                <div><Label>رقم الهاتف</Label><Input value={form.party_phone} onChange={e => setForm({...form, party_phone: e.target.value})} /></div>
                <div><Label>المبلغ *</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} /></div>
                <div><Label>العملة</Label>
                  <Select value={form.currency} onValueChange={v => setForm({...form, currency: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YER">ريال يمني</SelectItem>
                      <SelectItem value="USD">دولار</SelectItem>
                      <SelectItem value="SAR">ريال سعودي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>طريقة الصرف</Label>
                  <Select value={form.method} onValueChange={v => setForm({...form, method: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقدي</SelectItem>
                      <SelectItem value="wallet">محفظة</SelectItem>
                      <SelectItem value="bank_transfer">تحويل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>رقم المرجع</Label><Input value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} /></div>
              </div>
              <div><Label>سبب الصرف</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <Button className="w-full" onClick={createVoucher}>إنشاء السند</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جار التحميل...</div>
      ) : vouchers.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><ArrowUpDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">لا توجد سندات صرف</p></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {vouchers.map(v => (
            <Card key={v.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                      <ArrowUpDown className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <div className="font-semibold">{v.number}</div>
                      <div className="text-sm text-muted-foreground">{v.party_name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-lg text-red-700">{v.amount?.toLocaleString()} {v.currency}</div>
                      <div className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString('ar-YE')}</div>
                    </div>
                    <Badge variant="outline">{v.description?.slice(0, 20) || 'صرف'}</Badge>
                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
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
