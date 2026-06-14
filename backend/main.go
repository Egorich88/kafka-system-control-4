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

// Package main — точка входа бэкенда для Kafka System Control.
// Предоставляет REST API для управления топиками, сообщениями,
// а также метриками для дашборда.
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/IBM/sarama"
)

// =============================================================================
// Модели данных (DTO) для API
// =============================================================================

type TopicMetadata struct {
	Name              string `json:"name"`
	Partitions        int32  `json:"partitions"`
	ReplicationFactor int16  `json:"replicationFactor"`
}

type TopicsResponse struct {
	Topics []TopicMetadata `json:"topics"`
	Error  string          `json:"error,omitempty"`
}

type CreateTopicRequest struct {
	Topic       string            `json:"topic"`
	Partitions  int32             `json:"partitions"`
	Replication int16             `json:"replication"`
	Configs     map[string]string `json:"configs,omitempty"`
}

type CreateTopicResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}

type PartitionInfo struct {
	ID       int32   `json:"id"`
	Leader   int32   `json:"leader"`
	Replicas []int32 `json:"replicas"`
	Isr      []int32 `json:"isr"`
}

type TopicDetailResponse struct {
	Name              string            `json:"name"`
	Partitions        []PartitionInfo   `json:"partitions"`
	ReplicationFactor int16             `json:"replicationFactor"`
	Configs           map[string]string `json:"configs"`
}

type UpdateTopicConfigRequest struct {
	Configs map[string]string `json:"configs"`
}

// =============================================================================
// Вспомогательные функции
// =============================================================================

// getBootstrapFromRequest возвращает адрес Kafka-брокера из заголовка или переменной окружения.
func getBootstrapFromRequest(r *http.Request) string {
	if bootstrap := r.Header.Get("X-Kafka-Bootstrap"); bootstrap != "" {
		return bootstrap
	}
	if env := os.Getenv("KAFKA_BOOTSTRAP_SERVERS"); env != "" {
		return env
	}
	return "localhost:9092"
}

// createAdminClient создаёт административный клиент Sarama для управления кластером.
func createAdminClient(bootstrap string) (sarama.ClusterAdmin, error) {
	config := sarama.NewConfig()
	config.Version = sarama.V2_8_0_0
	return sarama.NewClusterAdmin([]string{bootstrap}, config)
}

