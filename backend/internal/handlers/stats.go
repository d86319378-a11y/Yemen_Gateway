package handlers

import (
	"net/http"
	"yemenapi/internal/domain"
	"yemenapi/internal/repository"

	"github.com/gin-gonic/gin"
)

type StatsHandler struct {
	invoicingRepo *repository.InvoicingRepository
	logRepo       *repository.RequestLogRepository
}

func NewStatsHandler(invoicingRepo *repository.InvoicingRepository, logRepo *repository.RequestLogRepository) *StatsHandler {
	return &StatsHandler{invoicingRepo: invoicingRepo, logRepo: logRepo}
}

func (h *StatsHandler) GetDashboardStats(c *gin.Context) {
	userID := currentUserID(c)
	stats, err := h.invoicingRepo.GetStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "failed to get stats"})
		return
	}
	c.JSON(http.StatusOK, domain.APIResponse{Success: true, Data: stats})
}
