package repository

import (
	"time"
	"yemenapi/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RequestLogRepository struct {
	db *gorm.DB
}

func NewRequestLogRepository(db *gorm.DB) *RequestLogRepository {
	return &RequestLogRepository{db: db}
}

func (r *RequestLogRepository) Create(log *domain.RequestLog) error {
	return r.db.Create(log).Error
}

func (r *RequestLogRepository) GetStats(userID uuid.UUID, from, to time.Time) (map[string]interface{}, error) {
	var totalRequests int64
	var successCount int64
	var errorCount int64
	var avgLatency float64

	err := r.db.Model(&domain.RequestLog{}).
		Where("user_id = ? AND created_at BETWEEN ? AND ?", userID, from, to).
		Count(&totalRequests).Error
	if err != nil {
		return nil, err
	}

	err = r.db.Model(&domain.RequestLog{}).
		Where("user_id = ? AND status_code >= 200 AND status_code < 300 AND created_at BETWEEN ? AND ?", userID, from, to).
		Count(&successCount).Error
	if err != nil {
		return nil, err
	}

	err = r.db.Model(&domain.RequestLog{}).
		Where("user_id = ? AND status_code >= 400 AND created_at BETWEEN ? AND ?", userID, from, to).
		Count(&errorCount).Error
	if err != nil {
		return nil, err
	}

	row := r.db.Model(&domain.RequestLog{}).
		Select("COALESCE(AVG(latency), 0)").
		Where("user_id = ? AND created_at BETWEEN ? AND ?", userID, from, to).
		Row()
	row.Scan(&avgLatency)

	successRate := float64(0)
	if totalRequests > 0 {
		successRate = float64(successCount) / float64(totalRequests) * 100
	}

	return map[string]interface{}{
		"total_requests": totalRequests,
		"success_count":  successCount,
		"error_count":    errorCount,
		"success_rate":   successRate,
		"avg_latency":    avgLatency,
	}, nil
}

func (r *RequestLogRepository) GetEndpointStats(userID uuid.UUID, from, to time.Time) ([]map[string]interface{}, error) {
	var results []map[string]interface{}
	
	err := r.db.Model(&domain.RequestLog{}).
		Select("method, path, COUNT(*) as count, AVG(latency) as avg_latency").
		Where("user_id = ? AND created_at BETWEEN ? AND ?", userID, from, to).
		Group("method, path").
		Order("count DESC").
		Scan(&results).Error
	
	return results, err
}

func (r *RequestLogRepository) ListByUser(userID uuid.UUID, page, perPage int) ([]domain.RequestLog, int64, error) {
	var logs []domain.RequestLog
	var total int64

	offset := (page - 1) * perPage

	err := r.db.Model(&domain.RequestLog{}).Where("user_id = ?", userID).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = r.db.Where("user_id = ?", userID).Order("created_at DESC").Offset(offset).Limit(perPage).Find(&logs).Error
	return logs, total, err
}

func (r *RequestLogRepository) GetRecentErrors(limit int) ([]domain.RequestLog, error) {
	var logs []domain.RequestLog
	err := r.db.Where("status_code >= ?", 400).Order("created_at DESC").Limit(limit).Find(&logs).Error
	return logs, err
}
