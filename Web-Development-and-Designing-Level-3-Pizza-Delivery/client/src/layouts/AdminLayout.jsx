import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div className="admin-sidebar-brand">
          <div className="admin-logo-row">
            <span className="font-display admin-brand-text">Crust &amp; Craft</span>
            <span className="admin-badge">Admin</span>
          </div>
          <span className="admin-tagline">Management Console</span>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📦</span>
            <span>Live Orders</span>
          </NavLink>
          <NavLink to="/admin/menu" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🍕</span>
            <span>Menu &amp; Items</span>
          </NavLink>
          <NavLink to="/admin/customers" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">👥</span>
            <span>Customers</span>
          </NavLink>

          <div className="admin-nav-divider"></div>

          <NavLink to="/" className="admin-nav-link public-link">
            <span className="nav-icon">🏪</span>
            <span>Back to Storefront</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">{user?.name?.charAt(0) || 'A'}</div>
            <div className="admin-details">
              <p className="admin-user-name">{user?.name || 'Administrator'}</p>
              <p className="admin-user-email">{user?.email}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm w-full" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title">Oasis Infobyte Internship — Level 3 Administration</div>
          <div className="admin-mode-pill">
            <span className="pulse-dot"></span>
            <span>API Server: Connected</span>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
