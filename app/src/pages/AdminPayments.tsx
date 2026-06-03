import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

function getAuthHeader() {
  return { 'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}` };
}

interface PaymentProof {
  id: string; invoice_id: string; provider: string; sender_name: string;
  sender_phone: string; amount: number; currency: string; reference: string;
  screenshot_url: string; status: string; admin_note: string; created_at: string;
}

export default function AdminPaymentsPage() {
  const [proofs, setProofs] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PaymentProof | null>(null);
  const [note, setNote] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => { fetchProofs(); }, [filterStatus]);

  const fetchProofs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/payment-submissions?status=${filterStatus}&limit=50`, {
        headers: getAuthHeader(),
      });
      const data = await res.json();
      if (data.success) setProofs(data.data || []);
    } finally { setLoading(false); }
  };

  const review = async (id: string, status: 'approved' | 'rejected') => {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/payment-submissions/${id}/review`, {
      method: 'PUT',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
    const data = await res.json();
    if (data.success) { setSelected(null); setNote(''); fetchProofs(); }
    else alert(data.error);
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-800' },
    approved: { label: 'مقبول', color: 'bg-green-100 text-green-800' },
    rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-800' },
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">مراجعة المدفوعات</h1>
        <p className="text-muted-foreground text-sm mt-1">اعتماد أو رفض إثباتات الدفع</p>
      </div>

      <div className="flex gap-2">
        {['pending', 'approved', 'rejected'].map(s => (
          <Button key={s} variant={filterStatus === s ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus(s)}>
            {statusConfig[s].label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جار التحميل...</div>
      ) : proofs.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">لا توجد مدفوعات {statusConfig[filterStatus].label}</p></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {proofs.map(p => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{p.reference}</span>
                      <Badge className={statusConfig[p.status]?.color || ''}>{statusConfig[p.status]?.label}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {p.provider} · {p.sender_name} · {p.sender_phone}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      فاتورة: {p.invoice_id?.slice(0, 8)}... · {new Date(p.created_at).toLocaleString('ar-YE')}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-lg">{p.amount?.toLocaleString()} {p.currency}</div>
                    </div>
                    {p.status === 'pending' && (
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => { setSelected(p); setNote(''); }}>
                        <Eye className="h-3.5 w-3.5" />مراجعة
                      </Button>
                    )}
                  </div>
                </div>
                {p.admin_note && <div className="mt-2 text-sm bg-muted/50 rounded p-2">ملاحظة: {p.admin_note}</div>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>مراجعة إثبات الدفع</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">الجهة:</span> <strong>{selected.provider}</strong></div>
                <div><span className="text-muted-foreground">المرسل:</span> <strong>{selected.sender_name}</strong></div>
                <div><span className="text-muted-foreground">المرجع:</span> <strong>{selected.reference}</strong></div>
                <div><span className="text-muted-foreground">المبلغ:</span> <strong>{selected.amount?.toLocaleString()} {selected.currency}</strong></div>
              </div>
              {selected.screenshot_url && (
                <a href={selected.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm underline">عرض صورة الإيصال</a>
              )}
              <div>
                <label className="text-sm font-medium">ملاحظات الاعتماد/الرفض</label>
                <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="أضف ملاحظة..." className="mt-1" />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700" onClick={() => review(selected.id, 'approved')}>
                  <CheckCircle className="h-4 w-4" />اعتماد الدفع
                </Button>
                <Button variant="destructive" className="flex-1 gap-2" onClick={() => review(selected.id, 'rejected')}>
                  <XCircle className="h-4 w-4" />رفض الدفع
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
