package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"yemenapi/internal/config"
	"yemenapi/internal/repository"
)

type AuthMiddleware struct {
	jwtConfig *config.JWTConfig
	userRepo  *repository.UserRepository
	keyRepo   *repository.APIKeyRepository
}

func NewAuthMiddleware(cfg *config.JWTConfig, userRepo *repository.UserRepository, keyRepo *repository.APIKeyRepository) *AuthMiddleware {
	return &AuthMiddleware{
		jwtConfig: cfg,
		userRepo:  userRepo,
		keyRepo:   keyRepo,
	}
}

func (am *AuthMiddleware) JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Authorization header required"})
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		tokenStr := parts[1]
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(am.jwtConfig.Secret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Invalid or expired token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Invalid token claims"})
			c.Abort()
			return
		}

		userID, ok := claims["user_id"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Invalid user ID in token"})
			c.Abort()
			return
		}

		c.Set("user_id", userID)
		c.Set("user_role", claims["role"])
		c.Next()
	}
}

func (am *AuthMiddleware) APIKeyAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		apiKey := c.GetHeader("X-API-Key")
		if apiKey == "" {
			apiKey = c.Query("api_key")
		}

		if apiKey == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "API key required. Provide it via X-API-Key header or api_key query parameter"})
			c.Abort()
			return
		}

		key, err := am.keyRepo.FindByKey(apiKey)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Invalid API key"})
			c.Abort()
			return
		}

		if key.Status != "active" {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "API key is " + key.Status})
			c.Abort()
			return
		}

		_ = am.keyRepo.UpdateLastUsed(key.ID.String())

		c.Set("api_key_id", key.ID.String())
		c.Set("user_id", key.UserID.String())
		c.Set("api_key", key)
		c.Next()
	}
}

func (am *AuthMiddleware) AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("user_role")
		if !exists || role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Admin access required"})
			c.Abort()
			return
		}
		c.Next()
	}
}

func (am *AuthMiddleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
				tokenStr := parts[1]
				token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
					return []byte(am.jwtConfig.Secret), nil
				})
				if err == nil && token.Valid {
					if claims, ok := token.Claims.(jwt.MapClaims); ok {
						if userID, ok := claims["user_id"].(string); ok {
							c.Set("user_id", userID)
							c.Set("user_role", claims["role"])
						}
					}
				}
			}
		}
		c.Next()
	}
}

func GenerateToken(userID string, role string, secret string, expiry time.Duration) (string, time.Time, error) {
	expiresAt := time.Now().Add(expiry)
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     expiresAt.Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expiresAt, nil
}
