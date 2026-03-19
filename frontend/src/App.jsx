import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Accounts from './pages/Accounts';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Campaigns from './pages/Campaigns';
import Composer from './pages/Composer';
import Calendar from './pages/Calendar';
import Inbox from './pages/Inbox';
import ActivityLog from './pages/ActivityLog';
import useAuthStore from './store/authStore';

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuthStore();
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

import DashboardHome from './pages/DashboardHome';
import Landing from './pages/Landing';

function App() {
  const { fetchProfile, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        <Route path="/" element={<Landing />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="composer" element={<Composer />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="inbox" element={<Inbox />} />
          <Route path="activity" element={<ActivityLog />} />
          <Route path="settings" element={<div className="p-4">Settings (Coming Soon)</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
