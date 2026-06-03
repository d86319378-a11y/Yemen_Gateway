import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  Clock,
  Shield,
  Search,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/constants';

type BackendApiKey = {
  id: string;
  user_id?: string;
  name: string;
  key?: string;
  prefix: string;
  status: 'active' | 'inactive' | 'revoked';
  permissions?: string[];
  last_used_at?: string | null;
  usage_count?: number;
  created_at?: string;
  updated_at?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

function getToken() {
  return localStorage.getItem('yg_token') || '';
}

function maskKey(apiKey: BackendApiKey) {
  if (apiKey.key) {
    return `${apiKey.key.substring(0, 14)}...${apiKey.key.substring(apiKey.key.length - 6)}`;
  }

  if (apiKey.prefix) {
    return `${apiKey.prefix}...`;
  }

  return 'Hidden key';
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<BackendApiKey[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredKeys = keys.filter((k) =>
    k.name.toLowerCase().includes(search.toLowerCase()) ||
    k.prefix.toLowerCase().includes(search.toLowerCase())
  );

  const loadKeys = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/keys`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const result: ApiResponse<BackendApiKey[]> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to load API keys');
      }

      setKeys(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: newKeyName.trim(),
        }),
      });

      const result: ApiResponse<BackendApiKey> = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || 'Failed to create API key');
      }

      setCreatedKey(result.data.key || null);
      setKeys((prev) => [result.data as BackendApiKey, ...prev]);
      setNewKeyName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteKey = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this API key?');
    if (!confirmed) return;

    setDeletingId(id);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/keys/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const result: ApiResponse<null> = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete API key');
      }

      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
    } finally {
      setDeletingId(null);
    }
  };

  const copyKey = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleShowKey = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">API Keys</h1>
          <p className="text-muted-foreground mt-1">Manage your real API keys</p>
        </div>

        <Button
          onClick={() => {
            setCreatedKey(null);
            setNewKeyName('');
            setShowCreate(true);
          }}
          className="bg-yemen-600 hover:bg-yemen-700 text-white"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Create Key
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </CardContent>
        </Card>
      )}

      <Card className="border-muted">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Your Keys</CardTitle>
              <CardDescription>{keys.length} API keys total</CardDescription>
            </div>

            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search keys..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading API keys...
            </div>
          ) : filteredKeys.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <Key className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">No API keys yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create your first API key to start using Yemen Gateway APIs.
              </p>
              <Button
                size="sm"
                className="mt-4 bg-yemen-600 hover:bg-yemen-700 text-white"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Create Key
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredKeys.map((apiKey) => {
                const visibleValue = apiKey.key || apiKey.prefix || '';
                const displayKey = showKey[apiKey.id] && apiKey.key
                  ? apiKey.key
                  : maskKey(apiKey);

                return (
                  <div
                    key={apiKey.id}
                    className="rounded-xl border p-4 transition-all hover:border-yemen-200 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            apiKey.status === 'active' ? 'bg-green-50' : 'bg-gray-50'
                          }`}
                        >
                          <Key
                            className={`h-5 w-5 ${
                              apiKey.status === 'active' ? 'text-green-600' : 'text-gray-400'
                            }`}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{apiKey.name}</span>
                            <Badge
                              variant={apiKey.status === 'active' ? 'default' : 'secondary'}
                              className="text-[10px]"
                            >
                              {apiKey.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">
                              {displayKey}
                            </code>

                            {apiKey.key && (
                              <button
                                onClick={() => toggleShowKey(apiKey.id)}
                                className="text-muted-foreground hover:text-foreground"
                                title="Show or hide key"
                              >
                                {showKey[apiKey.id] ? (
                                  <EyeOff className="h-3.5 w-3.5" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}

                            {visibleValue && (
                              <button
                                onClick={() => copyKey(visibleValue)}
                                className="text-muted-foreground hover:text-foreground"
                                title="Copy key"
                              >
                                {copied === visibleValue ? (
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteKey(apiKey.id)}
                          disabled={deletingId === apiKey.id}
                          className="h-8 text-destructive hover:text-destructive"
                        >
                          {deletingId === apiKey.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(apiKey.permissions && apiKey.permissions.length > 0
                        ? apiKey.permissions
                        : ['all']
                      ).map((perm) => (
                        <Badge key={perm} variant="outline" className="text-[10px] capitalize">
                          <Shield className="mr-1 h-2.5 w-2.5" />
                          {perm}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{(apiKey.usage_count || 0).toLocaleString()} requests</span>

                      {apiKey.last_used_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Last used: {new Date(apiKey.last_used_at).toLocaleString()}
                        </span>
                      )}

                      {apiKey.created_at && (
                        <span>
                          Created: {new Date(apiKey.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Generate a real API key connected to your account.
            </DialogDescription>
          </DialogHeader>

          {createdKey ? (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">API Key Created</span>
                </div>

                <p className="text-sm text-green-700 mb-3">
                  Copy this key now and keep it safe.
                </p>

                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-black text-green-400 px-3 py-2 rounded text-xs font-mono break-all">
                    {createdKey}
                  </code>

                  <Button size="sm" variant="outline" onClick={() => copyKey(createdKey)}>
                    {copied === createdKey ? 'Copied!' : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    setShowCreate(false);
                    setCreatedKey(null);
                  }}
                >
                  Done
                </Button>
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
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>

                <Button
                  onClick={handleCreate}
                  className="bg-yemen-600 hover:bg-yemen-700 text-white"
                  disabled={!newKeyName.trim() || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Generate Key'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
