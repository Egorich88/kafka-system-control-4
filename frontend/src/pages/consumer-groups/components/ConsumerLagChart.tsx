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
   * =============================================================================
   * ConsumerLagChart.tsx
   * =============================================================================
   *
   * График изменения Consumer Lag.
   *
   * Пока используются mock-данные.
   *
   * После подключения backend график будет получать
   * историю Lag выбранной Consumer Group.
   *
   * =============================================================================
   */

  import '../styles/consumer-chart.css';
  import type { ConsumerGroup } from '../types/consumer-groups.types';

  import {

      ResponsiveContainer,

      AreaChart,

      Area,

      CartesianGrid,

      Tooltip,

      XAxis,

      YAxis

  } from 'recharts';

  const mockLag = [

      { time: '12:00', lag: 420 },

      { time: '12:05', lag: 380 },

      { time: '12:10', lag: 310 },

      { time: '12:15', lag: 250 },

      { time: '12:20', lag: 184 },

  ];



  interface Props {

      group: ConsumerGroup | null;

  }

  export default function ConsumerLagChart({

      group

  }: Props) {
      if (!group) {

          return (

              <div className="consumer-chart">

                  <div className="consumer-chart-title">

                      История Consumer Lag

                  </div>

                  <div
                      style={{

                          flex: 1,

                          display: 'flex',

                          alignItems: 'center',

                          justifyContent: 'center',

                          color: 'var(--text-secondary)'

                      }}

                  >

                      Выберите группу

                  </div>

              </div>

          );

      }

      return (

          <div className="consumer-chart">

              <div className="consumer-chart-title">

                  Consumer Lag

              </div>

              <div className="consumer-chart-body">

                  <ResponsiveContainer
                      width="100%"
                      height="100%"
                  >

                      <AreaChart data={mockLag}>

                          <CartesianGrid
                              vertical={false}
                              strokeDasharray="3 3"
                          />

                          <XAxis dataKey="time" />

                          <XAxis
                              dataKey="time"
                              axisLine={false}
                              tickLine={false}
                          />

                          <Tooltip />

                          <Area

                              dataKey="lag"

                              stroke="var(--accent-color)"

                              fill="var(--accent-color)"

                              fillOpacity={0.25}

                          />

                      </AreaChart>

                  </ResponsiveContainer>

              </div>

          </div>

      );

  }