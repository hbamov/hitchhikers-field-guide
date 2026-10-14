import { Navigate, Route, Routes } from "react-router-dom";
import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";
import { AdminGuidePage } from "../../features/adminGuide/pages/AdminGuidePage";
import { AuthPage } from "../../features/auth/pages/AuthPage";
import { DashboardPage } from "../../pages/Dashboard/DashboardPage";
import { AppLayout } from "../../components/layout/AppLayout";
import { NotFoundPage } from "../../pages/NotFound/NotFoundPage";
import { GuidePage } from "../../features/guide/pages/GuidePage";
import { TravelTasksPage } from "../../features/travelTasks/pages/TravelTasksPage";
import { GuideEntryPage } from "../../features/guide/pages/GuideEntryPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<AdminRoute />}>
            <Route path="/admin/guide" element={<AdminGuidePage />} />
          </Route>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/guide/:entryId" element={<GuideEntryPage />} />
          <Route path="/tasks" element={<TravelTasksPage />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
