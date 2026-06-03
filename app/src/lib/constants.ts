import type { Plan, ApiEndpoint } from '@/types';

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'For personal projects and testing',
    price: 0,
    currency: 'USD',
    period: 'monthly',
    features: [
      '1,000 requests/month',
      '1 API Key',
      'Community support',
      'Basic analytics',
      'Rate limit: 10 req/min',
    ],
    limits: { requests: 1000, keys: 1, rateLimit: 10 },
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small businesses and startups',
    price: 19,
    currency: 'USD',
    period: 'monthly',
    features: [
      '50,000 requests/month',
      '5 API Keys',
      'Email support',
      'Advanced analytics',
      'Rate limit: 100 req/min',
      'Webhook support',
    ],
    limits: { requests: 50000, keys: 5, rateLimit: 100 },
  },
  {
    id: 'business',
    name: 'Business',
    description: 'For growing companies',
    price: 79,
    currency: 'USD',
    period: 'monthly',
    highlighted: true,
    features: [
      '250,000 requests/month',
      '20 API Keys',
      'Priority support',
      'Full analytics suite',
      'Rate limit: 500 req/min',
      'Webhook support',
      'Custom integrations',
      'SLA 99.9%',
    ],
    limits: { requests: 250000, keys: 20, rateLimit: 500 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 249,
    currency: 'USD',
    period: 'monthly',
    features: [
      'Unlimited requests',
      'Unlimited API Keys',
      '24/7 Dedicated support',
      'Custom analytics',
      'Custom rate limits',
      'Webhook support',
      'Custom integrations',
      'SLA 99.99%',
      'On-premise option',
      'Audit logs',
    ],
    limits: { requests: -1, keys: -1, rateLimit: -1 },
  },
];

