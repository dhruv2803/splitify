package auth

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/dhruv2803/splitify/backend/internal/models"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/idtoken"
	"gorm.io/gorm"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			c.Abort()
			return
		}

		idToken := strings.TrimSpace(strings.Replace(authHeader, "Bearer", "", 1))
		if idToken == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			c.Abort()
			return
		}

		clientID := os.Getenv("GOOGLE_CLIENT_ID")
		payload, err := idtoken.Validate(context.Background(), idToken, clientID)
		if err != nil {
			fmt.Printf("Token validation failed: %v\n", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Set user info in context for use in handlers
		// Google ID Token claims: sub (uid), email, name, picture
		c.Set("uid", payload.Subject)
		c.Set("email", payload.Claims["email"])
		c.Set("name", payload.Claims["name"])
		c.Set("picture", payload.Claims["picture"])
		c.Next()
	}
}

func AdminMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		uid := c.GetString("uid")
		if uid == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		var user models.User
		if err := db.Where("uid = ?", uid).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		if !user.IsAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		c.Next()
	}
}
