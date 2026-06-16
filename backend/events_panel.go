package main

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"time"
)

// EventLevel — уровень логов
type EventLevel string

const (
	INFO  EventLevel = "INFO"
	WARN  EventLevel = "WARN"
	ERROR EventLevel = "ERROR"
)

// DashboardEvent — строка таблицы
type DashboardEvent struct {
	Time    string     `json:"time"`
	Level   EventLevel `json:"level"`
	Message string     `json:"message"`
	Source  string     `json:"source"`
}

// getDashboardEventsHandler возвращает последние события кластера
func getDashboardEventsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	events := generateMockEvents()

	_ = json.NewEncoder(w).Encode(map[string][]DashboardEvent{
		"events": events,
	})
}

// временный генератор (потом заменишь на реальные Kafka/system logs)
func generateMockEvents() []DashboardEvent {
	sources := []string{"broker-1", "broker-2", "controller", "topic-service"}

	messages := []string{
		"Topic created successfully",
		"Consumer lag increased",
		"Partition reassigned",
		"Broker heartbeat missed",
		"Replication factor changed",
	}

	levels := []EventLevel{INFO, WARN, ERROR}

	var result []DashboardEvent

	for i := 0; i < 20; i++ {
		level := levels[rand.Intn(len(levels))]

		result = append(result, DashboardEvent{
			Time:    time.Now().Add(time.Duration(-i) * time.Minute).Format("15:04:05"),
			Level:   level,
			Message: messages[rand.Intn(len(messages))],
			Source:  sources[rand.Intn(len(sources))],
		})
	}

	return result
}