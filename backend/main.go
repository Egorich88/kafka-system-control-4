package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/IBM/sarama"
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

// Получаем bootstrap-адрес из заголовка X-Kafka-Bootstrap, переменной окружения или по умолчанию
func getBootstrapFromRequest(r *http.Request) string {
	if bootstrap := r.Header.Get("X-Kafka-Bootstrap"); bootstrap != "" {
		return bootstrap
	}
	if env := os.Getenv("KAFKA_BOOTSTRAP_SERVERS"); env != "" {
		return env
	}
	return "localhost:9092"
}

func createAdminClient(bootstrap string) (sarama.ClusterAdmin, error) {
	config := sarama.NewConfig()
	config.Version = sarama.V2_6_0_0
	client, err := sarama.NewClient([]string{bootstrap}, config)
	if err != nil {
		return nil, err
	}
	admin, err := sarama.NewClusterAdminFromClient(client)
	if err != nil {
		client.Close()
		return nil, err
	}
	return admin, nil
}

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

	topics, err := admin.ListTopics()
	if err != nil {
		log.Printf("ListTopics error: %v", err)
		sendJSONError(w, "Failed to list topics: "+err.Error(), http.StatusInternalServerError)
		return
	}

	names := make([]string, 0, len(topics))
	for name := range topics {
		names = append(names, name)
	}
	json.NewEncoder(w).Encode(TopicsResponse{Topics: names})
}

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
		sendJSONError(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	if req.Topic == "" {
		sendJSONError(w, "Topic name required", http.StatusBadRequest)
		return
	}
	partitions := int32(1)
	if req.Partitions != "" {
		if p, err := strconv.Atoi(req.Partitions); err == nil && p > 0 {
			partitions = int32(p)
		}
	}
	replication := int16(1)
	if req.Replication != "" {
		if rf, err := strconv.Atoi(req.Replication); err == nil && rf > 0 {
			replication = int16(rf)
		}
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
	if req.Configs != "" {
		configMap := make(map[string]*string)
		for _, cfg := range strings.Split(req.Configs, ",") {
			cfg = strings.TrimSpace(cfg)
			if cfg == "" {
				continue
			}
			parts := strings.SplitN(cfg, "=", 2)
			if len(parts) == 2 {
				val := parts[1]
				configMap[parts[0]] = &val
			} else {
				empty := ""
				configMap[cfg] = &empty
			}
		}
		topicDetail.ConfigEntries = configMap
	}

	if err := admin.CreateTopic(req.Topic, topicDetail, false); err != nil {
		log.Printf("CreateTopic error: %v", err)
		sendJSONError(w, "Failed to create topic: "+err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(CreateTopicResponse{Success: true})
}

func sendJSONError(w http.ResponseWriter, msg string, status int) {
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

func main() {
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
	log.Printf("Server running on %s", port)
	log.Fatal(http.ListenAndServe(port, nil))
}