import { useCluster } from '../contexts/ClusterContext';

export default function Dashboard() {
  const { currentCluster } = useCluster();

  return (
    <div className="dashboard-container">
      <h1>Kafka System Control 4.1</h1>
      {currentCluster ? (
        <div className="cluster-info">
          <h2>Активный кластер: {currentCluster.name}</h2>
          <div className="info-card">
            <p><strong>Брокеры:</strong> {currentCluster.brokers}</p>
            <p><strong>Аутентификация:</strong> {currentCluster.authType}</p>
            {currentCluster.authType !== 'PLAINTEXT' && (
              <p><strong>Пользователь:</strong> {currentCluster.username || '—'}</p>
            )}
          </div>
          <div className="stats-placeholder">
            <p>📊 Статистика кластера появится после подключения к API.</p>
            <p className="hint">Здесь будут отображаться количество топиков, групп, активные consumer’ы и т.д.</p>
          </div>
        </div>
      ) : (
        <div className="welcome-message">
          <h2>Добро пожаловать!</h2>
          <p>Kafka System Control — веб‑интерфейс для администрирования Apache Kafka.</p>
          <p>Чтобы начать работу, <strong>добавьте кластер</strong> через кнопку <strong>Add</strong> в левом меню.</p>
          <p>После добавления и выбора кластера здесь появится сводная информация о нём.</p>
          <p>Используйте меню для управления топиками, ACL и группами потребителей.</p>
        </div>
      )}
    </div>
  );
}