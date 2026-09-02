import { FiServer, FiActivity } from 'react-icons/fi';
import '../styles/management-pages.css';

export default function Brokers() {
  return (
    <div className="management-page">
      <header className="management-header">
        <span className="management-kicker">Kafka Cluster</span>
        <h1>Брокеры</h1>
        <p>Состояние брокеров, роли и распределение нагрузки кластера.</p>
      </header>
      <div className="management-grid">
        <div className="management-card"><div className="management-card-label">Брокеры</div><div className="management-card-value">0</div></div>
        <div className="management-card"><div className="management-card-label">Online</div><div className="management-card-value">0</div></div>
        <div className="management-card"><div className="management-card-label">Controller</div><div className="management-card-value">—</div></div>
        <div className="management-card"><div className="management-card-label">Partitions</div><div className="management-card-value">0</div></div>
      </div>
      <section className="management-panel">
        <div className="management-panel-head"><h2><FiServer /> Состояние брокеров</h2><FiActivity className="muted" /></div>
        <table className="management-table">
          <thead><tr><th>ID</th><th>Host</th><th>Port</th><th>Role</th><th>Status</th></tr></thead>
          <tbody><tr><td colSpan="5" className="muted">Данные брокеров будут загружены после подключения к кластеру.</td></tr></tbody>
        </table>
      </section>
    </div>
  );
}
