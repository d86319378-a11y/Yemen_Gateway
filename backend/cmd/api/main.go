package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/redis/go-redis/v9"

	"yemenapi/internal/config"
	"yemenapi/internal/database"
	"yemenapi/internal/domain"
	"yemenapi/internal/handlers"
	"yemenapi/internal/middleware"
	"yemenapi/internal/repository"
	"yemenapi/pkg/logger"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	_ "yemenapi/docs"
)

// @title Yemen API Gateway
// @version 1.0.0
// @description The unified API platform for developers and businesses in Yemen
// @termsOfService https://yemengateway.dev/terms
// @contact.name Yemen API Support
// @contact.url https://yemengateway.dev/support
// @contact.email support@yemengateway.dev
// @license.name MIT
// @license.url https://opensource.org/licenses/MIT
// @host api.yemengateway.dev
// @BasePath /
// @schemes https http
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Enter your JWT token with Bearer prefix: "Bearer your_token_here"
// @securityDefinitions.apikey APIKeyAuth
// @in header
// @name X-API-Key
// @description Enter your API key
func main() {
	if err := logger.Init(os.Getenv("SERVER_ENV")); err != nil {
		panic(err)
	}
	defer logger.Sync()

	logger.Info("starting Yemen API Gateway server")

	cfg := config.Load()

	if err := database.Connect(&cfg.Database); err != nil {
		logger.Fatal("failed to connect to database")
	}
	defer database.Close()

	if err := database.Migrate(); err != nil {
		logger.Fatal("failed to run migrations")
	}

	if err := database.Seed(); err != nil {
		logger.Warn("failed to seed database")
	}

	redisClient := redis.NewClient(&redis.Options{
		Addr:     cfg.Redis.Addr(),
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := redisClient.Ping(ctx).Err(); err != nil {
		logger.Warn("failed to connect to redis, continuing without caching")
		redisClient = nil
	} else {
		logger.Info("connected to redis")
	}

	db := database.GetDB()

	userRepo := repository.NewUserRepository(db)
	keyRepo := repository.NewAPIKeyRepository(db)
	planRepo := repository.NewPlanRepository(db)
	currencyRepo := repository.NewCurrencyRepository(db)
	walletRepo := repository.NewWalletRepository(db)
	logRepo := repository.NewRequestLogRepository(db)
	invoicingRepo := repository.NewInvoicingRepository(db)
	webhookRepo := repository.NewWebhookRepository(db)

	authMiddleware := middleware.NewAuthMiddleware(&cfg.JWT, userRepo, keyRepo)

	var rateLimiter *middleware.RateLimiter
	if redisClient != nil {
		rateLimiter = middleware.NewRateLimiter(redisClient, &cfg.Rate)
	}

	authHandler := handlers.NewAuthHandler(userRepo, planRepo, &cfg.JWT)
	currencyHandler := handlers.NewCurrencyHandler(currencyRepo)
	phoneHandler := handlers.NewPhoneHandler()
	smsHandler := handlers.NewSMSHandler()
	walletHandler := handlers.NewWalletHandler(walletRepo)
	paymentHandler := handlers.NewPaymentHandler()
	analyticsHandler := handlers.NewAnalyticsHandler(logRepo)
	adminHandler := handlers.NewAdminHandler(userRepo, keyRepo, logRepo)
	billingHandler := handlers.NewBillingHandler(planRepo)
	apiKeyHandler := handlers.NewAPIKeyHandler(keyRepo)
	invoicingHandler := handlers.NewInvoicingHandlerWithWebhooks(invoicingRepo, webhookRepo)
	webhookHandler := handlers.NewWebhookHandler(webhookRepo)
	statsHandler := handlers.NewStatsHandler(invoicingRepo, logRepo)

	if cfg.Server.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Recovery())

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-API-Key"},
		ExposeHeaders:    []string{"Content-Length", "X-RateLimit-Limit", "X-RateLimit-Remaining"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.Use(func() gin.HandlerFunc {
		return func(c *gin.Context) {
			start := time.Now()
			path := c.Request.URL.Path
			raw := c.Request.URL.RawQuery

			c.Next()

			latency := time.Since(start)
			clientIP := c.ClientIP()
			method := c.Request.Method
			statusCode := c.Writer.Status()

			if raw != "" {
				path = path + "?" + raw
			}
			_ = path

			logger.Info("HTTP Request")

			if userID, exists := c.Get("user_id"); exists {
				uid, err := ParseUUID(userID.(string))
				if err == nil {
					var keyID *uuid.UUID

					if kid, ok := c.Get("api_key_id"); ok {
						kidUUID, err := uuid.Parse(kid.(string))
						if err == nil {
							keyID = &kidUUID
						}
					}

					log := &domain.RequestLog{
						APIKeyID:   keyID,
						UserID:     &uid,
						Method:     method,
						Path:       c.Request.URL.Path,
						StatusCode: statusCode,
						Latency:    latency.Milliseconds(),
						IP:         clientIP,
						UserAgent:  c.Request.UserAgent(),
					}

					if len(c.Errors) > 0 {
						log.Error = c.Errors.String()
					}

					_ = logRepo.Create(log)
				}
			}
		}
	}())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"version":   "1.0.0",
			"timestamp": time.Now().UTC(),
		})
	})

	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	if cfg.Metrics.Enabled {
		go func() {
			metricsRouter := gin.New()
			metricsRouter.GET("/metrics", gin.WrapH(promhttp.Handler()))

			logger.Info("metrics server starting")

			if err := metricsRouter.Run(":" + cfg.Metrics.Port); err != nil {
				logger.Error("metrics server failed")
			}
		}()
	}

	v1 := r.Group("/api/v1")

	v1.GET("/invoices/:id/qr", invoicingHandler.InvoiceQRInfo)

	auth := v1.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	protected := v1.Group("")
	protected.Use(authMiddleware.JWTAuth())
	{
		protected.GET("/auth/me", authHandler.Me)
		protected.GET("/keys", apiKeyHandler.List)
protected.POST("/keys", apiKeyHandler.Create)
protected.DELETE("/keys/:id", apiKeyHandler.Delete)

		protected.GET("/billing/plans", billingHandler.ListPlans)
		protected.GET("/billing/usage", billingHandler.GetUsage)
		protected.GET("/billing/invoices", billingHandler.GetInvoices)

		protected.GET("/invoicing/stats", statsHandler.GetDashboardStats)

		protected.POST("/webhooks", webhookHandler.Create)
		protected.GET("/webhooks", webhookHandler.List)
		protected.DELETE("/webhooks/:id", webhookHandler.Delete)
	}

	api := v1.Group("")
	api.Use(authMiddleware.APIKeyAuth())
	{
		if rateLimiter != nil {
			api.Use(rateLimiter.Middleware())
		}

		api.GET("/currency/rates", currencyHandler.GetAllRates)
		api.GET("/currency/usd", currencyHandler.GetUSDRate)
		api.GET("/currency/sar", currencyHandler.GetSARRate)
		api.GET("/currency/history", currencyHandler.GetHistory)
		api.GET("/currency/convert", currencyHandler.Convert)

		api.POST("/phone/verify", phoneHandler.Verify)
		api.POST("/phone/check", phoneHandler.Check)

		api.POST("/sms/send", smsHandler.Send)
		api.POST("/sms/bulk", smsHandler.Bulk)
		api.POST("/sms/status", smsHandler.Status)

		api.GET("/wallets", walletHandler.List)
		api.GET("/wallets/providers", walletHandler.Providers)
		api.GET("/wallets/status", walletHandler.Status)

		api.POST("/payments", paymentHandler.Create)
		api.POST("/payments/verify", paymentHandler.Verify)
		api.POST("/payments/refund", paymentHandler.Refund)

		api.POST("/invoices", invoicingHandler.CreateInvoice)
		api.GET("/invoices", invoicingHandler.ListInvoices)
		api.GET("/invoices/:id", invoicingHandler.GetInvoice)
		api.PUT("/invoices/:id/status", invoicingHandler.UpdateInvoiceStatus)

		api.POST("/vouchers", invoicingHandler.CreateVoucher)
		api.POST("/receipts", invoicingHandler.CreateVoucher)
		api.GET("/vouchers", invoicingHandler.ListVouchers)
		api.POST("/payment-vouchers", invoicingHandler.CreateVoucher)

		api.POST("/payment-submissions", invoicingHandler.SubmitManualPayment)
		api.POST("/manual-payments", invoicingHandler.SubmitManualPayment)
	}

	v1.POST("/payments/webhook/:provider", paymentHandler.Webhook)

	analytics := v1.Group("/analytics")
	analytics.Use(authMiddleware.JWTAuth())
	{
		analytics.GET("/usage", analyticsHandler.GetUsage)
		analytics.GET("/logs", analyticsHandler.GetLogs)
		analytics.GET("/dashboard", analyticsHandler.Dashboard)
	}

	admin := v1.Group("/admin")
	admin.Use(authMiddleware.JWTAuth())
	admin.Use(authMiddleware.AdminOnly())
	{
		admin.GET("/users", adminHandler.ListUsers)
		admin.PUT("/users/:id/status", adminHandler.UpdateUserStatus)
		admin.GET("/errors", adminHandler.GetErrors)
		admin.GET("/stats", adminHandler.GetStats)

		admin.GET("/manual-payments", invoicingHandler.AdminListPaymentProofs)
		admin.GET("/payment-submissions", invoicingHandler.AdminListPaymentProofs)
		admin.PUT("/manual-payments/:id/review", invoicingHandler.AdminReviewPaymentProof)
		admin.PUT("/payment-submissions/:id/review", invoicingHandler.AdminReviewPaymentProof)
	}

	srv := &http.Server{
		Addr:    ":" + cfg.Server.Port,
		Handler: r,
	}

	go func() {
		logger.Info("server starting")

		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("server failed to start")
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("shutting down server")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Fatal("server forced to shutdown")
	}

	logger.Info("server exited")
}

func ParseUUID(s string) (uuid.UUID, error) {
	return uuid.Parse(s)
}
