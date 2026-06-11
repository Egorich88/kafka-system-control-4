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

/*
   ============================================================

   dashboard.go

   Назначение:
   Файл содержит обработчики мониторинга Kafka-кластера.

   Используется страницей:
   Dashboard (Обзор кластера)

   Предоставляет:

   - количество брокеров
   - количество топиков
   - количество партиций
   - количество consumer groups
   - идентификатор контроллера кластера
   - количество Under Replicated Partitions

   Данный файл является основой мониторинга Kafka API
   без использования JMX Exporter и Prometheus.

   ============================================================
*/

package main

import (
	"encoding/json"
	"net/http"

	"github.com/IBM/sarama"
)

/* DashboardOverviewResponse
Сводная информация по кластеру Kafka */
type DashboardOverviewResponse struct {

	/* Количество брокеров */
	Brokers int `json:"brokers"`

	/* Количество топиков */
	Topics int `json:"topics"`

	/* Количество партиций */
	Partitions int `json:"partitions"`

	/* Количество групп консьюмеров */
	ConsumerGroups int `json:"consumerGroups"`

	/* ID текущего контроллера */
	ControllerID int32 `json:"controllerId"`

	/* Количество Under Replicated Partitions */
	UnderReplicated int `json:"underReplicated"`
}

/* DashboardBroker
Информация о брокере Kafka */
type DashboardBroker struct {

	/* ID брокера */
	ID int32 `json:"id"`

	/* Адрес брокера */
	Address string `json:"address"`

	/* Является ли контроллером */
	Controller bool `json:"controller"`
}

/* DashboardBrokersResponse
Список брокеров кластера */
type DashboardBrokersResponse struct {
	Brokers []DashboardBroker `json:"brokers"`
}

/* DashboardConsumerGroup
Информация о группе потребителей */
type DashboardConsumerGroup struct {

	/* Название группы */
	Name string `json:"name"`

	/* Состояние группы */
	State string `json:"state"`
}

/* DashboardConsumerGroupsResponse
Список групп потребителей Kafka */
type DashboardConsumerGroupsResponse struct { Groups []DashboardConsumerGroup `json:"groups"` }

/* DashboardPartitionsResponse
Статистика партиций Kafka-кластера */
type DashboardPartitionsResponse struct { Total int `json:"total"` }

/* DashboardMessagesTotalResponse

   Ответ API, содержащий общее количество сообщений
   во всём Kafka-кластере.

   Используется на дашборде для отображения
   суммарного количества сообщений (входящих событий).
*/
/* Общее количество сообщений во всех топиках */
type DashboardMessagesTotalResponse struct { Total int64 `json:"total"` }

/*
   DashboardThroughputPoint

   Точка графика пропускной способности.

   Используется Dashboard для отображения
   входящего и исходящего потока сообщений.
*/
type DashboardThroughputPoint struct {

	/* Время точки */
	Time string `json:"time"`

	/* Входящий поток */
	Incoming int64 `json:"incoming"`

	/* Исходящий поток */
	Outgoing int64 `json:"outgoing"`
}

/*
   DashboardThroughputResponse

   Ответ API для графика
   пропускной способности кластера.
*/
type DashboardThroughputResponse struct {

	/* Набор точек графика */
	Points []DashboardThroughputPoint `json:"points"`
}

