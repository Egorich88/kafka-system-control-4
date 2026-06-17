/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/IBM/sarama"
)

// =============================================================================
// Модель события
// =============================================================================

// EventLevel — уровень события (INFO, WARN, ERROR)
type EventLevel string

const (
	INFO  EventLevel = "INFO"
	WARN  EventLevel = "WARN"
	ERROR EventLevel = "ERROR"
)

// DashboardEvent представляет одно событие в панели "Последние события".
type DashboardEvent struct {
	Time    string     `json:"time"`    // время в формате HH:MM:SS
	Level   EventLevel `json:"level"`   // уровень
	Message string     `json:"message"` // сообщение на русском языке
	Source  string     `json:"source"`  // источник (группа, топик, брокер)
}

// EventsResponse – ответ API с массивом событий.
type EventsResponse struct {
	Events []DashboardEvent `json:"events"`
}

// =============================================================================
// Кольцевой буфер для событий
// =============================================================================

// eventRingBuffer хранит ограниченное количество последних событий.
type eventRingBuffer struct {
	events []DashboardEvent
	idx    int
	full   bool
	mu     sync.RWMutex
}

func newEventRingBuffer(size int) *eventRingBuffer {
	return &eventRingBuffer{
		events: make([]DashboardEvent, size),
		idx:    0,
		full:   false,
	}
}

// Add добавляет событие в буфер (потокобезопасно).
func (b *eventRingBuffer) Add(e DashboardEvent) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.events[b.idx] = e
	b.idx = (b.idx + 1) % len(b.events)
	if b.idx == 0 {
		b.full = true
	}
}

// GetAll возвращает все хранящиеся события в хронологическом порядке (сначала старые).
func (b *eventRingBuffer) GetAll() []DashboardEvent {
	b.mu.RLock()
	defer b.mu.RUnlock()
	n := len(b.events)
	if !b.full {
		n = b.idx
	}
	if n == 0 {
		return []DashboardEvent{}
	}
	// Начинаем с самого старого элемента
	start := b.idx - n
	if start < 0 {
		start += len(b.events)
	}
	result := make([]DashboardEvent, 0, n)
	for i := 0; i < n; i++ {
		idx := (start + i) % len(b.events)
		if b.events[idx].Time != "" {
			result = append(result, b.events[idx])
		}
	}
	return result
}

// =============================================================================
// Сборщик событий (EventCollector)
// =============================================================================

// EventCollector периодически опрашивает кластер и генерирует события при изменениях.
type EventCollector struct {
	bootstrap string
	buffer    *eventRingBuffer
	stopChan  chan struct{}
	interval  time.Duration
	mu        sync.Mutex

	// Состояния для отслеживания изменений
	prevLags        map[string]int64                 // группа -> lag
	prevTopicOffsets map[string]int64                // топик -> суммарный оффсет (для скорости)
	prevTopics      map[string]int16                 // топик -> коэффициент репликации
	prevBrokers     map[int32]bool                   // ID брокера -> доступен ли
	prevTopicConfigs map[string]map[string]string    // топик -> конфиги (для выявления изменений)
}

func NewEventCollector(bootstrap string, bufferSize int, interval time.Duration) *EventCollector {
	return &EventCollector{
		bootstrap:        bootstrap,
		buffer:           newEventRingBuffer(bufferSize),
		stopChan:         make(chan struct{}),
		interval:         interval,
		prevLags:         make(map[string]int64),
		prevTopicOffsets: make(map[string]int64),
		prevTopics:       make(map[string]int16),
		prevBrokers:      make(map[int32]bool),
		prevTopicConfigs: make(map[string]map[string]string),
	}
}

// Start запускает фоновую горутину сбора событий.
func (ec *EventCollector) Start() {
	go func() {
		ticker := time.NewTicker(ec.interval)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				ec.collect()
			case <-ec.stopChan:
				log.Printf("[EventCollector] остановлен для bootstrap %s", ec.bootstrap)
				return
			}
		}
	}()
}

