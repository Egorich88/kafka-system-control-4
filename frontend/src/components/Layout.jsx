import { NavLink, Outlet } from 'react-router-dom';
import packageJson from '../../package.json'; // путь к package.json

const Layout = () => {
  const version = packageJson.version;
  const author = "Egor Khomenko";
  const githubUrl = "https://github.com/Egorich88";

  return (
    <div className="app-layout sidebar-dark">
      <aside className="sidebar">
        <div className="logo">
          <img src="/logo.svg" alt="Kafka Control" width="32" height="32" style={{ marginRight: 8 }} />
          <h3>Kafka System Control</h3>
        </div>
        <nav>
          <NavLink to="/topics" className={({ isActive }) => (isActive ? 'active' : '')}>
            Топики
          </NavLink>
          <NavLink to="/groups" className={({ isActive }) => (isActive ? 'active' : '')}>
            Группы потребителей
          </NavLink>
          <NavLink to="/acls" className={({ isActive }) => (isActive ? 'active' : '')}>
            ACL
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => (isActive ? 'active' : '')}>
            Поиск сообщений
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="version">Версия: {version}</div>
          <div className="author">
            <a href={githubUrl} target="_blank" rel="noopener noreferrer">
              {author}
            </a>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;