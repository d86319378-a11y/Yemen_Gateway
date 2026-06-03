import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ApiKey } from '@/types';
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Search,
} from 'lucide-react';

const PERMISSIONS = [
  { value: 'currency', label: 'Currency API' },
  { value: 'phone', label: 'Phone Verification' },
  { value: 'sms', label: 'SMS Service' },
  { value: 'wallet', label: 'Wallet Info' },
  { value: 'payment', label: 'Payments' },
  { value: 'all', label: 'All APIs' },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([
    { id: '1', name: 'Production Mobile App', key: 'yag_live_sk_a1b2c3d4e5f6g7h8i9j0', prefix: 'yag_live', status: 'active', permissions: ['currency', 'phone'], createdAt: '2024-01-10T08:00:00Z', lastUsedAt: '2024-01-15T10:30:00Z', usageCount: 45231 },
    { id: '2', name: 'Development Testing', key: 'yag_test_sk_x9y8z7w6v5u4t3s2r1q0', prefix: 'yag_test', status: 'active', permissions: ['all'], createdAt: '2024-01-12T14:20:00Z', lastUsedAt: '2024-01-15T09:15:00Z', usageCount: 8912 },
    { id: '3', name: 'Legacy Integration', key: 'yag_live_sk_legacy1234567890', prefix: 'yag_live', status: 'inactive', permissions: ['currency'], createdAt: '2023-12-01T10:00:00Z', lastUsedAt: '2024-01-10T16:45:00Z', usageCount: 156789 },
  ]);

  const [showCreate, setShowCreate] = useState(false);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [newKey, setNewKey] = useState({ name: '', permissions: ['currency'] });
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const filteredKeys = keys.filter(k => 
    k.name.toLowerCase().includes(search.toLowerCase()) ||
    k.prefix.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    const key: ApiKey = {
      id: Math.random().toString(36).substring(7),
      name: newKey.name,
      key: `yag_live_sk_${Math.random().toString(36).substring(2, 22)}`,
      prefix: 'yag_live',
      status: 'active',
      permissions: newKey.permissions,
      createdAt: new Date().toISOString(),
      usageCount: 0,
    };
    setKeys([key, ...keys]);
    setCreatedKey(key.key);
    setNewKey({ name: '', permissions: ['currency'] });
  };

  const toggleStatus = (id: string) => {
    setKeys(keys.map(k => k.id === id ? { ...k, status: k.status === 'active' ? 'inactive' : 'active' as ApiKey['status'] } : k));
  };

  const deleteKey = (id: string) => {
    setKeys(keys.filter(k => k.id !== id));
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleShowKey = (id: string) => {
    setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">API Keys</h1>
          <p className="text-muted-foreground mt-1">Manage your API keys and permissions</p>
        </div>
        <Button onClick={() => { setCreatedKey(null); setShowCreate(true); }} className="bg-yemen-600 hover:bg-yemen-700 text-white">
          <Plus className="mr-1.5 h-4 w-4" />
          Create Key
        </Button>
      </div>

      <Card className="border-muted">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Keys</CardTitle>
              <CardDescription>{keys.length} API keys total</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search keys..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredKeys.map((apiKey) => (
              <div key={apiKey.id} className="rounded-xl border p-4 transition-all hover:border-yemen-200 hover:shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${apiKey.status === 'active' ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <Key className={`h-5 w-5 ${apiKey.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{apiKey.name}</span>
                        <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                          {apiKey.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">
                          {showKey[apiKey.id] ? apiKey.key : `${apiKey.key.substring(0, 12)}...${apiKey.key.substring(apiKey.key.length - 4)}`}
                        </code>
                        <button onClick={() => toggleShowKey(apiKey.id)} className="text-muted-foreground hover:text-foreground">
                          {showKey[apiKey.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => copyKey(apiKey.key)} className="text-muted-foreground hover:text-foreground">
                          {copied === apiKey.key ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => toggleStatus(apiKey.id)} className="h-8">
                      {apiKey.status === 'active' ? <XCircle className="h-4 w-4 text-amber-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteKey(apiKey.id)} className="h-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {apiKey.permissions.map((perm) => (
                    <Badge key={perm} variant="outline" className="text-[10px] capitalize">
                      <Shield className="mr-1 h-2.5 w-2.5" />
                      {perm}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    {apiKey.usageCount.toLocaleString()} requests
                  </span>
                  {apiKey.lastUsedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last used: {new Date(apiKey.lastUsedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>Generate a new API key for your application.</DialogDescription>
          </DialogHeader>
          
          {createdKey ? (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">API Key Created</span>
                </div>
                <p className="text-sm text-green-700 mb-3">Copy this key now. You won&apos;t be able to see it again.</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-black text-green-400 px-3 py-2 rounded text-xs font-mono break-all">{createdKey}</code>
                  <Button size="sm" variant="outline" onClick={() => copyKey(createdKey)}>
                    {copied === createdKey ? 'Copied!' : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => { setShowCreate(false); setCreatedKey(null); }}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="key-name">Key Name</Label>
                  <Input
                    id="key-name"
                    placeholder="e.g., Production Mobile App"
                    value={newKey.name}
                    onChange={(e) => setNewKey(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <Select value={newKey.permissions[0]} onValueChange={(v) => setNewKey(prev => ({ ...prev, permissions: [v] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERMISSIONS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button onClick={handleCreate} className="bg-yemen-600 hover:bg-yemen-700 text-white" disabled={!newKey.name}>
                  Generate Key
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