// Stop останавливает сборщик.
func (ec *EventCollector) Stop() {
	close(ec.stopChan)
}

// collect — основная логика сбора и генерации событий.
func (ec *EventCollector) collect() {
	ec.mu.Lock()
	defer ec.mu.Unlock()

	// Получаем текущие метрики
	currentLags, err := ec.fetchConsumerLags()
	if err != nil {
		log.Printf("[EventCollector] ошибка получения lag: %v", err)
		return
	}

	currentOffsets, err := ec.fetchTopicOffsets()
	if err != nil {
		log.Printf("[EventCollector] ошибка получения оффсетов: %v", err)
		return
	}

	currentTopics, err := ec.fetchTopicMetadata()
	if err != nil {
		log.Printf("[EventCollector] ошибка получения метаданных топиков: %v", err)
		return
	}

	currentBrokers, err := ec.fetchBrokerStatus()
	if err != nil {
		log.Printf("[EventCollector] ошибка получения статуса брокеров: %v", err)
		return
	}

	currentConfigs, err := ec.fetchTopicConfigs()
	if err != nil {
		log.Printf("[EventCollector] ошибка получения конфигов топиков: %v", err)
	}

	now := time.Now()
	timeStr := now.Format("15:04:05")

	// ---- 1. Отслеживание изменений lag ----
	for group, lag := range currentLags {
		prev, exists := ec.prevLags[group]
		if !exists {
			// Новая группа — INFO
			ec.addEvent(timeStr, INFO, "Обнаружена новая группа потребителей", group)
		} else {
			// Порог для ERROR — увеличение более чем на 500 за интервал
			if lag-prev > 500 {
				ec.addEvent(timeStr, ERROR, "Увеличилось отставание потребителя", group)
			} else if prev-lag > 500 && lag < 100 {
				// Значительное снижение до малых значений — восстановление
				ec.addEvent(timeStr, INFO, "Отставание потребителя нормализовалось", group)
			}
		}
		ec.prevLags[group] = lag
	}

	// ---- 2. Отслеживание скорости записи (оффсеты топиков) ----
	for topic, current := range currentOffsets {
		prev, exists := ec.prevTopicOffsets[topic]
		if !exists {
			ec.prevTopicOffsets[topic] = current
			continue
		}
		delta := current - prev
		if delta < 0 {
			delta = 0
		}
		// Если скорость упала до нуля, а раньше была > 100 сообщений за интервал (10 сек) — WARN
		if delta == 0 && prev > 0 {
			ec.addEvent(timeStr, WARN, "Скорость записи в топик упала до нуля", topic)
		}
		// Если скорость резко выросла (в 5 раз больше среднего) — INFO
		if prev > 0 && delta > 5*prev {
			ec.addEvent(timeStr, INFO, "Резкий рост скорости записи в топик", topic)
		}
		ec.prevTopicOffsets[topic] = current
	}

	// ---- 3. Изменения в топиках (создание, удаление, репликация) ----
	for topic, repl := range currentTopics {
		prevRepl, exists := ec.prevTopics[topic]
		if !exists {
			// Новый топик
			ec.addEvent(timeStr, INFO, "Топик создан", topic)
		} else if repl != prevRepl {
			// Изменился коэффициент репликации
			ec.addEvent(timeStr, INFO, "Изменён коэффициент репликации", topic)
		}
		ec.prevTopics[topic] = repl
	}

	// Проверяем удалённые топики (были в prevTopics, но нет в current)
	for topic := range ec.prevTopics {
		if _, exists := currentTopics[topic]; !exists {
			ec.addEvent(timeStr, WARN, "Топик удалён", topic)
		}
	}

	// ---- 4. Изменения в конфигурациях топиков ----
	if len(currentConfigs) > 0 {
		for topic, configs := range currentConfigs {
			prevConfigs, exists := ec.prevTopicConfigs[topic]
			if !exists {
				ec.prevTopicConfigs[topic] = configs
				continue
			}
			// Проверяем изменения в ключевых параметрах (например, retention.ms)
			for key, value := range configs {
				if prevVal, ok := prevConfigs[key]; ok && prevVal != value {
					ec.addEvent(timeStr, WARN, "Изменена конфигурация топика: "+key+" = "+value, topic)
				}
			}
			ec.prevTopicConfigs[topic] = configs
		}
	}

	// ---- 5. Доступность брокеров (heartbeat) ----
	for id, available := range currentBrokers {
		prevAvailable, exists := ec.prevBrokers[id]
		if !exists {
			ec.prevBrokers[id] = available
			continue
		}
		if !available && prevAvailable {
			// Брокер стал недоступен
			ec.addEvent(timeStr, ERROR, "Брокер недоступен", fmt.Sprintf("broker-%d", id))
		} else if available && !prevAvailable {
			// Брокер восстановился
			ec.addEvent(timeStr, INFO, "Брокер восстановлен", fmt.Sprintf("broker-%d", id))
		}
		ec.prevBrokers[id] = available
	}
}

