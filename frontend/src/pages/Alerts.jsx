import { FiBell, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import '../styles/management-pages.css';

export default function Alerts() {
  return (
    <div className="management-page">
      <header className="management-header">
        <span className="management-kicker">Operations</span>
        <h1>Оповещения</h1>
        <p>События, требующие внимания при работе Kafka-кластера.</p>
      </header>
      <div className="management-grid">
        <div className="management-card"><div className="management-card-label">Активные</div><div className="management-card-value">0</div></div>
        <div className="management-card"><div className="management-card-label">Критические</div><div className="management-card-value">0</div></div>
        <div className="management-card"><div className="management-card-label">Предупреждения</div><div className="management-card-value">0</div></div>
        <div className="management-card"><div className="management-card-label">За 24 часа</div><div className="management-card-value">0</div></div>
      </div>
      <section className="management-panel">
        <div className="management-panel-head"><h2><FiBell /> Активные оповещения</h2></div>
        <table className="management-table">
          <thead><tr><th>Время</th><th>Уровень</th><th>Событие</th><th>Источник</th></tr></thead>
          <tbody><tr><td colSpan="4" className="muted"><FiCheckCircle /> Активных оповещений нет.</td></tr></tbody>
        </table>
      </section>
    </div>
  );
}
