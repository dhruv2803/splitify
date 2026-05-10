package database

import (
	"fmt"
	"log"
	"os"

	"github.com/dhruv2803/splitify/backend/internal/models"
	"gorm.io/driver/postgres"
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
		dbPath := os.Getenv("DB_PATH")
		if dbPath == "" {
			dbPath = "splitify.db"
		}
		DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	case "postgres":
		dsn := os.Getenv("DB_URL")
		if dsn == "" {
			log.Fatal("DB_URL environment variable is required for PostgreSQL")
		}
		DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	default:
		log.Fatalf("Unsupported DB_TYPE: %s", dbType)
	}

	if err != nil {
		log.Fatalf("CRITICAL: Failed to connect to database (%s): %v", dbType, err)
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
		log.Fatalf("CRITICAL: Failed to migrate database: %v", err)
	}

	fmt.Println("Database migration completed")
}
