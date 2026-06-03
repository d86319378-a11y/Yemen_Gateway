package handlers

import (
	"net/http"
	"yemenapi/internal/domain"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type SMSHandler struct{}

func NewSMSHandler() *SMSHandler {
	return &SMSHandler{}
}

type SendSMSRequest struct {
	To      string `json:"to" binding:"required"`
	Message string `json:"message" binding:"required,max=160"`
	Type    string `json:"type" binding:"omitempty,oneof=otp notification marketing"`
}

type BulkSMSRequest struct {
	Recipients []string `json:"recipients" binding:"required,min=1,max=1000"`
	Message    string   `json:"message" binding:"required,max=160"`
}

type SMSStatusRequest struct {
	MessageID string `json:"message_id" binding:"required"`
}

// @Summary Send single SMS
// @Description Send a single SMS message
// @Tags SMS
// @Accept json
// @Produce json
// @Param request body SendSMSRequest true "SMS details"
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/sms/send [post]
func (h *SMSHandler) Send(c *gin.Context) {
	var req SendSMSRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: err.Error()})
		return
	}

	smsType := req.Type
	if smsType == "" {
		smsType = "notification"
	}

	log := domain.SMSLog{
		ID:      uuid.New(),
		To:      req.To,
		Message: req.Message,
		Type:    smsType,
		Status:  "queued",
		Cost:    5.0,
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"message_id":  log.ID,
			"status":      "queued",
			"to":          req.To,
			"type":        smsType,
			"cost":        5.0,
			"characters":  len(req.Message),
			"segments":    (len(req.Message) / 160) + 1,
		},
	})
}

// @Summary Send bulk SMS
// @Description Send SMS to multiple recipients
// @Tags SMS
// @Accept json
// @Produce json
// @Param request body BulkSMSRequest true "Bulk SMS details"
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/sms/bulk [post]
func (h *SMSHandler) Bulk(c *gin.Context) {
	var req BulkSMSRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: err.Error()})
		return
	}

	batchID := uuid.New()
	total := len(req.Recipients)
	accepted := total
	rejected := 0

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"batch_id":    batchID,
			"total":       total,
			"accepted":    accepted,
			"rejected":    rejected,
			"message":     req.Message,
			"cost":        float64(total) * 5.0,
			"status":      "queued",
		},
	})
}

// @Summary Check SMS status
// @Description Check the delivery status of an SMS
// @Tags SMS
// @Accept json
// @Produce json
// @Param request body SMSStatusRequest true "Message ID"
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/sms/status [post]
func (h *SMSHandler) Status(c *gin.Context) {
	var req SMSStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "message_id is required"})
		return
	}

	// Simulate status
	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"message_id":  req.MessageID,
			"status":      "delivered",
			"sent_at":     "2024-01-15T10:00:00Z",
			"delivered_at": "2024-01-15T10:00:05Z",
			"provider":    "Yemen Mobile SMS Gateway",
		},
	})
}
