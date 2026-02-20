import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

import Layout from './components/Layout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import PullRequestList from './pages/PullRequestList';
import PullRequestDetail from './pages/PullRequestDetail';
import CreatePullRequest from './pages/CreatePullRequest';
import AssignedReviews from './pages/AssignedReviews';
import AuditLogs from './pages/AuditLogs';
import NotificationsPage from './pages/NotificationsPage';
import Settings from './pages/Settings';
import CodePlayground from './pages/CodePlayground';



function ProtectedRoute({ children }: { children: React.ReactNode }) {

  const { accessToken, user } = useAuthStore();

  // For demo purposes - allow access if we have a user, token, or demo mode
  const isAuthenticated = user || accessToken || localStorage.getItem('accessToken') || localStorage.getItem('demo-mode');

  if (!isAuthenticated) {

    return <Navigate to="/login" replace />;

  }

  return <>{children}</>;

}

// Demo route that bypasses authentication entirely
function DemoRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}



function PublicOnly({ children }: { children: React.ReactNode }) {

  const { user, accessToken } = useAuthStore();
  const hasToken = localStorage.getItem('accessToken');

  if (user || accessToken || hasToken) {

    return <Navigate to="/pull-requests" replace />;

  }

  return <>{children}</>;

}



export default function App() {

  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {

    document.documentElement.classList.toggle('dark', theme === 'dark');

  }, [theme]);


  return (

    <Routes>


      {/* Public */}

      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />

      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

      {/* Demo Route - Bypass Authentication */}
      <Route
        element={<DemoRoute><Layout /></DemoRoute>}
      >
        <Route path="/demo" element={<Dashboard />} />
        <Route path="/demo/dashboard" element={<Dashboard />} />
        <Route path="/demo/pull-requests" element={<PullRequestList />} />
        <Route path="/demo/pull-requests/new" element={<CreatePullRequest />} />
        <Route path="/demo/pull-requests/:id" element={<PullRequestDetail />} />
        <Route path="/demo/assigned-reviews" element={<AssignedReviews />} />
        <Route path="/demo/notifications" element={<NotificationsPage />} />
        <Route path="/demo/settings" element={<Settings />} />
        <Route path="/demo/playground" element={<CodePlayground />} />
      </Route>



      {/* Protected */}

      <Route

        element={

          <ProtectedRoute>

            <Layout />

          </ProtectedRoute>

        }

      >

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/pull-requests" element={<PullRequestList />} />

        <Route path="/pull-requests/new" element={<CreatePullRequest />} />

        <Route path="/pull-requests/:id" element={<PullRequestDetail />} />

        <Route path="/assigned-reviews" element={<AssignedReviews />} />

        <Route path="/audit-logs" element={<AuditLogs />} />

        <Route path="/notifications" element={<NotificationsPage />} />

        <Route path="/settings" element={<Settings />} />

        <Route path="/playground" element={<CodePlayground />} />

      </Route>



      <Route path="*" element={<Navigate to="/" replace />} />


    </Routes>

  );

}