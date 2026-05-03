package database

import (
	"fmt"
	"log"
	"os"

	"github.com/dhruv2803/splitify/backend/internal/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	dbType := os.Getenv("DB_TYPE")
	if dbType == "" {
		dbType = "sqlite"
	}

	switch dbType {
	case "sqlite":
		DB, err = gorm.Open(sqlite.Open("splitify.db"), &gorm.Config{})
	default:
		log.Fatalf("Unsupported DB_TYPE: %s", dbType)
	}

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	fmt.Println("Database connection established")

	// Auto-migrate models
	err = DB.AutoMigrate(
		&models.User{},
		&models.Account{},
		&models.Category{},
		&models.Transaction{},
		&models.Group{},
		&models.GroupExpense{},
		&models.GroupExpenseSplit{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	fmt.Println("Database migration completed")
}
