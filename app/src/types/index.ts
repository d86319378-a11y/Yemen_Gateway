export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  role: 'developer' | 'admin';
  plan: 'free' | 'starter' | 'business' | 'enterprise';
  createdAt: string;
  avatar?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  status: 'active' | 'inactive' | 'revoked';
  permissions: string[];
  createdAt: string;
  lastUsedAt?: string;
  usageCount: number;
}

export interface UsageStats {
  totalRequests: number;
  requestsToday: number;
  requestsThisMonth: number;
  successRate: number;
  averageLatency: number;
  errorRate: number;
}

export interface EndpointUsage {
  endpoint: string;
  method: string;
  count: number;
  percentage: number;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  period: 'monthly' | 'yearly';
  features: string[];
  limits: {
    requests: number;
    keys: number;
    rateLimit: number;
  };
  highlighted?: boolean;
}

export interface Activity {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning';
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  category: string;
  parameters?: ApiParameter[];
  responses?: ApiResponse[];
}

export interface ApiParameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
}

export interface ApiResponse {
  code: number;
  description: string;
  example?: string;
}
