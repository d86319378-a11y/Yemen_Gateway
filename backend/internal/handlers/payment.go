package handlers

import (
	"net/http"
	"yemenapi/internal/domain"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PaymentHandler struct{}

func NewPaymentHandler() *PaymentHandler {
	return &PaymentHandler{}
}

type CreatePaymentRequest struct {
	Amount      float64 `json:"amount" binding:"required,gt=0"`
	Currency    string  `json:"currency" binding:"required"`
	Provider    string  `json:"provider" binding:"required"`
	Description string  `json:"description"`
	WebhookURL  string  `json:"webhook_url"`
	CallbackURL string  `json:"callback_url"`
}

type VerifyPaymentRequest struct {
	PaymentID string `json:"payment_id" binding:"required"`
}

type RefundRequest struct {
	PaymentID string  `json:"payment_id" binding:"required"`
	Amount    float64 `json:"amount" binding:"required,gt=0"`
	Reason    string  `json:"reason"`
}

// @Summary Create payment
// @Description Create a new payment transaction
// @Tags Payment
// @Accept json
// @Produce json
// @Param request body CreatePaymentRequest true "Payment details"
// @Success 201 {object} domain.APIResponse
// @Router /api/v1/payments [post]
func (h *PaymentHandler) Create(c *gin.Context) {
	var req CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: err.Error()})
		return
	}

	userID, _ := c.Get("user_id")
	uid, _ := uuid.Parse(userID.(string))

	payment := domain.Payment{
		ID:          uuid.New(),
		UserID:      uid,
		Amount:      req.Amount,
		Currency:    req.Currency,
		Provider:    req.Provider,
		Status:      "pending",
		Type:        "payment",
		Description: req.Description,
		WebhookURL:  req.WebhookURL,
		CallbackURL: req.CallbackURL,
	}

	c.JSON(http.StatusCreated, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"payment_id":   payment.ID,
			"status":       "pending",
			"amount":       req.Amount,
			"currency":     req.Currency,
			"provider":     req.Provider,
			"checkout_url": "https://pay.yemengateway.dev/checkout/" + payment.ID.String(),
			"expires_at":   "2024-01-15T12:00:00Z",
		},
	})
}

// @Summary Verify payment
// @Description Verify a payment status
// @Tags Payment
// @Accept json
// @Produce json
// @Param request body VerifyPaymentRequest true "Payment verification"
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/payments/verify [post]
func (h *PaymentHandler) Verify(c *gin.Context) {
	var req VerifyPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "payment_id is required"})
		return
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"payment_id": req.PaymentID,
			"status":     "completed",
			"verified":   true,
			"amount":     1500.00,
			"currency":   "YER",
			"provider":   "Yemen Pay",
			"paid_at":    "2024-01-15T10:05:00Z",
		},
	})
}

// @Summary Refund payment
// @Description Refund a completed payment
// @Tags Payment
// @Accept json
// @Produce json
// @Param request body RefundRequest true "Refund details"
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/payments/refund [post]
func (h *PaymentHandler) Refund(c *gin.Context) {
	var req RefundRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"refund_id":  uuid.New(),
			"payment_id": req.PaymentID,
			"amount":     req.Amount,
			"status":     "refunded",
			"reason":     req.Reason,
			"refunded_at": "2024-01-15T10:30:00Z",
		},
	})
}

// @Summary Webhook receiver
// @Description Receive webhooks from payment providers
// @Tags Payment
// @Accept json
// @Produce json
// @Param provider path string true "Provider slug"
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/payments/webhook/{provider} [post]
func (h *PaymentHandler) Webhook(c *gin.Context) {
	provider := c.Param("provider")

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"received": true,
			"provider": provider,
			"message":  "Webhook processed",
		},
	})
}
