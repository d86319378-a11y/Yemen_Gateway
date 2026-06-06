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
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('yg_api_key') || '');
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    amount: 0,
  });

  const getJwtToken = () =>
    localStorage.getItem('yg_token') || localStorage.getItem('auth_token') || '';

  const getApiKey = () =>
    localStorage.getItem('yg_api_key') || apiKey || '';

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      alert('أدخل API Key أولاً');
      return;
    }

    localStorage.setItem('yg_api_key', apiKey.trim());
    alert('تم حفظ API Key');
    fetchInvoices();
  };

  const fetchCustomers = async () => {
    const token = getJwtToken();
    if (!token) return;

    const res = await fetch(`${API_BASE_URL}/api/v1/customers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (data.success) setCustomers(data.data || []);
  };

  const fetchInvoices = async () => {
    const key = getApiKey();
    if (!key) return;

    const res = await fetch(`${API_BASE_URL}/api/v1/invoices`, {
      headers: {
        'X-API-Key': key,
      },
    });

    const data = await res.json();
    if (data.success) setInvoices(data.data || []);
  };

  useEffect(() => {
    fetchCustomers();
    fetchInvoices();
  }, []);

  const handleCreateCustomer = async () => {
    const token = getJwtToken();

    if (!token) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    const name = prompt('أدخل اسم العميل الجديد');
    if (!name) return;

    const res = await fetch(`${API_BASE_URL}/api/v1/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (data.success) {
      const newCustomer = data.data as Customer;

      setCustomers((prev) => [newCustomer, ...prev]);
      setSelectedCustomer(newCustomer.id);

      setForm((prev) => ({
        ...prev,
        customer_name: newCustomer.name,
        customer_phone: newCustomer.phone || '',
        customer_email: newCustomer.email || '',
      }));
    } else {
      alert(data.error || 'فشل إنشاء العميل');
    }
  };

  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    const key = getApiKey();

    if (!key) {
      alert('API Key مطلوب لإنشاء الفاتورة');
      return;
    }

    if (!form.customer_name.trim()) {
      alert('أدخل اسم العميل');
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      alert('أدخل مبلغ صحيح');
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
        'X-API-Key': key,
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
          العملاء يستخدمون تسجيل الدخول، والفواتير تستخدم API Key.
        </p>
      </div>

      <div className="bg-white border rounded p-4 space-y-3">
        <Label>API Key</Label>
        <div className="flex gap-2">
          <Input
            dir="ltr"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="yg_xxxxxxxxxxxxxxxxx"
          />
          <Button type="button" onClick={saveApiKey}>
            حفظ المفتاح
          </Button>
        </div>
      </div>

      <div className="space-y-3 bg-white p-4 rounded shadow-sm border">
        <Label>اختر عميل محفوظ أو أضف جديد</Label>

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

        <Button type="button" onClick={handleCreateCustomer}>
          إنشاء عميل جديد
        </Button>
      </div>

      <form
        onSubmit={handleSubmitInvoice}
        className="space-y-3 bg-white p-4 rounded shadow-sm border"
      >
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
              setForm({ ...form, amount: Number(e.target.value) })
            }
            required
          />
        </div>

        <Button type="submit">إنشاء الفاتورة</Button>
      </form>

      <h2 className="text-lg font-semibold">الفواتير الحالية</h2>

      <div className="space-y-2">
        {invoices.length === 0 ? (
          <div className="rounded border bg-white p-6 text-center text-muted-foreground">
            لا توجد فواتير حتى الآن
          </div>
        ) : (
          invoices.map((inv) => (
            <div
              key={inv.id}
              className="border rounded p-3 bg-white shadow-sm"
            >
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
          ))
        )}
      </div>
    </div>
  );
}
