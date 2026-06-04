import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ArrowUpDown, CheckCircle, Clock, XCircle, Pencil, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

function getAPIKey() {
  return localStorage.getItem('yg_api_key') || '';
}

interface PaymentVoucher {
  id: string;
  invoice_id: string;
  provider: string;
  sender_name: string;
  sender_phone: string;
  amount: number;
  currency: string;
  reference: string;
  screenshot_url: string;
  status: string;
  admin_note: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'مقبول', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function PaymentVouchersPage() {
  const [vouchers, setVouchers] = useState<PaymentVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    invoice_id: '', provider: 'kuraimi', sender_name: '', sender_phone: '',
    amount: 0, currency: 'YER', reference: '', screenshot_url: '',
  });

  useEffect(() => { fetchVouchers(); }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/api/v1/payment-vouchers`, {
      headers: { 'X-API-Key': getAPIKey() },
    });
    const data = await res.json();
    if (data.success) setVouchers(data.data || []);
    setLoading(false);
  };

  const submitVoucher = async () => {
    const res = await fetch(`${API_BASE_URL}/api/v1/payment-vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': getAPIKey() },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) { setOpen(false); fetchVouchers(); }
    else alert(data.error || 'فشل إرسال سند الدفع');
  };

  const deleteVoucher = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف السند؟')) return;
    const res = await fetch(`${API_BASE_URL}/api/v1/payment-vouchers/${id}`, {
      method: 'DELETE',
      headers: { 'X-API-Key': getAPIKey() },
    });
    const data = await res.json();
    if (data.success) fetchVouchers();
    else alert(data.error || 'فشل الحذف');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">سندات الصرف</h1>
          <p className="text-muted-foreground text-sm mt-1">إرسال سندات الصرف ومتابعة حالتها</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />إرسال سند</Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader><DialogTitle>إرسال سند صرف جديد</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>رقم الفاتورة (ID) *</Label>
                <Input value={form.invoice_id} onChange={e => setForm({...form, invoice_id: e.target.value})} placeholder="UUID الفاتورة" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label>جهة الدفع</Label>
                  <Select value={form.provider} onValueChange={v => setForm({...form, provider: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kuraimi">كريمي</SelectItem>
                      <SelectItem value="jawali">جوالي</SelectItem>
                      <SelectItem value="onecash">ون كاش</SelectItem>
                      <SelectItem value="cac">بنك CAC</SelectItem>
                      <SelectItem value="cash">نقدي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div><Label>المبلغ *</Label>
                  <Input type="number" value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} required />
                </div>

                <div><Label>اسم المرسل</Label>
                  <Input value={form.sender_name} onChange={e => setForm({...form, sender_name: e.target.value})} />
                </div>

                <div><Label>رقم هاتف المرسل</Label>
                  <Input value={form.sender_phone} onChange={e => setForm({...form, sender_phone: e.target.value})} />
                </div>
              </div>

              <div><Label>رقم التحويل / المرجع *</Label>
                <Input value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} required />
              </div>

              <div><Label>رابط صورة الإيصال</Label>
                <Input value={form.screenshot_url} onChange={e => setForm({...form, screenshot_url: e.target.value})} placeholder="https://..." />
              </div>

              <Button className="w-full" onClick={submitVoucher}>إرسال للمراجعة</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جار التحميل...</div>
      ) : vouchers.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">لا توجد سندات صرف مرسلة</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {vouchers.map(v => {
            const cfg = statusConfig[v.status] || statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <Card key={v.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-semibold">{v.reference}</div>
                        <div className="text-sm text-muted-foreground">{v.provider} · {v.sender_name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold">{v.amount?.toLocaleString()} {v.currency}</div>
                        <div className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString('ar-YE')}</div>
                      </div>
                      <Badge className={cfg.color}>{cfg.label}</Badge>
                      {v.admin_note && <div className="text-xs text-muted-foreground max-w-32">{v.admin_note}</div>}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => alert('تعديل سند: ' + v.id)}>
                        <Pencil className="h-4 w-4" /> تعديل
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteVoucher(v.id)}>
                        <Trash2 className="h-4 w-4" /> حذف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
