import { FiShield, FiCheckCircle, FiLock } from 'react-icons/fi';
import '../styles/management-pages.css';

export default function Acl() {
  return (
    <div className="management-page">
      <header className="management-header">
        <span className="management-kicker">Security</span>
        <h1>ACL</h1>
        <p>Контроль разрешений Kafka для пользователей и сервисных аккаунтов.</p>
      </header>
      <div className="management-grid">
        <div className="management-card"><div className="management-card-label">Правила</div><div className="management-card-value">0</div></div>
        <div className="management-card"><div className="management-card-label">Пользователи</div><div className="management-card-value">0</div></div>
        <div className="management-card"><div className="management-card-label">Разрешено</div><div className="management-card-value">0</div></div>
        <div className="management-card"><div className="management-card-label">Ограничено</div><div className="management-card-value">0</div></div>
      </div>
      <section className="management-panel">
        <div className="management-panel-head"><h2><FiShield /> Политики доступа</h2></div>
        <table className="management-table">
          <thead><tr><th>Principal</th><th>Resource</th><th>Operation</th><th>Permission</th></tr></thead>
          <tbody><tr><td colSpan="4" className="muted">Правила ACL будут загружены после подключения кластера.</td></tr></tbody>
        </table>
      </section>
    </div>
  );
}
