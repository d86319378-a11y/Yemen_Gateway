package repository

import (
	"yemenapi/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *domain.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) FindByID(id string) (*domain.User, error) {
	var user domain.User
	err := r.db.Preload("Plan").Where("id = ?", id).First(&user).Error
	return &user, err
}

func (r *UserRepository) FindByEmail(email string) (*domain.User, error) {
	var user domain.User
	err := r.db.Where("email = ?", email).First(&user).Error
	return &user, err
}

func (r *UserRepository) Update(user *domain.User) error {
	return r.db.Save(user).Error
}

func (r *UserRepository) UpdatePlan(userID uuid.UUID, planID uuid.UUID) error {
	return r.db.Model(&domain.User{}).Where("id = ?", userID).Update("plan_id", planID).Error
}

func (r *UserRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&domain.User{}).Count(&count).Error
	return count, err
}

func (r *UserRepository) List(page, perPage int) ([]domain.User, int64, error) {
	var users []domain.User
	var total int64

	offset := (page - 1) * perPage
	err := r.db.Model(&domain.User{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	err = r.db.Preload("Plan").Offset(offset).Limit(perPage).Find(&users).Error
	return users, total, err
}

func (r *UserRepository) Delete(id string) error {
	return r.db.Delete(&domain.User{}, "id = ?", id).Error
}
