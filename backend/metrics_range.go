/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */

package main

import (
	"net/http"
	"net/url"
	"time"
)

// metricRange возвращает границы периода для исторических метрик Overview.
//
// В 4.2.35 фильтрация выполняется на сервере по Timestamp, а не по строке
// вида 15:04:05. Это важно для периодов длиннее одного часа и для перехода
// через полночь.
func metricRange(r *http.Request) (time.Time, time.Time) {
	now := time.Now()

	fromRaw := r.URL.Query().Get("from")
	toRaw := r.URL.Query().Get("to")
	if fromRaw != "" && toRaw != "" {
		if decoded, err := url.QueryUnescape(fromRaw); err == nil {
			fromRaw = decoded
		}
		if decoded, err := url.QueryUnescape(toRaw); err == nil {
			toRaw = decoded
		}
		from, fromErr := time.Parse(time.RFC3339, fromRaw)
		to, toErr := time.Parse(time.RFC3339, toRaw)
		if fromErr == nil && toErr == nil && from.Before(to) {
			return from, to
		}
	}

	durations := map[string]time.Duration{
		"5m":  5 * time.Minute,
		"15m": 15 * time.Minute,
		"30m": 30 * time.Minute,
		"1h":  time.Hour,
		"3h":  3 * time.Hour,
		"6h":  6 * time.Hour,
		"12h": 12 * time.Hour,
		"24h": 24 * time.Hour,
		"7d":  7 * 24 * time.Hour,
		"30d": 30 * 24 * time.Hour,
	}

	if duration, ok := durations[r.URL.Query().Get("range")]; ok {
		return now.Add(-duration), now
	}

	return now.Add(-24 * time.Hour), now
}
