import { useState } from 'react';
import { FiUser, FiShield, FiClock, FiGlobe } from 'react-icons/fi';
import '../styles/management-pages.css';

const permissions = ['Просмотр кластера', 'Просмотр топиков', 'Просмотр consumer groups', 'Управление ACL', 'Аудит'];

export default function User() {
  const [timezone, setTimezone] = useState(() => localStorage.getItem('ksc_timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone);

  const changeTimezone = (event) => {
    const value = event.target.value;
    setTimezone(value);
    localStorage.setItem('ksc_timezone', value);
  };

  return (
    <div className="management-page">
      <header className="management-header">
        <span className="management-kicker">Account</span>
        <h1>Пользователь</h1>
        <p>Профиль, локальные настройки и права доступа в KSC.</p>
      </header>
      <div className="management-grid">
        <div className="management-card"><div className="management-card-label">Пользователь</div><div className="management-card-value">Egorich88</div></div>
        <div className="management-card"><div className="management-card-label">Роль</div><div className="management-card-value">Administrator</div></div>
        <div className="management-card"><div className="management-card-label">Язык</div><div className="management-card-value">RU</div></div>
        <div className="management-card"><div className="management-card-label">Часовой пояс</div><div className="management-card-value" style={{fontSize:15}}>{timezone}</div></div>
      </div>
      <section className="management-panel">
        <div className="management-panel-head"><h2><FiUser /> Профиль</h2></div>
        <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(280px,1fr)',gap:20,padding:20}}>
          <div>
            <div className="management-card-label"><FiGlobe /> Часовой пояс</div>
            <select value={timezone} onChange={changeTimezone} style={{width:'100%',padding:'12px 14px',borderRadius:12,border:'1px solid var(--border-color)',background:'var(--input-bg)',color:'var(--text-primary)'}}>
              <option>{timezone}</option>
              <option>UTC</option><option>Europe/Amsterdam</option><option>Europe/Moscow</option><option>Asia/Almaty</option>
            </select>
          </div>
          <div>
            <div className="management-card-label"><FiShield /> Права</div>
            <div style={{display:'grid',gap:8}}>
              {permissions.map(permission => <span key={permission} className="status-pill">{permission}</span>)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
