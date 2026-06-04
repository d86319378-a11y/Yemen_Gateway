package repository

import (
	"github.com/google/uuid"
	"gorm.io/gorm"

	"yemenapi/internal/domain"
)

type CustomerRepository struct {
	db *gorm.DB
}

func NewCustomerRepository(db *gorm.DB) *CustomerRepository {
	return &CustomerRepository{
		db: db,
	}
}

func (r *CustomerRepository) Create(customer *domain.Customer) error {
	return r.db.Create(customer).Error
}

func (r *CustomerRepository) GetByID(id uuid.UUID) (*domain.Customer, error) {
	var customer domain.Customer

	err := r.db.
		Where("id = ?", id).
		First(&customer).Error

	if err != nil {
		return nil, err
	}

	return &customer, nil
}

func (r *CustomerRepository) ListByUser(userID uuid.UUID) ([]domain.Customer, error) {
	var customers []domain.Customer

	err := r.db.
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&customers).Error

	return customers, err
}

func (r *CustomerRepository) Update(customer *domain.Customer) error {
	return r.db.Save(customer).Error
}

func (r *CustomerRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&domain.Customer{}, "id = ?", id).Error
}
