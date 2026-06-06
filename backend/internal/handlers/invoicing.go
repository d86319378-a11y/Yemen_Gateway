package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"yemenapi/internal/domain"
	"yemenapi/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type InvoicingHandler struct {
	repo             *repository.InvoicingRepository
	webhookRepo      *repository.WebhookRepository
	notificationRepo *repository.NotificationRepository
}

func NewInvoicingHandler(repo *repository.InvoicingRepository) *InvoicingHandler {
	return &InvoicingHandler{repo: repo}
}

func NewInvoicingHandlerWithWebhooks(repo *repository.InvoicingRepository, webhookRepo *repository.WebhookRepository) *InvoicingHandler {
	return &InvoicingHandler{repo: repo, webhookRepo: webhookRepo}
}

func NewInvoicingHandlerFull(
	repo *repository.InvoicingRepository,
	webhookRepo *repository.WebhookRepository,
	notificationRepo *repository.NotificationRepository,
) *InvoicingHandler {
	return &InvoicingHandler{
		repo:             repo,
		webhookRepo:      webhookRepo,
		notificationRepo: notificationRepo,
	}
}

type InvoiceItemRequest struct {
	Description string  `json:"description" binding:"required"`
	Quantity    float64 `json:"quantity" binding:"required,gt=0"`
	UnitPrice   float64 `json:"unit_price" binding:"required,gte=0"`
}

type CreateInvoiceRequest struct {
	CustomerName  string               `json:"customer_name" binding:"required"`
	CustomerPhone string               `json:"customer_phone"`
	CustomerEmail string               `json:"customer_email"`
	Currency      string               `json:"currency"`
	Tax           float64              `json:"tax"`
	Discount      float64              `json:"discount"`
	Notes         string               `json:"notes"`
	Items         []InvoiceItemRequest `json:"items" binding:"required,min=1"`
}

type UpdateInvoiceStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=unpaid paid cancelled pending draft"`
}

type CreateVoucherRequest struct {
	Type             string  `json:"type" binding:"required,oneof=receipt payment"`
	PartyName        string  `json:"party_name" binding:"required"`
	PartyPhone       string  `json:"party_phone"`
	Amount           float64 `json:"amount" binding:"required,gt=0"`
	Currency         string  `json:"currency"`
	Method           string  `json:"method"`
	Reference        string  `json:"reference"`
	Description      string  `json:"description"`
	RelatedInvoiceID string  `json:"related_invoice_id"`
}

type SubmitManualPaymentRequest struct {
	InvoiceID     string  `json:"invoice_id" binding:"required"`
	Provider      string  `json:"provider" binding:"required"`
	SenderName    string  `json:"sender_name"`
	SenderPhone   string  `json:"sender_phone"`
	Amount        float64 `json:"amount" binding:"required,gt=0"`
	Currency      string  `json:"currency"`
	Reference     string  `json:"reference" binding:"required"`
	ScreenshotURL string  `json:"screenshot_url"`
}

type ReviewManualPaymentRequest struct {
	Status string `json:"status" binding:"required,oneof=approved rejected"`
	Note   string `json:"note"`
}

func (h *InvoicingHandler) CreateInvoice(c *gin.Context) {
	var req CreateInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: err.Error()})
		return
	}

	userID := currentUserID(c)

	currency := strings.ToUpper(req.Currency)
	if currency == "" {
		currency = "YER"
	}

	items := make([]domain.InvoiceItem, 0, len(req.Items))
	subtotal := 0.0

	for _, item := range req.Items {
		lineTotal := item.Quantity * item.UnitPrice
		subtotal += lineTotal

		items = append(items, domain.InvoiceItem{
			ID:          uuid.New(),
			Description: item.Description,
			Quantity:    item.Quantity,
			UnitPrice:   item.UnitPrice,
			Total:       lineTotal,
		})
	}

	total := subtotal + req.Tax - req.Discount
	if total < 0 {
		total = 0
	}

	invoice := &domain.Invoice{
		ID:            uuid.New(),
		UserID:        userID,
		Number:        h.repo.NextNumber("INV"),
		CustomerName:  req.CustomerName,
		CustomerPhone: req.CustomerPhone,
		CustomerEmail: req.CustomerEmail,
		Currency:      currency,
		Subtotal:      subtotal,
		Tax:           req.Tax,
		Discount:      req.Discount,
		Total:         total,
		Status:        "unpaid",
		Notes:         req.Notes,
		Items:         items,
	}

	if err := h.repo.CreateInvoice(invoice); err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "failed to create invoice"})
		return
	}

	if h.notificationRepo != nil {
		_ = h.notificationRepo.Create(&domain.Notification{
			ID:      uuid.New(),
			UserID:  userID,
			Title:   "تم إنشاء فاتورة جديدة",
			Message: invoice.Number + " - " + invoice.CustomerName,
			Type:    "invoice_created",
			Read:    false,
		})
	}

	if h.webhookRepo != nil {
		FireWebhook(h.webhookRepo, userID, "invoice.created", invoice)
	}

	baseURL := getBaseURL(c)

	c.JSON(http.StatusCreated, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"invoice":    invoice,
			"pdf_url":    baseURL + "/api/v1/invoices/" + invoice.ID.String() + "/pdf",
			"public_url": baseURL + "/pay/" + invoice.ID.String(),
			"qr_payload": buildQRPayload(invoice),
		},
	})
}

