import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Invoice {
  id: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  amount: number;
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

  // الحصول على API Key تلقائيًا
  const getApiKey = () => localStorage.getItem('yg_api_key') || '';

  const fetchInvoices = async () => {
    const token = getApiKey();
    if (!token) return;

    const res = await fetch(`${API_BASE_URL}/api/v1/invoices`, {
      headers: { Authorization: `Bearer ${token}`, 'X-API-Key': token },
    });

    const data = await res.json();
    if (data.success) setInvoices(data.data);
  };

  const fetchCustomers = async () => {
    const token = getApiKey();
    if (!token) return;

    const res = await fetch(`${API_BASE_URL}/api/v1/customers`, {
      headers: { Authorization: `Bearer ${token}`, 'X-API-Key': token },
    });

    const data = await res.json();
    if (data.success) setCustomers(data.data || []);
  };

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getApiKey();
    if (!token) return;

    // التأكد من إضافة عنصر Items لحل مشكلة Validation
    const payload = { ...form, items: [{ name: form.customer_name, amount: form.amount, quantity: 1 }] };

    const res = await fetch(`${API_BASE_URL}/api/v1/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-API-Key': token,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.success) {
      setInvoices([...invoices, data.data]);
      setForm({ customer_name: '', customer_phone: '', customer_email: '', amount: 0 });
      setSelectedCustomer('');
    } else {
      alert(data.error || 'فشل إنشاء الفاتورة');
    }
  };

  const handleDelete = async (id: string) => {
    const token = getApiKey();
    if (!token) return;

    const res = await fetch(`${API_BASE_URL}/api/v1/invoices/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'X-API-Key': token },
    });

    const data = await res.json();
    if (data.success) {
      setInvoices(invoices.filter((inv) => inv.id !== id));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">إنشاء فاتورة جديدة</h1>
      <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded shadow-sm">
        <div>
          <Label>اختر عميل</Label>
          <Select
            value={selectedCustomer}
            onValueChange={(value) => {
              setSelectedCustomer(value);
              const customer = customers.find((c) => c.id === value);
              if (customer) {
                setForm({
                  ...form,
                  customer_name: customer.name || '',
                  customer_phone: customer.phone || '',
                  customer_email: customer.email || '',
                });
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
            onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label>الهاتف</Label>
          <Input
            value={form.customer_phone}
            onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
          />
        </div>

        <div>
          <Label>البريد الإلكتروني</Label>
          <Input
            value={form.customer_email}
            onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
          />
        </div>

        <div>
          <Label>المبلغ</Label>
          <Input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
            required
          />
        </div>

        <Button type="submit">إنشاء الفاتورة</Button>
      </form>

      <hr className="my-6 border-t" />

      <h2 className="text-lg font-semibold mb-2">الفواتير الحالية</h2>
      <div className="space-y-2">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="border rounded p-3 flex justify-between items-center bg-white shadow-sm"
          >
            <div>
              <p>العميل: {inv.customer_name}</p>
              <p>الهاتف: {inv.customer_phone}</p>
              <p>البريد: {inv.customer_email}</p>
              <p>المبلغ: {inv.amount}</p>
              <p>الحالة: {inv.status}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => alert('نافذة تعديل الفاتورة')}>تعديل</Button>
              <Button variant="destructive" onClick={() => handleDelete(inv.id)}>حذف</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
