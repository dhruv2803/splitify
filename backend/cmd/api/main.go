package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/dhruv2803/splitify/backend/internal/auth"
	"github.com/dhruv2803/splitify/backend/internal/database"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize Database
	database.InitDB()

	// Initialize Firebase
	auth.InitFirebase()

	// Setup Router
	r := gin.Default()

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Protected routes
	api := r.Group("/api")
	api.Use(auth.AuthMiddleware())
	{
		api.GET("/me", func(c *gin.Context) {
			uid := c.GetString("uid")
			c.JSON(http.StatusOK, gin.H{"uid": uid})
		})
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on port %s...\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
