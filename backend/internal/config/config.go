package config

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
	Rate     RateLimitConfig
	Metrics  MetricsConfig
}

type ServerConfig struct {
	Port string
	Env  string
}

type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type RedisConfig struct {
	Host     string
	Port     int
	Password string
	DB       int
}

type JWTConfig struct {
	Secret        string
	Expiry        time.Duration
	RefreshExpiry time.Duration
}

type RateLimitConfig struct {
	Requests int
	Window   int
}

type MetricsConfig struct {
	Enabled bool
	Port    string
}

func Load() *Config {
	databaseConfig := loadDatabaseConfig()
	redisConfig := loadRedisConfig()

	return &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", getEnv("PORT", "8080")),
			Env:  getEnv("SERVER_ENV", "development"),
		},
		Database: databaseConfig,
		Redis:    redisConfig,
		JWT: JWTConfig{
			Secret:        getEnv("JWT_SECRET", "yemen-api-jwt-secret-change-me"),
			Expiry:        getEnvAsDuration("JWT_EXPIRY", 24*time.Hour),
			RefreshExpiry: getEnvAsDuration("JWT_REFRESH_EXPIRY", 168*time.Hour),
		},
		Rate: RateLimitConfig{
			Requests: getEnvAsInt("RATE_LIMIT_REQUESTS", 100),
			Window:   getEnvAsInt("RATE_LIMIT_WINDOW", 60),
		},
		Metrics: MetricsConfig{
			Enabled: getEnvAsBool("METRICS_ENABLED", true),
			Port:    getEnv("METRICS_PORT", "9090"),
		},
	}
}

func loadDatabaseConfig() DatabaseConfig {
	if rawURL := getEnv("DATABASE_URL", ""); rawURL != "" {
		if parsed, err := url.Parse(rawURL); err == nil {
			password, _ := parsed.User.Password()
			sslMode := getEnv("DATABASE_SSLMODE", "require")
			if querySSL := parsed.Query().Get("sslmode"); querySSL != "" {
				sslMode = querySSL
			}

			return DatabaseConfig{
				Host:     parsed.Hostname(),
				Port:     parsePort(parsed.Port(), 5432),
				User:     parsed.User.Username(),
				Password: password,
				DBName:   strings.TrimPrefix(parsed.Path, "/"),
				SSLMode:  sslMode,
			}
		}
	}

	return DatabaseConfig{
		Host:     getEnv("DATABASE_HOST", "localhost"),
		Port:     getEnvAsInt("DATABASE_PORT", 5432),
		User:     getEnv("DATABASE_USER", "yemenapi"),
		Password: getEnv("DATABASE_PASSWORD", "yemenapi_secret"),
		DBName:   getEnv("DATABASE_NAME", "yemenapi_db"),
		SSLMode:  getEnv("DATABASE_SSLMODE", "disable"),
	}
}

func loadRedisConfig() RedisConfig {
	if rawURL := getEnv("REDIS_URL", ""); rawURL != "" {
		if parsed, err := url.Parse(rawURL); err == nil {
			password, _ := parsed.User.Password()
			db := 0
			if path := strings.TrimPrefix(parsed.Path, "/"); path != "" {
				if parsedDB, err := strconv.Atoi(path); err == nil {
					db = parsedDB
				}
			}

			return RedisConfig{
				Host:     parsed.Hostname(),
				Port:     parsePort(parsed.Port(), 6379),
				Password: password,
				DB:       db,
			}
		}
	}

	return RedisConfig{
		Host:     getEnv("REDIS_HOST", "localhost"),
		Port:     getEnvAsInt("REDIS_PORT", 6379),
		Password: getEnv("REDIS_PASSWORD", ""),
		DB:       getEnvAsInt("REDIS_DB", 0),
	}
}

func parsePort(value string, fallback int) int {
	if value == "" {
		return fallback
	}
	if port, err := strconv.Atoi(value); err == nil {
		return port
	}
	return fallback
}

func (c *DatabaseConfig) DSN() string {
	return fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode)
}

func (c *RedisConfig) Addr() string {
	return fmt.Sprintf("%s:%d", c.Host, c.Port)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolVal, err := strconv.ParseBool(value); err == nil {
			return boolVal
		}
	}
	return defaultValue
}

func getEnvAsDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}
