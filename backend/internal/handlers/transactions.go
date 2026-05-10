package handlers

import (
	"net/http"

	"github.com/dhruv2803/splitify/backend/internal/database"
	"github.com/dhruv2803/splitify/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ListTransactions(c *gin.Context) {
	uid := c.GetString("uid")
	var transactions []models.Transaction
	
	// Preload Category and Account if needed, but for now simple list
	database.DB.Where("user_id = ?", uid).Order("date desc").Find(&transactions)
	c.JSON(http.StatusOK, transactions)
}

func CreateTransaction(c *gin.Context) {
	uid := c.GetString("uid")
	var transaction models.Transaction
	if err := c.ShouldBindJSON(&transaction); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	transaction.UserID = uid

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Create the transaction
		if err := tx.Create(&transaction).Error; err != nil {
			return err
		}

		// 2. Update account balance
		var account models.Account
		if err := tx.First(&account, transaction.AccountID).Error; err != nil {
			return err
		}

		if transaction.Type == "income" {
			account.CurrentBalance += transaction.Amount
		} else {
			account.CurrentBalance -= transaction.Amount
		}

		if err := tx.Save(&account).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, transaction)
}

func UpdateTransaction(c *gin.Context) {
	uid := c.GetString("uid")
	id := c.Param("id")

	var existingTransaction models.Transaction
	if err := database.DB.Where("id = ? AND user_id = ?", id, uid).First(&existingTransaction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	var updatedData models.Transaction
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Reverse the old transaction impact on old account
		var oldAccount models.Account
		if err := tx.First(&oldAccount, existingTransaction.AccountID).Error; err != nil {
			return err
		}

		if existingTransaction.Type == "income" {
			oldAccount.CurrentBalance -= existingTransaction.Amount
		} else {
			oldAccount.CurrentBalance += existingTransaction.Amount
		}

		if err := tx.Save(&oldAccount).Error; err != nil {
			return err
		}

		// 2. Apply new transaction impact on new account (could be same account)
		var newAccount models.Account
		if existingTransaction.AccountID == updatedData.AccountID {
			newAccount = oldAccount
		} else {
			if err := tx.First(&newAccount, updatedData.AccountID).Error; err != nil {
				return err
			}
		}

		if updatedData.Type == "income" {
			newAccount.CurrentBalance += updatedData.Amount
		} else {
			newAccount.CurrentBalance -= updatedData.Amount
		}

		if err := tx.Save(&newAccount).Error; err != nil {
			return err
		}

		// 3. Update the transaction
		existingTransaction.Amount = updatedData.Amount
		existingTransaction.Type = updatedData.Type
		existingTransaction.CategoryID = updatedData.CategoryID
		existingTransaction.AccountID = updatedData.AccountID
		existingTransaction.Date = updatedData.Date
		existingTransaction.Description = updatedData.Description
		existingTransaction.Currency = updatedData.Currency

		if err := tx.Save(&existingTransaction).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update transaction: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, existingTransaction)
}

func DeleteTransaction(c *gin.Context) {
	uid := c.GetString("uid")
	id := c.Param("id")

	var transaction models.Transaction
	if err := database.DB.Where("id = ? AND user_id = ?", id, uid).First(&transaction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		// 1. Reverse impact on account
		var account models.Account
		if err := tx.First(&account, transaction.AccountID).Error; err != nil {
			return err
		}

		if transaction.Type == "income" {
			account.CurrentBalance -= transaction.Amount
		} else {
			account.CurrentBalance += transaction.Amount
		}

		if err := tx.Save(&account).Error; err != nil {
			return err
		}

		// 2. Delete the transaction
		if err := tx.Delete(&transaction).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete transaction: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transaction deleted successfully"})
}

func GetTransaction(c *gin.Context) {
	uid := c.GetString("uid")
	id := c.Param("id")

	var transaction models.Transaction
	if err := database.DB.Where("id = ? AND user_id = ?", id, uid).First(&transaction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	c.JSON(http.StatusOK, transaction)
}
