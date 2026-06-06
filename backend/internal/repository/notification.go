package repository

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	"yemenapi/internal/domain"
)

type NotificationRepository struct {
	db *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) *NotificationRepository {
	return &NotificationRepository{db: db}
}

func (r *NotificationRepository) Create(notification *domain.Notification) error {
	return r.db.Create(notification).Error
}

func (r *NotificationRepository) ListByUser(userID uuid.UUID, limit int) ([]domain.Notification, error) {
	var notifications []domain.Notification

	if limit <= 0 {
		limit = 50
	}

	err := r.db.
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Find(&notifications).Error

	return notifications, err
}

func (r *NotificationRepository) CountUnread(userID uuid.UUID) (int64, error) {
	var count int64

	err := r.db.
		Model(&domain.Notification{}).
		Where("user_id = ? AND read = ?", userID, false).
		Count(&count).Error

	return count, err
}

func (r *NotificationRepository) MarkAsRead(id uuid.UUID, userID uuid.UUID) error {
	return r.db.
		Model(&domain.Notification{}).
		Where("id = ? AND user_id = ?", id, userID).
		Update("read", true).Error
}

func (r *NotificationRepository) MarkAllAsRead(userID uuid.UUID) error {
	return r.db.
		Model(&domain.Notification{}).
		Where("user_id = ? AND read = ?", userID, false).
		Update("read", true).Error
}

func (r *NotificationRepository) Delete(id uuid.UUID, userID uuid.UUID) error {
	return r.db.
		Where("id = ? AND user_id = ?", id, userID).
		Delete(&domain.Notification{}).Error
}
