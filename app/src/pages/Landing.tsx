import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PLANS } from '@/lib/constants';
import {
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Smartphone,
  CreditCard,
  BarChart3,
  Key,
  Lock,
  Clock,
  Check,
  ChevronRight,
  Server,
  Code2,
  Database,
  Activity,
  Mail,
  Phone,
  Wallet,
  FileText,
  Receipt,
  ArrowLeftRight,
} from 'lucide-react';

const features = [
  {
    icon: Receipt,
    title: 'الفواتير الإلكترونية',
    description: 'إصدار وإدارة الفواتير بشكل رقمي متوافق مع المعايير.',
  },
  {
    icon: FileText,
    title: 'سندات القبض',
    description: 'توثيق وتسجيل كافة عمليات القبض النقدية والبنكية.',
  },
  {
    icon: ArrowLeftRight,
    title: 'سندات الصرف',
    description: 'إدارة دقيقة لعمليات الصرف المالي والعهاد.',
  },
  {
    icon: CreditCard,
    title: 'المدفوعات',
    description: 'بوابة دفع آمنة لدعم التحصيلات المالية المتنوعة.',
  },
  {
    icon: Database,
    title: 'إدارة العملاء',
    description: 'نظام متكامل لتنظيم بيانات العملاء وتاريخ تعاملاتهم.',
  },
  {
    icon: Code2,
    title: 'واجهات المطورين API',
    description: 'أدوات برمجية احترافية لربط أنظمتك بمنصتنا بسهولة.',
  },
];

const codeExamples = {
  curl: `curl -X GET "https://api.yemengateway.dev/v1/invoices" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
  js: `const response = await fetch(
  'https://api.yemengateway.dev/v1/invoices',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  }
);
const data = await response.json();
console.log(data);`,
  go: `package main

import (
    "fmt"
    "net/http"
)

func main() {
    req, _ := http.NewRequest("GET",
        "https://api.yemengateway.dev/v1/invoices", nil)
    req.Header.Add("Authorization", "Bearer YOUR_API_KEY")
    
    client := &http.Client{}
    resp, _ := client.Do(req)
    fmt.Println(resp.Status)
}`,
};

export default function Landing() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-yemen-950 via-yemen-900 to-background pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-yemen-600/20 blur-3xl" />
          <div className="absolute top-20 -left-40 h-80 w-80 rounded-full bg-sand-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur">
              <Zap className="mr-1 h-3 w-3" />
              منصة رائدة في التحول الرقمي
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              بوابة اليمن الموحدة
              <span className="block mt-2 bg-gradient-to-r from-sand-300 to-sand-500 bg-clip-text text-transparent">
                للخدمات البرمجية
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 sm:text-xl">
              منصة يمنية متكاملة لإدارة الفواتير وسندات القبض وسندات الصرف والمدفوعات وخدمات المطورين عبر واجهات برمجية احترافية وآمنة.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/login?tab=register">
                <Button size="lg" className="bg-yemen-600 hover:bg-yemen-700 text-white px-8 shadow-lg shadow-yemen-600/25">
                  ابدأ مجاناً
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                  <Code2 className="mr-2 h-4 w-4" />
                  عرض التوثيق
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: 'نسبة التوفر', value: '99.9%', icon: Activity },
              { label: 'متوسط الاستجابة', value: '<100ms', icon: Clock },
              { label: 'المطورون النشطون', value: '2,500+', icon: Code2 },
              { label: 'طلبات يومية', value: '1M+', icon: Server },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <stat.icon className="mb-2 h-5 w-5 text-yemen-600" />
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              كل ما تحتاجه لإدارة أعمالك
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              حلول متكاملة للفواتير الإلكترونية والمدفوعات وسندات القبض وسندات الصرف وإدارة العملاء.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((service) => (
              <Card key={service.title} className="group relative overflow-hidden border-muted hover:border-yemen-200 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-yemen-50 text-yemen-600 mb-4`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Code Example */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <Badge variant="outline" className="mb-4">تجربة المطورين</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
                مبني للمطورين،
                <span className="text-yemen-600"> بواسطة المطورين</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                واجهات برمجة تطبيقات بسيطة وبدون تعقيدات. ابدأ الربط في دقائق.
              </p>
            </div>
            <div className="rounded-2xl border bg-card shadow-xl overflow-hidden">
              <Tabs defaultValue="curl" className="w-full">
                <div className="border-b bg-muted/50 px-4">
                  <TabsList className="h-12 bg-transparent gap-1">
                    <TabsTrigger value="curl" className="text-xs data-[state=active]:bg-background">cURL</TabsTrigger>
                    <TabsTrigger value="js" className="text-xs data-[state=active]:bg-background">JavaScript</TabsTrigger>
                    <TabsTrigger value="go" className="text-xs data-[state=active]:bg-background">Go</TabsTrigger>
                  </TabsList>
                </div>
                <div className="bg-[#0d1117] p-4 overflow-x-auto">
                  <TabsContent value="curl">
                    <pre className="text-sm text-green-400 font-mono"><code>{codeExamples.curl}</code></pre>
                  </TabsContent>
                  <TabsContent value="js">
                    <pre className="text-sm text-yellow-300 font-mono"><code>{codeExamples.js}</code></pre>
                  </TabsContent>
                  <TabsContent value="go">
                    <pre className="text-sm text-cyan-300 font-mono"><code>{codeExamples.go}</code></pre>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              باقات واضحة ومرنة
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              ابدأ مجاناً ثم اختر الباقة المناسبة لنمو أعمالك.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`relative flex flex-col ${
                  plan.highlighted
                    ? 'border-yemen-400 shadow-xl shadow-yemen-600/10 scale-105 z-10'
                    : 'border-muted hover:border-yemen-200'
                } transition-all`}
              >
                <CardContent className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                  </div>
                  <ul className="mb-6 flex-1 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to="/login?tab=register" className="mt-auto">
                    <Button className="w-full">اختر الباقة</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yemen-800 via-yemen-900 to-yemen-950 px-6 py-16 sm:px-16 sm:py-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              جاهز لإدارة أعمالك؟
            </h2>
            <p className="mt-4 text-lg text-gray-300 max-w-xl mx-auto">
              ابدأ باستخدام منصة اليمن لإدارة الفواتير والمدفوعات والعملاء بسهولة.
            </p>
            <div className="mt-8">
              <Link to="/login?tab=register">
                <Button size="lg" className="bg-white text-yemen-900 hover:bg-gray-100 px-8 shadow-xl">
                  إنشاء حساب مجاني
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
