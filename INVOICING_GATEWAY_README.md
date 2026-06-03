# Yemen Invoicing + Manual Payment Gateway

تمت إضافة نواة خدمة الفواتير اليمنية وبوابة الدفع اليدوي إلى المشروع.

## الملفات المضافة

- `backend/internal/domain/models.go`
  - Invoice
  - InvoiceItem
  - AccountingVoucher
  - ManualPaymentProof

- `backend/internal/repository/invoicing.go`
  - إنشاء واستعراض الفواتير
  - إنشاء واستعراض سندات القبض والصرف
  - استقبال ومراجعة إثبات الدفع اليدوي

- `backend/internal/handlers/invoicing.go`
  - REST API handlers للفواتير والسندات والدفع اليدوي

## الملفات المعدلة

- `backend/internal/database/database.go`
  - إضافة الجداول الجديدة إلى AutoMigrate

- `backend/cmd/api/main.go`
  - تسجيل InvoicingRepository و InvoicingHandler
  - إضافة Routes جديدة
  - إصلاح ParseUUID وإضافة imports لازمة

## Endpoints الجديدة

كل هذه عبر API Key:

- `POST /api/v1/invoices`
- `GET /api/v1/invoices`
- `GET /api/v1/invoices/:id`
- `PUT /api/v1/invoices/:id/status`
- `POST /api/v1/vouchers`
- `GET /api/v1/vouchers`
- `POST /api/v1/manual-payments`

Admin فقط:

- `GET /api/v1/admin/manual-payments`
- `PUT /api/v1/admin/manual-payments/:id/review`

## ملاحظة تشغيل

لم أستطع تنفيذ `go test ./...` نهائيًا داخل البيئة الحالية لأن تحميل مكتبات Go من `proxy.golang.org` محجوب في بيئة الفحص. عندك محليًا أو على Render سيحتاج المشروع إلى:

```bash
go mod tidy
go test ./...
```

