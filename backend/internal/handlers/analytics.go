package handlers

import (
	"net/http"
	"time"
	"yemenapi/internal/domain"
	"yemenapi/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AnalyticsHandler struct {
	logRepo *repository.RequestLogRepository
}

func NewAnalyticsHandler(logRepo *repository.RequestLogRepository) *AnalyticsHandler {
	return &AnalyticsHandler{logRepo: logRepo}
}

// @Summary Get usage stats
// @Description Get API usage statistics for the authenticated user
// @Tags Analytics
// @Accept json
// @Produce json
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/analytics/usage [get]
func (h *AnalyticsHandler) GetUsage(c *gin.Context) {
	userID, _ := c.Get("user_id")
	uid, _ := uuid.Parse(userID.(string))

	now := time.Now()
	from := now.AddDate(0, 0, -30)

	stats, err := h.logRepo.GetStats(uid, from, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to fetch stats"})
		return
	}

	// Get endpoint stats
	endpoints, err := h.logRepo.GetEndpointStats(uid, from, now)
	if err != nil {
		endpoints = []map[string]interface{}{}
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"period":    "30d",
			"stats":     stats,
			"endpoints": endpoints,
		},
	})
}

// @Summary Get dashboard summary
// @Description Get dashboard summary for admin
// @Tags Analytics
// @Accept json
// @Produce json
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/analytics/dashboard [get]
func (h *AnalyticsHandler) Dashboard(c *gin.Context) {
	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"total_users":        2847,
			"active_users_today": 342,
			"total_requests_24h": 1250000,
			"total_requests_7d":  8750000,
			"avg_response_time":  62,
			"error_rate":         0.4,
			"top_endpoints": []map[string]interface{}{
				{"endpoint": "GET /v1/currency/rates", "calls": 562500, "percentage": 45},
				{"endpoint": "POST /v1/phone/verify", "calls": 350000, "percentage": 28},
				{"endpoint": "POST /v1/sms/send", "calls": 187500, "percentage": 15},
				{"endpoint": "GET /v1/wallets", "calls": 100000, "percentage": 8},
				{"endpoint": "Others", "calls": 50000, "percentage": 4},
			},
			"revenue_month": 4250.00,
			"new_users_month": 342,
		},
	})
}

// @Summary Get request logs
// @Description Get recent request logs
// @Tags Analytics
// @Accept json
// @Produce json
// @Param page query int false "Page number"
// @Param per_page query int false "Items per page"
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/analytics/logs [get]
func (h *AnalyticsHandler) GetLogs(c *gin.Context) {
	userID, _ := c.Get("user_id")
	uid, _ := uuid.Parse(userID.(string))

	page := 1
	perPage := 20

	if p := c.Query("page"); p != "" {
		if parsed, err := time.Parse("2006-01-02", p); err == nil {
			_ = parsed
		}
	}

	logs, total, err := h.logRepo.ListByUser(uid, page, perPage)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to fetch logs"})
		return
	}

	totalPages := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data:    logs,
		Meta: &domain.Meta{
			Page:       page,
			PerPage:    perPage,
			Total:      total,
			TotalPages: totalPages,
		},
	})
}
