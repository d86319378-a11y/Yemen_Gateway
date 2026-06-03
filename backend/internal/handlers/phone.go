package handlers

import (
	"net/http"
	"regexp"
	"strings"
	"yemenapi/internal/domain"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PhoneHandler struct{}

func NewPhoneHandler() *PhoneHandler {
	return &PhoneHandler{}
}

// Telecom provider definitions
var yemenCarriers = map[string]struct {
	name   string
	prefix []string
	color  string
}{
	"yemen_mobile": {name: "Yemen Mobile", prefix: []string{"71", "73", "77"}, color: "#dc2626"},
	"sabafon":      {name: "Sabafon", prefix: []string{"70", "78"}, color: "#f59e0b"},
	"mtn":          {name: "MTN Yemen", prefix: []string{"72", "76"}, color: "#facc15"},
	"y":            {name: "Y Telecom", prefix: []string{"74", "75"}, color: "#16a34a"},
	"tele_yemen":   {name: "TeleYemen", prefix: []string{"01"}, color: "#2563eb"},
}

type VerifyPhoneRequest struct {
	Phone string `json:"phone" binding:"required"`
}

// @Summary Verify phone number
// @Description Verify a Yemeni phone number and get carrier info
// @Tags Phone
// @Accept json
// @Produce json
// @Param phone body VerifyPhoneRequest true "Phone number to verify"
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/phone/verify [post]
func (h *PhoneHandler) Verify(c *gin.Context) {
	var req VerifyPhoneRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "phone is required"})
		return
	}

	phone := normalizePhone(req.Phone)
	carrier, phoneType := detectCarrier(phone)
	valid := isValidYemeniPhone(phone)

	result := domain.PhoneVerification{
		ID:        uuid.New(),
		Phone:     phone,
		Valid:     valid,
		Carrier:   carrier,
		Type:      phoneType,
		Formatted: formatPhone(phone),
		Country:   "YE",
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data:    result,
	})
}

// @Summary Check phone number
// @Description Check phone number details without full verification
// @Tags Phone
// @Accept json
// @Produce json
// @Param phone body VerifyPhoneRequest true "Phone number to check"
// @Success 200 {object} domain.APIResponse
// @Router /api/v1/phone/check [post]
func (h *PhoneHandler) Check(c *gin.Context) {
	var req VerifyPhoneRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "phone is required"})
		return
	}

	phone := normalizePhone(req.Phone)
	carrier, phoneType := detectCarrier(phone)

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"phone":     phone,
			"carrier":   carrier,
			"type":      phoneType,
			"formatted": formatPhone(phone),
			"country":   "YE",
			"country_name": "Yemen",
		},
	})
}

func normalizePhone(phone string) string {
	phone = strings.TrimSpace(phone)
	phone = strings.ReplaceAll(phone, " ", "")
	phone = strings.ReplaceAll(phone, "-", "")
	phone = strings.ReplaceAll(phone, "+", "")
	
	if strings.HasPrefix(phone, "00") {
		phone = phone[2:]
	}
	
	return phone
}

func isValidYemeniPhone(phone string) bool {
	pattern := `^(967)?(7[0-9]{8}|01[0-9]{7})$`
	matched, _ := regexp.MatchString(pattern, phone)
	return matched
}

func detectCarrier(phone string) (string, string) {
	if strings.HasPrefix(phone, "967") {
		phone = phone[3:]
	}

	for _, carrier := range yemenCarriers {
		for _, prefix := range carrier.prefix {
			if strings.HasPrefix(phone, prefix) {
				return carrier.name, "mobile"
			}
		}
	}

	if strings.HasPrefix(phone, "01") {
		return "TeleYemen", "landline"
	}

	return "Unknown", "unknown"
}

func formatPhone(phone string) string {
	if strings.HasPrefix(phone, "967") {
		phone = phone[3:]
		return "+967 " + phone[:3] + " " + phone[3:6] + " " + phone[6:]
	}
	return phone
}
