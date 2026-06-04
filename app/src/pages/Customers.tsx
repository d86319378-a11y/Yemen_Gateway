import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

type Customer = {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

function getToken() {
  return localStorage.getItem('yg_token') || '';
}

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredCustomers = customers.filter((customer) => {
    const q = search.toLowerCase();
    return (
      customer.name.toLowerCase().includes(q) ||
      (customer.phone || '').toLowerCase().includes(q) ||
      (customer.email || '').toLowerCase().includes(q) ||
      (customer.address || '').toLowerCase().includes(q)
    );
  });

  const loadCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/customers`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const result: ApiResponse<Customer[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'فشل تحميل العملاء');
      }

      setCustomers(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تحميل العملاء');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openCreateDialog = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || '',
    });
    setOpen(true);
  };

  const saveCustomer = async () => {
    if (!form.name.trim()) {
      alert('يرجى إدخال اسم العميل');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const isEdit = Boolean(editingCustomer);
      const url = isEdit
        ? `${API_BASE_URL}/api/v1/customers/${editingCustomer?.id}`
        : `${API_BASE_URL}/api/v1/customers`;

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          notes: form.notes.trim(),
        }),
      });

      const result: ApiResponse<Customer> = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || 'فشل حفظ العميل');
      }

      setOpen(false);
      setForm(emptyForm);
      setEditingCustomer(null);
      await loadCustomers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل حفظ العميل');
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomer = async (customer: Customer) => {
    const ok = window.confirm(`هل تريد حذف العميل "${customer.name}"؟`);
    if (!ok) return;

    setDeletingId(customer.id);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/customers/${customer.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const result: ApiResponse<null> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'فشل حذف العميل');
      }

      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'فشل حذف العميل');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">العملاء</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة بيانات العملاء وربطهم بالفواتير والسندات
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2 bg-red-700 hover:bg-red-800 text-white">
              <Plus className="h-4 w-4" />
              عميل جديد
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>اسم العميل *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: متجر تهامة"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="777123456"
                  />
                </div>

                <div>
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="info@example.com"
                  />
                </div>
              </div>

              <div>
                <Label>العنوان</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="الحديدة / صنعاء / تعز..."
                />
              </div>

              <div>
                <Label>ملاحظات</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="أي ملاحظات خاصة بالعميل"
                />
              </div>

              <Button
                onClick={saveCustomer}
                disabled={saving}
                className="w-full bg-red-700 hover:bg-red-800 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جار الحفظ...
                  </>
                ) : editingCustomer ? (
                  'حفظ التعديل'
                ) : (
                  'إضافة العميل'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">إجمالي العملاء</div>
            <div className="mt-1 text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">لديهم رقم هاتف</div>
            <div className="mt-1 text-2xl font-bold text-green-600">
              {customers.filter((c) => c.phone).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">لديهم بريد إلكتروني</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">
              {customers.filter((c) => c.email).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center gap-2 p-4 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pr-9"
              placeholder="ابحث باسم العميل أو الهاتف أو البريد أو العنوان..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          جار تحميل العملاء...
        </div>
      ) : filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="font-medium text-slate-800">لا توجد عملاء</p>
            <p className="mt-1 text-sm text-muted-foreground">
              أضف أول عميل لبدء تنظيم الفواتير والسندات.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="border-slate-200 hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-700">
                      <Users className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="font-bold text-slate-900">{customer.name}</div>

                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {customer.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {customer.phone}
                          </span>
                        )}

                        {customer.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {customer.email}
                          </span>
                        )}

                        {customer.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {customer.address}
                          </span>
                        )}
                      </div>

                      {customer.notes && (
                        <p className="mt-2 text-xs text-slate-500">{customer.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(customer)}>
                      <Edit className="ml-1 h-4 w-4" />
                      تعديل
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCustomer(customer)}
                      disabled={deletingId === customer.id}
                      className="text-red-700 hover:text-red-800"
                    >
                      {deletingId === customer.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="ml-1 h-4 w-4" />
                          حذف
                        </>
                      )}
                    </Button>
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
