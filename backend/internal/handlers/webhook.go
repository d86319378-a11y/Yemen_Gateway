package handlers

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
	"yemenapi/internal/domain"
	"yemenapi/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type WebhookHandler struct {
	repo *repository.WebhookRepository
}

func NewWebhookHandler(repo *repository.WebhookRepository) *WebhookHandler {
	return &WebhookHandler{repo: repo}
}

type CreateWebhookRequest struct {
	URL    string   `json:"url" binding:"required,url"`
	Events []string `json:"events" binding:"required,min=1"`
}

func (h *WebhookHandler) Create(c *gin.Context) {
	var req CreateWebhookRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: err.Error()})
		return
	}
	secret := fmt.Sprintf("%x", sha256.Sum256([]byte(uuid.New().String())))
	wh := &domain.WebhookConfig{
		ID:     uuid.New(),
		UserID: currentUserID(c),
		URL:    req.URL,
		Events: joinEvents(req.Events),
		Secret: secret,
		Active: true,
	}
	if err := h.repo.Create(wh); err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "failed to create webhook"})
		return
	}
	c.JSON(http.StatusCreated, domain.APIResponse{Success: true, Data: map[string]interface{}{
		"webhook": wh,
		"secret":  secret,
	}})
}

func (h *WebhookHandler) List(c *gin.Context) {
	list, err := h.repo.List(currentUserID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "failed to list webhooks"})
		return
	}
	c.JSON(http.StatusOK, domain.APIResponse{Success: true, Data: list})
}

func (h *WebhookHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "invalid webhook id"})
		return
	}
	if err := h.repo.Delete(currentUserID(c), id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "failed to delete webhook"})
		return
	}
	c.JSON(http.StatusOK, domain.APIResponse{Success: true, Data: "deleted"})
}

// FireWebhook sends a webhook event asynchronously
func FireWebhook(repo *repository.WebhookRepository, userID uuid.UUID, event string, payload interface{}) {
	go func() {
		hooks, err := repo.FindByUserAndEvent(userID, event)
		if err != nil || len(hooks) == 0 {
			return
		}
		body, _ := json.Marshal(map[string]interface{}{
			"event":     event,
			"timestamp": time.Now().UTC(),
			"data":      payload,
		})
		for _, hook := range hooks {
			deliverWebhook(repo, hook, event, body)
		}
	}()
}

func deliverWebhook(repo *repository.WebhookRepository, hook domain.WebhookConfig, event string, body []byte) {
	mac := hmac.New(sha256.New, []byte(hook.Secret))
	mac.Write(body)
	sig := hex.EncodeToString(mac.Sum(nil))

	req, err := http.NewRequest("POST", hook.URL, bytes.NewReader(body))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Yemen-Signature", "sha256="+sig)
	req.Header.Set("X-Yemen-Event", event)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)

	delivery := &domain.WebhookDelivery{
		ID:          uuid.New(),
		WebhookID:   hook.ID,
		Event:       event,
		Payload:     string(body),
		AttemptedAt: time.Now(),
	}
	if err != nil {
		delivery.Success = false
		delivery.ResponseBody = err.Error()
	} else {
		defer resp.Body.Close()
		delivery.StatusCode = resp.StatusCode
		delivery.Success = resp.StatusCode >= 200 && resp.StatusCode < 300
	}
	_ = repo.LogDelivery(delivery)
}

func joinEvents(events []string) string {
	result := ""
	for i, e := range events {
		if i > 0 {
			result += ","
		}
		result += e
	}
	return result
}
