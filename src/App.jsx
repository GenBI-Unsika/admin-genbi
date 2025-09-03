import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import ScholarshipList from "./pages/ScholarshipList";
import ScholarshipDetail from "./pages/ScholarshipDetail";
import Activities from "./pages/Activities";
import ActivityForm from "./pages/ActivityForm";
import Articles from "./pages/Articles";
import ArticleForm from "./pages/ArticleForm";
import CMSSettings from "./pages/CMSSettings";

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Beasiswa */}
        <Route path="/beasiswa" element={<ScholarshipList />} />
        <Route path="/beasiswa/:id" element={<ScholarshipDetail />} />

        {/* Aktivitas */}
        <Route path="/aktivitas" element={<Activities />} />
        <Route path="/aktivitas/new" element={<ActivityForm mode="create" />} />
        <Route
          path="/aktivitas/:id/edit"
          element={<ActivityForm mode="edit" />}
        />

        {/* Artikel */}
        <Route path="/artikel" element={<Articles />} />
        <Route path="/artikel/new" element={<ArticleForm mode="create" />} />
        <Route path="/artikel/:id/edit" element={<ArticleForm mode="edit" />} />

        {/* Placeholder CMS Landing Page */}
        <Route path="/cms" element={<CMSSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
