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

type Message struct {
	Offset    int64  `json:"offset"`
	Key       string `json:"key"`
	Value     string `json:"value"`
	Timestamp string `json:"timestamp"`
}

type MessagesResponse struct {
    Messages []Message `json:"messages"`
    Total    int       `json:"total"`
}

type PartitionInfo struct {
	ID       int32   `json:"id"`
	Leader   int32   `json:"leader"`
	Replicas []int32 `json:"replicas"`
	Isr      []int32 `json:"isr"`
}

type PartitionsResponse struct {
    Partitions []int32 `json:"partitions"`
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

		sendJSONError(
			w,
			"Failed to connect to Kafka: "+err.Error(),
			http.StatusInternalServerError,
		)

		return
	}

	defer admin.Close()

	topicsMap, err := admin.ListTopics()

	if err != nil {

		log.Printf("ListTopics error: %v", err)

		sendJSONError(
			w,
			"Failed to list topics: "+err.Error(),
			http.StatusInternalServerError,
		)

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

	json.NewEncoder(w).Encode(TopicsResponse{
		Topics: result,
	})
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

		sendJSONError(
			w,
			"Failed to connect to Kafka: "+err.Error(),
			http.StatusInternalServerError,
		)

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

		sendJSONError(
			w,
			"Failed to create topic: "+err.Error(),
			http.StatusInternalServerError,
		)

		return
	}

	json.NewEncoder(w).Encode(CreateTopicResponse{
		Success: true,
	})
}

