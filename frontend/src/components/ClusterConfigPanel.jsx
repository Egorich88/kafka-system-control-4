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
import { useState, useEffect } from 'react';

export default function ClusterConfigPanel({ cluster, onSave, onCancel }) {
  const [config, setConfig] = useState({
    name: '',
    brokers: '',
    authType: 'PLAINTEXT',
    username: '',
    password: '',
    cert: '',
    key: '',
    ca: ''
  });

  useEffect(() => {
    if (cluster) setConfig(cluster);
  }, [cluster]);

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!config.name || !config.brokers) {
      alert('Заполните название и брокеры');
      return;
    }
    onSave(config);
  };

  return (
    <div>
      <h3>{cluster ? 'Редактировать' : 'Новый кластер'}</h3>
      <label>Название</label>
      <input name="name" value={config.name} onChange={handleChange} />
      <label>Брокеры (host:port, через запятую)</label>
      <input name="brokers" value={config.brokers} onChange={handleChange} />
      <label>Аутентификация</label>
      <select name="authType" value={config.authType} onChange={handleChange}>
        <option value="PLAINTEXT">PLAINTEXT</option>
        <option value="SASL_PLAIN">SASL/PLAIN</option>
        <option value="SASL_SCRAM">SASL/SCRAM</option>
        <option value="MTLS">mTLS</option>
      </select>
      {(config.authType === 'SASL_PLAIN' || config.authType === 'SASL_SCRAM') && (
        <>
          <label>Логин</label>
          <input name="username" value={config.username} onChange={handleChange} />
          <label>Пароль</label>
          <input name="password" type="password" value={config.password} onChange={handleChange} />
        </>
      )}
      {config.authType === 'MTLS' && (
        <>
          <label>Сертификат (PEM)</label>
          <textarea name="cert" value={config.cert} onChange={handleChange} rows="3" />
          <label>Приватный ключ</label>
          <textarea name="key" value={config.key} onChange={handleChange} rows="3" />
          <label>CA (опционально)</label>
          <textarea name="ca" value={config.ca} onChange={handleChange} rows="2" />
        </>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={handleSubmit}>Сохранить</button>
        <button onClick={onCancel}>Отмена</button>
      </div>
    </div>
  );
}