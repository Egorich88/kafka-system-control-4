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
	"fmt"
	"log"
	"math"
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

// BrokerInfo - полная информация о брокере Kafka
type BrokerInfo struct {
	ID            int32   `json:"id"`            // ID брокера
	Address       string  `json:"address"`       // Адрес (host:port)
	Controller    bool    `json:"controller"`    // Является ли контроллером
	Rack          string  `json:"rack"`          // Ракка (зона доступности)
	Version       string  `json:"version"`       // Версия Kafka
	CPU           float64 `json:"cpu"`           // Использование CPU в процентах
	Memory        float64 `json:"memory"`        // Использование памяти в MB
	LeaderCount   int32   `json:"leaderCount"`   // Количество лидерских партиций на брокере
	ReplicaCount  int32   `json:"replicaCount"`  // Количество реплик на брокере
	UnderReplicated int32 `json:"underReplicated"` // Количество недореплицированных партиций
}

// BrokersResponse - структура ответа API с брокерами
type BrokersResponse struct {
	Brokers []BrokerInfo `json:"brokers"`
}

// =============================================================================
// Глобальный кеш для версии (определяется один раз при первом запросе)
// =============================================================================

var cachedKafkaVersion string

// =============================================================================
// HTTP-обработчик
// =============================================================================

