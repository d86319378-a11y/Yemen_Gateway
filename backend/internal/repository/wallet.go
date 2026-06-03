package repository

import (
	"yemenapi/internal/domain"

	"gorm.io/gorm"
)

type WalletRepository struct {
	db *gorm.DB
}

func NewWalletRepository(db *gorm.DB) *WalletRepository {
	return &WalletRepository{db: db}
}

func (r *WalletRepository) List() ([]domain.WalletProvider, error) {
	var wallets []domain.WalletProvider
	err := r.db.Find(&wallets).Error
	return wallets, err
}

func (r *WalletRepository) FindBySlug(slug string) (*domain.WalletProvider, error) {
	var wallet domain.WalletProvider
	err := r.db.Where("slug = ?", slug).First(&wallet).Error
	return &wallet, err
}

func (r *WalletRepository) Create(wallet *domain.WalletProvider) error {
	return r.db.Create(wallet).Error
}

func (r *WalletRepository) Update(wallet *domain.WalletProvider) error {
	return r.db.Save(wallet).Error
}
