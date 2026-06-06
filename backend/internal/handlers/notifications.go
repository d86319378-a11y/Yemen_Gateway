package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"yemenapi/internal/domain"
	"yemenapi/internal/repository"
)

type NotificationHandler struct {
	repo *repository.NotificationRepository
}

func NewNotificationHandler(repo *repository.NotificationRepository) *NotificationHandler {
	return &NotificationHandler{repo: repo}
}

func (h *NotificationHandler) List(c *gin.Context) {
	userID := c.GetString("user_id")

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.APIResponse{Success: false, Error: "Invalid user"})
		return
	}

	limit := 50
	if q := c.Query("limit"); q != "" {
		if parsed, err := strconv.Atoi(q); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	notifications, err := h.repo.ListByUser(uid, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to load notifications"})
		return
	}

	unread, _ := h.repo.CountUnread(uid)

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: gin.H{
			"notifications": notifications,
			"unread_count":  unread,
		},
	})
}

func (h *NotificationHandler) CountUnread(c *gin.Context) {
	userID := c.GetString("user_id")

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.APIResponse{Success: false, Error: "Invalid user"})
		return
	}

	count, err := h.repo.CountUnread(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to count notifications"})
		return
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: gin.H{
			"unread_count": count,
		},
	})
}

func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	userID := c.GetString("user_id")

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.APIResponse{Success: false, Error: "Invalid user"})
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "Invalid notification id"})
		return
	}

	if err := h.repo.MarkAsRead(id, uid); err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to mark notification as read"})
		return
	}

	c.JSON(http.StatusOK, domain.APIResponse{Success: true})
}

func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
	userID := c.GetString("user_id")

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.APIResponse{Success: false, Error: "Invalid user"})
		return
	}

	if err := h.repo.MarkAllAsRead(uid); err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to mark all notifications as read"})
		return
	}

	c.JSON(http.StatusOK, domain.APIResponse{Success: true})
}

func (h *NotificationHandler) Delete(c *gin.Context) {
	userID := c.GetString("user_id")

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.APIResponse{Success: false, Error: "Invalid user"})
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: "Invalid notification id"})
		return
	}

	if err := h.repo.Delete(id, uid); err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to delete notification"})
		return
	}

	c.JSON(http.StatusOK, domain.APIResponse{Success: true})
}
