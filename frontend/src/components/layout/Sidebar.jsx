import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Layers, Calendar, Inbox, BarChart2, MessageSquare, Settings, Activity, Megaphone } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: Home, path: '/dashboard' },
  { label: 'Accounts', icon: Layers, path: '/dashboard/accounts' },
  { label: 'Analytics', icon: BarChart2, path: '/dashboard/analytics' },
  { label: 'Campaigns', icon: Megaphone, path: '/dashboard/campaigns' },
  { label: 'Composer', icon: MessageSquare, path: '/dashboard/composer' },
  { label: 'Calendar', icon: Calendar, path: '/dashboard/calendar' },
  { label: 'Inbox', icon: Inbox, path: '/dashboard/inbox' },
  { label: 'Activity', icon: Activity, path: '/dashboard/activity' },
  { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

const Sidebar = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        .sb-root {
          font-family: 'Poppins', system-ui, sans-serif;
          width: 256px;
          height: 100vh;
          background: #f3ede3;
          border-right: 1px solid rgba(120, 90, 50, 0.12);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
        }
        .sb-logo {
          padding: 20px 20px 18px;
          border-bottom: 1px solid rgba(120, 90, 50, 0.12);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sb-logo-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: linear-gradient(135deg, #6d3cb4, #5a58d6);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 14px rgba(109, 60, 180, 0.28);
          flex-shrink: 0;
        }
        .sb-logo-text {
          font-size: 15px;
          font-weight: 800;
          color: #2a1f0f;
          letter-spacing: -0.02em;
        }
        .sb-logo-badge {
          font-size: 9px;
          font-weight: 700;
          color: #6d3cb4;
          background: rgba(109, 60, 180, 0.1);
          border: 1px solid rgba(109, 60, 180, 0.2);
          padding: 2px 7px;
          border-radius: 5px;
          letter-spacing: 0.06em;
          margin-left: 2px;
        }
        .sb-nav {
          flex: 1;
          padding: 12px 10px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .sb-nav::-webkit-scrollbar { width: 4px; }
        .sb-nav::-webkit-scrollbar-track { background: transparent; }
        .sb-nav::-webkit-scrollbar-thumb { background: #c4b49a; border-radius: 3px; }
        .sb-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          color: #7a6a55;
          border: 1px solid transparent;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .sb-link:hover {
          background: rgba(109, 60, 180, 0.06);
          color: #2a1f0f;
          border-color: rgba(109, 60, 180, 0.14);
        }
        .sb-link.active {
          background: linear-gradient(135deg, rgba(109,60,180,0.12), rgba(90,88,214,0.07));
          color: #6d3cb4;
          border-color: rgba(109, 60, 180, 0.24);
          font-weight: 600;
        }
        .sb-footer {
          padding: 14px 16px;
          border-top: 1px solid rgba(120, 90, 50, 0.12);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sb-footer-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #4a8c3a;
          animation: pulseDot 1.8s ease-in-out infinite;
          flex-shrink: 0;
        }
        .sb-footer-text {
          font-size: 11px;
          color: #7a6a55;
        }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>

      <aside className="sb-root">
        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-icon">
            <Home size={15} color="#fff" />
          </div>
          <span className="sb-logo-text">Creator OS</span>
          <span className="sb-logo-badge">BETA</span>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer status */}
        <div className="sb-footer">
          <div className="sb-footer-dot" />
          <span className="sb-footer-text">All platforms connected</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;