package handlers

import (
	"net/http"
	"yemenapi/internal/domain"
	"yemenapi/internal/repository"

	"github.com/gin-gonic/gin"
)

type BillingHandler struct {
	planRepo *repository.PlanRepository
}

func NewBillingHandler(planRepo *repository.PlanRepository) *BillingHandler {
	return &BillingHandler{planRepo: planRepo}
}

// @Summary List plans
// @Description Get all available subscription plans
// @Tags Billing
// @Accept json
// @Produce json
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/billing/plans [get]
func (h *BillingHandler) ListPlans(c *gin.Context) {
	plans, err := h.planRepo.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to fetch plans"})
		return
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data:    plans,
	})
}

// @Summary Get current usage
// @Description Get current billing period usage
// @Tags Billing
// @Accept json
// @Produce json
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/billing/usage [get]
func (h *BillingHandler) GetUsage(c *gin.Context) {
	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"plan": "business",
			"period": map[string]string{
				"start": "2024-04-01",
				"end":   "2024-04-30",
			},
			"requests": map[string]interface{}{
				"used":     57800,
				"limit":    250000,
				"percentage": 23.12,
			},
			"api_keys": map[string]interface{}{
				"used":  2,
				"limit": 20,
			},
			"rate_limit": "500 req/min",
		},
	})
}

// @Summary Get invoices
// @Description Get invoice history
// @Tags Billing
// @Accept json
// @Produce json
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/billing/invoices [get]
func (h *BillingHandler) GetInvoices(c *gin.Context) {
	invoices := []map[string]interface{}{
		{
			"id":         "INV-2024-001",
			"date":       "2024-01-01",
			"amount":     19.00,
			"status":     "paid",
			"plan":       "Starter",
			"items": []map[string]string{
				{"description": "Starter Plan - Monthly", "amount": "19.00"},
			},
		},
		{
			"id":         "INV-2024-002",
			"date":       "2024-02-01",
			"amount":     19.00,
			"status":     "paid",
			"plan":       "Starter",
			"items": []map[string]string{
				{"description": "Starter Plan - Monthly", "amount": "19.00"},
			},
		},
		{
			"id":         "INV-2024-003",
			"date":       "2024-03-01",
			"amount":     79.00,
			"status":     "paid",
			"plan":       "Business",
			"items": []map[string]string{
				{"description": "Business Plan - Monthly", "amount": "79.00"},
			},
		},
		{
			"id":         "INV-2024-004",
			"date":       "2024-04-01",
			"amount":     79.00,
			"status":     "pending",
			"plan":       "Business",
			"items": []map[string]string{
				{"description": "Business Plan - Monthly", "amount": "79.00"},
				{"description": "Overage charges", "amount": "0.00"},
			},
		},
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data:    invoices,
	})
}
