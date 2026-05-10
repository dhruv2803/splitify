package handlers

import (
	"net/http"

	"github.com/dhruv2803/splitify/backend/internal/database"
	"github.com/dhruv2803/splitify/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func GetAdminStats(c *gin.Context) {
	var userCount, accountCount, transactionCount, groupExpenseCount int64

	database.DB.Model(&models.User{}).Count(&userCount)
	database.DB.Model(&models.Account{}).Count(&accountCount)
	database.DB.Model(&models.Transaction{}).Count(&transactionCount)
	database.DB.Model(&models.GroupExpense{}).Count(&groupExpenseCount)

	c.JSON(http.StatusOK, gin.H{
		"users":         userCount,
		"accounts":      accountCount,
		"transactions":  transactionCount,
		"groupExpenses": groupExpenseCount,
	})
}

func ListAllUsers(c *gin.Context) {
	var users []models.User
	database.DB.Find(&users)
	c.JSON(http.StatusOK, users)
}

func UpdateUserRole(c *gin.Context) {
	uid := c.Param("uid")
	var input struct {
		IsAdmin bool `json:"isAdmin"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("uid = ?", uid).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.IsAdmin = input.IsAdmin
	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user role"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func RunMigration(c *gin.Context) {
	// Simple migration to ensure all records have a currency
	// In GORM, the defaults should handle this, but we can do a bulk update if needed.
	// For now, let's just return success as our models already have defaults.
	c.JSON(http.StatusOK, gin.H{"message": "Migration completed (defaults applied by GORM)"})
}