func (h *InvoicingHandler) ListInvoices(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	invoices, err := h.repo.ListInvoices(currentUserID(c), c.Query("status"), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "failed to list invoices"})
		return
	}

	c.JSON(http.StatusOK, domain.APIResponse{Success: true, Data: invoices})
}

func (h *InvoicingHandler) GetInvoice(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "invalid invoice id"})
		return
	}

	invoice, err := h.repo.GetInvoice(currentUserID(c), id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.APIResponse{Success: false, Error: "invoice not found"})
		return
	}

	baseURL := getBaseURL(c)

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"invoice":    invoice,
			"pdf_url":    baseURL + "/api/v1/invoices/" + invoice.ID.String() + "/pdf",
			"qr_payload": buildQRPayload(invoice),
		},
	})
}

func (h *InvoicingHandler) UpdateInvoiceStatus(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "invalid invoice id"})
		return
	}

	var req UpdateInvoiceStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: err.Error()})
		return
	}

	userID := currentUserID(c)

	invoice, err := h.repo.UpdateInvoiceStatus(userID, id, req.Status)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.APIResponse{Success: false, Error: "invoice not found"})
		return
	}

	if h.notificationRepo != nil {
		title := "تم تحديث حالة الفاتورة"
		notificationType := "invoice_updated"

		if req.Status == "paid" {
			title = "تم دفع الفاتورة"
			notificationType = "invoice_paid"
		}

		if req.Status == "cancelled" {
			title = "تم إلغاء الفاتورة"
			notificationType = "invoice_cancelled"
		}

		_ = h.notificationRepo.Create(&domain.Notification{
			ID:      uuid.New(),
			UserID:  userID,
			Title:   title,
			Message: invoice.Number + " - " + invoice.CustomerName,
			Type:    notificationType,
			Read:    false,
		})
	}

	if h.webhookRepo != nil {
		switch req.Status {
		case "paid":
			FireWebhook(h.webhookRepo, userID, "invoice.paid", invoice)
		case "cancelled":
			FireWebhook(h.webhookRepo, userID, "invoice.cancelled", invoice)
		}
	}

	c.JSON(http.StatusOK, domain.APIResponse{Success: true, Data: invoice})
}

func (h *InvoicingHandler) CreateVoucher(c *gin.Context) {
	var req CreateVoucherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: err.Error()})
		return
	}

	userID := currentUserID(c)

	currency := strings.ToUpper(req.Currency)
	if currency == "" {
		currency = "YER"
	}

	var relatedID *uuid.UUID
	if req.RelatedInvoiceID != "" {
		parsed, err := uuid.Parse(req.RelatedInvoiceID)
		if err != nil {
			c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "invalid related_invoice_id"})
			return
		}
		relatedID = &parsed
	}

	prefix := "RCPT"
	if req.Type == "payment" {
		prefix = "PV"
	}

	voucher := &domain.AccountingVoucher{
		ID:               uuid.New(),
		UserID:           userID,
		Number:           h.repo.NextNumber(prefix),
		Type:             req.Type,
		PartyName:        req.PartyName,
		PartyPhone:       req.PartyPhone,
		Amount:           req.Amount,
		Currency:         currency,
		Method:           req.Method,
		Reference:        req.Reference,
		Description:      req.Description,
		Status:           "issued",
		RelatedInvoiceID: relatedID,
	}

	if err := h.repo.CreateVoucher(voucher); err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "failed to create voucher"})
		return
	}

	if h.notificationRepo != nil {
		title := "تم إنشاء سند قبض"
		notificationType := "receipt_created"

		if req.Type == "payment" {
			title = "تم إنشاء سند صرف"
			notificationType = "payment_voucher_created"
		}

		_ = h.notificationRepo.Create(&domain.Notification{
			ID:      uuid.New(),
			UserID:  userID,
			Title:   title,
			Message: voucher.Number + " - " + voucher.PartyName,
			Type:    notificationType,
			Read:    false,
		})
	}

	baseURL := getBaseURL(c)

	c.JSON(http.StatusCreated, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"voucher": voucher,
			"pdf_url": baseURL + "/api/v1/vouchers/" + voucher.ID.String() + "/pdf",
		},
	})
}

