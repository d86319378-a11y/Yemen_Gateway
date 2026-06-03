package repository

import (
	"yemenapi/internal/domain"

	"gorm.io/gorm"
)

type CurrencyRepository struct {
	db *gorm.DB
}

func NewCurrencyRepository(db *gorm.DB) *CurrencyRepository {
	return &CurrencyRepository{db: db}
}

func (r *CurrencyRepository) GetAllRates() ([]domain.CurrencyRate, error) {
	var rates []domain.CurrencyRate
	err := r.db.Where("to_code = ?", "YER").Find(&rates).Error
	return rates, err
}

func (r *CurrencyRepository) GetRate(from, to string) (*domain.CurrencyRate, error) {
	var rate domain.CurrencyRate
	err := r.db.Where("from_code = ? AND to_code = ?", from, to).Order("created_at DESC").First(&rate).Error
	return &rate, err
}

func (r *CurrencyRepository) Create(rate *domain.CurrencyRate) error {
	return r.db.Create(rate).Error
}

func (r *CurrencyRepository) UpdateRate(from, to string, rate float64) error {
	return r.db.Model(&domain.CurrencyRate{}).
		Where("from_code = ? AND to_code = ?", from, to).
		Update("rate", rate).Error
}
