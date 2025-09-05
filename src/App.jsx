import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';

// Pages
import Dashboard from './pages/Dashboard';
import ScholarshipList from './pages/ScholarshipList';
import ScholarshipDetail from './pages/ScholarshipDetail';
import Activities from './pages/Activities';
import ActivityForm from './pages/ActivityForm';
import Articles from './pages/Articles';
import ArticleForm from './pages/ArticleForm';
import CMSSettings from './pages/CMSSettings';
import InfoCenter from './pages/InfoCenter';

// Tambahan
import Login from './pages/Login';
import AdminUsers from './pages/AdminUsers';
import AdminUserForm from './pages/AdminUserForm';

// Guard sederhana berbasis localStorage
const RequireAuth = ({ children }) => {
  const authed = !!localStorage.getItem('authToken');
  return authed ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* Root -> login */}
      <Route index element={<Navigate to="/login" replace />} />
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Protected area */}
      <Route
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Beasiswa */}
        <Route path="/beasiswa" element={<ScholarshipList />} />
        <Route path="/beasiswa/:id" element={<ScholarshipDetail />} />

        {/* Aktivitas */}
        <Route path="/aktivitas" element={<Activities />} />
        <Route path="/aktivitas/new" element={<ActivityForm mode="create" />} />
        <Route path="/aktivitas/:id/edit" element={<ActivityForm mode="edit" />} />

        {/* Artikel */}
        <Route path="/artikel" element={<Articles />} />
        <Route path="/artikel/new" element={<ArticleForm mode="create" />} />
        <Route path="/artikel/:id/edit" element={<ArticleForm mode="edit" />} />

        {/* Kelola User Admin */}
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/new" element={<AdminUserForm mode="create" />} />
        <Route path="/admin/users/:id/edit" element={<AdminUserForm mode="edit" />} />

        {/* CMS */}
        <Route path="/cms" element={<CMSSettings />} />

        <Route path="/pusat-informasi" element={<InfoCenter />} />
      </Route>

      {/* Fallback -> login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
