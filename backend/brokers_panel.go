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
	"bufio"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/IBM/sarama"
)

// =============================================================================
// Модели для брокеров
// =============================================================================

type BrokerInfo struct {
	ID         int32  `json:"id"`
	Address    string `json:"address"`
	Controller bool   `json:"controller"`
	Rack       string `json:"rack"`
	Version    string `json:"version"`
}

type BrokersResponse struct {
	Brokers []BrokerInfo `json:"brokers"`
}

// =============================================================================
// Глобальный кеш для версии
// =============================================================================

var cachedKafkaVersion string

// =============================================================================
// HTTP-обработчик
// =============================================================================

func GetBrokersHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	bootstrap := getBootstrapFromRequest(r)

	// Получаем реальную версию с логированием
	kafkaVersion := getRealKafkaVersionWithLog(bootstrap)

	config := sarama.NewConfig()
	config.Version = sarama.V2_8_0_0

	client, err := sarama.NewClient([]string{bootstrap}, config)
	if err != nil {
		sendJSONError(w, "Ошибка подключения к Kafka: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer client.Close()

	controller, err := client.Controller()
	if err != nil {
		sendJSONError(w, "Не удалось определить контроллер кластера", http.StatusInternalServerError)
		return
	}

	result := make([]BrokerInfo, 0, len(client.Brokers()))
	for _, broker := range client.Brokers() {
		result = append(result, BrokerInfo{
			ID:         broker.ID(),
			Address:    broker.Addr(),
			Controller: broker.ID() == controller.ID(),
			Rack:       broker.Rack(),
			Version:    kafkaVersion,
		})
	}

	_ = json.NewEncoder(w).Encode(BrokersResponse{Brokers: result})
}

// =============================================================================
// getRealKafkaVersionWithLog - ПОЛУЧАЕТ РЕАЛЬНУЮ ВЕРСИЮ С ЛОГИРОВАНИЕМ
// =============================================================================

func getRealKafkaVersionWithLog(bootstrap string) string {
	// Если уже есть в кеше - возвращаем
	if cachedKafkaVersion != "" {
		log.Printf("[VERSION] Using cached version: %s", cachedKafkaVersion)
		return cachedKafkaVersion
	}

	var version string
	var source string

	// 1. Пробуем получить через переменную окружения
	if v := os.Getenv("KAFKA_VERSION"); v != "" {
		version = v
		source = "ENV variable KAFKA_VERSION"
		log.Printf("[VERSION] Found in %s: %s", source, version)
		cachedKafkaVersion = version
		return version
	}

	// 2. Пробуем через логи (САМЫЙ НАДЁЖНЫЙ!)
	if v, src := getVersionFromLogsWithSource(); v != "" {
		version = v
		source = src
		log.Printf("[VERSION] Found in %s: %s", source, version)
		cachedKafkaVersion = version
		return version
	}

	// 3. Пробуем через jar-файл
	if v, src := getVersionFromJarWithSource(); v != "" {
		version = v
		source = src
		log.Printf("[VERSION] Found in %s: %s", source, version)
		cachedKafkaVersion = version
		return version
	}

	log.Printf("[VERSION] Version not found, using: unknown")
	cachedKafkaVersion = "unknown"
	return "unknown"
}

// =============================================================================
// getVersionFromLogsWithSource - парсит версию из логов с указанием источника
// =============================================================================

func getVersionFromLogsWithSource() (string, string) {
	// Пути к логам Kafka
	logPaths := []string{
		"/opt/kafka/logs/server.log",
		"/var/log/kafka/server.log",
		"/kafka/logs/server.log",
		"/logs/server.log",
		"/opt/bitnami/kafka/logs/server.log",
	}

	re := regexp.MustCompile(`Kafka version:\s*(\d+\.\d+\.\d+)`)

	// Сначала ищем локально
	for _, logPath := range logPaths {
		file, err := os.Open(logPath)
		if err != nil {
			continue
		}
		defer file.Close()

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := scanner.Text()
			matches := re.FindStringSubmatch(line)
			if len(matches) > 1 {
				version := matches[1]
				if !strings.HasPrefix(version, "2.12") && !strings.HasPrefix(version, "2.13") {
					return version, "local log file: " + logPath
				}
			}
		}
	}

	// Если локально не нашли - ищем в Docker контейнере
	return getVersionFromDockerLogsWithSource()
}

// =============================================================================
// getVersionFromDockerLogsWithSource - ищет в логах Docker контейнера
// =============================================================================

func getVersionFromDockerLogsWithSource() (string, string) {
	// Ищем контейнер Kafka
	cmd := exec.Command("sh", "-c", "docker ps --format '{{.Names}}' | grep -i kafka | head -1")
	output, err := cmd.Output()
	if err != nil {
		return "", ""
	}
	containerName := strings.TrimSpace(string(output))
	if containerName == "" {
		return "", ""
	}

	// Читаем логи из контейнера
	cmd = exec.Command("sh", "-c", "docker exec "+containerName+" cat /opt/kafka/logs/server.log 2>/dev/null | grep 'Kafka version:' | head -1")
	output, err = cmd.Output()
	if err != nil {
		return "", ""
	}

	line := strings.TrimSpace(string(output))
	re := regexp.MustCompile(`Kafka version:\s*(\d+\.\d+\.\d+)`)
	matches := re.FindStringSubmatch(line)
	if len(matches) > 1 {
		version := matches[1]
		if !strings.HasPrefix(version, "2.12") && !strings.HasPrefix(version, "2.13") {
			return version, "Docker container: " + containerName + " -> /opt/kafka/logs/server.log"
		}
	}

	return "", ""
}

// =============================================================================
// getVersionFromJarWithSource - ищет версию из jar-файла
// =============================================================================

func getVersionFromJarWithSource() (string, string) {
	paths := []string{
		"/opt/kafka/libs",
		"/usr/local/kafka/libs",
		"/kafka/libs",
		"/opt/bitnami/kafka/libs",
		"/usr/share/kafka/libs",
	}

	for _, basePath := range paths {
		files, err := filepath.Glob(filepath.Join(basePath, "kafka_*.jar"))
		if err != nil {
			continue
		}
		for _, file := range files {
			re := regexp.MustCompile(`kafka_\d+\.\d+-([\d.]+)\.jar`)
			matches := re.FindStringSubmatch(filepath.Base(file))
			if len(matches) > 1 {
				version := matches[1]
				if !strings.HasPrefix(version, "2.12") && !strings.HasPrefix(version, "2.13") {
					return version, "JAR file: " + file
				}
			}
		}
	}

	return "", ""
}