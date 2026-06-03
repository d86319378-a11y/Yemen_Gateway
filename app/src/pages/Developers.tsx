import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy, Code2, Webhook, Plus, BookOpen, Download } from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';


interface WebhookConfig {
  id: string; url: string; events: string; active: boolean; created_at: string;
}

const curlExamples = [
  {
    title: 'إنشاء فاتورة',
    code: `curl -X POST ${API_BASE_URL || 'https://api.yemengateway.dev'}/api/v1/invoices \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_name": "محمد أحمد",
    "customer_phone": "777123456",
    "currency": "YER",
    "items": [
      {"description": "خدمة تطوير", "quantity": 1, "unit_price": 50000}
    ]
  }'`,
  },
  {
    title: 'قائمة الفواتير',
    code: `curl -X GET "${API_BASE_URL || 'https://api.yemengateway.dev'}/api/v1/invoices?status=unpaid" \\
  -H "X-API-Key: YOUR_API_KEY"`,
  },
  {
    title: 'سند قبض',
    code: `curl -X POST ${API_BASE_URL || 'https://api.yemengateway.dev'}/api/v1/receipts \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "receipt",
    "party_name": "عميل",
    "amount": 50000,
    "method": "cash"
  }'`,
  },
];

const apiEndpoints = [
  { method: 'POST', path: '/api/v1/invoices', desc: 'إنشاء فاتورة جديدة', auth: 'API Key' },
  { method: 'GET', path: '/api/v1/invoices', desc: 'قائمة الفواتير', auth: 'API Key' },
  { method: 'GET', path: '/api/v1/invoices/:id', desc: 'تفاصيل فاتورة', auth: 'API Key' },
  { method: 'PUT', path: '/api/v1/invoices/:id/status', desc: 'تحديث حالة الفاتورة', auth: 'API Key' },
  { method: 'POST', path: '/api/v1/receipts', desc: 'إنشاء سند قبض', auth: 'API Key' },
  { method: 'POST', path: '/api/v1/payment-vouchers', desc: 'إنشاء سند صرف', auth: 'API Key' },
  { method: 'POST', path: '/api/v1/payment-submissions', desc: 'إرسال إثبات دفع', auth: 'API Key' },
  { method: 'GET', path: '/api/v1/invoicing/stats', desc: 'إحصائيات الفوترة', auth: 'JWT' },
  { method: 'POST', path: '/api/v1/webhooks', desc: 'إضافة Webhook', auth: 'JWT' },
  { method: 'GET', path: '/api/v1/webhooks', desc: 'قائمة Webhooks', auth: 'JWT' },
  { method: 'GET', path: '/api/v1/currency/rates', desc: 'أسعار الصرف', auth: 'API Key' },
  { method: 'POST', path: '/api/v1/phone/verify', desc: 'التحقق من رقم الهاتف', auth: 'API Key' },
];

const methodColors: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-800',
  POST: 'bg-green-100 text-green-800',
  PUT: 'bg-yellow-100 text-yellow-800',
  DELETE: 'bg-red-100 text-red-800',
};

