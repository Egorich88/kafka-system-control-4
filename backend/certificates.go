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

/**
 * @file certificates.go
 * Сводная информация о JKS/PKCS12 хранилищах сертификатов Kafka.
 *
 * Поддерживаются:
 * - обычная Linux-установка Kafka;
 * - Docker-контейнер Kafka при наличии доступа к Docker socket;
 * - пути из переменных окружения KAFKA_SSL_*_LOCATION.
 *
 * Пароли не хранятся в коде. Для чтения JKS используется KAFKA_KEYSTORE_PASSWORD
 * либо стандартный пароль changeit, если он явно не задан.
 */

package main

import (
	"encoding/json"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

type CertificateInfo struct {
	Name      string `json:"name"`
	Path      string `json:"path"`
	ExpiresAt string `json:"expiresAt"`
	DaysLeft  int    `json:"daysLeft"`
}

type CertificatesResponse struct {
	Count        int               `json:"count"`
	NearestDays  int               `json:"nearestDays"`
	Certificates []CertificateInfo `json:"certificates"`
	Available    bool              `json:"available"`
	Message      string            `json:"message,omitempty"`
}

func getCertificatesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	bootstrap := getBootstrapFromRequest(r)
	var result []CertificateInfo
	seen := make(map[string]bool)

	// Сначала проверяем обычную Linux-файловую систему только для Kafka,
	// работающей на том же сервере. Это не позволяет показать сертификаты
	// другого удалённого кластера.
	if isLocalBootstrap(bootstrap) {
		for _, path := range findLocalKeystores() {
			if info, ok := readKeystoreCertificate(path, ""); ok && !seen[info.Path] {
				seen[info.Path] = true
				result = append(result, info)
			}
		}
	}

	// Затем ищем Docker-контейнер, который действительно соответствует
	// выбранному bootstrap. Контейнер другого кластера не используется.
	if container := findKafkaContainerForBootstrap(bootstrap); container != "" {
		for _, path := range findDockerKeystores(container) {
			if info, ok := readKeystoreCertificate(path, container); ok {
				info.Path = container + ":" + path
				key := info.Path
				if !seen[key] {
					seen[key] = true
					result = append(result, info)
				}
			}
		}
	}

	nearest := 0
	for index, cert := range result {
		if index == 0 || cert.DaysLeft < nearest {
			nearest = cert.DaysLeft
		}
	}

	response := CertificatesResponse{
		Count:        len(result),
		NearestDays:  nearest,
		Certificates: result,
		Available:    len(result) > 0,
	}
	if len(result) == 0 {
		response.Message = "JKS/PKCS12 сертификаты не обнаружены"
	}

	_ = json.NewEncoder(w).Encode(response)
}

func findLocalKeystores() []string {
	var result []string
	seen := make(map[string]bool)

	add := func(path string) {
		if path != "" && !seen[path] {
			seen[path] = true
			result = append(result, path)
		}
	}

	for _, env := range []string{
		"KAFKA_SSL_KEYSTORE_LOCATION",
		"KAFKA_SSL_TRUSTSTORE_LOCATION",
		"SSL_KEYSTORE_LOCATION",
		"SSL_TRUSTSTORE_LOCATION",
	} {
		add(os.Getenv(env))
	}

	// Walk используется вместо filepath.Glob("**"), поскольку Go Glob
	// не поддерживает рекурсивный glob в стиле shell.
	for _, base := range []string{
		"/etc/kafka", "/opt/kafka/config", "/opt/bitnami/kafka/config",
		"/var/lib/kafka", "/kafka/config", "/etc/ssl", "/etc/pki",
	} {
		_ = filepath.Walk(base, func(path string, info os.FileInfo, err error) error {
			if err != nil || info == nil || info.IsDir() {
				return nil
			}
			ext := strings.ToLower(filepath.Ext(path))
			if ext == ".jks" || ext == ".p12" || ext == ".pfx" {
				add(path)
			}
			return nil
		})
	}

	return result
}

func isLocalBootstrap(bootstrap string) bool {
	host, _, err := net.SplitHostPort(bootstrap)
	if err != nil {
		return bootstrap == "localhost" || bootstrap == "127.0.0.1"
	}
	return host == "localhost" || host == "127.0.0.1" || host == "::1"
}

func findKafkaContainerForBootstrap(bootstrap string) string {
	_, port, err := net.SplitHostPort(bootstrap)
	if err != nil {
		return ""
	}

	output, err := exec.Command("sh", "-c",
		"docker ps --format '{{.Names}}|{{.Ports}}' | grep -i kafka").Output()
	if err != nil {
		return ""
	}

	for _, line := range strings.Split(string(output), "\n") {
		parts := strings.SplitN(line, "|", 2)
		if len(parts) != 2 {
			continue
		}
		// Проверяем опубликованный host-port. Например:
		// 0.0.0.0:9092->9092/tcp
		if strings.Contains(parts[1], ":"+port+"->") {
			return strings.TrimSpace(parts[0])
		}
	}
	return ""
}

func findDockerKeystores(container string) []string {
	if container == "" {
		return nil
	}

	command := `find /etc/kafka /opt/kafka/config /var/lib/kafka /opt/bitnami/kafka/config -type f \( -name "*.jks" -o -name "*.p12" -o -name "*.pfx" \) 2>/dev/null | head -100`
	output, err := exec.Command("docker", "exec", container, "sh", "-c", command).Output()
	if err != nil {
		return nil
	}

	var result []string
	for _, line := range strings.Split(string(output), "\n") {
		if strings.TrimSpace(line) != "" {
			result = append(result, strings.TrimSpace(line))
		}
	}
	return result
}

func readKeystoreCertificate(path, container string) (CertificateInfo, bool) {
	password := os.Getenv("KAFKA_KEYSTORE_PASSWORD")
	if password == "" {
		password = "changeit"
	}

	var output []byte
	var err error

	if container != "" {
		output, err = exec.Command(
			"docker", "exec", container, "keytool",
			"-list", "-v", "-keystore", path, "-storepass", password,
		).CombinedOutput()
	} else {
		output, err = exec.Command(
			"keytool", "-list", "-v", "-keystore", path, "-storepass", password,
		).CombinedOutput()
	}
	if err != nil {
		return CertificateInfo{}, false
	}

	re := regexp.MustCompile(`Valid from: .* until:\s*(.+)`)
	match := re.FindStringSubmatch(string(output))
	if len(match) < 2 {
		return CertificateInfo{}, false
	}

	raw := strings.TrimSpace(match[1])
	layouts := []string{
		"Mon Jan 02 15:04:05 MST 2006",
		"Mon Jan 02 15:04:05 UTC 2006",
		"Mon Jan 02 15:04:05 -0700 2006",
	}

	var expires time.Time
	for _, layout := range layouts {
		if parsed, parseErr := time.Parse(layout, raw); parseErr == nil {
			expires = parsed
			break
		}
	}
	if expires.IsZero() {
		return CertificateInfo{}, false
	}

	return CertificateInfo{
		Name:      filepath.Base(path),
		Path:      path,
		ExpiresAt: expires.Format(time.RFC3339),
		DaysLeft:  int(time.Until(expires).Hours() / 24),
	}, true
}
