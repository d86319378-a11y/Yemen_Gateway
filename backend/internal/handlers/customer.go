package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"yemenapi/internal/domain"
	"yemenapi/internal/repository"
)

type CustomerHandler struct {
	repo             *repository.CustomerRepository
	notificationRepo *repository.NotificationRepository
}

func NewCustomerHandler(repo *repository.CustomerRepository) *CustomerHandler {
	return &CustomerHandler{
		repo: repo,
	}
}

func NewCustomerHandlerWithNotifications(
	repo *repository.CustomerRepository,
	notificationRepo *repository.NotificationRepository,
) *CustomerHandler {
	return &CustomerHandler{
		repo:             repo,
		notificationRepo: notificationRepo,
	}
}

type CreateCustomerRequest struct {
	Name    string `json:"name" binding:"required"`
	Phone   string `json:"phone"`
	Email   string `json:"email"`
	Address string `json:"address"`
	Notes   string `json:"notes"`
}

type UpdateCustomerRequest struct {
	Name    string `json:"name" binding:"required"`
	Phone   string `json:"phone"`
	Email   string `json:"email"`
	Address string `json:"address"`
	Notes   string `json:"notes"`
}

func (h *CustomerHandler) List(c *gin.Context) {
	userID := c.GetString("user_id")

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.APIResponse{
			Success: false,
			Error:   "invalid user",
		})
		return
	}

	customers, err := h.repo.ListByUser(uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{
			Success: false,
			Error:   "failed to load customers",
		})
		return
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data:    customers,
	})
}

func (h *CustomerHandler) Create(c *gin.Context) {
	userID := c.GetString("user_id")

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.APIResponse{
			Success: false,
			Error:   "invalid user",
		})
		return
	}

	var req CreateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	customer := &domain.Customer{
		ID:      uuid.New(),
		UserID:  uid,
		Name:    req.Name,
		Phone:   req.Phone,
		Email:   req.Email,
		Address: req.Address,
		Notes:   req.Notes,
	}

	if err := h.repo.Create(customer); err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{
			Success: false,
			Error:   "failed to create customer",
		})
		return
	}

	if h.notificationRepo != nil {
		_ = h.notificationRepo.Create(&domain.Notification{
			ID:      uuid.New(),
			UserID:  uid,
			Title:   "تم إنشاء عميل جديد",
			Message: customer.Name,
			Type:    "customer_created",
			Read:    false,
		})
	}

	c.JSON(http.StatusCreated, domain.APIResponse{
		Success: true,
		Data:    customer,
	})
}

func (h *CustomerHandler) Update(c *gin.Context) {
	userID := c.GetString("user_id")

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.APIResponse{
			Success: false,
			Error:   "invalid user",
		})
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{
			Success: false,
			Error:   "invalid customer id",
		})
		return
	}

	var req UpdateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	customer, err := h.repo.GetByID(id)
	if err != nil || customer.UserID != uid {
		c.JSON(http.StatusNotFound, domain.APIResponse{
			Success: false,
			Error:   "customer not found",
		})
		return
	}

	customer.Name = req.Name
	customer.Phone = req.Phone
	customer.Email = req.Email
	customer.Address = req.Address
	customer.Notes = req.Notes

	if err := h.repo.Update(customer); err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{
			Success: false,
			Error:   "failed to update customer",
		})
		return
	}

	if h.notificationRepo != nil {
		_ = h.notificationRepo.Create(&domain.Notification{
			ID:      uuid.New(),
			UserID:  uid,
			Title:   "تم تعديل بيانات عميل",
			Message: customer.Name,
			Type:    "customer_updated",
			Read:    false,
		})
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data:    customer,
	})
}

func (h *CustomerHandler) Delete(c *gin.Context) {
	userID := c.GetString("user_id")

	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.APIResponse{
			Success: false,
			Error:   "invalid user",
		})
		return
	}

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{
			Success: false,
			Error:   "invalid customer id",
		})
		return
	}

	customer, err := h.repo.GetByID(id)
	if err != nil || customer.UserID != uid {
		c.JSON(http.StatusNotFound, domain.APIResponse{
			Success: false,
			Error:   "customer not found",
		})
		return
	}

	customerName := customer.Name

	if err := h.repo.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{
			Success: false,
			Error:   "failed to delete customer",
		})
		return
	}

	if h.notificationRepo != nil {
		_ = h.notificationRepo.Create(&domain.Notification{
			ID:      uuid.New(),
			UserID:  uid,
			Title:   "تم حذف عميل",
			Message: customerName,
			Type:    "customer_deleted",
			Read:    false,
		})
	}

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
	})
}