// addEvent добавляет событие в буфер (внутренний метод).
func (ec *EventCollector) addEvent(timeStr string, level EventLevel, msg, source string) {
	e := DashboardEvent{
		Time:    timeStr,
		Level:   level,
		Message: msg,
		Source:  source,
	}
	ec.buffer.Add(e)
	log.Printf("[Event] %s %s %s %s", timeStr, level, msg, source)
}

// --- Вспомогательные методы для получения данных ---

// fetchConsumerLags возвращает текущий lag для всех групп.
// Использует ту же логику, что и в LagCollector, но для краткости дублируем.
func (ec *EventCollector) fetchConsumerLags() (map[string]int64, error) {
	admin, err := createAdminClient(ec.bootstrap)
	if err != nil {
		return nil, err
	}
	defer admin.Close()

	config := sarama.NewConfig()
	config.Version = sarama.V2_8_0_0
	client, err := sarama.NewClient([]string{ec.bootstrap}, config)
	if err != nil {
		return nil, err
	}
	defer client.Close()

	groupsMap, err := admin.ListConsumerGroups()
	if err != nil {
		return nil, err
	}

	result := make(map[string]int64)
	for groupName := range groupsMap {
		offsets, err := admin.ListConsumerGroupOffsets(groupName, nil)
		if err != nil {
			continue
		}
		var totalLag int64
		for topic, partitions := range offsets.Blocks {
			for partition, block := range partitions {
				latestOffset, err := client.GetOffset(topic, partition, sarama.OffsetNewest)
				if err != nil {
					continue
				}
				lag := latestOffset - block.Offset
				if lag > 0 {
					totalLag += lag
				}
			}
		}
		result[groupName] = totalLag
	}
	return result, nil
}

// fetchTopicOffsets возвращает сумму latest offsets для каждого топика.
func (ec *EventCollector) fetchTopicOffsets() (map[string]int64, error) {
	config := sarama.NewConfig()
	config.Version = sarama.V2_8_0_0
	client, err := sarama.NewClient([]string{ec.bootstrap}, config)
	if err != nil {
		return nil, err
	}
	defer client.Close()

	topics, err := client.Topics()
	if err != nil {
		return nil, err
	}
	result := make(map[string]int64)
	for _, topic := range topics {
		partitions, err := client.Partitions(topic)
		if err != nil {
			continue
		}
		var sum int64
		for _, p := range partitions {
			latest, err := client.GetOffset(topic, p, sarama.OffsetNewest)
			if err != nil {
				continue
			}
			sum += latest
		}
		result[topic] = sum
	}
	return result, nil
}

// fetchTopicMetadata возвращает карту топик -> коэффициент репликации.
func (ec *EventCollector) fetchTopicMetadata() (map[string]int16, error) {
	admin, err := createAdminClient(ec.bootstrap)
	if err != nil {
		return nil, err
	}
	defer admin.Close()

	topicsMap, err := admin.ListTopics()
	if err != nil {
		return nil, err
	}
	result := make(map[string]int16)
	for name, metadata := range topicsMap {
		result[name] = metadata.ReplicationFactor
	}
	return result, nil
}

