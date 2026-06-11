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

/* ==============================================
           ТАБЛИЦА БРОКЕРОВ KAFKA-КЛАСТЕРА
================================================= */
export default function BrokersPanel({
  brokers
}) {

  return (
        <div className="dashboard-panel">

          <div className="panel-header">
            Брокеры
          </div>

          <div className="panel-body">

            {/* Таблица брокеров Kafka */}
            <div className="broker-table">

              {/* Заголовок таблицы */}
              <div className="broker-table-header">

                {/* Идентификатор брокера */}
                <div>ID</div>

                {/* Адрес подключения */}
                <div>Адрес</div>

                {/* Состояние брокера */}
                <div>Статус</div>

                {/* Является ли брокер контроллером */}
                <div>Контроллер</div>

              </div>

              {/* Список брокеров */}
              {
                brokers.map((broker, index) => (

                  <div
                    key={index}
                    className="broker-table-row"
                  >

                    {/* Идентификатор брокера */}
                    <div>
                      {broker.id}
                    </div>

                    {/* Адрес подключения */}
                    <div>
                      {broker.address}
                    </div>

                    {/* Статус брокера */}
                    <div className="broker-status">

                      <span className="broker-status-dot" />

                      Онлайн

                    </div>

                    {/* Признак контроллера Kafka */}
                    <div>

                      {
                        broker.controller
                          ? (
                              <span className="broker-controller-badge">
                                Да
                              </span>
                            )
                          : (
                              <span className="broker-no-controller">
                                Нет
                              </span>
                            )
                      }

                    </div>

                  </div>

                ))
              }

            </div>

          </div>

        </div>
       );

  }