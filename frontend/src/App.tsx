import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import PullRequestList from './pages/PullRequestList';
import PullRequestDetail from './pages/PullRequestDetail';
import CreatePullRequest from './pages/CreatePullRequest';
import AssignedReviews from './pages/AssignedReviews';
import AuditLogs from './pages/AuditLogs';
import NotificationsPage from './pages/NotificationsPage';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, accessToken, fetchUser } = useAuthStore();
  useEffect(() => {
    if (accessToken || localStorage.getItem('accessToken')) fetchUser();
  }, [accessToken, fetchUser]);
  if (!user && !localStorage.getItem('accessToken')) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (user) return <Navigate to="/pull-requests" replace />;
  return <>{children}</>;
}

export default function App() {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<PublicOnly><Landing /></PublicOnly>} />
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/pull-requests" replace />} />
        <Route path="pull-requests" element={<PullRequestList />} />
        <Route path="pull-requests/new" element={<CreatePullRequest />} />
        <Route path="pull-requests/:id" element={<PullRequestDetail />} />
        <Route path="assigned-reviews" element={<AssignedReviews />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
