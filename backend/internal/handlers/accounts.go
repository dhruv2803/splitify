package handlers

import (
	"net/http"

	"github.com/dhruv2803/splitify/backend/internal/database"
	"github.com/dhruv2803/splitify/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func ListAccounts(c *gin.Context) {
	uid := c.GetString("uid")
	var accounts []models.Account

	if err := database.DB.Where("user_id = ?", uid).Find(&accounts).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch accounts"})
		return
	}

	c.JSON(http.StatusOK, accounts)
}

func CreateAccount(c *gin.Context) {
	uid := c.GetString("uid")
	var account models.Account

	if err := c.ShouldBindJSON(&account); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Handle special credit card logic
	// In some systems, credit card balance is negative. 
	// The user mentioned "initial outstanding". 
	// We'll keep the value as provided, but the frontend/logic will treat it based on Type.
	
	account.UserID = uid
	// For a new account, current balance starts as initial balance
	account.CurrentBalance = account.InitialBalance

	if err := database.DB.Create(&account).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create account"})
		return
	}

	c.JSON(http.StatusCreated, account)
}

func UpdateAccount(c *gin.Context) {
	uid := c.GetString("uid")
	id := c.Param("id")

	var account models.Account
	if err := database.DB.Where("id = ? AND user_id = ?", id, uid).First(&account).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Account not found"})
		return
	}

	// Capture initial balance before binding
	originalInitialBalance := account.InitialBalance

	if err := c.ShouldBindJSON(&account); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Constraint: should not have option to update initialized balance
	if account.InitialBalance != originalInitialBalance {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Updating initial balance is not permitted after creation"})
		return
	}

	if err := database.DB.Save(&account).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update account"})
		return
	}

	c.JSON(http.StatusOK, account)
}

func DeleteAccount(c *gin.Context) {
	uid := c.GetString("uid")
	id := c.Param("id")

	// Check if any transaction is present
	var count int64
	database.DB.Model(&models.Transaction{}).Where("account_id = ? AND user_id = ?", id, uid).Count(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete account with existing transactions"})
		return
	}

	if err := database.DB.Where("id = ? AND user_id = ?", id, uid).Delete(&models.Account{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete account"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Account deleted"})
}
