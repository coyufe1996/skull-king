package period_calculator

import (
	"time"
)

// CalculateRemainingPeriods calculates the number of periods (monthly or yearly)
// remaining from the current time to the expiration timestamp.
// It rounds up partial periods (ceiling).
// It assumes current time is time.Now().
func CalculateRemainingPeriods(expirationTimestamp int64, period string) int {
	return calculateRemainingPeriodsWithTime(expirationTimestamp, period, time.Now())
}

// calculateRemainingPeriodsWithTime is a helper that accepts 'now' for testing.
// It compares the truncated 'now' with the truncated 'expiration'.
func calculateRemainingPeriodsWithTime(expirationTimestamp int64, period string, now time.Time) int {
	// Convert expiration timestamp to time.Time in the same location as 'now'
	expTime := time.Unix(expirationTimestamp, 0).In(now.Location())

	// Truncate to day (midnight)
	nowDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	expDay := time.Date(expTime.Year(), expTime.Month(), expTime.Day(), 0, 0, 0, 0, expTime.Location())

	// If expiration is today or in the past, return 0
	if !expDay.After(nowDay) {
		return 0
	}

	switch period {
case "monthly":
		// Calculate rough difference in months
		diffYears := expDay.Year() - nowDay.Year()
		diffMonths := int(expDay.Month()) - int(nowDay.Month())

		totalMonths := diffYears*12 + diffMonths
		if totalMonths < 0 {
			totalMonths = 0
		}

		// Check surrounding values because AddDate normalization can shift dates
		// (e.g. Jan 31 + 1 month -> Mar 3, skipping Feb entirely in some sense)
		// We start checking from totalMonths - 1
		start := totalMonths - 1
		if start < 0 {
			start = 0
		}

		for k := start; ; k++ {
			if !nowDay.AddDate(0, k, 0).Before(expDay) {
				return k
			}
			// Safety break? Unlikely needed as k will eventually reach exp
			if k > totalMonths+2 {
				// Should not happen, but return k
				return k
			}
		}

	case "yearly":
		diffYears := expDay.Year() - nowDay.Year()
		if diffYears < 0 {
			diffYears = 0
		}

		start := diffYears - 1
		if start < 0 {
			start = 0
		}

		for k := start; ; k++ {
			if !nowDay.AddDate(k, 0, 0).Before(expDay) {
				return k
			}
			if k > diffYears+2 {
				return k
			}
		}
	default:
		// Unknown period, return 0 or handle error.
		// Given the prompt, we assume valid inputs or return 0 for safety.
		return 0
	}
}