func (h *InvoicingHandler) ListVouchers(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	vouchers, err := h.repo.ListVouchers(currentUserID(c), c.Query("type"), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "failed to list vouchers"})
		return
	}

	c.JSON(http.StatusOK, domain.APIResponse{Success: true, Data: vouchers})
}

func (h *InvoicingHandler) SubmitManualPayment(c *gin.Context) {
	var req SubmitManualPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: err.Error()})
		return
	}

	invoiceID, err := uuid.Parse(req.InvoiceID)
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "invalid invoice_id"})
		return
	}

	currency := strings.ToUpper(req.Currency)
	if currency == "" {
		currency = "YER"
	}

	proof := &domain.ManualPaymentProof{
		ID:            uuid.New(),
		UserID:        currentUserID(c),
		InvoiceID:     invoiceID,
		Provider:      req.Provider,
		SenderName:    req.SenderName,
		SenderPhone:   req.SenderPhone,
		Amount:        req.Amount,
		Currency:      currency,
		Reference:     req.Reference,
		ScreenshotURL: req.ScreenshotURL,
		Status:        "pending",
	}

	if err := h.repo.CreatePaymentProof(proof); err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "failed to submit payment proof"})
		return
	}

	if h.notificationRepo != nil {
		_ = h.notificationRepo.Create(&domain.Notification{
			ID:      uuid.New(),
			UserID:  proof.UserID,
			Title:   "تم إرسال إثبات دفع",
			Message: proof.Reference,
			Type:    "payment_submitted",
			Read:    false,
		})
	}

	c.JSON(http.StatusCreated, domain.APIResponse{Success: true, Data: proof})
}

func (h *InvoicingHandler) AdminListPaymentProofs(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	proofs, err := h.repo.ListPaymentProofs(c.Query("status"), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "failed to list payment proofs"})
		return
	}

	c.JSON(http.StatusOK, domain.APIResponse{Success: true, Data: proofs})
}

func (h *InvoicingHandler) AdminReviewPaymentProof(c *gin.Context) {
	proofID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "invalid proof id"})
		return
	}

	var req ReviewManualPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: err.Error()})
		return
	}

	proof, err := h.repo.ReviewPaymentProof(proofID, req.Status, req.Note)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.APIResponse{Success: false, Error: "payment proof not found"})
		return
	}

	if h.notificationRepo != nil {
		title := "تمت مراجعة الدفع"
		notificationType := "payment_reviewed"

		if req.Status == "approved" {
			title = "تم قبول الدفع"
			notificationType = "payment_approved"
		}

		if req.Status == "rejected" {
			title = "تم رفض الدفع"
			notificationType = "payment_rejected"
		}

		_ = h.notificationRepo.Create(&domain.Notification{
			ID:      uuid.New(),
			UserID:  proof.UserID,
			Title:   title,
			Message: proof.Reference,
			Type:    notificationType,
			Read:    false,
		})
	}

	if req.Status == "approved" && h.webhookRepo != nil {
		invoice, iErr := h.repo.GetInvoiceByID(proof.InvoiceID)
		if iErr == nil {
			FireWebhook(h.webhookRepo, invoice.UserID, "invoice.paid", invoice)
		}
	}

	c.JSON(http.StatusOK, domain.APIResponse{Success: true, Data: proof})
}

func (h *InvoicingHandler) InvoiceQRInfo(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "invalid invoice id"})
		return
	}

	invoice, err := h.repo.GetInvoiceByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, domain.APIResponse{Success: false, Error: "invoice not found"})
		return
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: map[string]interface{}{
			"invoice_number": invoice.Number,
			"status":         invoice.Status,
			"amount":         invoice.Total,
			"currency":       invoice.Currency,
			"created_at":     invoice.CreatedAt,
			"customer_name":  invoice.CustomerName,
		},
	})
}

func currentUserID(c *gin.Context) uuid.UUID {
	value, _ := c.Get("user_id")
	parsed, err := uuid.Parse(value.(string))
	if err != nil {
		return uuid.Nil
	}
	return parsed
}

func getBaseURL(c *gin.Context) string {
	scheme := "https"
	if c.Request.TLS == nil {
		scheme = "http"
	}

	return scheme + "://" + c.Request.Host
}

func buildQRPayload(invoice *domain.Invoice) string {
	return "YEMENAPI:INVOICE:" + invoice.ID.String() + ":" + invoice.Number + ":" + invoice.Status
}
