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
	"strconv"
	"strings"
	"time"

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

type MessagesResponse struct {
	Messages []Message `json:"messages"`
}

type Message struct {
	Offset    int64  `json:"offset"`
	Key       string `json:"key"`
	Value     string `json:"value"`
	Timestamp string `json:"timestamp"`
}

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
	config.Version = sarama.V2_8_0_0
	return sarama.NewClusterAdmin([]string{bootstrap}, config)
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

func deleteTopicHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 3 {
		sendJSONError(w, "Invalid topic path", http.StatusBadRequest)
		return
	}
	topic := pathParts[2]
	if topic == "" {
		sendJSONError(w, "Topic name required", http.StatusBadRequest)
		return
	}
	bootstrap := getBootstrapFromRequest(r)
	admin, err := createAdminClient(bootstrap)
	if err != nil {
		log.Printf("AdminClient error: %v", err)
		sendJSONError(w, "Failed to connect to Kafka: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer admin.Close()
	err = admin.DeleteTopic(topic)
	if err != nil {
		log.Printf("DeleteTopic error: %v", err)
		sendJSONError(w, "Failed to delete topic: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func getMessagesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	pathParts := strings.Split(r.URL.Path, "/")
	if len(pathParts) < 4 {
		sendJSONError(w, "Invalid topic path", http.StatusBadRequest)
		return
	}
	topic := pathParts[3]
	if topic == "" {
		sendJSONError(w, "Topic name required", http.StatusBadRequest)
		return
	}
	partitionStr := r.URL.Query().Get("partition")
	offsetStr := r.URL.Query().Get("offset")
	limitStr := r.URL.Query().Get("limit")

	partition := int32(0)
	if partitionStr != "" {
		if p, err := strconv.Atoi(partitionStr); err == nil && p >= 0 {
			partition = int32(p)
		}
	}
	offset := int64(0)
	if offsetStr != "" {
		if o, err := strconv.ParseInt(offsetStr, 10, 64); err == nil && o >= 0 {
			offset = o
		}
	}
	limit := int32(10)
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 1000 {
			limit = int32(l)
		}
	}

	bootstrap := getBootstrapFromRequest(r)
	config := sarama.NewConfig()
	config.Version = sarama.V2_8_0_0
	config.Consumer.Return.Errors = true
	consumer, err := sarama.NewConsumer([]string{bootstrap}, config)
	if err != nil {
		log.Printf("Consumer error: %v", err)
		sendJSONError(w, "Failed to create consumer: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer consumer.Close()

	pc, err := consumer.ConsumePartition(topic, partition, offset)
	if err != nil {
		log.Printf("ConsumePartition error: %v", err)
		sendJSONError(w, "Failed to consume partition: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer pc.Close()

	messages := make([]Message, 0, limit)
	timeout := time.After(3 * time.Second)
	done := false
	for i := int32(0); i < limit && !done; i++ {
		select {
		case msg := <-pc.Messages():
			messages = append(messages, Message{
				Offset:    msg.Offset,
				Key:       string(msg.Key),
				Value:     string(msg.Value),
				Timestamp: msg.Timestamp.Format(time.RFC3339),
			})
		case err := <-pc.Errors():
			log.Printf("Consumer error: %v", err)
		case <-timeout:
			done = true
		}
	}
	json.NewEncoder(w).Encode(MessagesResponse{Messages: messages})
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

	http.HandleFunc("/api/topics/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodDelete {
			deleteTopicHandler(w, r)
		} else if r.Method == http.MethodGet && strings.Contains(r.URL.Path, "/messages") {
			getMessagesHandler(w, r)
		} else {
			w.WriteHeader(http.StatusNotFound)
		}
	})

	port := ":8080"
	log.Printf("Server running on %s", port)
	log.Fatal(http.ListenAndServe(port, nil))
}