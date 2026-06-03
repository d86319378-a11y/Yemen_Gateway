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
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Sub-100ms response times with edge caching and optimized routes.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'JWT authentication, API key validation, rate limiting, and request signing.',
  },
  {
    icon: Globe,
    title: 'Local Services',
    description: 'Unified access to Yemeni financial, telecom, and payment services.',
  },
  {
    icon: Smartphone,
    title: 'Phone Verification',
    description: 'Validate Yemeni phone numbers and identify carriers instantly.',
  },
  {
    icon: CreditCard,
    title: 'Currency API',
    description: 'Real-time exchange rates for USD, SAR, EUR, and Yemeni Rial.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Monitor usage, track errors, and optimize with detailed insights.',
  },
];

const codeExamples = {
  curl: `curl -X GET "https://api.yemengateway.dev/v1/currency/rates" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
  js: `const response = await fetch(
  'https://api.yemengateway.dev/v1/currency/rates',
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
        "https://api.yemengateway.dev/v1/currency/rates", nil)
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
              Now in Public Beta
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              The Unified API Platform
              <span className="block mt-2 bg-gradient-to-r from-sand-300 to-sand-500 bg-clip-text text-transparent">
                for Yemen
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-300 sm:text-xl">
              Access currency rates, phone verification, SMS services, e-wallets, and payments — all through a single, powerful API gateway built for developers in Yemen and the region.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/login?tab=register">
                <Button size="lg" className="bg-yemen-600 hover:bg-yemen-700 text-white px-8 shadow-lg shadow-yemen-600/25">
                  Start Building Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                  <Code2 className="mr-2 h-4 w-4" />
                  View Documentation
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400" /> Free tier</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400" /> No credit card</span>
              <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-green-400" /> 1,000 req/month</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: 'Uptime SLA', value: '99.9%', icon: Activity },
              { label: 'Response Time', value: '<100ms', icon: Clock },
              { label: 'Active Developers', value: '2,500+', icon: Code2 },
              { label: 'API Requests/Day', value: '1M+', icon: Server },
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
            <Badge variant="outline" className="mb-4">API Services</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to build
              <span className="text-yemen-600"> for Yemen</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Comprehensive APIs covering finance, telecom, payments, and more — all unified under one gateway.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: CreditCard, title: 'Currency Exchange', desc: 'Real-time USD, SAR, EUR to YER rates with historical data', color: 'bg-blue-50 text-blue-600' },
              { icon: Phone, title: 'Phone Verification', desc: 'Validate numbers, detect carriers, format Yemeni phones', color: 'bg-green-50 text-green-600' },
              { icon: Mail, title: 'SMS Service', desc: 'Send OTP, notifications, and marketing messages', color: 'bg-purple-50 text-purple-600' },
              { icon: Wallet, title: 'E-Wallet Info', desc: 'Check balances, providers, and service availability', color: 'bg-amber-50 text-amber-600' },
              { icon: CreditCard, title: 'Payment Gateway', desc: 'Create payments, verify transactions, handle refunds', color: 'bg-rose-50 text-rose-600' },
              { icon: Database, title: 'Analytics', desc: 'Detailed usage metrics, error tracking, and insights', color: 'bg-teal-50 text-teal-600' },
            ].map((service) => (
              <Card key={service.title} className="group relative overflow-hidden border-muted hover:border-yemen-200 transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${service.color} mb-4`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
                  <Link to="/docs" className="mt-4 inline-flex items-center text-sm font-medium text-yemen-600 hover:text-yemen-700">
                    Learn more <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
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
              <Badge variant="outline" className="mb-4">Developer Experience</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
                Built for developers,
                <span className="text-yemen-600"> by developers</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Simple, intuitive APIs with comprehensive documentation. Start integrating in minutes, not hours.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Key, text: 'API Key authentication with scoped permissions' },
                  { icon: Lock, text: 'Enterprise-grade security and compliance' },
                  { icon: Clock, text: '99.9% uptime SLA with real-time monitoring' },
                  { icon: Server, text: 'Rate limiting with fair usage policies' },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-yemen-50">
                      <item.icon className="h-3.5 w-3.5 text-yemen-600" />
                    </div>
                    <span className="text-sm text-muted-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
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
              <div className="border-t p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Response:</span>
                  <Badge variant="secondary" className="text-xs">200 OK</Badge>
                </div>
                <pre className="mt-2 text-xs text-muted-foreground font-mono bg-muted p-3 rounded-md overflow-x-auto">
{`{
  "USD_YER": 1500.00,
  "SAR_YER": 399.80,
  "EUR_YER": 1648.50,
  "updated_at": "2024-01-15T12:00:00Z"
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="outline" className="mb-4">Why Choose Us</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Production-ready infrastructure
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built with enterprise standards to scale with your business.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-muted hover:border-yemen-200 transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-yemen-50">
                    <feature.icon className="h-5 w-5 text-yemen-600" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 sm:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free, scale as you grow. No hidden fees.
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
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-yemen-600 text-white hover:bg-yemen-700">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="flex flex-1 flex-col p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
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
                    <Button
                      className={`w-full ${
                        plan.highlighted
                          ? 'bg-yemen-600 hover:bg-yemen-700 text-white'
                          : plan.id === 'free'
                          ? 'bg-secondary hover:bg-secondary/80'
                          : 'bg-foreground hover:bg-foreground/90 text-background'
                      }`}
                      variant={plan.id === 'free' ? 'outline' : 'default'}
                    >
                      {plan.id === 'free' ? 'Get Started Free' : 'Subscribe'}
                    </Button>
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
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-yemen-600/30 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-sand-400/10 blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to start building?
              </h2>
              <p className="mt-4 text-lg text-gray-300 max-w-xl mx-auto">
                Join thousands of developers using Yemen API Gateway to power their applications.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link to="/login?tab=register">
                  <Button size="lg" className="bg-white text-yemen-900 hover:bg-gray-100 px-8 shadow-xl">
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/docs">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                    Read Documentation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
