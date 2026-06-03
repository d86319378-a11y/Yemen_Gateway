package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"yemenapi/internal/config"
	"yemenapi/internal/domain"
	"yemenapi/internal/middleware"
	"yemenapi/internal/repository"
	"yemenapi/pkg/logger"
)

type AuthHandler struct {
	userRepo *repository.UserRepository
	planRepo *repository.PlanRepository
	jwtCfg   *config.JWTConfig
}

func NewAuthHandler(userRepo *repository.UserRepository, planRepo *repository.PlanRepository, jwtCfg *config.JWTConfig) *AuthHandler {
	return &AuthHandler{
		userRepo: userRepo,
		planRepo: planRepo,
		jwtCfg:   jwtCfg,
	}
}

type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=100"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Company  string `json:"company"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: err.Error()})
		return
	}

	// Check if email exists
	_, err := h.userRepo.FindByEmail(req.Email)
	if err == nil {
		c.JSON(http.StatusConflict, domain.APIResponse{Success: false, Error: "Email already registered"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.Error("failed to hash password", logger.With()...)
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to create account"})
		return
	}

	// Get free plan
	freePlan, err := h.planRepo.FindBySlug("free")
	if err != nil {
		logger.Error("failed to find free plan", logger.With()...)
	}

	user := &domain.User{
		ID:       uuid.New(),
		Email:    req.Email,
		Password: string(hashedPassword),
		Name:     req.Name,
		Company:  req.Company,
		Role:     "developer",
		Active:   true,
	}

	if freePlan != nil {
		user.PlanID = &freePlan.ID
	}

	if err := h.userRepo.Create(user); err != nil {
		logger.Error("failed to create user", logger.With()...)
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to create account"})
		return
	}

	// Generate JWT
	token, expiresAt, err := middleware.GenerateToken(user.ID.String(), user.Role, h.jwtCfg.Secret, h.jwtCfg.Expiry)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, domain.APIResponse{
		Success: true,
		Data: domain.AuthResponse{
			Token:     token,
			ExpiresAt: expiresAt,
			User:      *user,
		},
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, domain.APIResponse{Success: false, Error: err.Error()})
		return
	}

	user, err := h.userRepo.FindByEmail(req.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, domain.APIResponse{Success: false, Error: "Invalid email or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, domain.APIResponse{Success: false, Error: "Invalid email or password"})
		return
	}

	if !user.Active {
		c.JSON(http.StatusForbidden, domain.APIResponse{Success: false, Error: "Account is suspended"})
		return
	}

	// Generate JWT
	token, expiresAt, err := middleware.GenerateToken(user.ID.String(), user.Role, h.jwtCfg.Secret, h.jwtCfg.Expiry)
	if err != nil {
		c.JSON(http.StatusInternalServerError, domain.APIResponse{Success: false, Error: "Failed to generate token"})
		return
	}

	// Don't return password
	user.Password = ""

	c.JSON(http.StatusOK, domain.APIResponse{
		Success: true,
		Data: domain.AuthResponse{
			Token:     token,
			ExpiresAt: expiresAt,
			User:      *user,
		},
	})
}

func (h *AuthHandler) Me(c *gin.Context) {
	userID, _ := c.Get("user_id")
	
	user, err := h.userRepo.FindByID(userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, domain.APIResponse{Success: false, Error: "User not found"})
		return
	}

	user.Password = ""
	c.JSON(http.StatusOK, domain.APIResponse{Success: true, Data: user})
}
