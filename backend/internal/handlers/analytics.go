package handlers

import (
	"net/http"
	"strconv"
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

func (h *AnalyticsHandler) GetUsage(c *gin.Context) {
	userID, _ := c.Get("user_id")
	uid, err := uuid.Parse(userID.(string))
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.APIResponse{Success: false, Error: "Invalid user"})
		return
	}

	now := time.Now()
	from := now.AddDate(0, 0, -30)

	stats, err := h.logRepo.GetStats(uid, from, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to fetch stats"})
		return
	}

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

func (h *AnalyticsHandler) GetOverview(c *gin.Context) {
	userID, _ := c.Get("user_id")
	uid, err := uuid.Parse(userID.(string))
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.APIResponse{
			Success: false,
			Error:   "Invalid user",
		})
		return
	}

	days := 7
	if d := c.Query("days"); d != "" {
		if parsed, err := strconv.Atoi(d); err == nil && parsed > 0 {
			days = parsed
		}
	}

	now := time.Now()
	from := now.AddDate(0, 0, -days)

	stats, err := h.logRepo.GetStats(uid, from, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{
			Success: false,
			Error:   "Failed to fetch analytics stats",
		})
		return
	}

	endpoints, err := h.logRepo.GetEndpointStats(uid, from, now)
	if err != nil {
		endpoints = []map[string]interface{}{}
	}

	totalRequests := toFloat64(stats["total_requests"])
	successCount := toFloat64(stats["success_count"])
	errorCount := toFloat64(stats["error_count"])

	successRate := float64(0)
	errorRate := float64(0)

	if totalRequests > 0 {
		successRate = successCount / totalRequests * 100
		errorRate = errorCount / totalRequests * 100
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"period":         days,
			"total_requests": int64(totalRequests),
			"success_count":  int64(successCount),
			"error_count":    int64(errorCount),
			"success_rate":   successRate,
			"error_rate":     errorRate,
			"avg_latency":    stats["avg_latency"],
			"top_endpoints":  endpoints,
		},
	})
}

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
			"revenue_month":  4250.00,
			"new_users_month": 342,
		},
	})
}

func (h *AnalyticsHandler) GetLogs(c *gin.Context) {
	userID, _ := c.Get("user_id")
	uid, err := uuid.Parse(userID.(string))
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.APIResponse{Success: false, Error: "Invalid user"})
		return
	}

	page := 1
	perPage := 20

	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}

	if pp := c.Query("per_page"); pp != "" {
		if parsed, err := strconv.Atoi(pp); err == nil && parsed > 0 && parsed <= 100 {
			perPage = parsed
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

func toFloat64(v interface{}) float64 {
	switch n := v.(type) {
	case int:
		return float64(n)
	case int64:
		return float64(n)
	case int32:
		return float64(n)
	case float64:
		return n
	case float32:
		return float64(n)
	default:
		return 0
	}
}
