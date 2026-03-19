import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .dash-root * { font-family: 'Poppins', system-ui, sans-serif; box-sizing: border-box; }
        .dash-root {
          min-height: 100vh;
          background: #faf7f2;
          display: flex;
        }
        .dash-sidebar-wrap {
          width: 256px;
          flex-shrink: 0;
          background: #f3ede3;
          border-right: 1px solid rgba(120, 90, 50, 0.12);
          min-height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 50;
        }
        .dash-content {
          flex: 1;
          margin-left: 256px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .dash-navbar-wrap {
          position: sticky;
          top: 0;
          z-index: 40;
          background: rgba(250, 247, 242, 0.92);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(120, 90, 50, 0.12);
        }
        .dash-main {
          flex: 1;
          padding: 28px;
          overflow-y: auto;
          background: #faf7f2;
        }

        @media (max-width: 768px) {
          .dash-sidebar-wrap { display: none; }
          .dash-content { margin-left: 0; }
          .dash-main { padding: 16px; }
        }
      `}</style>

      <div className="dash-root">
        <div className="dash-sidebar-wrap">
          <Sidebar />
        </div>
        <div className="dash-content">
          <div className="dash-navbar-wrap">
            <Navbar />
          </div>
          <main className="dash-main">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;