import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { API_ENDPOINTS, CURRENCY_CODES, TELECOM_PROVIDERS } from '@/lib/constants';
import {
  BookOpen,
  Globe,
  Smartphone,
  Mail,
  Wallet,
  CreditCard,
  Shield,
  Copy,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';

const categories = [
  { id: 'all', label: 'All Endpoints', icon: Globe },
  { id: 'Currency', label: 'Currency', icon: CreditCard },
  { id: 'Phone', label: 'Phone', icon: Smartphone },
  { id: 'SMS', label: 'SMS', icon: Mail },
  { id: 'Wallet', label: 'Wallet', icon: Wallet },
];

const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-700 border-green-200',
  POST: 'bg-blue-100 text-blue-700 border-blue-200',
  PUT: 'bg-amber-100 text-amber-700 border-amber-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
  PATCH: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function DocumentationPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const filteredEndpoints = activeCategory === 'all' 
    ? API_ENDPOINTS 
    : API_ENDPOINTS.filter(ep => ep.category === activeCategory);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const baseUrl = 'https://api.yemengateway.dev';

  const curlExample = (endpoint: typeof API_ENDPOINTS[0]) => {
    const params = endpoint.parameters?.map(p => `-d "${p.name}=${p.example}"`).join(' \\\n  ') || '';
    return `curl -X ${endpoint.method} \\"${baseUrl}${endpoint.path}\" \\
  -H \"Authorization: Bearer YOUR_API_KEY\" \\
  -H \"Content-Type: application/json\" \\
  ${params}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">API Documentation</h1>
        <p className="text-muted-foreground mt-1">Complete reference for Yemen API Gateway endpoints</p>
      </div>

      <Card className="border-muted bg-gradient-to-br from-yemen-950 to-yemen-900 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-5 w-5 text-sand-300" />
            <h2 className="font-semibold">Quick Start</h2>
          </div>
          <ol className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yemen-600 text-xs font-medium">1</span>
              Sign up for a free account and get your API key from the dashboard
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yemen-600 text-xs font-medium">2</span>
              Include your API key in the Authorization header: Bearer YOUR_API_KEY
            </li>
            <li className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yemen-600 text-xs font-medium">3</span>
              Start making requests to any endpoint. All responses are in JSON format.
            </li>
          </ol>
          <div className="mt-4 rounded-lg bg-black/50 p-3 flex items-center justify-between">
            <code className="text-xs font-mono text-green-400">{baseUrl}/v1/...</code>
            <button onClick={() => copyCode(baseUrl)} className="text-muted-foreground hover:text-white">
              {copiedCode ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-yemen-600 text-white shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <cat.icon className="h-4 w-4" />
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredEndpoints.map((endpoint) => {
          const isExpanded = expandedEndpoint === `${endpoint.method}${endpoint.path}`;
          return (
            <Card key={`${endpoint.method}${endpoint.path}`} className={`border-muted transition-all ${isExpanded ? 'ring-1 ring-yemen-200' : ''}`}>
              <button
                className="w-full text-left"
                onClick={() => setExpandedEndpoint(isExpanded ? null : `${endpoint.method}${endpoint.path}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={`${methodColors[endpoint.method]} font-mono text-xs`}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono text-foreground">{endpoint.path}</code>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">{endpoint.category}</Badge>
                      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 ml-16">{endpoint.description}</p>
                </CardContent>
              </button>

              {isExpanded && (
                <CardContent className="border-t bg-muted/30 px-4 py-4">
                  <Tabs defaultValue="request">
                    <TabsList className="mb-4">
                      <TabsTrigger value="request" className="text-xs">Request</TabsTrigger>
                      <TabsTrigger value="response" className="text-xs">Response</TabsTrigger>
                      <TabsTrigger value="example" className="text-xs">Example</TabsTrigger>
                    </TabsList>

                    <TabsContent value="request">
                      {endpoint.parameters && endpoint.parameters.length > 0 ? (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Parameters</h4>
                          <div className="rounded-lg border bg-card overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-muted">
                                <tr>
                                  <th className="px-4 py-2 text-left font-medium">Name</th>
                                  <th className="px-4 py-2 text-left font-medium">Type</th>
                                  <th className="px-4 py-2 text-left font-medium">Required</th>
                                  <th className="px-4 py-2 text-left font-medium">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {endpoint.parameters.map((param) => (
                                  <tr key={param.name} className="border-t">
                                    <td className="px-4 py-2 font-mono text-xs">{param.name}</td>
                                    <td className="px-4 py-2 text-muted-foreground">{param.type}</td>
                                    <td className="px-4 py-2">
                                      {param.required ? (
                                        <Badge variant="destructive" className="text-[10px]">Required</Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-[10px]">Optional</Badge>
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-muted-foreground">{param.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No parameters required.</p>
                      )}
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium">Headers</h4>
                        <div className="rounded-lg bg-black p-3">
                          <code className="text-xs font-mono text-green-400">
                            Authorization: Bearer YOUR_API_KEY<br />
                            Content-Type: application/json
                          </code>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="response">
                      {endpoint.responses?.map((resp) => (
                        <div key={resp.code} className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            <Badge variant={resp.code < 300 ? 'default' : resp.code < 500 ? 'secondary' : 'destructive'} className="text-xs">
                              {resp.code}
                            </Badge>
                            <span className="text-sm">{resp.description}</span>
                          </div>
                          {resp.example && (
                            <pre className="rounded-lg bg-black p-3 text-xs font-mono text-green-400 overflow-x-auto">{resp.example}</pre>
                          )}
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="example">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">cURL</span>
                          <button onClick={() => copyCode(curlExample(endpoint))} className="text-muted-foreground hover:text-foreground">
                            {copiedCode ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                        <pre className="rounded-lg bg-black p-3 text-xs font-mono text-green-400 overflow-x-auto whitespace-pre-wrap">{curlExample(endpoint)}</pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-muted">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-yemen-600" />
              <h3 className="font-semibold">Supported Currencies</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {CURRENCY_CODES.map((c) => (
                <div key={c.code} className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
                  <span className="font-mono text-xs font-bold text-yemen-600">{c.code}</span>
                  <span className="text-xs text-muted-foreground">{c.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="h-5 w-5 text-yemen-600" />
              <h3 className="font-semibold">Telecom Providers</h3>
            </div>
            <div className="space-y-2">
              {TELECOM_PROVIDERS.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-sm">{p.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{p.prefix}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-muted">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-yemen-600" />
            <h3 className="font-semibold">Error Codes</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { code: '400', desc: 'Bad Request - Invalid parameters' },
              { code: '401', desc: 'Unauthorized - Invalid API key' },
              { code: '403', desc: 'Forbidden - Insufficient permissions' },
              { code: '404', desc: 'Not Found - Resource not found' },
              { code: '429', desc: 'Too Many Requests - Rate limit exceeded' },
              { code: '500', desc: 'Internal Server Error' },
            ].map((err) => (
              <div key={err.code} className="flex items-start gap-2 rounded-md border p-3">
                <Badge variant="destructive" className="shrink-0 text-xs">{err.code}</Badge>
                <span className="text-xs text-muted-foreground">{err.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
