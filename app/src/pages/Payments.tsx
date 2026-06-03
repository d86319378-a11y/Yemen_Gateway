import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Wallet, CheckCircle, Clock, XCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

function getToken() {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
}

interface PaymentProof {
  id: string; invoice_id: string; provider: string;
  sender_name: string; sender_phone: string; amount: number;
  currency: string; reference: string; screenshot_url: string;
  status: string; admin_note: string; created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  approved: { label: 'مقبول', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function PaymentsPage() {
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    invoice_id: '', provider: 'kuraimi', sender_name: '', sender_phone: '',
    amount: 0, currency: 'YER', reference: '', screenshot_url: '',
  });

  useEffect(() => { fetchProofs(); }, []);

  const fetchProofs = async () => {
    try {
      // For regular users - show their own submissions by listing with user auth
      const res = await fetch(`${API_BASE_URL}/api/v1/manual-payments?limit=50`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}` },
      });
      const data = await res.json();
      if (data.success) setProofs(data.data || []);
    } finally { setLoading(false); }
  };

  const submitPayment = async () => {
    const res = await fetch(`${API_BASE_URL}/api/v1/payment-submissions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': getToken() },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) { setOpen(false); fetchProofs(); }
    else alert(data.error || 'فشل إرسال إثبات الدفع');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">بوابة الدفع</h1>
          <p className="text-muted-foreground text-sm mt-1">إرسال إثباتات الدفع ومتابعة حالتها</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />إرسال دفع</Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader><DialogTitle>إثبات دفع فاتورة</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>رقم الفاتورة (ID) *</Label><Input value={form.invoice_id} onChange={e => setForm({...form, invoice_id: e.target.value})} placeholder="UUID الفاتورة" /></div>
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
                <div><Label>المبلغ *</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} /></div>
                <div><Label>اسم المرسل</Label><Input value={form.sender_name} onChange={e => setForm({...form, sender_name: e.target.value})} /></div>
                <div><Label>رقم هاتف المرسل</Label><Input value={form.sender_phone} onChange={e => setForm({...form, sender_phone: e.target.value})} /></div>
              </div>
              <div><Label>رقم التحويل / المرجع *</Label><Input value={form.reference} onChange={e => setForm({...form, reference: e.target.value})} /></div>
              <div><Label>رابط صورة الإيصال</Label><Input value={form.screenshot_url} onChange={e => setForm({...form, screenshot_url: e.target.value})} placeholder="https://..." /></div>
              <Button className="w-full" onClick={submitPayment}>إرسال للمراجعة</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4 text-sm text-blue-800" dir="rtl">
          <strong>كيف يعمل الدفع اليدوي:</strong> قم بإرسال المبلغ عبر أي محفظة إلكترونية، ثم أرسل إثبات الدفع هنا. سيتم مراجعته وتأكيد الفاتورة خلال دقائق.
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جار التحميل...</div>
      ) : proofs.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">لا توجد مدفوعات مرسلة</p></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {proofs.map(p => {
            const cfg = statusConfig[p.status] || statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-semibold">{p.reference}</div>
                        <div className="text-sm text-muted-foreground">{p.provider} · {p.sender_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold">{p.amount?.toLocaleString()} {p.currency}</div>
                        <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString('ar-YE')}</div>
                      </div>
                      <Badge className={cfg.color}>{cfg.label}</Badge>
                      {p.admin_note && <div className="text-xs text-muted-foreground max-w-32">{p.admin_note}</div>}
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
