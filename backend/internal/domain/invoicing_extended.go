package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// WebhookConfig stores webhook endpoints per user
type WebhookConfig struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	URL       string         `gorm:"not null" json:"url"`
	Events    string         `gorm:"not null" json:"events"` // comma-separated: invoice.created,invoice.paid,...
	Secret    string         `gorm:"not null" json:"-"`
	Active    bool           `gorm:"default:true" json:"active"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// WebhookDelivery logs each webhook attempt
type WebhookDelivery struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	WebhookID    uuid.UUID `gorm:"type:uuid;not null;index" json:"webhook_id"`
	Event        string    `gorm:"not null" json:"event"`
	Payload      string    `gorm:"type:text" json:"payload"`
	StatusCode   int       `json:"status_code"`
	ResponseBody string    `gorm:"type:text" json:"response_body"`
	Success      bool      `gorm:"default:false" json:"success"`
	AttemptedAt  time.Time `json:"attempted_at"`
}

// InvoicingStats aggregated dashboard stats
type InvoicingStats struct {
	TotalInvoices    int64   `json:"total_invoices"`
	PaidInvoices     int64   `json:"paid_invoices"`
	UnpaidInvoices   int64   `json:"unpaid_invoices"`
	CancelledInvoices int64  `json:"cancelled_invoices"`
	TotalRevenue     float64 `json:"total_revenue"`
	PendingPayments  int64   `json:"pending_payments"`
	TotalVouchers    int64   `json:"total_vouchers"`
}
