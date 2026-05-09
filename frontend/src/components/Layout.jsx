import { NavLink, Outlet } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="logo">
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
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;