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
	"os"
	"os/exec"
	"strings"
)

type TopicsResponse struct {
	Topics []string `json:"topics"`
	Error  string   `json:"error,omitempty"`
}

type CreateTopicRequest struct {
	Topic       string `json:"topic"`
	Partitions  string `json:"partitions"`
	Replication string `json:"replication"`
	Configs     string `json:"configs,omitempty"`
}

type CreateTopicResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}

type ClusterInfo struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Bootstrap string `json:"bootstrap"`
}

// Карта соответствия ID кластера -> bootstrap сервер
var clusterBootstrapMap = map[string]string{
	"local": "localhost:9092",
	"dev":   "dev-kafka.example.com:9092",
	"prod":  "prod-kafka.example.com:9092",
}

// Список доступных кластеров
func getAvailableClusters() []ClusterInfo {
	return []ClusterInfo{
		{ID: "local", Name: "Локальный (WSL)", Bootstrap: clusterBootstrapMap["local"]},
		{ID: "dev", Name: "DEV", Bootstrap: clusterBootstrapMap["dev"]},
		{ID: "prod", Name: "PROD", Bootstrap: clusterBootstrapMap["prod"]},
	}
}

// Возвращает bootstrap для кластера (или fallback)
func getBootstrapForCluster(clusterID string) string {
	if bs, ok := clusterBootstrapMap[clusterID]; ok {
		return bs
	}
	if env := os.Getenv("KAFKA_BOOTSTRAP_SERVERS"); env != "" {
		return env
	}
	return "localhost:9092"
}

// Чтение заголовка X-Kafka-Cluster
func getBootstrapFromRequest(r *http.Request) string {
	if clusterID := r.Header.Get("X-Kafka-Cluster"); clusterID != "" {
		return getBootstrapForCluster(clusterID)
	}
	if env := os.Getenv("KAFKA_BOOTSTRAP_SERVERS"); env != "" {
		return env
	}
	return "localhost:9092"
}

// Старый метод для обратной совместимости
func getBootstrapServer() string {
	if env := os.Getenv("KAFKA_BOOTSTRAP_SERVERS"); env != "" {
		return env
	}
	return "localhost:9092"
}

func getClustersHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(getAvailableClusters())
}

func getTopicsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	bootstrapServer := getBootstrapFromRequest(r)

	cmdPath, err := exec.LookPath("kafka-topics.sh")
	if err != nil {
		sendJSONError(w, "kafka-topics.sh not found", http.StatusInternalServerError)
		return
	}
	cmd := exec.Command(cmdPath, "--bootstrap-server", bootstrapServer, "--list")
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Ошибка: %v, вывод: %s", err, output)
		sendJSONError(w, string(output), http.StatusInternalServerError)
		return
	}
	lines := strings.Split(strings.TrimSpace(string(output)), "\n")
	topics := make([]string, 0)
	for _, line := range lines {
		if line != "" {
			topics = append(topics, line)
		}
	}
	json.NewEncoder(w).Encode(TopicsResponse{Topics: topics})
}

func createTopicHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Kafka-Cluster")
		w.WriteHeader(http.StatusNoContent)
		return
	}
	var req CreateTopicRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	if req.Topic == "" {
		sendJSONError(w, "Topic name required", http.StatusBadRequest)
		return
	}
	partitions := req.Partitions
	if partitions == "" {
		partitions = "1"
	}
	replication := req.Replication
	if replication == "" {
		replication = "1"
	}
	bootstrapServer := getBootstrapFromRequest(r)
	cmdPath, _ := exec.LookPath("kafka-topics.sh")
	args := []string{
		"--bootstrap-server", bootstrapServer,
		"--create",
		"--topic", req.Topic,
		"--partitions", partitions,
		"--replication-factor", replication,
	}
	if req.Configs != "" {
		for _, cfg := range strings.Split(req.Configs, ",") {
			cfg = strings.TrimSpace(cfg)
			if cfg != "" {
				args = append(args, "--config", cfg)
			}
		}
	}
	cmd := exec.Command(cmdPath, args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Ошибка создания топика: %v, вывод: %s", err, output)
		sendJSONError(w, string(output), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(CreateTopicResponse{Success: true})
}

func sendJSONError(w http.ResponseWriter, msg string, status int) {
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

func main() {
	http.HandleFunc("/api/clusters", getClustersHandler)
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
	port := ":8080"
	log.Printf("Server running on port %s", port)
	log.Fatal(http.ListenAndServe(port, nil))
}