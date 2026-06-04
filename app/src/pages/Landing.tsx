import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  Zap,
  FileText,
  Receipt,
  ArrowLeftRight,
  CreditCard,
  Code2,
  Activity,
  Clock,
  Server,
  Database,
  CheckCircle,
} from 'lucide-react';

const services = [
  { icon: FileText, title: 'الفواتير الإلكترونية', desc: 'إنشاء فواتير احترافية وحفظها وإدارتها بسهولة.' },
  { icon: Receipt, title: 'سندات القبض', desc: 'إصدار سندات قبض منظمة للعملاء والمدفوعات.' },
  { icon: ArrowLeftRight, title: 'سندات الصرف', desc: 'إدارة المصروفات وسندات الصرف بطريقة مبسطة.' },
  { icon: CreditCard, title: 'المدفوعات', desc: 'متابعة المدفوعات اليدوية وحالات الفواتير.' },
  { icon: Code2, title: 'API للمطورين', desc: 'مفاتيح API جاهزة للربط مع الأنظمة والتطبيقات.' },
  { icon: Database, title: 'تقارير وإحصائيات', desc: 'لوحة تحكم لمتابعة الفواتير والمبيعات والاستخدام.' },
];

export default function Landing() {
  return (
    <div className="flex flex-col bg-slate-50" dir="rtl">
      <section className="relative overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-slate-950 px-4 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">
            <Zap className="ml-1 h-3 w-3" />
            النسخة التجريبية متاحة الآن
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            بوابة اليمن الموحدة
            <span className="block mt-3 text-amber-300">
              للفواتير والمدفوعات وواجهات API
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-200">
            منصة يمنية احترافية لإدارة الفواتير الإلكترونية، سندات القبض، سندات الصرف،
            المدفوعات، ومفاتيح الربط البرمجي للمطورين في مكان واحد.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/login?tab=register">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-8">
                ابدأ مجاناً
                <ArrowRight className="mr-2 h-4 w-4" />
              </Button>
            </Link>

            <Link to="/docs">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                عرض التوثيق
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
          {[
            { label: 'نسبة التوفر', value: '99.9%', icon: Activity },
            { label: 'متوسط الاستجابة', value: '<100ms', icon: Clock },
            { label: 'خدمات جاهزة', value: '6+', icon: Server },
            { label: 'ربط API', value: 'مباشر', icon: Code2 },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <item.icon className="mx-auto mb-2 h-5 w-5 text-red-700" />
              <div className="text-2xl font-bold text-slate-900">{item.value}</div>
              <div className="text-sm text-slate-500">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">الخدمات</Badge>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              كل ما تحتاجه لإدارة أعمالك
            </h2>
            <p className="mt-4 text-slate-600">
              حلول مبسطة وقابلة للتوسع لأصحاب المتاجر والشركات والمطورين.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.title} className="border-slate-200 bg-white hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-700">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">{service.title}</h3>
                  <p className="text-sm leading-6 text-slate-600">{service.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Badge variant="outline" className="mb-4">لماذا المنصة؟</Badge>
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                مصممة للسوق اليمني وقابلة للتوسع عربياً
              </h2>
              <p className="mt-4 text-slate-600">
                تبدأ بالفواتير والسندات، ثم تتوسع إلى المدفوعات وواجهات الربط وخدمات الأعمال.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'واجهة عربية سهلة الاستخدام',
                  'API Keys جاهزة للمطورين',
                  'فواتير وسندات محفوظة في قاعدة بيانات حقيقية',
                  'مناسبة للمتاجر والشركات الصغيرة ومزودي الخدمات',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-slate-200 shadow-xl">
              <CardContent className="p-6">
                <div className="rounded-xl bg-slate-950 p-5 text-left text-sm text-green-400" dir="ltr">
                  <pre>{`POST /api/v1/invoices
X-API-Key: yg_xxxxx

{
  "customer_name": "Ahmed Store",
  "currency": "YER",
  "items": [
    {
      "description": "Monthly subscription",
      "quantity": 1,
      "unit_price": 10000
    }
  ]
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-br from-red-900 to-slate-950 px-6 py-16 text-center shadow-xl">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            جاهز لإدارة أعمالك بطريقة احترافية؟
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-200">
            ابدأ الآن مجاناً، وأنشئ أول فاتورة وأول API Key خلال دقائق.
          </p>
          <div className="mt-8">
            <Link to="/login?tab=register">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-8">
                إنشاء حساب مجاني
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