/* getDashboardMessagesTotalHandler

   HTTP-обработчик, возвращающий общее количество сообщений
   во всех топиках Kafka-кластера.

   Логика:
   - получает список всех топиков
   - проходит по всем партициям
   - суммирует latest offset (как приближение общего числа сообщений)

   Используется на Dashboard в карточке:
   "Сообщений в кластере"
*/
func getDashboardMessagesTotalHandler(
	w http.ResponseWriter,
	r *http.Request,
) {

	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	bootstrap := getBootstrapFromRequest(r)

	config := sarama.NewConfig()
	config.Version = sarama.V2_8_0_0

	client, err := sarama.NewClient([]string{bootstrap}, config)
	if err != nil {
		sendJSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer client.Close()

	topics, err := client.Topics()
	if err != nil {
		sendJSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var total int64 = 0

	for _, topic := range topics {
		partitions, err := client.Partitions(topic)
		if err != nil {
			continue
		}

		for _, p := range partitions {
			latest, err := client.GetOffset(topic, p, sarama.OffsetNewest)
			if err != nil {
				continue
			}
			total += latest
		}
	}

	json.NewEncoder(w).Encode(
		DashboardMessagesTotalResponse{
			Total: total,
		},
	)
}

/*
   getDashboardOverviewHandler

   Возвращает агрегированную информацию
   о состоянии Kafka-кластера.
*/
func getDashboardOverviewHandler(
	w http.ResponseWriter,
	r *http.Request,
) {

	w.Header().Set(
		"Access-Control-Allow-Origin",
		"*",
	)

	w.Header().Set(
		"Content-Type",
		"application/json",
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
			"Ошибка подключения к Kafka: "+err.Error(),
			http.StatusInternalServerError,
		)

		return
	}

	defer client.Close()

	/*
	   =========================
	   Брокеры
	   =========================
	*/

	brokers := client.Brokers()

	/*
	   =========================
	   Контроллер
	   =========================
	*/

	controller, err := client.Controller()

	if err != nil {

		sendJSONError(
			w,
			"Не удалось получить контроллер кластера",
			http.StatusInternalServerError,
		)

		return
	}

	/*
	   =========================
	   Топики
	   =========================
	*/

	topics, err := client.Topics()

	if err != nil {

		sendJSONError(
			w,
			"Не удалось получить список топиков",
			http.StatusInternalServerError,
		)

		return
	}

	totalPartitions := 0

	underReplicated := 0

	for _, topic := range topics {

		partitions, err := client.Partitions(topic)

		if err != nil {
			continue
		}

		totalPartitions += len(partitions)

		for _, partitionID := range partitions {

			replicas, err := client.Replicas(
				topic,
				partitionID,
			)

			if err != nil {
				continue
			}

			isr, err := client.InSyncReplicas(
				topic,
				partitionID,
			)

			if err != nil {
				continue
			}

			/*
			   Если ISR меньше Replicas,
			   значит партиция отстает.
			*/
			if len(isr) < len(replicas) {

				underReplicated++
			}
		}
	}

	/*
	   =========================
	   Consumer Groups
	   =========================
	*/

	admin, err := createAdminClient(
		bootstrap,
	)

	if err != nil {

		sendJSONError(
			w,
			"Не удалось создать Admin Client",
			http.StatusInternalServerError,
		)

		return
	}

	defer admin.Close()

	groups, err := admin.ListConsumerGroups()

	if err != nil {

		sendJSONError(
			w,
			"Не удалось получить Consumer Groups",
			http.StatusInternalServerError,
		)

		return
	}

	response := DashboardOverviewResponse{

		Brokers: len(brokers),

		Topics: len(topics),

		Partitions: totalPartitions,

		ConsumerGroups: len(groups),

		ControllerID: controller.ID(),

		UnderReplicated: underReplicated,
	}

	json.NewEncoder(w).Encode(
		response,
	)
}

/*
   getDashboardBrokersHandler

   Возвращает список брокеров Kafka-кластера.
*/
func getDashboardBrokersHandler(
	w http.ResponseWriter,
	r *http.Request,
) {

	w.Header().Set(
		"Access-Control-Allow-Origin",
		"*",
	)

	w.Header().Set(
		"Content-Type",
		"application/json",
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
			"Ошибка подключения к Kafka: "+err.Error(),
			http.StatusInternalServerError,
		)

		return
	}

	defer client.Close()

	controller, err := client.Controller()

	if err != nil {

		sendJSONError(
			w,
			"Не удалось определить контроллер кластера",
			http.StatusInternalServerError,
		)

		return
	}

	result := make(
		[]DashboardBroker,
		0,
	)

	for _, broker := range client.Brokers() {

		result = append(
			result,
			DashboardBroker{

				ID: broker.ID(),

				Address: broker.Addr(),

				Controller: broker.ID() == controller.ID(),
			},
		)
	}

	json.NewEncoder(w).Encode(
		DashboardBrokersResponse{
			Brokers: result,
		},
	)
}

