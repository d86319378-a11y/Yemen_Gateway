import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FileText, Download, QrCode, Trash2, Eye } from 'lucide-react';
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
  total: number;
  status: string;
  notes: string;
  created_at: string;
  items: InvoiceItem[];
}

function getToken() {
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || '';
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, unit_price: 0 }]);
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', customer_email: '',
    currency: 'YER', tax: 0, discount: 0, notes: '',
  });

  useEffect(() => { fetchInvoices(); }, [filterStatus]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/api/v1/invoices${filterStatus ? `?status=${filterStatus}` : ''}`;
      const res = await fetch(url, { headers: { 'X-API-Key': getToken() } });
      const data = await res.json();
      if (data.success) setInvoices(data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const createInvoice = async () => {
    const payload = { ...form, items };
    const res = await fetch(`${API_BASE_URL}/api/v1/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': getToken() },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) { setOpen(false); fetchInvoices(); }
    else alert(data.error || 'فشل إنشاء الفاتورة');
  };

  const addItem = () => setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
  const updateItem = (i: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    (newItems[i] as unknown as Record<string, string | number>)[field] = value;
    setItems(newItems);
  };
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
  const total = subtotal + Number(form.tax) - Number(form.discount);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الفواتير</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة فواتير العملاء</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />فاتورة جديدة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>اسم العميل *</Label><Input value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} placeholder="محمد أحمد" /></div>
                <div><Label>رقم الهاتف</Label><Input value={form.customer_phone} onChange={e => setForm({...form, customer_phone: e.target.value})} placeholder="777123456" /></div>
                <div><Label>البريد الإلكتروني</Label><Input value={form.customer_email} onChange={e => setForm({...form, customer_email: e.target.value})} type="email" /></div>
                <div><Label>العملة</Label>
                  <Select value={form.currency} onValueChange={v => setForm({...form, currency: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YER">ريال يمني (YER)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>البنود</Label>
                  <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 ml-1" />إضافة بند</Button>
                </div>
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 mb-2">
                    <div className="col-span-5"><Input placeholder="وصف الخدمة" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} /></div>
                    <div className="col-span-2"><Input type="number" placeholder="الكمية" value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} /></div>
                    <div className="col-span-3"><Input type="number" placeholder="السعر" value={item.unit_price} onChange={e => updateItem(i, 'unit_price', Number(e.target.value))} /></div>
                    <div className="col-span-2 flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">{(item.quantity * item.unit_price).toLocaleString()}</span>
                      {items.length > 1 && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(i)}><Trash2 className="h-3 w-3 text-destructive" /></Button>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>الضريبة</Label><Input type="number" value={form.tax} onChange={e => setForm({...form, tax: Number(e.target.value)})} /></div>
                <div><Label>الخصم</Label><Input type="number" value={form.discount} onChange={e => setForm({...form, discount: Number(e.target.value)})} /></div>
              </div>
              <div><Label>ملاحظات</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
              <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
                <div className="flex justify-between"><span>المجموع الجزئي:</span><span>{subtotal.toLocaleString()} {form.currency}</span></div>
                <div className="flex justify-between"><span>الضريبة:</span><span>{Number(form.tax).toLocaleString()} {form.currency}</span></div>
                <div className="flex justify-between font-bold border-t pt-1 mt-1"><span>الإجمالي:</span><span>{total.toLocaleString()} {form.currency}</span></div>
              </div>
              <Button className="w-full" onClick={createInvoice}>إنشاء الفاتورة</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <Select value={filterStatus || '_all'} onValueChange={v => setFilterStatus(v === '_all' ? '' : v)}>
          <SelectTrigger className="w-48"><SelectValue placeholder="كل الحالات" /></SelectTrigger>
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
        <Card><CardContent className="py-12 text-center"><FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">لا توجد فواتير</p></CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {invoices.map(inv => (
            <Card key={inv.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
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
                      <div className="font-bold text-lg">{inv.total?.toLocaleString()} {inv.currency}</div>
                      <div className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString('ar-YE')}</div>
                    </div>
                    <Badge className={statusColors[inv.status] || 'bg-gray-100 text-gray-800'}>
                      {statusLabels[inv.status] || inv.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" title="عرض PDF"><Download className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" title="QR Code"><QrCode className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" title="عرض"><Eye className="h-4 w-4" /></Button>
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
