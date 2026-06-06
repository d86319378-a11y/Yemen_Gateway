package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a developer account
type User struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email     string         `gorm:"uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"not null" json:"-"`
	Name      string         `gorm:"not null" json:"name"`
	Company   string         `json:"company,omitempty"`
	Role      string         `gorm:"default:developer" json:"role"`
	PlanID    *uuid.UUID     `gorm:"type:uuid" json:"plan_id,omitempty"`
	Plan      *Plan          `gorm:"foreignKey:PlanID" json:"plan,omitempty"`
	Active    bool           `gorm:"default:true" json:"active"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Plan represents a subscription plan
type Plan struct {
	ID          uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string     `gorm:"not null" json:"name"`
	Slug        string     `gorm:"uniqueIndex;not null" json:"slug"`
	Description string     `json:"description"`
	Price       float64    `gorm:"not null" json:"price"`
	Currency    string     `gorm:"default:USD" json:"currency"`
	Period      string     `gorm:"default:monthly" json:"period"`
	Features    []string   `gorm:"-" json:"features"`
	Limits      PlanLimits `gorm:"embedded" json:"limits"`
	Highlighted bool       `gorm:"default:false" json:"highlighted"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type PlanLimits struct {
	Requests  int `gorm:"column:limit_requests" json:"requests"`
	Keys      int `gorm:"column:limit_keys" json:"keys"`
	RateLimit int `gorm:"column:limit_rate" json:"rate_limit"`
}

