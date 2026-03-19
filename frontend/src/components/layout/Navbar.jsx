import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
        .navbar-root {
          font-family: 'Poppins', system-ui, sans-serif;
          height: 64px;
          background: rgba(250, 247, 242, 0.95);
          border-bottom: 1px solid rgba(120, 90, 50, 0.12);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 40;
          backdrop-filter: blur(16px);
        }
        .navbar-welcome {
          font-size: 14px;
          font-weight: 500;
          color: #2a1f0f;
        }
        .navbar-welcome span {
          color: #6d3cb4;
          font-weight: 600;
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .navbar-bell {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: #ede6d9;
          border: 1px solid rgba(120, 90, 50, 0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #7a6a55;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .navbar-bell:hover {
          background: #e6ddd0;
          color: #2a1f0f;
          border-color: rgba(109, 60, 180, 0.25);
        }
        .navbar-divider {
          width: 1px;
          height: 22px;
          background: rgba(120, 90, 50, 0.14);
          margin: 0 4px;
        }
        .navbar-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6d3cb4, #5a58d6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
        }
        .navbar-logout {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 8px;
          background: transparent;
          border: 1px solid rgba(120, 90, 50, 0.14);
          color: #7a6a55;
          font-size: 13px;
          font-weight: 500;
          font-family: 'Poppins', system-ui, sans-serif;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .navbar-logout:hover {
          background: rgba(200, 80, 60, 0.07);
          color: #c85040;
          border-color: rgba(200, 80, 60, 0.25);
        }
        .navbar-logout-label {
          display: inline;
        }
        @media (max-width: 480px) {
          .navbar-logout-label { display: none; }
        }
      `}</style>

      <header className="navbar-root">
        <div>
          {user && (
            <p className="navbar-welcome">
              Welcome back, <span>{user.name}</span>
            </p>
          )}
        </div>

        <div className="navbar-actions">
          <button className="navbar-bell">
            <Bell size={16} />
          </button>

          <div className="navbar-divider" />

          <div className="navbar-avatar">
            <User size={15} />
          </div>

          <button onClick={handleLogout} className="navbar-logout">
            <LogOut size={14} />
            <span className="navbar-logout-label">Logout</span>
          </button>
        </div>
      </header>
    </>
  );
};

export default Navbar;