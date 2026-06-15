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

// =============================================================================
// Файл: health.go
// =============================================================================
// Назначение:
//   Предоставляет HTTP-обработчик для проверки состояния (health check)
//   подключения к Kafka-кластеру.
//
// Используется фронтендом для:
//   - Отображения зелёного/красного/серого индикатора рядом с кластером
//   - Визуальной обратной связи о доступности брокеров
//
// Механизм:
//   Принимает запрос с заголовком X-Kafka-Bootstrap (адрес брокера),
//   пытается подключиться к Kafka и получить список топиков.
//   В зависимости от успеха возвращает статус "connected" или "disconnected".
// =============================================================================

package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/IBM/sarama"
)

// ClusterHealthResponse представляет ответ API с результатом проверки.
// Поле Status принимает значения: "connected", "disconnected", "error".
// Поле Error опционально, содержит текст ошибки при её возникновении.
type ClusterHealthResponse struct {
	Status string `json:"status"`            // "connected", "disconnected", "error"
	Error  string `json:"error,omitempty"`  // детали ошибки (если есть)
}

// getClusterHealthHandler – HTTP-обработчик для проверки доступности Kafka.
// Маршрут: GET /api/clusters/health
// Заголовок: X-Kafka-Bootstrap: <адрес брокера>
//
// Логика работы:
//   1. Извлекает bootstrap из заголовка запроса.
//   2. Создаёт конфигурацию Sarama с короткими таймаутами.
//   3. Пытается создать клиент и подключиться к Kafka.
//   4. Запрашивает список топиков (дополнительная проверка).
//   5. Возвращает JSON со статусом "connected" или "disconnected".
func getClusterHealthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	// Получаем адрес брокера из заголовка (единый способ для всех API)
	bootstrap := getBootstrapFromRequest(r)
	if bootstrap == "" {
		sendJSONError(w, "Bootstrap server not provided", http.StatusBadRequest)
		return
	}

	// Конфигурация с агрессивными таймаутами для быстрой проверки
	config := sarama.NewConfig()
	config.Version = sarama.V2_8_0_0
	config.Net.DialTimeout = 3 * time.Second   // время ожидания подключения
	config.Net.ReadTimeout = 2 * time.Second
	config.Net.WriteTimeout = 2 * time.Second

	// Пытаемся создать клиент Sarama
	client, err := sarama.NewClient([]string{bootstrap}, config)
	if err != nil {
		// Не удалось подключиться — кластер недоступен
		response := ClusterHealthResponse{
			Status: "disconnected",
			Error:  err.Error(),
		}
		_ = json.NewEncoder(w).Encode(response)
		return
	}
	defer client.Close()

	// Дополнительная проверка: запрашиваем список топиков,
	// чтобы удостовериться, что брокер отвечает на запросы.
	if _, err := client.Topics(); err != nil {
		response := ClusterHealthResponse{
			Status: "disconnected",
			Error:  err.Error(),
		}
		_ = json.NewEncoder(w).Encode(response)
		return
	}

	// Все проверки пройдены — кластер доступен
	response := ClusterHealthResponse{Status: "connected"}
	_ = json.NewEncoder(w).Encode(response)
}