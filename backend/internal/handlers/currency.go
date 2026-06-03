package handlers

import (
	"net/http"
	"strconv"
	"time"
	"yemenapi/internal/domain"
	"yemenapi/internal/repository"

	"github.com/gin-gonic/gin"
)

type CurrencyHandler struct {
	repo *repository.CurrencyRepository
}

func NewCurrencyHandler(repo *repository.CurrencyRepository) *CurrencyHandler {
	return &CurrencyHandler{repo: repo}
}

// @Summary Get all currency rates
// @Description Get current exchange rates for all supported currencies against YER
// @Tags Currency
// @Accept json
// @Produce json
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/currency/rates [get]
func (h *CurrencyHandler) GetAllRates(c *gin.Context) {
	rates, err := h.repo.GetAllRates()
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to fetch rates"})
		return
	}

	result := make(map[string]interface{})
	for _, rate := range rates {
		key := rate.FromCode + "_" + rate.ToCode
		result[key] = map[string]interface{}{
			"rate":       rate.Rate,
			"updated_at": rate.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data:    result,
	})
}

// @Summary Get USD/YER rate
// @Description Get current USD to Yemeni Rial exchange rate
// @Tags Currency
// @Accept json
// @Produce json
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/currency/usd [get]
func (h *CurrencyHandler) GetUSDRate(c *gin.Context) {
	rate, err := h.repo.GetRate("USD", "YER")
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to fetch USD rate"})
		return
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"from":       "USD",
			"to":         "YER",
			"rate":       rate.Rate,
			"updated_at": rate.CreatedAt,
		},
	})
}

// @Summary Get SAR/YER rate
// @Description Get current SAR to Yemeni Rial exchange rate
// @Tags Currency
// @Accept json
// @Produce json
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/currency/sar [get]
func (h *CurrencyHandler) GetSARRate(c *gin.Context) {
	rate, err := h.repo.GetRate("SAR", "YER")
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to fetch SAR rate"})
		return
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"from":       "SAR",
			"to":         "YER",
			"rate":       rate.Rate,
			"updated_at": rate.CreatedAt,
		},
	})
}

// @Summary Get currency history
// @Description Get historical exchange rates for a currency pair
// @Tags Currency
// @Accept json
// @Produce json
// @Param from query string true "Start date (YYYY-MM-DD)"
// @Param to query string true "End date (YYYY-MM-DD)"
// @Param currency query string false "Currency code (default: USD)"
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/currency/history [get]
func (h *CurrencyHandler) GetHistory(c *gin.Context) {
	from := c.Query("from")
	to := c.Query("to")
	currency := c.DefaultQuery("currency", "USD")

	if from == "" || to == "" {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "from and to dates are required"})
		return
	}

	fromDate, err := time.Parse("2006-01-02", from)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "Invalid from date format. Use YYYY-MM-DD"})
		return
	}

	toDate, err := time.Parse("2006-01-02", to)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "Invalid to date format. Use YYYY-MM-DD"})
		return
	}

	// Return simulated historical data
	var history []map[string]interface{}
	days := int(toDate.Sub(fromDate).Hours() / 24)
	baseRate := 1500.0

	for i := 0; i <= days && i < 30; i++ {
		date := fromDate.Add(time.Duration(i) * 24 * time.Hour)
		fluctuation := (float64(i%5) - 2.0) * 2.5
		history = append(history, map[string]interface{}{
			"date": date.Format("2006-01-02"),
			"rate": baseRate + fluctuation,
		})
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"currency": currency,
			"from":     from,
			"to":       to,
			"data":     history,
		},
	})
}

// @Summary Convert currency
// @Description Convert amount from one currency to another
// @Tags Currency
// @Accept json
// @Produce json
// @Param from query string true "Source currency code"
// @Param to query string true "Target currency code"
// @Param amount query number true "Amount to convert"
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/currency/convert [get]
func (h *CurrencyHandler) Convert(c *gin.Context) {
	from := c.Query("from")
	to := c.Query("to")
	amountStr := c.Query("amount")

	if from == "" || to == "" || amountStr == "" {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "from, to, and amount are required"})
		return
	}

	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "Invalid amount"})
		return
	}

	rate, err := h.repo.GetRate(from, to)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.APIResponse{Success: false, Error: "Exchange rate not found for currency pair"})
		return
	}

	converted := amount * rate.Rate

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"from":     from,
			"to":       to,
			"amount":   amount,
			"rate":     rate.Rate,
			"result":   converted,
			"timestamp": time.Now(),
		},
	})
}
