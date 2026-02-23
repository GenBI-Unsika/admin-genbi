import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import { authLogout, authRefresh, fetchMe, hasAccessToken } from './utils/api';
import { fetchMeViaTrpc } from './utils/me';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ScholarshipList = React.lazy(() => import('./pages/ScholarshipList'));
const ScholarshipDetail = React.lazy(() => import('./pages/ScholarshipDetail'));
const ScholarshipInterview = React.lazy(() => import('./pages/ScholarshipInterview'));
const ScholarshipDocuments = React.lazy(() => import('./pages/ScholarshipDocuments'));
const Activities = React.lazy(() => import('./pages/Activities'));
const ActivityForm = React.lazy(() => import('./pages/ActivityForm'));
const Articles = React.lazy(() => import('./pages/Articles'));
const ArticleForm = React.lazy(() => import('./pages/ArticleForm'));
const CMSSettings = React.lazy(() => import('./pages/CMSSettings'));

const MasterData = React.lazy(() => import('./pages/MasterData'));
const Login = React.lazy(() => import('./pages/Login'));
const AdminUsers = React.lazy(() => import('./pages/AdminUsers'));
const AdminUserForm = React.lazy(() => import('./pages/AdminUserForm'));
const Divisions = React.lazy(() => import('./pages/Divisions'));
const DivisionForm = React.lazy(() => import('./pages/DivisionForm'));
const Teams = React.lazy(() => import('./pages/Teams'));
const TeamForm = React.lazy(() => import('./pages/TeamForm'));
const Treasury = React.lazy(() => import('./pages/Treasury'));
const Dispensations = React.lazy(() => import('./pages/Dispensations'));
const Points = React.lazy(() => import('./pages/Points'));
const Profile = React.lazy(() => import('./pages/Profile'));

const RequireAuth = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(hasAccessToken());

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!hasAccessToken()) {
          try {
            await authRefresh();
          } catch {
            // Cuekin errornya; ntar disuruh login lg ttp
          }
        }

        if (hasAccessToken()) {
          try {
            let me;
            try {
              me = await fetchMeViaTrpc();
            } catch {
              try {
                await authRefresh();
                me = await fetchMeViaTrpc();
              } catch {
                me = await fetchMe();
              }
            }

            const allowedRoles = new Set(['super_admin', 'admin', 'koordinator']);

            const userRole = typeof me?.role === 'object' ? me.role?.name : me?.role;

            if (!me || !allowedRoles.has(userRole)) {
              await authLogout();
            }
          } catch {
            await authLogout();
          }
        }
      } finally {
        if (alive) {
          setAuthed(hasAccessToken());
          setChecking(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (checking) return null;
  return authed ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-600" />
      </div>
    }>
      <Routes>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<Navigate to="/dashboard/traffic" replace />} />
          <Route path="/dashboard/:tab" element={<Dashboard />} />
          <Route path="/beasiswa" element={<ScholarshipList />} />
          <Route path="/beasiswa/wawancara" element={<ScholarshipInterview />} />
          <Route path="/beasiswa/dokumen" element={<ScholarshipDocuments />} />
          <Route path="/beasiswa/:id" element={<ScholarshipDetail />} />
          <Route path="/aktivitas" element={<Activities />} />
          <Route path="/aktivitas/new" element={<ActivityForm mode="create" />} />
          <Route path="/aktivitas/:id/edit" element={<ActivityForm mode="edit" />} />
          <Route path="/artikel" element={<Articles />} />
          <Route path="/artikel/new" element={<ArticleForm mode="create" />} />
          <Route path="/artikel/:id/edit" element={<ArticleForm mode="edit" />} />

          <Route path="/divisi" element={<Divisions />} />
          <Route path="/divisi/new" element={<DivisionForm />} />
          <Route path="/divisi/:id/edit" element={<DivisionForm />} />

          <Route path="/anggota" element={<Teams />} />
          <Route path="/anggota/new" element={<TeamForm />} />
          <Route path="/anggota/:id/edit" element={<TeamForm />} />
          <Route path="/kas" element={<Treasury />} />
          <Route path="/poin" element={<Points />} />
          <Route path="/dispensasi" element={<Dispensations />} />
          <Route path="/admin/users" element={<Navigate to="/admin/users/accounts" replace />} />
          <Route path="/admin/users/:tab" element={<AdminUsers />} />
          <Route path="/admin/users/new" element={<AdminUserForm mode="create" />} />
          <Route path="/admin/users/:id/edit" element={<AdminUserForm mode="edit" />} />
          <Route path="/cms" element={<CMSSettings />} />
          <Route path="/master-data" element={<MasterData />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </React.Suspense>
  );
}
