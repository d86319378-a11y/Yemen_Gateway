package repository

import (
	"strings"
	"yemenapi/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type WebhookRepository struct {
	db *gorm.DB
}

func NewWebhookRepository(db *gorm.DB) *WebhookRepository {
	return &WebhookRepository{db: db}
}

func (r *WebhookRepository) Create(wh *domain.WebhookConfig) error {
	return r.db.Create(wh).Error
}

func (r *WebhookRepository) List(userID uuid.UUID) ([]domain.WebhookConfig, error) {
	var list []domain.WebhookConfig
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&list).Error
	return list, err
}

func (r *WebhookRepository) Delete(userID uuid.UUID, id uuid.UUID) error {
	return r.db.Where("user_id = ? AND id = ?", userID, id).Delete(&domain.WebhookConfig{}).Error
}

// FindByEvent returns all active webhooks for users listening to a specific event
func (r *WebhookRepository) FindByUserAndEvent(userID uuid.UUID, event string) ([]domain.WebhookConfig, error) {
	var all []domain.WebhookConfig
	if err := r.db.Where("user_id = ? AND active = true", userID).Find(&all).Error; err != nil {
		return nil, err
	}
	var matched []domain.WebhookConfig
	for _, wh := range all {
		for _, e := range strings.Split(wh.Events, ",") {
			if strings.TrimSpace(e) == event {
				matched = append(matched, wh)
				break
			}
		}
	}
	return matched, nil
}

func (r *WebhookRepository) LogDelivery(d *domain.WebhookDelivery) error {
	return r.db.Create(d).Error
}
