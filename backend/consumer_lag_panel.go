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
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/IBM/sarama"
)

// =============================================================================
// Модели данных
// =============================================================================

// LagPoint – точка графика для одной consumer группы.
type LagPoint struct {
	Time  string `json:"time"`  // время в формате HH:MM:SS
	Group string `json:"group"` // название группы потребителей
	Value int64  `json:"value"` // отставание (lag) в сообщениях
}

// LagResponse – ответ API с массивом точек.
type LagResponse struct {
	Points []LagPoint `json:"points"`
}

// =============================================================================
// Кольцевой буфер для хранения lag точек по группам
// =============================================================================

// lagRingBuffer – кольцевой буфер для одной группы.
type lagRingBuffer struct {
	points []LagPoint
	idx    int
	full   bool
	mu     sync.RWMutex
}

// lagMetricsStorage – хранилище буферов для всех групп.
type lagMetricsStorage struct {
	mu   sync.RWMutex
	data map[string]*lagRingBuffer
	size int
}

func newLagMetricsStorage(bufferSize int) *lagMetricsStorage {
	return &lagMetricsStorage{
		data: make(map[string]*lagRingBuffer),
		size: bufferSize,
	}
}

func (s *lagMetricsStorage) getOrCreateBuffer(group string) *lagRingBuffer {
	s.mu.RLock()
	buf, exists := s.data[group]
	s.mu.RUnlock()
	if exists {
		return buf
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if buf, exists = s.data[group]; exists {
		return buf
	}
	buf = &lagRingBuffer{
		points: make([]LagPoint, s.size),
		idx:    0,
		full:   false,
	}
	s.data[group] = buf
	return buf
}

func (s *lagMetricsStorage) addPoint(group string, point LagPoint) {
	buf := s.getOrCreateBuffer(group)
	buf.mu.Lock()
	defer buf.mu.Unlock()
	buf.points[buf.idx] = point
	buf.idx = (buf.idx + 1) % s.size
	if buf.idx == 0 {
		buf.full = true
	}
}

func (s *lagMetricsStorage) getAllPoints() []LagPoint {
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]LagPoint, 0)
	for group, buf := range s.data {
		buf.mu.RLock()
		n := s.size
		if !buf.full {
			n = buf.idx
		}
		start := buf.idx - n
		if start < 0 {
			start += s.size
		}
		for i := 0; i < n; i++ {
			pt := buf.points[(start+i)%s.size]
			if pt.Time != "" {
				if pt.Group == "" {
					pt.Group = group
				}
				result = append(result, pt)
			}
		}
		buf.mu.RUnlock()
	}
	return result
}

// =============================================================================
// Сборщик метрик lag
// =============================================================================

// LagCollector собирает lag для всех consumer групп.
type LagCollector struct {
	storage      *lagMetricsStorage
	bootstrap    string
	lastLags     map[string]int64 // для текущего lag, не используется для истории, но можно оставить
	mu           sync.Mutex
	stopChan     chan struct{}
	interval     time.Duration
}

func NewLagCollector(bootstrap string, bufferSize int, interval time.Duration) *LagCollector {
	return &LagCollector{
		storage:   newLagMetricsStorage(bufferSize),
		bootstrap: bootstrap,
		lastLags:  make(map[string]int64),
		stopChan:  make(chan struct{}),
		interval:  interval,
	}
}

func (lc *LagCollector) Start() {
	go func() {
		ticker := time.NewTicker(lc.interval)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				lc.collect()
			case <-lc.stopChan:
				log.Printf("[LagCollector] остановлен для bootstrap %s", lc.bootstrap)
				return
			}
		}
	}()
}

func (lc *LagCollector) Stop() {
	close(lc.stopChan)
}

func (lc *LagCollector) collect() {
	lc.mu.Lock()
	defer lc.mu.Unlock()

	lagMap, err := lc.fetchConsumerLags()
	if err != nil {
		log.Printf("[LagCollector] ошибка получения lag: %v", err)
		return
	}

	now := time.Now()
	for group, lag := range lagMap {
		// lag может быть отрицательным? Нет, он всегда >= 0, но на всякий случай обрезаем
		if lag < 0 {
			lag = 0
		}
		point := LagPoint{
			Time:  now.Format("15:04:05"),
			Group: group,
			Value: lag,
		}
		lc.storage.addPoint(group, point)
	}
	log.Printf("[LagCollector] собрано lag для %d групп", len(lagMap))
}

// fetchConsumerLags возвращает текущий lag для каждой активной consumer группы.
func (lc *LagCollector) fetchConsumerLags() (map[string]int64, error) {
	admin, err := createAdminClient(lc.bootstrap)
	if err != nil {
		return nil, err
	}
	defer admin.Close()

	// Создаём клиент для получения latest offset
	config := sarama.NewConfig()
	config.Version = sarama.V2_8_0_0
	client, err := sarama.NewClient([]string{lc.bootstrap}, config)
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

func (lc *LagCollector) GetPoints() []LagPoint {
	return lc.storage.getAllPoints()
}

// =============================================================================
// Глобальное управление сборщиками для разных кластеров
// =============================================================================

var (
	currentLagCollector *LagCollector
	lagCollectorMu      sync.RWMutex
)

func ensureLagCollectorForBootstrap(bootstrap string) {
	lagCollectorMu.Lock()
	defer lagCollectorMu.Unlock()
	if currentLagCollector != nil && currentLagCollector.bootstrap == bootstrap {
		return
	}
	if currentLagCollector != nil {
		currentLagCollector.Stop()
	}
	log.Printf("[LagCollector] создаём сборщик для bootstrap: %s", bootstrap)
	// Буфер на 288 точек (24 часа при интервале 10 секунд – 2880, но оставим 288 для согласованности)
	currentLagCollector = NewLagCollector(bootstrap, 288, 10*time.Second)
	currentLagCollector.Start()
}

// GetConsumerLagHandler – обработчик API, возвращает точки lag для фронтенда.
func GetConsumerLagHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	bootstrap := getBootstrapFromRequest(r)
	if bootstrap == "" {
		sendJSONError(w, "Bootstrap server not provided", http.StatusBadRequest)
		return
	}

	ensureLagCollectorForBootstrap(bootstrap)

	lagCollectorMu.RLock()
	collector := currentLagCollector
	lagCollectorMu.RUnlock()

	if collector == nil {
		sendJSONError(w, "Сборщик lag не инициализирован", http.StatusInternalServerError)
		return
	}

	// Поддержка параметра range (аналогично topics)
	rangeParam := r.URL.Query().Get("range")
	limit := 0
	switch rangeParam {
	case "15m":
		limit = 90
	case "1h":
		limit = 360
	case "6h":
		limit = 2160
	case "24h":
		limit = 8640
	default:
		limit = 0
	}

	allPoints := collector.GetPoints()
	var points []LagPoint
	if limit > 0 && len(allPoints) > limit {
		points = allPoints[len(allPoints)-limit:]
	} else {
		points = allPoints
	}

	response := LagResponse{Points: points}
	log.Printf("[GetConsumerLagHandler] возвращаем %d точек (из %d) для range=%s", len(points), len(allPoints), rangeParam)
	_ = json.NewEncoder(w).Encode(response)
}