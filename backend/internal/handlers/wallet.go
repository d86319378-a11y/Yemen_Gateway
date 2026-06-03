package handlers

import (
	"net/http"
	"yemenapi/internal/domain"
	"yemenapi/internal/repository"

	"github.com/gin-gonic/gin"
)

type WalletHandler struct {
	repo *repository.WalletRepository
}

func NewWalletHandler(repo *repository.WalletRepository) *WalletHandler {
	return &WalletHandler{repo: repo}
}

// @Summary List wallets
// @Description Get all supported e-wallets
// @Tags Wallet
// @Accept json
// @Produce json
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/wallets [get]
func (h *WalletHandler) List(c *gin.Context) {
	wallets, err := h.repo.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to fetch wallets"})
		return
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data:    wallets,
	})
}

// @Summary List wallet providers
// @Description Get detailed information about wallet providers
// @Tags Wallet
// @Accept json
// @Produce json
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/wallets/providers [get]
func (h *WalletHandler) Providers(c *gin.Context) {
	wallets, err := h.repo.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to fetch providers"})
		return
	}

	var providers []map[string]interface{}
	for _, w := range wallets {
		providers = append(providers, map[string]interface{}{
			"id":          w.ID,
			"name":        w.Name,
			"slug":        w.Slug,
			"website":     w.Website,
			"logo":        w.Logo,
			"status":      w.Status,
			"api_doc_url": w.APIDocURL,
			"features":    w.Features,
		})
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data:    providers,
	})
}

// @Summary Wallet status
// @Description Get current status of wallet services
// @Tags Wallet
// @Accept json
// @Produce json
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/wallets/status [get]
func (h *WalletHandler) Status(c *gin.Context) {
	wallets, err := h.repo.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to fetch status"})
		return
	}

	var services []map[string]interface{}
	for _, w := range wallets {
		services = append(services, map[string]interface{}{
			"wallet_id":   w.ID,
			"name":        w.Name,
			"status":      w.Status,
			"uptime":      99.9,
			"response_time": 45,
		})
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"services":    services,
			"overall_status": "operational",
		},
	})
}