// fetchBrokerStatus возвращает карту ID брокера -> доступен ли (true/false).
// Проверяет каждого брокера через Connected() с обработкой ошибки.
func (ec *EventCollector) fetchBrokerStatus() (map[int32]bool, error) {
	config := sarama.NewConfig()
	config.Version = sarama.V2_8_0_0
	config.Net.DialTimeout = 2 * time.Second
	client, err := sarama.NewClient([]string{ec.bootstrap}, config)
	if err != nil {
		return nil, err
	}
	defer client.Close()

	brokers := client.Brokers()
	result := make(map[int32]bool)
	for _, b := range brokers {
		connected, err := b.Connected()
		if err != nil {
			// В случае ошибки считаем брокера недоступным
			result[b.ID()] = false
		} else {
			result[b.ID()] = connected
		}
	}
	return result, nil
}

// fetchTopicConfigs возвращает конфигурации всех топиков (только ключевые параметры).
func (ec *EventCollector) fetchTopicConfigs() (map[string]map[string]string, error) {
	admin, err := createAdminClient(ec.bootstrap)
	if err != nil {
		return nil, err
	}
	defer admin.Close()

	topics, err := admin.ListTopics()
	if err != nil {
		return nil, err
	}
	result := make(map[string]map[string]string)
	for topic := range topics {
		cfgResource := sarama.ConfigResource{Type: sarama.TopicResource, Name: topic}
		resp, err := admin.DescribeConfig(cfgResource)
		if err != nil {
			continue
		}
		cfgMap := make(map[string]string)
		for _, entry := range resp {
			// Сохраняем только интересующие параметры
			if entry.Name == "retention.ms" || entry.Name == "segment.bytes" || entry.Name == "min.insync.replicas" {
				cfgMap[entry.Name] = entry.Value
			}
		}
		if len(cfgMap) > 0 {
			result[topic] = cfgMap
		}
	}
	return result, nil
}

// GetEvents возвращает все события из буфера (для обработчика).
func (ec *EventCollector) GetEvents() []DashboardEvent {
	return ec.buffer.GetAll()
}

// =============================================================================
// Глобальное управление сборщиком событий
// =============================================================================

var (
	currentEventCollector *EventCollector
	eventCollectorMu      sync.RWMutex
)

// ensureEventCollectorForBootstrap создаёт или пересоздаёт сборщик для указанного кластера.
func ensureEventCollectorForBootstrap(bootstrap string) {
	eventCollectorMu.Lock()
	defer eventCollectorMu.Unlock()
	if currentEventCollector != nil && currentEventCollector.bootstrap == bootstrap {
		return
	}
	if currentEventCollector != nil {
		currentEventCollector.Stop()
	}
	log.Printf("[EventCollector] создаём сборщик для bootstrap: %s", bootstrap)
	currentEventCollector = NewEventCollector(bootstrap, 200, 10*time.Second) // 200 событий, интервал 10 сек
	currentEventCollector.Start()
}

// =============================================================================
// HTTP-обработчик
// =============================================================================

// getDashboardEventsHandler возвращает последние события кластера.
// Теперь использует реальные данные из сборщика.
func getDashboardEventsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	bootstrap := getBootstrapFromRequest(r)
	if bootstrap == "" {
		sendJSONError(w, "Bootstrap server not provided", http.StatusBadRequest)
		return
	}

	// Гарантируем, что сборщик запущен для этого кластера
	ensureEventCollectorForBootstrap(bootstrap)

	eventCollectorMu.RLock()
	collector := currentEventCollector
	eventCollectorMu.RUnlock()

	if collector == nil {
		sendJSONError(w, "Сборщик событий не инициализирован", http.StatusInternalServerError)
		return
	}

	events := collector.GetEvents()
	// Возвращаем последние 50 (можно параметризовать)
	if len(events) > 50 {
		events = events[len(events)-50:]
	}
	response := EventsResponse{Events: events}
	_ = json.NewEncoder(w).Encode(response)
}