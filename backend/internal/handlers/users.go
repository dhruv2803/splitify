package handlers

import (
	"net/http"

	"github.com/dhruv2803/splitify/backend/internal/database"
	"github.com/dhruv2803/splitify/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SyncProfile(c *gin.Context) {
	uid := c.GetString("uid")
	email, _ := c.Get("email")
	name, _ := c.Get("name")
	picture, _ := c.Get("picture")

	var user models.User
	result := database.DB.Where("uid = ?", uid).First(&user)

	if result.Error != nil {
		// User doesn't exist, create one
		user = models.User{
			UID:         uid,
			Email:       email.(string),
			DisplayName: name.(string),
			PhotoURL:    picture.(string),
			Currency:    "INR",
		}
		if err := database.DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user profile"})
			return
		}
	} else {
		// Optional: Update profile info if changed in Firebase
		user.DisplayName = name.(string)
		user.PhotoURL = picture.(string)
		database.DB.Save(&user)
	}

	c.JSON(http.StatusOK, user)
}

func GetProfile(c *gin.Context) {
	uid := c.GetString("uid")
	var user models.User

	if err := database.DB.Where("uid = ?", uid).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func UpdateProfile(c *gin.Context) {
	uid := c.GetString("uid")
	var user models.User

	if err := database.DB.Where("uid = ?", uid).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
		return
	}

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Prevent UID change
	user.UID = uid

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func PurgeData(c *gin.Context) {
	uid := c.GetString("uid")

	// Start a transaction to ensure everything is deleted or nothing is
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		// Delete all user related data
		if err := tx.Where("user_id = ?", uid).Delete(&models.GroupExpenseSplit{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", uid).Delete(&models.GroupExpense{}).Error; err != nil {
			return err
		}
		// Note: Group members (many-to-many) will be handled if we delete the group or clear the join table
		// For now, simple user-owned data
		if err := tx.Where("owner_id = ?", uid).Delete(&models.Group{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", uid).Delete(&models.Transaction{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", uid).Delete(&models.Account{}).Error; err != nil {
			return err
		}
		if err := tx.Where("user_id = ?", uid).Delete(&models.Category{}).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to purge data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All data cleared successfully"})
}