/*
   getDashboardConsumerGroupsHandler

   Возвращает список consumer groups Kafka-кластера.
*/
func getDashboardConsumerGroupsHandler(
	w http.ResponseWriter,
	r *http.Request,
) {

	w.Header().Set(
		"Access-Control-Allow-Origin",
		"*",
	)

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	bootstrap := getBootstrapFromRequest(r)

	admin, err := createAdminClient(
		bootstrap,
	)

	if err != nil {

		sendJSONError(
			w,
			"Ошибка подключения к Kafka: "+err.Error(),
			http.StatusInternalServerError,
		)

		return
	}

	defer admin.Close()

	groupsMap, err := admin.ListConsumerGroups()

	if err != nil {

		sendJSONError(
			w,
			"Ошибка получения consumer groups: "+err.Error(),
			http.StatusInternalServerError,
		)

		return
	}

	groupNames := make(
		[]string,
		0,
		len(groupsMap),
	)

	for groupName := range groupsMap {

		groupNames = append(
			groupNames,
			groupName,
		)
	}

	descriptions, err := admin.DescribeConsumerGroups(
		groupNames,
	)

	if err != nil {

		sendJSONError(
			w,
			"Ошибка описания consumer groups: "+err.Error(),
			http.StatusInternalServerError,
		)

		return
	}

	result := make(
		[]DashboardConsumerGroup,
		0,
		len(descriptions),
	)

	for _, group := range descriptions {

		result = append(
			result,
			DashboardConsumerGroup{

				Name: group.GroupId,

				State: group.State,
			},
		)
	}

	json.NewEncoder(w).Encode(
		DashboardConsumerGroupsResponse{
			Groups: result,
		},
	)
}

/*
   getDashboardPartitionsHandler

   Возвращает общее количество партиций
   во всех топиках Kafka-кластера.
*/
func getDashboardPartitionsHandler(
	w http.ResponseWriter,
	r *http.Request,
) {

	w.Header().Set(
		"Access-Control-Allow-Origin",
		"*",
	)

	w.Header().Set(
		"Content-Type",
		"application/json",
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
			"Ошибка подключения к Kafka: "+err.Error(),
			http.StatusInternalServerError,
		)

		return
	}

	defer client.Close()

	topics, err := client.Topics()

	if err != nil {

		sendJSONError(
			w,
			"Не удалось получить список топиков",
			http.StatusInternalServerError,
		)

		return
	}

	totalPartitions := 0

	for _, topic := range topics {

		partitions, err := client.Partitions(
			topic,
		)

		if err != nil {
			continue
		}

		totalPartitions += len(
			partitions,
		)
	}

	json.NewEncoder(w).Encode(
		DashboardPartitionsResponse{
			Total: totalPartitions,
		},
	)
}
/*
   getDashboardThroughputHandler

   Возвращает данные графика
   пропускной способности кластера.

   В текущей версии используются
   временные тестовые данные.

   В дальнейшем будут заменены
   реальными метриками Kafka.
*/
func getDashboardThroughputHandler(
	w http.ResponseWriter,
	r *http.Request,
) {

	w.Header().Set(
		"Access-Control-Allow-Origin",
		"*",
	)

	w.Header().Set(
		"Content-Type",
		"application/json",
	)

	response := DashboardThroughputResponse{

		Points: []DashboardThroughputPoint{

			{
				Time: "00",
				Incoming: 120,
				Outgoing: 100,
			},

			{
				Time: "05",
				Incoming: 240,
				Outgoing: 180,
			},

			{
				Time: "10",
				Incoming: 430,
				Outgoing: 390,
			},

			{
				Time: "15",
				Incoming: 610,
				Outgoing: 570,
			},
		},
	}

	json.NewEncoder(w).Encode(
		response,
	)
}