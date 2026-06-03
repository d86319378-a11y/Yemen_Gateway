package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"yemenapi/internal/domain"
	"yemenapi/internal/repository"
)

type APIKeyHandler struct {
	repo *repository.APIKeyRepository
}

func NewAPIKeyHandler(repo *repository.APIKeyRepository) *APIKeyHandler {
	return &APIKeyHandler{
		repo: repo,
	}
}

type CreateAPIKeyRequest struct {
	Name string `json:"name"`
}

func (h *APIKeyHandler) List(c *gin.Context) {
	userID := c.GetString("user_id")

	keys, err := h.repo.FindByUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": "failed to load keys",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": keys,
	})
}

func (h *APIKeyHandler) Create(c *gin.Context) {
	userID := c.GetString("user_id")

	var req CreateAPIKeyRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": err.Error(),
		})
		return
	}

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error": "invalid user",
		})
		return
	}

	rawKey := "yg_" + strings.ReplaceAll(uuid.New().String(), "-", "")

	key := &domain.APIKey{
		UserID: uid,
		Name: req.Name,
		Key: rawKey,
		Prefix: rawKey[:12],
		Status: "active",
	}

	if err := h.repo.Create(key); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data": gin.H{
			"id": key.ID,
			"name": key.Name,
			"key": rawKey,
			"prefix": key.Prefix,
			"status": key.Status,
		},
	})
}

func (h *APIKeyHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	if err := h.repo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
	})
}
