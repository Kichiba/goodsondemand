import { NavLink, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminLogout } from '../../services/adminFirebase';
import AdminLoginPage from './AdminLoginPage';

export default function AdminLayout() {
  const { user, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="admin-loading">
        <p>Loading...</p>
      </div>
    );
  }

  // Not signed in — show the login gate instead of the admin.
  if (!user) {
    return <AdminLoginPage />;
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header-inner">
          <span className="admin-title">Inventory Manager</span>
          <nav className="admin-nav">
            <NavLink
              to="/admin/summary"
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              Summary
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              Products
            </NavLink>
            <NavLink
              to="/admin/orders"
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              Orders
            </NavLink>
          </nav>
          <div className="admin-user">
            <span className="admin-email">{user.email}</span>
            <button className="admin-logout" onClick={() => adminLogout()}>
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
