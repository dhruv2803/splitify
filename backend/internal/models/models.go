package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	UID         string         `gorm:"primaryKey" json:"uid"`
	Email       string         `gorm:"uniqueIndex;not null" json:"email"`
	DisplayName string         `json:"displayName"`
	PhotoURL            string         `json:"photoURL"`
	Currency            string         `gorm:"default:'INR'" json:"currency"`
	OnboardingCompleted bool           `gorm:"default:false" json:"onboardingCompleted"`
	IsAdmin             bool           `gorm:"default:false" json:"isAdmin"`
	CreatedAt           time.Time      `json:"createdAt"`
	UpdatedAt           time.Time      `json:"updatedAt"`
	DeletedAt           gorm.DeletedAt `gorm:"index" json:"-"`
}

type Account struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	Name           string         `gorm:"not null" json:"name"`
	Type           string         `gorm:"not null" json:"type"` // wallet, card, bank
	InitialBalance float64        `gorm:"not null" json:"initialBalance"`
	CurrentBalance float64        `gorm:"not null" json:"currentBalance"`
	UserID         string         `gorm:"index;not null" json:"userId"`
	Color          string         `json:"color"`
	Icon           string         `json:"icon"`
	Currency       string         `gorm:"default:'INR'" json:"currency"`
	CreatedAt      time.Time      `json:"createdAt"`
	UpdatedAt      time.Time      `json:"updatedAt"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

type Category struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	Type      string         `gorm:"not null" json:"type"` // expense, income
	Icon      string         `json:"icon"`
	UserID    string         `gorm:"index;not null" json:"userId"`
	IsDefault bool           `gorm:"default:false" json:"isDefault"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Transaction struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Amount      float64        `gorm:"not null" json:"amount"`
	Type        string         `gorm:"not null" json:"type"` // expense, income
	CategoryID  uint           `gorm:"not null" json:"categoryId"`
	AccountID   uint           `gorm:"not null" json:"accountId"`
	Date        time.Time      `gorm:"not null" json:"date"`
	Description string         `json:"description"`
	Currency    string         `gorm:"default:'INR'" json:"currency"`
	UserID      string         `gorm:"index;not null" json:"userId"`
	GroupID     *uint          `gorm:"index" json:"groupId,omitempty"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type Group struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	OwnerID   string         `gorm:"not null" json:"ownerId"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	
	// Members are handled via a many-to-many relationship
	Members []User `gorm:"many2many:group_members;" json:"members"`
}

type GroupExpense struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Description string         `gorm:"not null" json:"description"`
	TotalAmount float64        `gorm:"not null" json:"totalAmount"`
	PaidBy      string         `gorm:"not null" json:"paidBy"`
	GroupID     uint           `gorm:"index;not null" json:"groupId"`
	Date        time.Time      `gorm:"not null" json:"date"`
	UserID      string         `gorm:"index;not null" json:"userId"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	
	Splits []GroupExpenseSplit `json:"splits"`
}

type GroupExpenseSplit struct {
	ID             uint    `gorm:"primaryKey" json:"id"`
	GroupExpenseID uint    `gorm:"index;not null" json:"groupExpenseId"`
	UserID         string  `gorm:"not null" json:"userId"`
	Amount         float64 `gorm:"not null" json:"amount"`
	Status         string  `gorm:"default:'pending'" json:"status"` // pending, settled
}