export const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/v1/currency/rates',
    description: 'Get all currency exchange rates',
    category: 'Currency',
    parameters: [],
    responses: [
      { code: 200, description: 'Success', example: '{"USD_YER": 1500, "SAR_YER": 400, "EUR_YER": 1650}' },
      { code: 429, description: 'Rate limit exceeded' },
    ],
  },
  {
    method: 'GET',
    path: '/api/v1/currency/usd',
    description: 'Get USD to YER exchange rate',
    category: 'Currency',
    responses: [
      { code: 200, description: 'Success', example: '{"rate": 1500, "updated_at": "2024-01-15T10:00:00Z"}' },
    ],
  },
  {
    method: 'GET',
    path: '/api/v1/currency/sar',
    description: 'Get SAR to YER exchange rate',
    category: 'Currency',
    responses: [
      { code: 200, description: 'Success', example: '{"rate": 400, "updated_at": "2024-01-15T10:00:00Z"}' },
    ],
  },
  {
    method: 'GET',
    path: '/api/v1/currency/history',
    description: 'Get historical currency rates',
    category: 'Currency',
    parameters: [
      { name: 'from', type: 'string', required: true, description: 'Start date (YYYY-MM-DD)', example: '2024-01-01' },
      { name: 'to', type: 'string', required: true, description: 'End date (YYYY-MM-DD)', example: '2024-01-31' },
      { name: 'currency', type: 'string', required: false, description: 'Currency code (default: USD)', example: 'USD' },
    ],
    responses: [
      { code: 200, description: 'Success', example: '{"data": [{"date": "2024-01-01", "rate": 1500}, ...]}' },
    ],
  },
  {
    method: 'POST',
    path: '/api/v1/phone/verify',
    description: 'Verify a Yemeni phone number',
    category: 'Phone',
    parameters: [
      { name: 'phone', type: 'string', required: true, description: 'Phone number (e.g., 9677XXXXXXXX)', example: '967712345678' },
    ],
    responses: [
      { code: 200, description: 'Valid number', example: '{"valid": true, "carrier": "Yemen Mobile", "type": "mobile"}' },
      { code: 400, description: 'Invalid phone number' },
    ],
  },
  {
    method: 'POST',
    path: '/api/v1/phone/check',
    description: 'Check phone number details without full verification',
    category: 'Phone',
    parameters: [
      { name: 'phone', type: 'string', required: true, description: 'Phone number', example: '967712345678' },
    ],
    responses: [
      { code: 200, description: 'Success', example: '{"carrier": "Yemen Mobile", "type": "mobile", "formatted": "+967 712 345 678"}' },
    ],
  },
  {
    method: 'POST',
    path: '/api/v1/sms/send',
    description: 'Send a single SMS',
    category: 'SMS',
    parameters: [
      { name: 'to', type: 'string', required: true, description: 'Recipient phone number', example: '967712345678' },
      { name: 'message', type: 'string', required: true, description: 'Message content (max 160 chars)', example: 'Your OTP is 123456' },
      { name: 'type', type: 'string', required: false, description: 'Message type: otp, notification, marketing', example: 'otp' },
    ],
    responses: [
      { code: 200, description: 'SMS queued', example: '{"message_id": "msg_123", "status": "queued"}' },
      { code: 429, description: 'Daily SMS limit exceeded' },
    ],
  },
  {
    method: 'POST',
    path: '/api/v1/sms/bulk',
    description: 'Send bulk SMS messages',
    category: 'SMS',
    parameters: [
      { name: 'recipients', type: 'array', required: true, description: 'Array of phone numbers', example: '["967712345678", "967787654321"]' },
      { name: 'message', type: 'string', required: true, description: 'Message content', example: 'Hello from Yemen Gateway!' },
    ],
    responses: [
      { code: 200, description: 'Bulk SMS queued', example: '{"batch_id": "batch_123", "total": 100, "accepted": 98}' },
    ],
  },
  {
    method: 'POST',
    path: '/api/v1/sms/status',
    description: 'Check SMS delivery status',
    category: 'SMS',
    parameters: [
      { name: 'message_id', type: 'string', required: true, description: 'Message ID from send response', example: 'msg_123' },
    ],
    responses: [
      { code: 200, description: 'Status retrieved', example: '{"message_id": "msg_123", "status": "delivered", "delivered_at": "2024-01-15T10:05:00Z"}' },
    ],
  },
  {
    method: 'GET',
    path: '/api/v1/wallets',
    description: 'List all supported e-wallets',
    category: 'Wallet',
    responses: [
      { code: 200, description: 'Success', example: '{"wallets": [{"id": "yb", "name": "Yemen Bank", "status": "active"}]}' },
    ],
  },
  {
    method: 'GET',
    path: '/api/v1/wallets/providers',
    description: 'Get wallet providers information',
    category: 'Wallet',
    responses: [
      { code: 200, description: 'Success', example: '{"providers": [{"id": "yemen_pay", "name": "Yemen Pay", "website": "..."}]}' },
    ],
  },
  {
    method: 'GET',
    path: '/api/v1/wallets/status',
    description: 'Get wallet services status',
    category: 'Wallet',
    responses: [
      { code: 200, description: 'Success', example: '{"services": [{"wallet_id": "yb", "status": "operational", "uptime": 99.9}]}' },
    ],
  },
];

export const CURRENCY_CODES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'YER', name: 'Yemeni Rial', symbol: '﷼' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'د.ب' },
  { code: 'OMR', name: 'Omani Rial', symbol: '﷼' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
];

export const TELECOM_PROVIDERS = [
  { id: 'yemen_mobile', name: 'Yemen Mobile', prefix: '71,73,77', color: '#dc2626' },
  { id: 'sabafon', name: 'Sabafon', prefix: '70,78', color: '#f59e0b' },
  { id: 'mtn', name: 'MTN Yemen', prefix: '72,76', color: '#facc15' },
  { id: 'y', name: 'Y Telecom', prefix: '74,75', color: '#16a34a' },
  { id: 'tele_yemen', name: 'TeleYemen', prefix: '01', color: '#2563eb' },
];

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Docs', href: '/docs' },
];

export const SIDEBAR_LINKS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'API Keys', href: '/keys', icon: 'Key' },
  { label: 'Usage & Analytics', href: '/usage', icon: 'BarChart3' },
  { label: 'Documentation', href: '/docs', icon: 'BookOpen' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
];

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

