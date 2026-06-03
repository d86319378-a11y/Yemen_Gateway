package repository

import (
	"fmt"
	"time"
	"yemenapi/internal/domain"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InvoicingRepository struct {
	db *gorm.DB
}

func NewInvoicingRepository(db *gorm.DB) *InvoicingRepository {
	return &InvoicingRepository{db: db}
}

func (r *InvoicingRepository) NextNumber(prefix string) string {
	return fmt.Sprintf("%s-%s-%06d", prefix, time.Now().Format("20060102"), time.Now().UnixNano()%1000000)
}

func (r *InvoicingRepository) CreateInvoice(invoice *domain.Invoice) error {
	return r.db.Create(invoice).Error
}

func (r *InvoicingRepository) GetInvoice(userID uuid.UUID, id uuid.UUID) (*domain.Invoice, error) {
	var invoice domain.Invoice
	err := r.db.Preload("Items").Where("user_id = ? AND id = ?", userID, id).First(&invoice).Error
	return &invoice, err
}

func (r *InvoicingRepository) ListInvoices(userID uuid.UUID, status string, limit int) ([]domain.Invoice, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	q := r.db.Preload("Items").Where("user_id = ?", userID).Order("created_at DESC").Limit(limit)
	if status != "" {
		q = q.Where("status = ?", status)
	}
	var invoices []domain.Invoice
	return invoices, q.Find(&invoices).Error
}

func (r *InvoicingRepository) UpdateInvoiceStatus(userID uuid.UUID, id uuid.UUID, status string) (*domain.Invoice, error) {
	invoice, err := r.GetInvoice(userID, id)
	if err != nil {
		return nil, err
	}
	invoice.Status = status
	if status == "paid" {
		now := time.Now()
		invoice.PaidAt = &now
	}
	return invoice, r.db.Save(invoice).Error
}

func (r *InvoicingRepository) CreateVoucher(voucher *domain.AccountingVoucher) error {
	return r.db.Create(voucher).Error
}

func (r *InvoicingRepository) ListVouchers(userID uuid.UUID, voucherType string, limit int) ([]domain.AccountingVoucher, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	q := r.db.Where("user_id = ?", userID).Order("created_at DESC").Limit(limit)
	if voucherType != "" {
		q = q.Where("type = ?", voucherType)
	}
	var vouchers []domain.AccountingVoucher
	return vouchers, q.Find(&vouchers).Error
}

func (r *InvoicingRepository) CreatePaymentProof(proof *domain.ManualPaymentProof) error {
	return r.db.Create(proof).Error
}

func (r *InvoicingRepository) ListPaymentProofs(status string, limit int) ([]domain.ManualPaymentProof, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	q := r.db.Where("1=1").Order("created_at DESC").Limit(limit)
	if status != "" {
		q = q.Where("status = ?", status)
	}
	var proofs []domain.ManualPaymentProof
	return proofs, q.Find(&proofs).Error
}

func (r *InvoicingRepository) GetInvoiceByID(id uuid.UUID) (*domain.Invoice, error) {
	var invoice domain.Invoice
	err := r.db.Preload("Items").Where("id = ?", id).First(&invoice).Error
	return &invoice, err
}

func (r *InvoicingRepository) GetStats(userID uuid.UUID) (*domain.InvoicingStats, error) {
	stats := &domain.InvoicingStats{}
	r.db.Model(&domain.Invoice{}).Where("user_id = ?", userID).Count(&stats.TotalInvoices)
	r.db.Model(&domain.Invoice{}).Where("user_id = ? AND status = 'paid'", userID).Count(&stats.PaidInvoices)
	r.db.Model(&domain.Invoice{}).Where("user_id = ? AND status = 'unpaid'", userID).Count(&stats.UnpaidInvoices)
	r.db.Model(&domain.Invoice{}).Where("user_id = ? AND status = 'cancelled'", userID).Count(&stats.CancelledInvoices)
	r.db.Model(&domain.Invoice{}).Where("user_id = ? AND status = 'paid'", userID).Select("COALESCE(SUM(total),0)").Scan(&stats.TotalRevenue)
	r.db.Model(&domain.ManualPaymentProof{}).Where("user_id = ? AND status = 'pending'", userID).Count(&stats.PendingPayments)
	r.db.Model(&domain.AccountingVoucher{}).Where("user_id = ?", userID).Count(&stats.TotalVouchers)
	return stats, nil
}

func (r *InvoicingRepository) ReviewPaymentProof(proofID uuid.UUID, status string, note string) (*domain.ManualPaymentProof, error) {
	var proof domain.ManualPaymentProof
	if err := r.db.First(&proof, "id = ?", proofID).Error; err != nil {
		return nil, err
	}
	now := time.Now()
	proof.Status = status
	proof.AdminNote = note
	proof.ReviewedAt = &now

	err := r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&proof).Error; err != nil {
			return err
		}
		if status == "approved" {
			return tx.Model(&domain.Invoice{}).Where("id = ?", proof.InvoiceID).Updates(map[string]interface{}{
				"status":  "paid",
				"paid_at": now,
			}).Error
		}
		return nil
	})
	return &proof, err
}