// sendJSONError отправляет JSON-ответ с сообщением об ошибке и HTTP-статусом.
func sendJSONError(w http.ResponseWriter, msg string, status int) {
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

// =============================================================================
// HTTP-обработчики для управления топиками
// =============================================================================

// getTopicsHandler возвращает список всех топиков с базовой информацией.
func getTopicsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	bootstrap := getBootstrapFromRequest(r)
	admin, err := createAdminClient(bootstrap)
	if err != nil {
		log.Printf("AdminClient error: %v", err)
		sendJSONError(w, "Failed to connect to Kafka: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer admin.Close()

	topicsMap, err := admin.ListTopics()
	if err != nil {
		log.Printf("ListTopics error: %v", err)
		sendJSONError(w, "Failed to list topics: "+err.Error(), http.StatusInternalServerError)
		return
	}

	result := make([]TopicMetadata, 0, len(topicsMap))
	for name, metadata := range topicsMap {
		result = append(result, TopicMetadata{
			Name:              name,
			Partitions:        metadata.NumPartitions,
			ReplicationFactor: metadata.ReplicationFactor,
		})
	}
	_ = json.NewEncoder(w).Encode(TopicsResponse{Topics: result})
}

// createTopicHandler создаёт новый топик.
func createTopicHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Kafka-Bootstrap")
		w.WriteHeader(http.StatusNoContent)
		return
	}

	var req CreateTopicRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("JSON decode error: %v", err)
		sendJSONError(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	if req.Topic == "" {
		sendJSONError(w, "Topic name required", http.StatusBadRequest)
		return
	}

	partitions := req.Partitions
	if partitions <= 0 {
		partitions = 1
	}
	replication := req.Replication
	if replication <= 0 {
		replication = 1
	}

	bootstrap := getBootstrapFromRequest(r)
	admin, err := createAdminClient(bootstrap)
	if err != nil {
		log.Printf("AdminClient error: %v", err)
		sendJSONError(w, "Failed to connect to Kafka: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer admin.Close()

	topicDetail := &sarama.TopicDetail{
		NumPartitions:     partitions,
		ReplicationFactor: replication,
	}
	if len(req.Configs) > 0 {
		configMap := make(map[string]*string)
		for key, value := range req.Configs {
			v := value
			configMap[key] = &v
		}
		topicDetail.ConfigEntries = configMap
	}

	if err := admin.CreateTopic(req.Topic, topicDetail, false); err != nil {
		log.Printf("CreateTopic error: %v", err)
		sendJSONError(w, "Failed to create topic: "+err.Error(), http.StatusInternalServerError)
		return
	}
	_ = json.NewEncoder(w).Encode(CreateTopicResponse{Success: true})
}

// deleteTopicHandler удаляет топик по имени.
func deleteTopicHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	topic := strings.TrimPrefix(r.URL.Path, "/api/topics/")
	topic = strings.TrimSuffix(topic, "/")
	if topic == "" {
		sendJSONError(w, "Topic name required", http.StatusBadRequest)
		return
	}

	bootstrap := getBootstrapFromRequest(r)
	log.Printf("Deleting topic: %s, bootstrap: %s", topic, bootstrap)

	admin, err := createAdminClient(bootstrap)
	if err != nil {
		log.Printf("AdminClient error: %v", err)
		sendJSONError(w, "Failed to connect to Kafka: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer admin.Close()

	if err = admin.DeleteTopic(topic); err != nil {
		log.Printf("DeleteTopic error: %v", err)
		sendJSONError(w, "Failed to delete topic: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// getTopicDetailHandler возвращает детальную информацию о топике (партиции, конфиги).
func getTopicDetailHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	topic := strings.TrimPrefix(r.URL.Path, "/api/topics/")
	topic = strings.TrimSuffix(topic, "/")
	if topic == "" {
		sendJSONError(w, "Topic name required", http.StatusBadRequest)
		return
	}

	bootstrap := getBootstrapFromRequest(r)
	admin, err := createAdminClient(bootstrap)
	if err != nil {
		sendJSONError(w, "Failed to connect to Kafka: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer admin.Close()

	metadata, err := admin.DescribeTopics([]string{topic})
	if err != nil {
		sendJSONError(w, "Failed to describe topic: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if len(metadata) == 0 {
		sendJSONError(w, "Topic not found", http.StatusNotFound)
		return
	}

	topicMeta := metadata[0]
	if topicMeta.Err != sarama.ErrNoError {
		sendJSONError(w, topicMeta.Err.Error(), http.StatusInternalServerError)
		return
	}

	partitions := make([]PartitionInfo, 0, len(topicMeta.Partitions))
	for _, p := range topicMeta.Partitions {
		partitions = append(partitions, PartitionInfo{
			ID:       p.ID,
			Leader:   p.Leader,
			Replicas: p.Replicas,
			Isr:      p.Isr,
		})
	}

	replicationFactor := int16(1)
	if len(topicMeta.Partitions) > 0 {
		replicationFactor = int16(len(topicMeta.Partitions[0].Replicas))
	}

	configs := make(map[string]string)
	cfgResource := sarama.ConfigResource{Type: sarama.TopicResource, Name: topic}
	resp, err := admin.DescribeConfig(cfgResource)
	if err != nil {
		log.Printf("DescribeConfig error for topic %s: %v", topic, err)
	} else {
		for _, entry := range resp {
			configs[entry.Name] = entry.Value
		}
		log.Printf("Loaded %d config entries for topic %s", len(configs), topic)
	}

	response := TopicDetailResponse{
		Name:              topic,
		Partitions:        partitions,
		ReplicationFactor: replicationFactor,
		Configs:           configs,
	}
	_ = json.NewEncoder(w).Encode(response)
}

// updateTopicConfigHandler обновляет конфигурацию топика.
func updateTopicConfigHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Methods", "PATCH, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Kafka-Bootstrap")
		w.WriteHeader(http.StatusNoContent)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/topics/")
	path = strings.TrimSuffix(path, "/config")
	topic := strings.TrimSuffix(path, "/")
	if topic == "" {
		sendJSONError(w, "Topic name required", http.StatusBadRequest)
		return
	}

	var req UpdateTopicConfigRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	bootstrap := getBootstrapFromRequest(r)
	admin, err := createAdminClient(bootstrap)
	if err != nil {
		sendJSONError(w, "Failed to connect to Kafka: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer admin.Close()

	configs := make(map[string]*string)
	for key, value := range req.Configs {
		v := value
		configs[key] = &v
	}
	if err = admin.AlterConfig(sarama.TopicResource, topic, configs, false); err != nil {
		sendJSONError(w, "Failed to update config: "+err.Error(), http.StatusInternalServerError)
		return
	}
	_ = json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

// =============================================================================
// Основная функция — настройка маршрутов и запуск сервера
// =============================================================================

func main() {
	// ----- Группа маршрутов для управления топиками -----
	http.HandleFunc("/api/topics", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet:
			getTopicsHandler(w, r)
		case http.MethodPost:
			createTopicHandler(w, r)
		default:
			w.WriteHeader(http.StatusMethodNotAllowed)
		}
	})

	http.HandleFunc("/api/topics/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/api/topics/" {
			getTopicsHandler(w, r)
			return
		}
		switch r.Method {
		case http.MethodDelete:
			deleteTopicHandler(w, r)
		case http.MethodPatch:
			if strings.Contains(r.URL.Path, "/config") {
				updateTopicConfigHandler(w, r)
			} else {
				w.WriteHeader(http.StatusNotFound)
			}
		case http.MethodGet:
			if strings.Contains(r.URL.Path, "/messages") {
				getMessagesHandler(w, r) // обработчик из search.go
			} else if strings.Contains(r.URL.Path, "/partitions") {
				getPartitionsHandler(w, r) // обработчик из search.go
			} else {
				getTopicDetailHandler(w, r)
			}
		default:
			w.WriteHeader(http.StatusNotFound)
		}
	})

	// ----- Маршруты для Overview (метрики кластера) -----
	http.HandleFunc("/api/overview", getDashboardOverviewHandler)
	http.HandleFunc("/api/overview/brokers", getDashboardBrokersHandler)
	http.HandleFunc("/api/overview/consumer-groups", getDashboardConsumerGroupsHandler)
	http.HandleFunc("/api/overview/partitions", getDashboardPartitionsHandler)
	http.HandleFunc("/api/overview/throughput", getDashboardThroughputHandler)
	http.HandleFunc("/api/overview/messages-total", getDashboardMessagesTotalHandler)

	port := ":8080"
	log.Printf("Server running on %s", port)
	log.Fatal(http.ListenAndServe(port, nil))
}