package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"

	"yemenapi/internal/config"
	"yemenapi/pkg/logger"
)

type RateLimiter struct {
	redis  *redis.Client
	config *config.RateLimitConfig
}

func NewRateLimiter(redis *redis.Client, cfg *config.RateLimitConfig) *RateLimiter {
	return &RateLimiter{
		redis:  redis,
		config: cfg,
	}
}

func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		key := rl.getKey(c)

		ctx := c.Request.Context()

		// Check current count
		count, err := rl.redis.Get(ctx, key).Int()
		if err != nil && err != redis.Nil {
			logger.Error("rate limiter redis error", zap.Error(err))
			c.Next()
			return
		}

		if count >= rl.config.Requests {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success":     false,
				"error":       fmt.Sprintf("Rate limit exceeded. Maximum %d requests per %d seconds.", rl.config.Requests, rl.config.Window),
				"retry_after": rl.getRetryAfter(ctx, key),
			})
			c.Abort()
			return
		}

		// Increment counter
		pipe := rl.redis.Pipeline()
		pipe.Incr(ctx, key)
		pipe.Expire(ctx, key, time.Duration(rl.config.Window)*time.Second)
		_, _ = pipe.Exec(ctx)

		// Set headers
		c.Header("X-RateLimit-Limit", strconv.Itoa(rl.config.Requests))
		c.Header("X-RateLimit-Remaining", strconv.Itoa(rl.config.Requests-count-1))

		c.Next()
	}
}

func (rl *RateLimiter) MiddlewareByKey(limit int, window int) gin.HandlerFunc {
	return func(c *gin.Context) {
		key := "rate_limit:key:" + c.GetString("api_key_id")

		ctx := c.Request.Context()

		count, err := rl.redis.Get(ctx, key).Int()
		if err != nil && err != redis.Nil {
			c.Next()
			return
		}

		if limit > 0 && count >= limit {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"error":   fmt.Sprintf("API key rate limit exceeded. Maximum %d requests per %d seconds.", limit, window),
			})
			c.Abort()
			return
		}

		pipe := rl.redis.Pipeline()
		pipe.Incr(ctx, key)
		pipe.Expire(ctx, key, time.Duration(window)*time.Second)
		_, _ = pipe.Exec(ctx)

		c.Next()
	}
}

func (rl *RateLimiter) getKey(c *gin.Context) string {
	// Use API key if available, otherwise use IP
	if apiKey := c.GetHeader("X-API-Key"); apiKey != "" {
		return "rate_limit:api:" + apiKey
	}
	return "rate_limit:ip:" + c.ClientIP()
}

func (rl *RateLimiter) getRetryAfter(ctx context.Context, key string) int {
	ttl, err := rl.redis.TTL(ctx, key).Result()
	if err != nil {
		return rl.config.Window
	}

	seconds := int(ttl.Seconds())
	if seconds < 0 {
		return rl.config.Window
	}

	return seconds
}