func deleteTopicHandler(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	path := strings.TrimPrefix(r.URL.Path, "/api/topics/")
	topic := strings.TrimSuffix(path, "/")

	if topic == "" {

		sendJSONError(w, "Topic name required", http.StatusBadRequest)

		return
	}

	bootstrap := getBootstrapFromRequest(r)

	log.Printf("Deleting topic: %s, bootstrap: %s", topic, bootstrap)

	admin, err := createAdminClient(bootstrap)

	if err != nil {

		log.Printf("AdminClient error: %v", err)

		sendJSONError(
			w,
			"Failed to connect to Kafka: "+err.Error(),
			http.StatusInternalServerError,
		)

		return
	}

	defer admin.Close()

	err = admin.DeleteTopic(topic)

	if err != nil {

		log.Printf("DeleteTopic error: %v", err)

		sendJSONError(
			w,
			"Failed to delete topic: "+err.Error(),
			http.StatusInternalServerError,
		)

		return
	}

	w.WriteHeader(http.StatusNoContent)
}

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

		sendJSONError(
			w,
			"Failed to connect to Kafka: "+err.Error(),
			http.StatusInternalServerError,
		)

		return
	}

	defer admin.Close()

	metadata, err := admin.DescribeTopics([]string{topic})

	if err != nil {

		sendJSONError(
			w,
			"Failed to describe topic: "+err.Error(),
			http.StatusInternalServerError,
		)

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

	cfgResource := sarama.ConfigResource{
		Type: sarama.TopicResource,
		Name: topic,
	}

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

	json.NewEncoder(w).Encode(response)
}

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

		sendJSONError(
			w,
			"Failed to connect to Kafka: "+err.Error(),
			http.StatusInternalServerError,
		)

		return
	}

	defer admin.Close()

	configs := make(map[string]*string)

	for key, value := range req.Configs {

		v := value

		configs[key] = &v
	}

	err = admin.AlterConfig(
    	sarama.TopicResource,
    	topic,
    	configs,
    	false,
    )

	if err != nil {

		sendJSONError(
			w,
			"Failed to update config: "+err.Error(),
			http.StatusInternalServerError,
		)

		return
	}

	json.NewEncoder(w).Encode(map[string]bool{
		"success": true,
	})
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

	offsetStr := r.URL.Query().Get("offset")
	limitStr := r.URL.Query().Get("limit")

	partitionStr := r.URL.Query().Get("partition")
	log.Printf(
        "partitionStr='%s'",
        partitionStr,
    )

    var partition int32 = -1

    if partitionStr != "" && partitionStr != "all" {

        if p, err := strconv.Atoi(partitionStr); err == nil {
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

	client, err := sarama.NewClient([]string{bootstrap}, config)

    if err != nil {

    	log.Printf("Client error: %v", err)

    	sendJSONError(
    		w,
    		"Failed to create client: "+err.Error(),
    		http.StatusInternalServerError,
    	)

    	return
    }

    defer client.Close()

    consumer, err := sarama.NewConsumerFromClient(client)

    if err != nil {

    	log.Printf("Consumer error: %v", err)

    	sendJSONError(
    		w,
    		"Failed to create consumer: "+err.Error(),
    		http.StatusInternalServerError,
    	)

    	return
    }

    defer consumer.Close()

    var earliestOffset int64
    var latestOffset int64

    if partition != -1 {

        earliestOffset, err = client.GetOffset(
            topic,
            partition,
            sarama.OffsetOldest,
        )

        if err != nil {

            sendJSONError(
                w,
                "Failed to get earliest offset: "+err.Error(),
                http.StatusInternalServerError,
            )

            return
        }

        latestOffset, err = client.GetOffset(
            topic,
            partition,
            sarama.OffsetNewest,
        )

        if err != nil {

            sendJSONError(
                w,
                "Failed to get latest offset: "+err.Error(),
                http.StatusInternalServerError,
            )

            return
        }
    }

    if offset < earliestOffset {
    	offset = earliestOffset
    }
    messages := make([]Message, 0)
    if partition != -1 && offset >= latestOffset {

        total := len(messages)

        if partition != -1 {
            total = int(latestOffset - earliestOffset)
        }

        json.NewEncoder(w).Encode(MessagesResponse{
            Messages: messages,
            Total: total,
        })

        return
    }


    partitions, err := client.Partitions(topic)
    log.Printf(
        "TOPIC %s PARTITIONS: %+v",
        topic,
        partitions,
    )

    if err != nil {

        sendJSONError(
            w,
            "Failed to get partitions: "+err.Error(),
            http.StatusInternalServerError,
        )

        return
    }
    if partition == -1 {

        for _, p := range partitions {
            log.Printf(
                "READ topic=%s partition=%d offset=%d earliest=%d latest=%d",
                topic,
                partition,
                offset,
                earliestOffset,
                latestOffset,
            )
            pc, err := consumer.ConsumePartition(
                topic,
                p,
                sarama.OffsetOldest,
            )

            if err != nil {

                log.Printf(
                    "Partition %d error: %v",
                    p,
                    err,
                )

                continue
            }

            timeout := time.After(
                1 * time.Second,
            )

            done := false

            for !done {

                select {

                case msg := <-pc.Messages():

                    messages = append(messages, Message{
                        Offset: msg.Offset,
                        Key: string(msg.Key),
                        Value: string(msg.Value),
                        Timestamp: msg.Timestamp.Format(
                            time.RFC3339,
                        ),
                    })

                    if len(messages) >= int(limit) {

                        done = true
                    }

                case <-timeout:

                    done = true
                }
            }

            pc.Close()
        }

    } else {

        pc, err := consumer.ConsumePartition(
            topic,
            partition,
            offset,
        )

        if err != nil {

            sendJSONError(
                w,
                "Failed to consume partition: "+
                    err.Error(),
                http.StatusInternalServerError,
            )

            return
        }

        defer pc.Close()

        timeout := time.After(
            3 * time.Second,
        )

        done := false

        for i := int32(0); i < limit && !done; i++ {

            select {

            case msg := <-pc.Messages():

                messages = append(messages, Message{
                    Offset: msg.Offset,
                    Key: string(msg.Key),
                    Value: string(msg.Value),
                    Timestamp: msg.Timestamp.Format(
                        time.RFC3339,
                    ),
                })

            case <-timeout:

                done = true
            }
        }
    }
    total := len(messages)

    if partition != -1 {
        total = int(latestOffset - earliestOffset)
    }

    json.NewEncoder(w).Encode(MessagesResponse{
        Messages: messages,
        Total: total,
    })
}

func sendJSONError(w http.ResponseWriter, msg string, status int) {

	w.WriteHeader(status)

	json.NewEncoder(w).Encode(map[string]string{
		"error": msg,
	})
}

func getPartitionsHandler(w http.ResponseWriter, r *http.Request) {

    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Content-Type", "application/json")

    path := strings.TrimPrefix(
        r.URL.Path,
        "/api/topics/",
    )

    path = strings.TrimSuffix(
        path,
        "/partitions",
    )

    topic := strings.TrimSuffix(
        path,
        "/",
    )

    bootstrap := getBootstrapFromRequest(r)

    config := sarama.NewConfig()
    config.Version = sarama.V2_8_0_0

    client, err := sarama.NewClient(
        []string{bootstrap},
        config,
    )

    if err != nil {

        sendJSONError(
            w,
            err.Error(),
            http.StatusInternalServerError,
        )

        return
    }

    defer client.Close()

    partitions, err := client.Partitions(topic)
    log.Printf(
        "GET PARTITIONS %s -> %+v",
        topic,
        partitions,
    )

    if err != nil {

        sendJSONError(
            w,
            err.Error(),
            http.StatusInternalServerError,
        )

        return
    }

    json.NewEncoder(w).Encode(
        PartitionsResponse{
            Partitions: partitions,
        },
    )
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

                getMessagesHandler(w, r)

            } else if strings.Contains(
                r.URL.Path,
                "/partitions",
            ) {

                getPartitionsHandler(w, r)

            } else {

                getTopicDetailHandler(w, r)

            }

        default:
        	w.WriteHeader(http.StatusNotFound)
        }
	})

	port := ":8080"

    /*
       Dashboard API
    */
    http.HandleFunc(
    	"/api/dashboard/overview",
    	getDashboardOverviewHandler,
    )
    http.HandleFunc(
    	"/api/dashboard/brokers",
    	getDashboardBrokersHandler,
    )
	log.Printf("Server running on %s", port)

	log.Fatal(http.ListenAndServe(port, nil))
}