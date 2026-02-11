import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui';
import HomeIcon from '../../assets/Home.png';
import DocumentsIcon from '../../assets/Documents.png';
import HistoryIcon from '../../assets/History.png';
import UsersIcon from '../../assets/Users.png';
import LogoutIcon from '../../assets/Logout.png';
import HamburgerIcon from '../../assets/Hamburger.png';
import './layout.css';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate after logout is complete
      navigate('/login', { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      alert("Error logging out. Please try again.");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className={`dashboard-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-header">
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={toggleSidebar}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <img src={HamburgerIcon} alt="Toggle sidebar" />
          </button>
          <h2>Library CMS</h2>
        </div>
        <nav>
          <Link to="/">
            <span className="sidebar-icon">
              <img src={HomeIcon} alt="Home" />
            </span>
            <span className="sidebar-label">Home</span>
          </Link>
          <Link to="/clearances">
            <span className="sidebar-icon">
              <img src={DocumentsIcon} alt="Clearances" />
            </span>
            <span className="sidebar-label">Clearances</span>
          </Link>
          <Link to="/history">
            <span className="sidebar-icon">
              <img src={HistoryIcon} alt="History" />
            </span>
            <span className="sidebar-label">History</span>
          </Link>
          {user?.role === 'LIBRARY_ADMIN' && (
            <Link to="/users">
              <span className="sidebar-icon">
                <img src={UsersIcon} alt="Users" />
              </span>
              <span className="sidebar-label">Users</span>
            </Link>
          )}
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            style={{ width: '100%' }}
          >
            <span className="sidebar-icon">
              <img src={LogoutIcon} alt="Logout" />
            </span>
            <span className="sidebar-label">Logout</span>
          </Button>
        </nav>
      </aside>
      <main className="content">
        <header>
          <div className="header-left">
            <span>Welcome, {user?.displayName || 'Librarian'}</span>
          </div>
        </header>
        <Outlet /> {/* This renders the specific page (Clearances or Users) */}
      </main>
    </div>
  );
};

export default DashboardLayout;