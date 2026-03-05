package period_calculator

import (
	"testing"
	"time"
)

func TestCalculateRemainingPeriods(t *testing.T) {
	// Helper to create time in UTC to avoid local timezone issues in tests
	date := func(year int, month time.Month, day, hour, min int) time.Time {
		return time.Date(year, month, day, hour, min, 0, 0, time.UTC)
	}
	
	ts := func(t time.Time) int64 {
		return t.Unix()
	}

	tests := []struct {
		name     string
		now      time.Time
		exp      time.Time
		period   string
		expected int
	}{
		// Regular Monthly
		{
			name:     "Exact 1 month",
			now:      date(2023, time.January, 1, 0, 0),
			exp:      date(2023, time.February, 1, 0, 0),
			period:   "monthly",
			expected: 1,
		},
		{
			name:     "1 month + 1 day",
			now:      date(2023, time.January, 1, 0, 0),
			exp:      date(2023, time.February, 2, 0, 0),
			period:   "monthly",
			expected: 2,
		},
		{
			name:     "Less than 1 month",
			now:      date(2023, time.January, 1, 0, 0),
			exp:      date(2023, time.January, 15, 0, 0),
			period:   "monthly",
			expected: 1,
		},
		{
			name:     "Same day",
			now:      date(2023, time.January, 1, 0, 0),
			exp:      date(2023, time.January, 1, 0, 0),
			period:   "monthly",
			expected: 0,
		},
		{
			name:     "Past day",
			now:      date(2023, time.January, 2, 0, 0),
			exp:      date(2023, time.January, 1, 0, 0),
			period:   "monthly",
			expected: 0,
		},

		// End of Month Edge Cases
		{
			name:     "Jan 31 -> Feb 28 (Non-leap)",
			now:      date(2023, time.January, 31, 0, 0),
			exp:      date(2023, time.February, 28, 0, 0),
			period:   "monthly",
			expected: 1,
		},
		{
			name:     "Jan 31 -> Feb 27 (Non-leap)",
			now:      date(2023, time.January, 31, 0, 0),
			exp:      date(2023, time.February, 27, 0, 0),
			period:   "monthly",
			expected: 1,
		},
		{
			name:     "Jan 31 -> Mar 3 (Go AddDate logic)",
			// Jan 31 + 1m = Mar 3 (2023). So Mar 3 should be covered by 1 month.
			now:      date(2023, time.January, 31, 0, 0),
			exp:      date(2023, time.March, 3, 0, 0),
			period:   "monthly",
			expected: 1,
		},
		{
			name:     "Jan 31 -> Mar 4",
			now:      date(2023, time.January, 31, 0, 0),
			exp:      date(2023, time.March, 4, 0, 0),
			period:   "monthly",
			expected: 2,
		},
		
		// Leap Years
		{
			name:     "Jan 31 2024 -> Feb 29 2024",
			now:      date(2024, time.January, 31, 0, 0),
			exp:      date(2024, time.February, 29, 0, 0),
			period:   "monthly",
			expected: 1,
		},
		{
			name:     "Jan 31 2024 -> Mar 1 2024",
			// Jan 31 + 1m (2024) -> Mar 2 (2024). Mar 2 >= Mar 1.
			now:      date(2024, time.January, 31, 0, 0),
			exp:      date(2024, time.March, 1, 0, 0),
			period:   "monthly",
			expected: 1,
		},
		
		// Prompt Examples
		{
			name:     "3/3 15:02 -> 4/3 23:59 => 1",
			now:      date(2023, time.March, 3, 15, 2),
			exp:      date(2023, time.April, 3, 23, 59),
			period:   "monthly",
			expected: 1,
		},
		{
			name:     "3/3 -> 4/2 => 1",
			now:      date(2023, time.March, 3, 0, 0),
			exp:      date(2023, time.April, 2, 0, 0),
			period:   "monthly",
			expected: 1,
		},
		
		// Yearly
		{
			name:     "Exact 1 year",
			now:      date(2023, time.January, 1, 0, 0),
			exp:      date(2024, time.January, 1, 0, 0),
			period:   "yearly",
			expected: 1,
		},
		{
			name:     "1 year + 1 day",
			now:      date(2023, time.January, 1, 0, 0),
			exp:      date(2024, time.January, 2, 0, 0),
			period:   "yearly",
			expected: 2,
		},
		{
			name:     "Leap year crossing",
			now:      date(2023, time.February, 28, 0, 0),
			exp:      date(2024, time.February, 28, 0, 0),
			period:   "yearly",
			expected: 1,
		},
		{
			name:     "Leap year day preservation",
			now:      date(2024, time.February, 29, 0, 0),
			// 2024 is leap. 2025 is not.
			// Feb 29 + 1y -> Mar 1 (2025).
			exp:      date(2025, time.March, 1, 0, 0),
			period:   "yearly",
			expected: 1,
		},
		{
			name:     "Leap year day overflow",
			now:      date(2024, time.February, 29, 0, 0),
			exp:      date(2025, time.March, 2, 0, 0),
			// Feb 29 + 1y -> Mar 1.
			// Mar 2 > Mar 1. So 2 years.
			period:   "yearly",
			expected: 2,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := calculateRemainingPeriodsWithTime(ts(tt.exp), tt.period, tt.now)
			if got != tt.expected {
				t.Errorf("calculateRemainingPeriodsWithTime() = %v, want %v. Now: %v, Exp: %v", got, tt.expected, tt.now, tt.exp)
			}
		})
	}
}
