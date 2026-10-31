import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import { useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import LiveVoicePage from './pages/LiveVoicePage';
import TwoPersonTranslationPage from './pages/TwoPersonTranslationPage';
import TranslationExplanationPage from './pages/TranslationExplanationPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import HistoryPage from './pages/HistoryPage';
import SavedConversationsPage from './pages/SavedConversationsPage';
import SupportDashboardPage from './pages/SupportDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';
import HelpPage from './pages/HelpPage';

// Layout for Protected Pages
const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className="flex-1 flex w-full">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Layout for Public Pages
const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Allow guest exploration during hackathon if desired, or redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Admin Route Guard
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return <Navigate to="/app/dashboard" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      {/* Protected App Pages */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="voice" element={<LiveVoicePage />} />
        <Route path="dual-translation" element={<TwoPersonTranslationPage />} />
        <Route path="translation" element={<TranslationExplanationPage />} />
        <Route path="knowledge" element={<KnowledgeBasePage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="saved" element={<SavedConversationsPage />} />
        <Route path="support" element={<SupportDashboardPage />} />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="help" element={<HelpPage />} />
      </Route>

      {/* Fallback & Convenient Aliases */}
      <Route path="/translate" element={<Navigate to="/app/translation" replace />} />
      <Route path="/translation" element={<Navigate to="/app/translation" replace />} />
      <Route path="/two-person" element={<Navigate to="/app/dual-translation" replace />} />
      <Route path="/dual-translation" element={<Navigate to="/app/dual-translation" replace />} />
      <Route path="/live-voice" element={<Navigate to="/app/voice" replace />} />
      <Route path="/voice" element={<Navigate to="/app/voice" replace />} />
      <Route path="/chat" element={<Navigate to="/app/chat" replace />} />
      <Route path="/knowledge" element={<Navigate to="/app/knowledge" replace />} />
      <Route path="/admin" element={<Navigate to="/app/admin" replace />} />
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
