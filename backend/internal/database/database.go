package database

import (
	"yemenapi/internal/config"
	"yemenapi/internal/domain"
	"yemenapi/pkg/logger"

	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

var db *gorm.DB

func Connect(cfg *config.DatabaseConfig) error {
	logger.Info("connecting to database", zap.String("host", cfg.Host), zap.Int("port", cfg.Port))

	gormConfig := &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			SingularTable: false,
		},
	}

	var err error
	db, err = gorm.Open(postgres.Open(cfg.DSN()), gormConfig)
	if err != nil {
		logger.Error("failed to connect to database", zap.Error(err))
		return err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return err
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	logger.Info("database connection established")
	return nil
}

func Migrate() error {
	logger.Info("running database migrations")

	err := db.AutoMigrate(
	&domain.User{},
	&domain.Plan{},
	&domain.APIKey{},
	&domain.Subscription{},
	&domain.RequestLog{},
	&domain.CurrencyRate{},
	&domain.PhoneVerification{},
	&domain.SMSLog{},
	&domain.WalletProvider{},
	&domain.Payment{},
	&domain.Customer{},
	&domain.Invoice{},
	&domain.InvoiceItem{},
	&domain.AccountingVoucher{},
	&domain.ManualPaymentProof{},
	&domain.AuditLog{},
	&domain.WebhookConfig{},
	&domain.WebhookDelivery{},
	&domain.Notification{},	
)
	if err != nil {
		logger.Error("failed to migrate database", zap.Error(err))
		return err
	}

	logger.Info("database migrations completed")
	return nil
}

func Seed() error {
	logger.Info("seeding database with default plans")

	plans := []domain.Plan{
		{
			Name:        "Free",
			Slug:        "free",
			Description: "For personal projects and testing",
			Price:       0,
			Currency:    "USD",
			Period:      "monthly",
			Features:    []string{"1,000 requests/month", "1 API Key", "Community support", "Basic analytics", "Rate limit: 10 req/min"},
			Limits:      domain.PlanLimits{Requests: 1000, Keys: 1, RateLimit: 10},
			Highlighted: false,
		},
		{
			Name:        "Starter",
			Slug:        "starter",
			Description: "For small businesses and startups",
			Price:       19,
			Currency:    "USD",
			Period:      "monthly",
			Features:    []string{"50,000 requests/month", "5 API Keys", "Email support", "Advanced analytics", "Rate limit: 100 req/min", "Webhook support"},
			Limits:      domain.PlanLimits{Requests: 50000, Keys: 5, RateLimit: 100},
			Highlighted: false,
		},
		{
			Name:        "Business",
			Slug:        "business",
			Description: "For growing companies",
			Price:       79,
			Currency:    "USD",
			Period:      "monthly",
			Features:    []string{"250,000 requests/month", "20 API Keys", "Priority support", "Full analytics suite", "Rate limit: 500 req/min", "Webhook support", "Custom integrations", "SLA 99.9%"},
			Limits:      domain.PlanLimits{Requests: 250000, Keys: 20, RateLimit: 500},
			Highlighted: true,
		},
		{
			Name:        "Enterprise",
			Slug:        "enterprise",
			Description: "For large organizations",
			Price:       249,
			Currency:    "USD",
			Period:      "monthly",
			Features:    []string{"Unlimited requests", "Unlimited API Keys", "24/7 Dedicated support", "Custom analytics", "Custom rate limits", "Webhook support", "Custom integrations", "SLA 99.99%", "On-premise option", "Audit logs"},
			Limits:      domain.PlanLimits{Requests: -1, Keys: -1, RateLimit: -1},
			Highlighted: false,
		},
	}

	for _, plan := range plans {
		var existing domain.Plan
		result := db.Where("slug = ?", plan.Slug).First(&existing)
		if result.Error == gorm.ErrRecordNotFound {
			if err := db.Create(&plan).Error; err != nil {
				logger.Error("failed to seed plan", zap.String("slug", plan.Slug), zap.Error(err))
			}
		}
	}

	// Seed wallet providers
	wallets := []domain.WalletProvider{
		{Name: "Yemen Bank", Slug: "yemen_bank", Website: "https://yemenbank.com", Status: "active"},
		{Name: "Kuraimi Islamic", Slug: "kuraimi", Website: "https://kuraimibank.com", Status: "active"},
		{Name: "CAC Bank", Slug: "cac", Website: "https://cacbank.com.ye", Status: "active"},
		{Name: "Yemen Pay", Slug: "yemen_pay", Website: "https://yemenpay.ye", Status: "active"},
		{Name: "Al-Tadhamon", Slug: "tadhamon", Website: "https://tadhamonbank.com", Status: "active"},
	}

	for _, wallet := range wallets {
		var existing domain.WalletProvider
		result := db.Where("slug = ?", wallet.Slug).First(&existing)
		if result.Error == gorm.ErrRecordNotFound {
			if err := db.Create(&wallet).Error; err != nil {
				logger.Error("failed to seed wallet", zap.String("slug", wallet.Slug), zap.Error(err))
			}
		}
	}

	// Seed currency rates
	rates := []domain.CurrencyRate{
		{FromCode: "USD", ToCode: "YER", Rate: 1500.0, Source: "central_bank"},
		{FromCode: "SAR", ToCode: "YER", Rate: 400.0, Source: "central_bank"},
		{FromCode: "EUR", ToCode: "YER", Rate: 1648.5, Source: "central_bank"},
		{FromCode: "AED", ToCode: "YER", Rate: 408.5, Source: "central_bank"},
		{FromCode: "QAR", ToCode: "YER", Rate: 411.8, Source: "central_bank"},
		{FromCode: "KWD", ToCode: "YER", Rate: 4885.0, Source: "central_bank"},
		{FromCode: "GBP", ToCode: "YER", Rate: 1905.0, Source: "central_bank"},
	}

	for _, rate := range rates {
		var existing domain.CurrencyRate
		result := db.Where("from_code = ? AND to_code = ?", rate.FromCode, rate.ToCode).First(&existing)
		if result.Error == gorm.ErrRecordNotFound {
			if err := db.Create(&rate).Error; err != nil {
				logger.Error("failed to seed rate", zap.String("pair", rate.FromCode+"/"+rate.ToCode), zap.Error(err))
			}
		}
	}

	logger.Info("database seeding completed")
	return nil
}

func GetDB() *gorm.DB {
	return db
}

func Close() error {
	if db != nil {
		sqlDB, err := db.DB()
		if err != nil {
			return err
		}
		return sqlDB.Close()
	}
	return nil
}
