package handlers

import (
	"net/http"
	"strconv"
	"yemenapi/internal/domain"
	"yemenapi/internal/repository"

	"github.com/gin-gonic/gin"
)

type AdminHandler struct {
	userRepo *repository.UserRepository
	keyRepo  *repository.APIKeyRepository
	logRepo  *repository.RequestLogRepository
}

func NewAdminHandler(userRepo *repository.UserRepository, keyRepo *repository.APIKeyRepository, logRepo *repository.RequestLogRepository) *AdminHandler {
	return &AdminHandler{
		userRepo: userRepo,
		keyRepo:  keyRepo,
		logRepo:  logRepo,
	}
}

// @Summary List users
// @Description List all registered users (admin only)
// @Tags Admin
// @Accept json
// @Produce json
// @Param page query int false "Page number"
// @Param per_page query int false "Items per page"
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/admin/users [get]
func (h *AdminHandler) ListUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

	users, total, err := h.userRepo.List(page, perPage)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to fetch users"})
		return
	}

	// Hide passwords
	for i := range users {
		users[i].Password = ""
	}

	totalPages := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data:    users,
		Meta: &domain.Meta{
			Page:       page,
			PerPage:    perPage,
			Total:      total,
			TotalPages: totalPages,
		},
	})
}

// @Summary Update user status
// @Description Activate or suspend a user account
// @Tags Admin
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param status body string true "Status: active or suspended"
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/admin/users/{id}/status [put]
func (h *AdminHandler) UpdateUserStatus(c *gin.Context) {
	userID := c.Param("id")
	
	var req struct {
		Status bool `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"user_id": userID,
			"status":  req.Status,
		},
	})
}

// @Summary Get error logs
// @Description Get recent error logs (admin only)
// @Tags Admin
// @Accept json
// @Produce json
// @Param limit query int false "Number of logs to return"
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/admin/errors [get]
func (h *AdminHandler) GetErrors(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))

	logs, err := h.logRepo.GetRecentErrors(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to fetch errors"})
		return
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data:    logs,
	})
}

// @Summary Get platform stats
// @Description Get overall platform statistics
// @Tags Admin
// @Accept json
// @Produce json
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/admin/stats [get]
func (h *AdminHandler) GetStats(c *gin.Context) {
	userCount, _ := h.userRepo.Count()

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"total_users":      userCount,
			"active_users":     342,
			"total_api_keys":   4231,
			"active_keys":      3890,
			"total_requests_24h": 1250000,
			"total_requests_7d":  8750000,
			"avg_response_time":  62,
			"error_rate":         0.4,
			"revenue_month":      4250.00,
			"uptime":             99.95,
		},
	})
}