export default function DevelopersPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [open, setOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['invoice.created', 'invoice.paid']);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { fetchWebhooks(); }, []);

  const fetchWebhooks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/webhooks`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}` },
      });
      const data = await res.json();
      if (data.success) setWebhooks(data.data || []);
    } catch (e) { console.error(e); }
  };

  const createWebhook = async () => {
    const res = await fetch(`${API_BASE_URL}/api/v1/webhooks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}` },
      body: JSON.stringify({ url: webhookUrl, events: selectedEvents }),
    });
    const data = await res.json();
    if (data.success) { setOpen(false); fetchWebhooks(); alert('تم إنشاء الـ Webhook. السر: ' + data.data.secret); }
    else alert(data.error);
  };

  const deleteWebhook = async (id: string) => {
    await fetch(`${API_BASE_URL}/api/v1/webhooks/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}` },
    });
    fetchWebhooks();
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const allEvents = ['invoice.created', 'invoice.paid', 'invoice.cancelled'];

  const toggleEvent = (e: string) => {
    setSelectedEvents(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">بوابة المطورين</h1>
          <p className="text-muted-foreground text-sm mt-1">توثيق الـ API، مفاتيح الوصول، والـ Webhooks</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => window.open(`${API_BASE_URL}/swagger/index.html`, '_blank')}>
          <BookOpen className="h-4 w-4" /> Swagger Docs
        </Button>
      </div>

      <Tabs defaultValue="docs" dir="rtl">
        <TabsList>
          <TabsTrigger value="docs">توثيق الـ API</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="examples">أمثلة cURL</TabsTrigger>
          <TabsTrigger value="postman">Postman</TabsTrigger>
        </TabsList>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">نقاط النهاية المتاحة (API Endpoints)</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {apiEndpoints.map((ep, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Badge className={`${methodColors[ep.method]} text-xs w-14 justify-center`}>{ep.method}</Badge>
                    <code className="text-sm font-mono text-foreground flex-1">{ep.path}</code>
                    <span className="text-sm text-muted-foreground flex-1">{ep.desc}</span>
                    <Badge variant="outline" className="text-xs">{ep.auth}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">أحداث الـ Webhook</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { event: 'invoice.created', desc: 'عند إنشاء فاتورة جديدة' },
                  { event: 'invoice.paid', desc: 'عند اعتماد دفعة فاتورة' },
                  { event: 'invoice.cancelled', desc: 'عند إلغاء فاتورة' },
                ].map(ev => (
                  <div key={ev.event} className="p-3 border rounded-lg">
                    <code className="text-sm font-mono text-yemen-700">{ev.event}</code>
                    <p className="text-xs text-muted-foreground mt-1">{ev.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" />إضافة Webhook</Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader><DialogTitle>إضافة Webhook جديد</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>رابط الـ Webhook *</Label><Input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://your-server.com/webhook" /></div>
                  <div>
                    <Label>الأحداث</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {allEvents.map(e => (
                        <button key={e} onClick={() => toggleEvent(e)}
                          className={`px-3 py-1 rounded-full text-xs border transition-colors ${selectedEvents.includes(e) ? 'bg-yemen-600 text-white border-yemen-600' : 'border-muted-foreground text-muted-foreground'}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full" onClick={createWebhook}>إنشاء</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {webhooks.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">لا توجد Webhooks</p></CardContent></Card>
          ) : (
            webhooks.map(wh => (
              <Card key={wh.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-mono text-sm">{wh.url}</div>
                    <div className="flex gap-1 mt-1">
                      {wh.events.split(',').map(e => <Badge key={e} variant="outline" className="text-xs">{e.trim()}</Badge>)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={wh.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{wh.active ? 'نشط' : 'موقوف'}</Badge>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteWebhook(wh.id)}>حذف</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          {curlExamples.map((ex, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><CardTitle className="text-base">{ex.title}</CardTitle></CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">{ex.code}</pre>
                  <Button variant="ghost" size="icon" className="absolute top-2 left-2 h-7 w-7" onClick={() => copy(ex.code, `curl-${i}`)}>
                    <Copy className={`h-3.5 w-3.5 ${copied === `curl-${i}` ? 'text-green-600' : ''}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="postman">
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <Code2 className="h-16 w-16 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">مجموعة Postman</h3>
              <p className="text-muted-foreground text-sm">حمّل مجموعة Postman الجاهزة لاختبار جميع نقاط الـ API</p>
              <Button className="gap-2" onClick={() => {
                const collection = {
                  info: { name: "Yemen API Gateway", schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
                  item: apiEndpoints.map(ep => ({
                    name: ep.desc,
                    request: {
                      method: ep.method,
                      header: [{ key: "X-API-Key", value: "{{api_key}}" }],
                      url: { raw: `{{base_url}}${ep.path}` },
                    },
                  })),
                  variable: [
                    { key: "base_url", value: API_BASE_URL || "http://localhost:8080" },
                    { key: "api_key", value: "YOUR_API_KEY" },
                  ],
                };
                const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = 'Yemen_API_Gateway.postman_collection.json'; a.click();
              }}>
                <Download className="h-4 w-4" />تحميل Postman Collection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
