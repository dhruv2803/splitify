package handlers

import (
	"net/http"
	"time"

	"github.com/dhruv2803/splitify/backend/internal/database"
	"github.com/dhruv2803/splitify/backend/internal/models"
	"github.com/gin-gonic/gin"
)

// Simple exchange rates (base USD)
var exchangeRates = map[string]float64{
	"USD": 1,
	"EUR": 0.92,
	"GBP": 0.79,
	"INR": 83.45,
	"JPY": 151.62,
	"CAD": 1.35,
	"AUD": 1.52,
}

func convert(amount float64, from, to string) float64 {
	fromRate := exchangeRates[from]
	if fromRate == 0 {
		fromRate = 1
	}
	toRate := exchangeRates[to]
	if toRate == 0 {
		toRate = 1
	}
	return (amount / fromRate) * toRate
}

func GetDashboard(c *gin.Context) {
	uid := c.GetString("uid")

	var user models.User
	if err := database.DB.Where("uid = ?", uid).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var accounts []models.Account
	database.DB.Where("user_id = ?", uid).Find(&accounts)

	var transactions []models.Transaction
	database.DB.Where("user_id = ?", uid).Order("date desc").Find(&transactions)

	var categories []models.Category
	database.DB.Where("user_id = ?", uid).Find(&categories)
	catMap := make(map[uint]string)
	for _, cat := range categories {
		catMap[cat.ID] = cat.Name
	}

	// Calculate Net Worth and Currency Totals
	netWorth := 0.0
	currencyTotalsMap := make(map[string]float64)
	accountSummaries := []gin.H{}

	for _, acc := range accounts {
		currencyTotalsMap[acc.Currency] += acc.CurrentBalance
		netWorth += convert(acc.CurrentBalance, acc.Currency, user.Currency)
		accountSummaries = append(accountSummaries, gin.H{
			"id":      acc.ID,
			"name":    acc.Name,
			"type":    acc.Type,
			"balance": acc.CurrentBalance,
			"color":   acc.Color,
		})
	}

	currencyTotals := []gin.H{}
	for curr, amt := range currencyTotalsMap {
		currencyTotals = append(currencyTotals, gin.H{"currency": curr, "amount": amt})
	}

	// Monthly Stats (Last 6 months)
	monthlyStats := []gin.H{}
	for i := 5; i >= 0; i-- {
		t := time.Now().AddDate(0, -i, 0)
		name := t.Format("Jan")
		year, month, _ := t.Date()

		income := 0.0
		expense := 0.0

		for _, tr := range transactions {
			y, m, _ := tr.Date.Date()
			if y == year && m == month {
				convertedAmt := convert(tr.Amount, "INR", user.Currency) // Assuming transactions are in INR for now or we add currency to Transaction model
				if tr.Type == "income" {
					income += convertedAmt
				} else {
					expense += convertedAmt
				}
			}
		}
		monthlyStats = append(monthlyStats, gin.H{"name": name, "income": income, "expense": expense})
	}

	// Category Spending
	categorySpendingMap := make(map[string]float64)
	for _, tr := range transactions {
		if tr.Type == "expense" {
			catName := catMap[tr.CategoryID]
			if catName == "" {
				catName = "Other"
			}
			categorySpendingMap[catName] += convert(tr.Amount, "INR", user.Currency)
		}
	}
	categorySpending := []gin.H{}
	for name, val := range categorySpendingMap {
		categorySpending = append(categorySpending, gin.H{"name": name, "value": val})
	}

	// Daily Trend (Last 14 days)
	dailyTrend := []gin.H{}
	for i := 13; i >= 0; i-- {
		t := time.Now().AddDate(0, 0, -i)
		dateStr := t.Format("Jan 02")
		day := t.Format("2006-01-02")

		amount := 0.0
		for _, tr := range transactions {
			if tr.Type == "expense" && tr.Date.Format("2006-01-02") == day {
				amount += convert(tr.Amount, "INR", user.Currency)
			}
		}
		dailyTrend = append(dailyTrend, gin.H{"date": dateStr, "amount": amount})
	}

	c.JSON(http.StatusOK, gin.H{
		"netWorth":         netWorth,
		"currencyTotals":   currencyTotals,
		"monthlyStats":     monthlyStats,
		"categorySpending": categorySpending,
		"dailyTrend":       dailyTrend,
		"accountSummaries": accountSummaries,
	})
}