// APIKey represents an API key for authentication
type APIKey struct {
	ID          uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	User        User           `gorm:"foreignKey:UserID" json:"-"`
	Name        string         `gorm:"not null" json:"name"`
	Key         string         `gorm:"uniqueIndex;not null" json:"-"`
	Prefix      string         `gorm:"not null" json:"prefix"`
	Status      string         `gorm:"default:active" json:"status"`
	Permissions []string       `gorm:"-" json:"permissions"`
	LastUsedAt  *time.Time     `json:"last_used_at,omitempty"`
	UsageCount  int64          `gorm:"default:0" json:"usage_count"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Subscription tracks user subscriptions
type Subscription struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	User      User           `gorm:"foreignKey:UserID" json:"-"`
	PlanID    uuid.UUID      `gorm:"type:uuid;not null" json:"plan_id"`
	Plan      Plan           `gorm:"foreignKey:PlanID" json:"plan"`
	Status    string         `gorm:"default:active" json:"status"`
	StartDate time.Time      `json:"start_date"`
	EndDate   *time.Time     `json:"end_date,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// RequestLog tracks all API requests
type RequestLog struct {
	ID         uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	APIKeyID   *uuid.UUID `gorm:"type:uuid" json:"api_key_id,omitempty"`
	UserID     *uuid.UUID `gorm:"type:uuid" json:"user_id,omitempty"`
	Method     string     `gorm:"not null" json:"method"`
	Path       string     `gorm:"not null" json:"path"`
	StatusCode int        `json:"status_code"`
	Latency    int64      `json:"latency_ms"`
	IP         string     `json:"ip"`
	UserAgent  string     `json:"user_agent"`
	Error      string     `json:"error,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
}

// CurrencyRate stores exchange rates
type CurrencyRate struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	FromCode  string    `gorm:"not null;index" json:"from_code"`
	ToCode    string    `gorm:"not null;index" json:"to_code"`
	Rate      float64   `gorm:"not null" json:"rate"`
	Source    string    `json:"source"`
	Date      time.Time `json:"date"`
	CreatedAt time.Time `json:"created_at"`
}

// PhoneVerification stores phone verification results
type PhoneVerification struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Phone     string    `gorm:"not null" json:"phone"`
	Valid     bool      `json:"valid"`
	Carrier   string    `json:"carrier"`
	Type      string    `json:"type"`
	Formatted string    `json:"formatted"`
	Country   string    `json:"country"`
	CreatedAt time.Time `json:"created_at"`
}

// SMSLog stores sent SMS records
type SMSLog struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	From      string    `json:"from"`
	To        string    `gorm:"not null" json:"to"`
	Message   string    `gorm:"not null" json:"message"`
	Type      string    `json:"type"`
	Status    string    `gorm:"default:queued" json:"status"`
	Provider  string    `json:"provider"`
	Cost      float64   `json:"cost"`
	CreatedAt time.Time `json:"created_at"`
}

// WalletProvider stores e-wallet provider info
type WalletProvider struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name      string    `gorm:"not null" json:"name"`
	Slug      string    `gorm:"uniqueIndex;not null" json:"slug"`
	Website   string    `json:"website"`
	Logo      string    `json:"logo"`
	Status    string    `gorm:"default:active" json:"status"`
	Features  []string  `gorm:"-" json:"features"`
	APIDocURL string    `json:"api_doc_url,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Payment stores payment transactions
type Payment struct {
	ID          uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID  `gorm:"type:uuid;not null" json:"user_id"`
	Amount      float64    `gorm:"not null" json:"amount"`
	Currency    string     `gorm:"default:YER" json:"currency"`
	Provider    string     `json:"provider"`
	ProviderRef string     `json:"provider_ref,omitempty"`
	Status      string     `gorm:"default:pending" json:"status"`
	Type        string     `json:"type"`
	Description string     `json:"description"`
	WebhookURL  string     `json:"webhook_url,omitempty"`
	CallbackURL string     `json:"callback_url,omitempty"`
	PaidAt      *time.Time `json:"paid_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// AuditLog tracks admin actions
type AuditLog struct {
	ID        uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    *uuid.UUID `gorm:"type:uuid" json:"user_id,omitempty"`
	Action    string     `gorm:"not null" json:"action"`
	Entity    string     `json:"entity"`
	EntityID  string     `json:"entity_id"`
	OldValue  string     `json:"old_value,omitempty"`
	NewValue  string     `json:"new_value,omitempty"`
	IP        string     `json:"ip"`
	CreatedAt time.Time  `json:"created_at"`
}

// AuthResponse represents authentication response
type AuthResponse struct {
	Token        string    `json:"token"`
	RefreshToken string    `json:"refresh_token"`
	User         User      `json:"user"`
	ExpiresAt    time.Time `json:"expires_at"`
}

// APIResponse represents a standard API response
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
}

// Meta represents pagination metadata
type Meta struct {
	Page       int   `json:"page"`
	PerPage    int   `json:"per_page"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

// PaginationParams represents pagination query parameters
type PaginationParams struct {
	Page    int `form:"page,default=1"`
	PerPage int `form:"per_page,default=20"`
}

// Customer represents a customer record.
type Customer struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	User      User           `gorm:"foreignKey:UserID" json:"-"`

	Name      string         `gorm:"not null" json:"name"`
	Phone     string         `json:"phone"`
	Email     string         `json:"email"`
	Address   string         `json:"address"`
	Notes     string         `json:"notes"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
// Invoice represents a Yemeni accounting invoice issued via API.
type Invoice struct {
	ID            uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID        uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	User          User           `gorm:"foreignKey:UserID" json:"-"`
	Number        string         `gorm:"uniqueIndex;not null" json:"number"`
	CustomerName  string         `gorm:"not null" json:"customer_name"`
	CustomerPhone string         `json:"customer_phone"`
	CustomerEmail string         `json:"customer_email"`
	Currency      string         `gorm:"default:YER" json:"currency"`
	Subtotal      float64        `json:"subtotal"`
	Tax           float64        `json:"tax"`
	Discount      float64        `json:"discount"`
	Total         float64        `json:"total"`
	Status        string         `gorm:"default:unpaid;index" json:"status"` // unpaid, paid, cancelled
	Notes         string         `json:"notes"`
	DueDate       *time.Time     `json:"due_date,omitempty"`
	PaidAt        *time.Time     `json:"paid_at,omitempty"`
	Items         []InvoiceItem  `gorm:"foreignKey:InvoiceID" json:"items"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// InvoiceItem represents one line in an invoice.
type InvoiceItem struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	InvoiceID   uuid.UUID `gorm:"type:uuid;not null;index" json:"invoice_id"`
	Description string    `gorm:"not null" json:"description"`
	Quantity    float64   `gorm:"not null" json:"quantity"`
	UnitPrice   float64   `gorm:"not null" json:"unit_price"`
	Total       float64   `gorm:"not null" json:"total"`
	CreatedAt   time.Time `json:"created_at"`
}

// AccountingVoucher represents receipt/payment vouchers.
type AccountingVoucher struct {
	ID               uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID           uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	User             User           `gorm:"foreignKey:UserID" json:"-"`
	Number           string         `gorm:"uniqueIndex;not null" json:"number"`
	Type             string         `gorm:"not null;index" json:"type"` // receipt, payment
	PartyName        string         `gorm:"not null" json:"party_name"`
	PartyPhone       string         `json:"party_phone"`
	Amount           float64        `gorm:"not null" json:"amount"`
	Currency         string         `gorm:"default:YER" json:"currency"`
	Method           string         `json:"method"` // cash, wallet, bank_transfer
	Reference        string         `json:"reference"`
	Description      string         `json:"description"`
	Status           string         `gorm:"default:issued;index" json:"status"`
	RelatedInvoiceID *uuid.UUID     `gorm:"type:uuid" json:"related_invoice_id,omitempty"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

// ManualPaymentProof is the first practical self-built payment gateway layer.
type ManualPaymentProof struct {
	ID            uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID        uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	InvoiceID     uuid.UUID      `gorm:"type:uuid;not null;index" json:"invoice_id"`
	Invoice       Invoice        `gorm:"foreignKey:InvoiceID" json:"-"`
	Provider      string         `gorm:"not null" json:"provider"` // kuraimi, jawali, onecash, cash
	SenderName    string         `json:"sender_name"`
	SenderPhone   string         `json:"sender_phone"`
	Amount        float64        `gorm:"not null" json:"amount"`
	Currency      string         `gorm:"default:YER" json:"currency"`
	Reference     string         `gorm:"not null" json:"reference"`
	ScreenshotURL string         `json:"screenshot_url"`
	Status        string         `gorm:"default:pending;index" json:"status"` // pending, approved, rejected
	AdminNote     string         `json:"admin_note"`
	ReviewedAt    *time.Time     `json:"reviewed_at,omitempty"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type Notification struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"-"`

	Title     string `gorm:"not null" json:"title"`
	Message   string `gorm:"type:text" json:"message"`
	Type      string `gorm:"not null;default:'info'" json:"type"`
	Read      bool   `gorm:"default:false" json:"read"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
