# Yemen API Gateway

> The unified API platform for developers and businesses in Yemen. Access currency rates, phone verification, SMS services, e-wallets, and payments — all through a single, powerful API gateway.

## Quick Start

```bash
# Clone repository
git clone https://github.com/yemenapi/gateway.git
cd gateway/backend

# Copy environment variables
cp .env.example .env

# Start with Docker Compose
cd docker && docker-compose up -d

# API will be available at http://localhost:8080
# Documentation at http://localhost:8080/swagger/index.html
# Grafana at http://localhost:3001 (admin/yemenapi-admin-2024)
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│  Web App  │  Mobile  │  Third-party Services  │  Dashboard  │
└───────────┴──────────┴────────────────────────┴─────────────┘
                              │
                    ┌─────────▼──────────┐
                    │     NGINX          │
                    │  (Load Balancer)   │
                    └─────────┬──────────┘
                              │
┌─────────────────────────────▼────────────────────────────────┐
│                    YEMEN API GATEWAY                          │
│  ┌─────────────┐  ┌──────────┐  ┌────────────┐  ┌────────┐  │
│  │   Currency  │  │  Phone   │  │    SMS     │  │ Wallet │  │
│  │     API     │  │   API    │  │    API     │  │  API   │  │
│  └─────────────┘  └──────────┘  └────────────┘  └────────┘  │
│  ┌─────────────┐  ┌──────────┐  ┌────────────┐  ┌────────┐  │
│  │  Payment    │  │  Auth    │  │  Analytics │  │  Admin │  │
│  │   API       │  │  (JWT)   │  │    API     │  │  API   │  │
│  └─────────────┘  └──────────┘  └────────────┘  └────────┘  │
│                                                              │
│  ┌──────────────┐  ┌──────────┐  ┌────────────────────────┐  │
│  │ Rate Limiter │  │  Logger  │  │  Request/Response      │  │
│  │   (Redis)    │  │  (Zap)   │  │  Middleware            │  │
│  └──────────────┘  └──────────┘  └────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
┌────────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│   PostgreSQL    │  │    Redis       │  │  Prometheus    │
│  (Primary DB)   │  │   (Cache)      │  │  (Metrics)     │
└─────────────────┘  └────────────────┘  └────────────────┘
```

## Technology Stack

- **Language**: Go 1.21+
- **Framework**: Gin
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **ORM**: GORM
- **Auth**: JWT + API Keys
- **Docs**: Swagger/OpenAPI 3.0
- **Monitoring**: Prometheus + Grafana
- **Logging**: Zap (Uber)
- **Deployment**: Docker + Docker Compose

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new account |
| POST | `/api/v1/auth/login` | Login and get token |
| GET | `/api/v1/auth/me` | Get current user |

### Currency API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/currency/rates` | Get all exchange rates |
| GET | `/api/v1/currency/usd` | Get USD/YER rate |
| GET | `/api/v1/currency/sar` | Get SAR/YER rate |
| GET | `/api/v1/currency/history` | Get historical rates |
| GET | `/api/v1/currency/convert` | Convert currency |

### Phone Verification API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/phone/verify` | Verify phone number |
| POST | `/api/v1/phone/check` | Check phone details |

### SMS Service API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/sms/send` | Send single SMS |
| POST | `/api/v1/sms/bulk` | Send bulk SMS |
| POST | `/api/v1/sms/status` | Check SMS status |

### Wallet Information API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/wallets` | List e-wallets |
| GET | `/api/v1/wallets/providers` | Get providers info |
| GET | `/api/v1/wallets/status` | Get service status |

### Payment Gateway API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments` | Create payment |
| POST | `/api/v1/payments/verify` | Verify payment |
| POST | `/api/v1/payments/refund` | Refund payment |
| POST | `/api/v1/payments/webhook/:provider` | Webhook receiver |

### Analytics API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/usage` | Get usage stats |
| GET | `/api/v1/analytics/logs` | Get request logs |
| GET | `/api/v1/analytics/dashboard` | Get dashboard data |

### Admin API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users` | List all users |
| PUT | `/api/v1/admin/users/:id/status` | Update user status |
| GET | `/api/v1/admin/errors` | Get error logs |
| GET | `/api/v1/admin/stats` | Get platform stats |

## Authentication

### JWT Authentication
```bash
curl -X POST https://api.yemengateway.dev/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### API Key Authentication
```bash
curl https://api.yemengateway.dev/api/v1/currency/rates \
  -H "X-API-Key: yag_live_sk_your_api_key_here"
```

## Deployment

### Production Deployment (Ubuntu)
```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh

# 2. Clone and configure
git clone https://github.com/yemenapi/gateway.git
cd gateway/backend
cp .env.example .env
# Edit .env with production values

# 3. Deploy
cd docker && docker-compose -f docker-compose.yml up -d

# 4. Setup SSL with Let's Encrypt
certbot --nginx -d api.yemengateway.dev
```

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `SERVER_PORT` | HTTP server port | `8080` |
| `DATABASE_HOST` | PostgreSQL host | `localhost` |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_USER` | PostgreSQL user | `yemenapi` |
| `DATABASE_PASSWORD` | PostgreSQL password | - |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing secret | - |
| `RATE_LIMIT_REQUESTS` | Max requests per window | `100` |
| `RATE_LIMIT_WINDOW` | Rate limit window (seconds) | `60` |
| `METRICS_ENABLED` | Enable Prometheus metrics | `true` |

## Monitoring

- **Prometheus**: http://localhost:9091
- **Grafana**: http://localhost:3001 (admin/yemenapi-admin-2024)
- **Health Check**: http://localhost:8080/health

## Security

- JWT Authentication with refresh tokens
- API Key authentication with scoped permissions
- Rate limiting per key and per IP
- Input validation and sanitization
- SQL injection protection via parameterized queries
- XSS protection via output encoding
- Request signing for webhooks
- HTTPS enforcement
- Audit logging for all admin actions
- Request/response logging with PII redaction

## Database Schema

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │────<│   api_keys  │     │    plans    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (uuid)   │     │ id (uuid)   │     │ id (uuid)   │
│ email       │     │ user_id     │     │ name        │
│ password    │     │ key         │     │ slug        │
│ name        │     │ prefix      │     │ price       │
│ role        │     │ status      │     │ limits      │
│ plan_id     │>────│ permissions │     │ features    │
│ active      │     │ usage_count │     └─────────────┘
│ created_at  │     │ created_at  │
└─────────────┘     └─────────────┘
       │
       │        ┌──────────────────┐
       └───────<│ subscriptions    │
                ├──────────────────┤
                │ id (uuid)        │
                │ user_id          │
                │ plan_id          │
                │ status           │
                │ start_date       │
                │ end_date         │
                └──────────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: https://docs.yemengateway.dev
- Email: support@yemengateway.dev
- Discord: https://discord.gg/yemenapi
