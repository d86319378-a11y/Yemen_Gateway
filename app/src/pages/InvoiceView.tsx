import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { API_BASE_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Invoice {
  id: string;
  number: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  currency: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  notes?: string;
  items: InvoiceItem[];
  created_at: string;
}

export default function InvoiceView() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    amount: 0,
    notes: '',
  });

  const getApiKey = () => localStorage.getItem('yg_api_key') || '';

  const fetchInvoice = async () => {
    const key = getApiKey();

    if (!key || !id) {
      setLoading(false);
      return;
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/invoices/${id}`, {
      headers: {
        'X-API-Key': key,
      },
    });

    const data = await res.json();

    if (data.success) {
      const inv = data.data?.invoice || data.data;
      setInvoice(inv);

      setForm({
        customer_name: inv.customer_name || '',
        customer_phone: inv.customer_phone || '',
        customer_email: inv.customer_email || '',
        amount: Number(inv.total || 0),
        notes: inv.notes || '',
      });
    } else {
      alert(data.error || 'فشل تحميل الفاتورة');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleUpdate = async () => {
    const key = getApiKey();

    if (!key || !id) {
      alert('API Key غير موجود');
      return;
    }

    if (!form.customer_name.trim()) {
      alert('اسم العميل مطلوب');
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      alert('المبلغ غير صحيح');
      return;
    }

    setSaving(true);

    const payload = {
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      customer_email: form.customer_email,
      currency: invoice?.currency || 'YER',
      tax: 0,
      discount: 0,
      notes: form.notes,
      items: [
        {
          description: 'خدمة / منتج',
          quantity: 1,
          unit_price: Number(form.amount),
        },
      ],
    };

    const res = await fetch(`${API_BASE_URL}/api/v1/invoices/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': key,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    setSaving(false);

    if (data.success) {
      alert('تم تحديث الفاتورة بنجاح');
      await fetchInvoice();
    } else {
      alert(data.error || 'فشل تحديث الفاتورة');
    }
  };

  const handleDelete = async () => {
    const key = getApiKey();

    if (!key || !id) {
      alert('API Key غير موجود');
      return;
    }

    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;

    const res = await fetch(`${API_BASE_URL}/api/v1/invoices/${id}`, {
      method: 'DELETE',
      headers: {
        'X-API-Key': key,
      },
    });

    const data = await res.json();

    if (data.success) {
      alert('تم حذف الفاتورة');
      window.location.href = '/invoices';
    } else {
      alert(data.error || 'فشل حذف الفاتورة');
    }
  };

  const handleDownloadPdf = () => {
    const key = getApiKey();

    if (!key || !id) {
      alert('API Key غير موجود');
      return;
    }

    window.open(
      `${API_BASE_URL}/api/v1/invoices/${id}/pdf?api_key=${encodeURIComponent(key)}`,
      '_blank'
    );
  };

  if (loading) {
    return <div className="p-6 text-muted-foreground">جار تحميل الفاتورة...</div>;
  }

  if (!invoice) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">لم يتم العثور على الفاتورة.</p>
        <Link to="/invoices">
          <Button>العودة للفواتير</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">تفاصيل الفاتورة</h1>
          <p className="text-sm text-muted-foreground">
            {invoice.number} · {invoice.status}
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/invoices">
            <Button variant="outline">رجوع</Button>
          </Link>

          <Button variant="outline" onClick={handleDownloadPdf}>
            تحميل PDF
          </Button>

          <Button variant="destructive" onClick={handleDelete}>
            حذف
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white border rounded p-4 space-y-4">
          <h2 className="font-semibold">تعديل بيانات الفاتورة</h2>

          <div>
            <Label>اسم العميل</Label>
            <Input
              value={form.customer_name}
              onChange={(e) =>
                setForm({ ...form, customer_name: e.target.value })
              }
            />
          </div>

          <div>
            <Label>الهاتف</Label>
            <Input
              value={form.customer_phone}
              onChange={(e) =>
                setForm({ ...form, customer_phone: e.target.value })
              }
            />
          </div>

          <div>
            <Label>البريد الإلكتروني</Label>
            <Input
              value={form.customer_email}
              onChange={(e) =>
                setForm({ ...form, customer_email: e.target.value })
              }
            />
          </div>

          <div>
            <Label>المبلغ</Label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <Label>ملاحظات</Label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <Button onClick={handleUpdate} disabled={saving}>
            {saving ? 'جار الحفظ...' : 'حفظ التعديل'}
          </Button>
        </div>

        <div className="bg-white border rounded p-4 space-y-3">
          <h2 className="font-semibold">معاينة الفاتورة</h2>

          <div className="space-y-1 text-sm">
            <p>رقم الفاتورة: {invoice.number}</p>
            <p>العميل: {invoice.customer_name}</p>
            <p>الهاتف: {invoice.customer_phone || '-'}</p>
            <p>البريد: {invoice.customer_email || '-'}</p>
            <p>التاريخ: {new Date(invoice.created_at).toLocaleString('ar-YE')}</p>
            <p>الحالة: {invoice.status}</p>
          </div>

          <hr />

          <div className="space-y-2">
            <h3 className="font-medium">البنود</h3>

            {invoice.items?.length ? (
              invoice.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between rounded border p-2 text-sm"
                >
                  <span>{item.description}</span>
                  <span>
                    {item.quantity} × {item.unit_price.toLocaleString()} ={' '}
                    {item.total.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">لا توجد بنود</p>
            )}
          </div>

          <hr />

          <div className="space-y-1 text-sm">
            <p>الإجمالي قبل الخصم: {invoice.subtotal?.toLocaleString()} {invoice.currency}</p>
            <p>الضريبة: {invoice.tax?.toLocaleString()} {invoice.currency}</p>
            <p>الخصم: {invoice.discount?.toLocaleString()} {invoice.currency}</p>
            <p className="text-lg font-bold">
              الإجمالي: {invoice.total?.toLocaleString()} {invoice.currency}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
