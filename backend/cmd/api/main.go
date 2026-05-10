package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/dhruv2803/splitify/backend/internal/auth"
	"github.com/dhruv2803/splitify/backend/internal/database"
	"github.com/dhruv2803/splitify/backend/internal/handlers"
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

	// Validate essential environment variables
	if os.Getenv("GOOGLE_CLIENT_ID") == "" {
		log.Fatal("CRITICAL: GOOGLE_CLIENT_ID environment variable is not set")
	}

	// Setup Router
	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

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

		// Dashboard
		api.GET("/dashboard", handlers.GetDashboard)

		// User Profile
		api.POST("/profile/sync", handlers.SyncProfile)
		api.GET("/profile", handlers.GetProfile)
		api.PUT("/profile", handlers.UpdateProfile)
		api.POST("/profile/purge", handlers.PurgeData)

		// Categories
		api.GET("/categories", handlers.ListCategories)
		api.POST("/categories", handlers.CreateCategory)
		api.PUT("/categories/:id", handlers.UpdateCategory)
		api.DELETE("/categories/:id", handlers.DeleteCategory)

		// Accounts
		api.GET("/accounts", handlers.ListAccounts)
		api.POST("/accounts", handlers.CreateAccount)
		api.PUT("/accounts/:id", handlers.UpdateAccount)
		api.DELETE("/accounts/:id", handlers.DeleteAccount)

		// Transactions
		api.GET("/transactions", handlers.ListTransactions)
		api.GET("/transactions/:id", handlers.GetTransaction)
		api.POST("/transactions", handlers.CreateTransaction)
		api.PUT("/transactions/:id", handlers.UpdateTransaction)
		api.DELETE("/transactions/:id", handlers.DeleteTransaction)
	}

	// Admin routes
	admin := r.Group("/api/admin")
	admin.Use(auth.AuthMiddleware(), auth.AdminMiddleware(database.DB))
	{
		admin.GET("/stats", handlers.GetAdminStats)
		admin.GET("/users", handlers.ListAllUsers)
		admin.PUT("/users/:uid/role", handlers.UpdateUserRole)
		admin.POST("/migrate", handlers.RunMigration)
	}

	// Serve static files from frontend build
	r.Static("/assets", "./dist/assets")
	r.StaticFile("/favicon.ico", "./dist/favicon.ico")
	r.StaticFile("/vite.svg", "./dist/vite.svg")
	
	// Catch-all for SPA routing
	r.NoRoute(func(c *gin.Context) {
		c.File("./dist/index.html")
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on port %s...\n", port)
	if err := r.Run("0.0.0.0:" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
