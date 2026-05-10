package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/dhruv2803/splitify/backend/internal/models"
	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	dbType := os.Getenv("DB_TYPE")
	if dbType == "" {
		dbType = "sqlite"
	}

	for i := 0; i < 3; i++ {
		switch dbType {
		case "sqlite":
			dbPath := os.Getenv("DB_PATH")
			if dbPath == "" {
				dbPath = "/tmp/splitify.db"
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

		if err == nil {
			break
		}
		fmt.Printf("Database connection attempt %d failed, retrying in 2s...\n", i+1)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		log.Fatalf("CRITICAL: Failed to connect to database (%s) after retries: %v", dbType, err)
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
