import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Invoice {
  id: string;
  number?: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  amount?: number;
  total?: number;
  currency?: string;
  status: string;
  created_at: string;
}

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    amount: 0,
  });

  const getToken = () => {
    return localStorage.getItem('yg_token') || localStorage.getItem('auth_token') || '';
  };

  const fetchInvoices = async () => {
    const token = getToken();
    if (!token) return;

    const res = await fetch(`${API_BASE_URL}/api/v1/invoices`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.success) {
      setInvoices(Array.isArray(data.data) ? data.data : []);
    }
  };

  const fetchCustomers = async () => {
    const token = getToken();
    if (!token) return;

    const res = await fetch(`${API_BASE_URL}/api/v1/customers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (data.success) {
      setCustomers(data.data || []);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = getToken();
    if (!token) return;

    if (!form.customer_name.trim()) {
      alert('يرجى إدخال اسم العميل');
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      alert('يرجى إدخال مبلغ صحيح');
      return;
    }

    const payload = {
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      customer_email: form.customer_email,
      currency: 'YER',
      tax: 0,
      discount: 0,
      notes: '',
      items: [
        {
          description: 'خدمة / منتج',
          quantity: 1,
          unit_price: Number(form.amount),
        },
      ],
    };

    const res = await fetch(`${API_BASE_URL}/api/v1/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.success) {
      const createdInvoice = data.data?.invoice || data.data;

      setInvoices((prev) => [createdInvoice, ...prev]);
      setForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        amount: 0,
      });
      setSelectedCustomer('');

      await fetchInvoices();
    } else {
      alert(data.error || 'فشل إنشاء الفاتورة');
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl font-bold mb-1">إنشاء فاتورة جديدة</h1>
        <p className="text-sm text-muted-foreground">
          اختر عميلًا محفوظًا أو أدخل بيانات العميل يدويًا.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 bg-white p-4 rounded shadow-sm border"
      >
        <div>
          <Label>اختر عميل</Label>
          <Select
            value={selectedCustomer}
            onValueChange={(value) => {
              setSelectedCustomer(value);

              const customer = customers.find((c) => c.id === value);

              if (customer) {
                setForm((prev) => ({
                  ...prev,
                  customer_name: customer.name || '',
                  customer_phone: customer.phone || '',
                  customer_email: customer.email || '',
                }));
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر عميل محفوظ" />
            </SelectTrigger>

            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>اسم العميل</Label>
          <Input
            value={form.customer_name}
            onChange={(e) =>
              setForm({ ...form, customer_name: e.target.value })
            }
            required
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
              setForm({
                ...form,
                amount: Number(e.target.value),
              })
            }
            required
          />
        </div>

        <Button type="submit">إنشاء الفاتورة</Button>
      </form>

      <hr className="my-6 border-t" />

      <h2 className="text-lg font-semibold mb-2">الفواتير الحالية</h2>

      <div className="space-y-2">
        {invoices.length === 0 ? (
          <div className="rounded border bg-white p-6 text-center text-muted-foreground">
            لا توجد فواتير حتى الآن
          </div>
        ) : (
          invoices.map((inv) => (
            <div
              key={inv.id}
              className="border rounded p-3 flex justify-between items-center bg-white shadow-sm"
            >
              <div className="space-y-1">
                <p>رقم الفاتورة: {inv.number || inv.id}</p>
                <p>العميل: {inv.customer_name}</p>
                <p>الهاتف: {inv.customer_phone || '-'}</p>
                <p>البريد: {inv.customer_email || '-'}</p>
                <p>
                  المبلغ:{' '}
                  {Number(inv.total || inv.amount || 0).toLocaleString()}{' '}
                  {inv.currency || 'YER'}
                </p>
                <p>الحالة: {inv.status}</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => alert('نافذة تعديل الفاتورة')}>
                  تعديل
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
