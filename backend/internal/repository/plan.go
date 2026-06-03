package repository

import (
	"yemenapi/internal/domain"

	"gorm.io/gorm"
)

type PlanRepository struct {
	db *gorm.DB
}

func NewPlanRepository(db *gorm.DB) *PlanRepository {
	return &PlanRepository{db: db}
}

func (r *PlanRepository) FindBySlug(slug string) (*domain.Plan, error) {
	var plan domain.Plan
	err := r.db.Where("slug = ?", slug).First(&plan).Error
	return &plan, err
}

func (r *PlanRepository) List() ([]domain.Plan, error) {
	var plans []domain.Plan
	err := r.db.Find(&plans).Error
	return plans, err
}

func (r *PlanRepository) Create(plan *domain.Plan) error {
	return r.db.Create(plan).Error
}

func (r *PlanRepository) Update(plan *domain.Plan) error {
	return r.db.Save(plan).Error
}

func (r *PlanRepository) Delete(id string) error {
	return r.db.Delete(&domain.Plan{}, "id = ?", id).Error
}