// GetBrokersHandler - возвращает расширенную информацию о брокерах:
// ID, адрес, статус, контроллер, ракка, версия, CPU, память,
// количество лидеров и реплик
func GetBrokersHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	bootstrap := getBootstrapFromRequest(r)

	// Получаем реальную версию Kafka с логированием
	kafkaVersion := getRealKafkaVersionWithLog(bootstrap)

	config := sarama.NewConfig()
	config.Version = sarama.V2_8_0_0

	client, err := sarama.NewClient([]string{bootstrap}, config)
	if err != nil {
		sendJSONError(w, "Ошибка подключения к Kafka: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer client.Close()

	// Определяем контроллер кластера
	controller, err := client.Controller()
	if err != nil {
		sendJSONError(w, "Не удалось определить контроллер кластера", http.StatusInternalServerError)
		return
	}

	// Получаем метрики CPU и Memory для брокеров (через Docker)
	metrics := getBrokerMetrics()

	// Формируем результат
	result := make([]BrokerInfo, 0, len(client.Brokers()))
	for _, broker := range client.Brokers() {
		brokerID := broker.ID()

		// Считаем количество лидеров и реплик для этого брокера
		leaderCount, replicaCount := countPartitionsForBroker(client, brokerID)

		result = append(result, BrokerInfo{
			ID:            brokerID,
			Address:       broker.Addr(),
			Controller:    brokerID == controller.ID(),
			Rack:          broker.Rack(),
			Version:       kafkaVersion,
			CPU:           metrics.CPU,
			Memory:        metrics.Memory,
			LeaderCount:   leaderCount,
			ReplicaCount:  replicaCount,
			UnderReplicated: 0, // TODO: можно добавить позже
		})
	}

	_ = json.NewEncoder(w).Encode(BrokersResponse{Brokers: result})
}

// =============================================================================
// countPartitionsForBroker - подсчёт лидеров и реплик для конкретного брокера
// =============================================================================

// countPartitionsForBroker - возвращает количество лидерских партиций
// и общее количество реплик для указанного брокера
func countPartitionsForBroker(client sarama.Client, brokerID int32) (int32, int32) {
	var leaders, replicas int32

	// Получаем список всех топиков
	topics, err := client.Topics()
	if err != nil {
		log.Printf("[ERROR] Не удалось получить список топиков: %v", err)
		return 0, 0
	}

	// Перебираем все топики и партиции
	for _, topic := range topics {
		partitions, err := client.Partitions(topic)
		if err != nil {
			continue
		}
		for _, partition := range partitions {
			// Проверяем, является ли брокер лидером для этой партиции
			leader, err := client.Leader(topic, partition)
			if err == nil && leader != nil && leader.ID() == brokerID {
				leaders++
			}
			// Подсчитываем реплики на этом брокере
			replicasList, err := client.Replicas(topic, partition)
			if err == nil {
				for _, r := range replicasList {
					if r == brokerID {
						replicas++
					}
				}
			}
		}
	}

	return leaders, replicas
}

// =============================================================================
// BrokerMetrics - структура для метрик CPU и Memory
// =============================================================================

type BrokerMetrics struct {
	CPU    float64 `json:"cpu"`    // Использование CPU в процентах
	Memory float64 `json:"memory"` // Использование памяти в MB
}

// =============================================================================
// getBrokerMetrics - получает метрики через Docker stats или JMX
// =============================================================================

// getBrokerMetrics - возвращает метрики CPU и Memory для Kafka
// Сначала пробует получить через Docker stats, затем через JMX
func getBrokerMetrics() BrokerMetrics {
	// 1. Пробуем через Docker stats (если брокеры запущены в контейнерах)
	if metrics := getMetricsFromDocker(); metrics.CPU > 0 || metrics.Memory > 0 {
		return metrics
	}

	// 2. Пробуем через JMX (если включен)
	if metrics := getMetricsFromJMX(); metrics.CPU > 0 || metrics.Memory > 0 {
		return metrics
	}

	return BrokerMetrics{CPU: 0, Memory: 0}
}

// =============================================================================
// getMetricsFromDocker - получает метрики через Docker API
// =============================================================================

// getMetricsFromDocker - получает метрики через команду docker stats
func getMetricsFromDocker() BrokerMetrics {
	// Ищем контейнер Kafka
	cmd := exec.Command("sh", "-c", "docker ps --format '{{.Names}}' | grep -i kafka | head -1")
	output, err := cmd.Output()
	if err != nil {
		return BrokerMetrics{CPU: 0, Memory: 0}
	}
	containerName := strings.TrimSpace(string(output))
	if containerName == "" {
		return BrokerMetrics{CPU: 0, Memory: 0}
	}

	// Получаем статистику через docker stats
	cmd = exec.Command("sh", "-c", "docker stats --no-stream --format '{{.CPUPerc}}|{{.MemUsage}}' "+containerName)
	output, err = cmd.Output()
	if err != nil {
		return BrokerMetrics{CPU: 0, Memory: 0}
	}

	line := strings.TrimSpace(string(output))
	parts := strings.Split(line, "|")
	if len(parts) < 2 {
		return BrokerMetrics{CPU: 0, Memory: 0}
	}

	// Парсим CPU
	cpuStr := strings.TrimSuffix(strings.TrimSpace(parts[0]), "%")
	cpu, _ := parseFloat(cpuStr)

	// Парсим Memory (ТОЧНО как в Docker)
	memStr := strings.TrimSpace(parts[1])
	re := regexp.MustCompile(`([\d.]+)\s*([A-Za-z]+)`)
	matches := re.FindStringSubmatch(memStr)
	memory := 0.0
	if len(matches) > 0 {
		val, _ := parseFloat(matches[1])
		unit := matches[2]
		switch unit {
		case "GiB":
			memory = val * 1024 // 1.017 * 1024 = 1041.408
		case "MiB":
			memory = val
		case "KiB":
			memory = val / 1024
		default:
			memory = val
		}
	}

	// Округляем до целого как в Docker
	memory = math.Round(memory)

	return BrokerMetrics{
		CPU:    cpu,
		Memory: memory,
	}
}

// =============================================================================
// getMetricsFromJMX - получает метрики через JMX (заглушка)
// =============================================================================

// getMetricsFromJMX - получает метрики через JMX (в будущем)
func getMetricsFromJMX() BrokerMetrics {
	// TODO: реализовать получение метрик через JMX
	// Например: http://localhost:9999/metrics
	return BrokerMetrics{CPU: 0, Memory: 0}
}

// =============================================================================
// parseFloat - парсит строку в float64
// =============================================================================

// parseFloat - преобразует строку в число с плавающей точкой
func parseFloat(s string) (float64, error) {
	var result float64
	_, err := fmt.Sscanf(s, "%f", &result)
	return result, err
}

// =============================================================================
// getRealKafkaVersionWithLog - ПОЛУЧАЕТ РЕАЛЬНУЮ ВЕРСИЮ С ЛОГИРОВАНИЕМ
// =============================================================================

// getRealKafkaVersionWithLog - возвращает версию Kafka
// Источники: переменная окружения, логи, jar-файлы
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

	// 2. Пробуем через логи (самый надёжный способ)
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
// getVersionFromLogsWithSource - парсит версию из логов
// =============================================================================

// getVersionFromLogsWithSource - читает версию из лог-файлов Kafka
func getVersionFromLogsWithSource() (string, string) {
	// Возможные пути к логам Kafka
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
				// Исключаем версию Scala (2.12, 2.13)
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
// getVersionFromDockerLogsWithSource - ищет версию в логах Docker контейнера
// =============================================================================

// getVersionFromDockerLogsWithSource - читает версию из логов в Docker контейнере
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

// getVersionFromJarWithSource - извлекает версию из имени jar-файла
func getVersionFromJarWithSource() (string, string) {
	// Возможные пути к библиотекам Kafka
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