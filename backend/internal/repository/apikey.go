package repository

import (
	"time"
	"yemenapi/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type APIKeyRepository struct {
	db *gorm.DB
}

func NewAPIKeyRepository(db *gorm.DB) *APIKeyRepository {
	return &APIKeyRepository{db: db}
}

func (r *APIKeyRepository) Create(key *domain.APIKey) error {
	return r.db.Create(key).Error
}

func (r *APIKeyRepository) FindByID(id string) (*domain.APIKey, error) {
	var key domain.APIKey
	err := r.db.Where("id = ?", id).First(&key).Error
	return &key, err
}

func (r *APIKeyRepository) FindByKey(keyStr string) (*domain.APIKey, error) {
	var key domain.APIKey
	err := r.db.Where("key = ?", keyStr).First(&key).Error
	return &key, err
}

func (r *APIKeyRepository) FindByUser(userID string) ([]domain.APIKey, error) {
	var keys []domain.APIKey
	err := r.db.Where("user_id = ?", userID).Find(&keys).Error
	return keys, err
}

func (r *APIKeyRepository) Update(key *domain.APIKey) error {
	return r.db.Save(key).Error
}

func (r *APIKeyRepository) UpdateLastUsed(id string) error {
	now := time.Now()
	return r.db.Model(&domain.APIKey{}).Where("id = ?", id).Updates(map[string]interface{}{
		"last_used_at": now,
		"usage_count":  gorm.Expr("usage_count + 1"),
	}).Error
}

func (r *APIKeyRepository) UpdateStatus(id string, status string) error {
	return r.db.Model(&domain.APIKey{}).Where("id = ?", id).Update("status", status).Error
}

func (r *APIKeyRepository) Delete(id string) error {
	return r.db.Delete(&domain.APIKey{}, "id = ?", id).Error
}

func (r *APIKeyRepository) CountByUser(userID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.Model(&domain.APIKey{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}
