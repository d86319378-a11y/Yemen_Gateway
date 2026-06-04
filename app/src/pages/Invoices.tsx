import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FileText, Download, QrCode, Trash2, Eye, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

const statusColors: Record<string, string> = {
  unpaid: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  pending: 'bg-blue-100 text-blue-800',
  draft: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  unpaid: 'غير مدفوعة',
  paid: 'مدفوعة',
  cancelled: 'ملغاة',
  pending: 'قيد الانتظار',
  draft: 'مسودة',
};

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total?: number;
}

interface Invoice {
  id: string;
  number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  currency: string;
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  status: string;
  notes: string;
  created_at: string;
  items: InvoiceItem[];
}

function getApiKey() {
  return localStorage.getItem('yg_api_key') || '';
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    description: '',
    amount: 0,
    currency: 'YER',
    notes: '',
  });

  useEffect(() => {
    fetchInvoices();
  }, [filterStatus]);

  const resetForm = () => {
    setForm({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      description: '',
      amount: 0,
      currency: 'YER',
      notes: '',
    });
  };

  const fetchInvoices = async () => {
    const apiKey = getApiKey();

    if (!apiKey) {
      setLoading(false);
      setError('يرجى إنشاء API Key أولًا من صفحة API Keys قبل استخدام الفواتير.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${API_BASE_URL}/api/v1/invoices${filterStatus ? `?status=${filterStatus}` : ''}`;

      const res = await fetch(url, {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل تحميل الفواتير');
      }

      setInvoices(data.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل تحميل الفواتير');
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async () => {
    const apiKey = getApiKey();

    if (!apiKey) {
      alert('يرجى إنشاء API Key أولًا من صفحة API Keys');
      return;
    }

    if (!form.customer_name.trim()) {
      alert('يرجى إدخال اسم العميل');
      return;
    }

    if (!form.description.trim()) {
      alert('يرجى إدخال وصف الخدمة أو المنتج');
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }

    const payload = {
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.trim(),
      customer_email: form.customer_email.trim(),
      currency: form.currency,
      tax: 0,
      discount: 0,
      notes: form.notes.trim(),
      items: [
        {
          description: form.description.trim(),
          quantity: 1,
          unit_price: Number(form.amount),
        },
      ],
    };

    try {
      setCreating(true);

      const res = await fetch(`${API_BASE_URL}/api/v1/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل إنشاء الفاتورة');
      }

      setOpen(false);
      resetForm();
      await fetchInvoices();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'فشل إنشاء الفاتورة');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الفواتير</h1>
          <p className="text-muted-foreground text-sm mt-1">إنشاء وإدارة فواتير العملاء بسهولة</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              فاتورة جديدة
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>اسم العميل *</Label>
                  <Input
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    placeholder="مثال: محمد أحمد"
                  />
                </div>

                <div>
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={form.customer_phone}
                    onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                    placeholder="مثال: 777123456"
                  />
                </div>
              </div>

              <div>
                <Label>البريد الإلكتروني</Label>
                <Input
                  value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                  type="email"
                  placeholder="اختياري"
                />
              </div>

              <div>
                <Label>وصف الخدمة أو المنتج *</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="مثال: اشتراك شهري / تصميم موقع / بيع منتج"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>المبلغ *</Label>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label>العملة</Label>
                  <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YER">ريال يمني (YER)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>ملاحظات</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="أي ملاحظات إضافية"
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>الإجمالي:</span>
                  <span className="font-bold">
                    {Number(form.amount || 0).toLocaleString()} {form.currency}
                  </span>
                </div>
              </div>

              <Button className="w-full" onClick={createInvoice} disabled={creating}>
                {creating ? 'جار إنشاء الفاتورة...' : 'إنشاء الفاتورة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Select value={filterStatus || '_all'} onValueChange={(v) => setFilterStatus(v === '_all' ? '' : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="كل الحالات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">كل الحالات</SelectItem>
            <SelectItem value="unpaid">غير مدفوعة</SelectItem>
            <SelectItem value="paid">مدفوعة</SelectItem>
            <SelectItem value="pending">قيد الانتظار</SelectItem>
            <SelectItem value="cancelled">ملغاة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">جار التحميل...</div>
      ) : invoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد فواتير</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invoices.map((inv) => (
            <Card key={inv.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yemen-50 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-yemen-600" />
                    </div>

                    <div>
                      <div className="font-semibold">{inv.number}</div>
                      <div className="text-sm text-muted-foreground">{inv.customer_name}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {Number(inv.total || 0).toLocaleString()} {inv.currency}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(inv.created_at).toLocaleDateString('ar-YE')}
                      </div>
                    </div>

                    <Badge className={statusColors[inv.status] || 'bg-gray-100 text-gray-800'}>
                      {statusLabels[inv.status] || inv.status}
                    </Badge>

                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" title="عرض PDF">
                        <Download className="h-4 w-4" />
                      </Button>

                      <Button variant="ghost" size="icon" title="QR Code">
                        <QrCode className="h-4 w-4" />
                      </Button>

                      <Button variant="ghost" size="icon" title="عرض">
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button variant="ghost" size="icon" title="حذف">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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
