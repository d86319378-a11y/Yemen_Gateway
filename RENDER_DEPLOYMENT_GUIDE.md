# Render Deployment Guide - Yemen Gateway

## 1) ارفع المشروع إلى GitHub
ارفع محتويات هذا المجلد كما هي إلى Repository جديد.

## 2) أنشئ Blueprint على Render
Render Dashboard → New → Blueprint → اختر GitHub Repository.
Render سيقرأ ملف `render.yaml` ويُنشئ:

- Backend Web Service: `yemen-gateway-api`
- Frontend Static Site: `yemen-gateway-app`
- PostgreSQL: `yemen-gateway-db`
- Redis: `yemen-gateway-redis`
- Persistent Disk للملفات: `/app/storage`

## 3) بعد أول Deploy
افتح رابط الـ Backend:

```txt
https://yemen-gateway-api.onrender.com/health
```

يجب أن يظهر:

```json
{"status":"healthy"}
```

ثم افتح الواجهة:

```txt
https://yemen-gateway-app.onrender.com
```

## 4) متغيرات البيئة المهمة
يتم توليد أغلبها تلقائيًا من `render.yaml`:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `SERVER_ENV=production`
- `METRICS_ENABLED=false`

## 5) ملاحظات مهمة
- إذا فشل Build بسبب Go dependencies فغالبًا المشكلة اتصال مؤقت من Render، أعد Deploy.
- إذا فشل Frontend بسبب TypeScript، افتح Log وأصلح الملف المذكور.
- `VITE_API_URL` يجب أن يحتوي رابط الـ Backend. إذا لم يتم ضبطه تلقائيًا، ضعه يدويًا:

```txt
https://yemen-gateway-api.onrender.com
```

## 6) اختبار سريع بعد النشر

```bash
curl https://yemen-gateway-api.onrender.com/health
```

ثم جرّب التسجيل من الواجهة.
