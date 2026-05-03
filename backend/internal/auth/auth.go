package auth

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/option"
)

var AuthClient *auth.Client

func InitFirebase() {
	ctx := context.Background()
	
	// Check if service account file exists
	serviceAccountKey := os.Getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
	var app *firebase.App
	var err error

	if serviceAccountKey != "" {
		opt := option.WithCredentialsFile(serviceAccountKey)
		app, err = firebase.NewApp(ctx, nil, opt)
	} else {
		// Try to use default credentials (useful for GCP deployment)
		app, err = firebase.NewApp(ctx, nil)
	}

	if err != nil {
		log.Fatalf("Error initializing firebase app: %v\n", err)
	}

	AuthClient, err = app.Auth(ctx)
	if err != nil {
		log.Fatalf("Error getting auth client: %v\n", err)
	}

	fmt.Println("Firebase Auth initialized")
}

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

		token, err := AuthClient.VerifyIDToken(context.Background(), idToken)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Set UID in context for use in handlers
		c.Set("uid", token.UID)
		c.Next()
	}
}
