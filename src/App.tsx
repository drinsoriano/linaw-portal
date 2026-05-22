import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { BarangayProfilePage } from "./pages/BarangayProfilePage";
import { AuditChecklistPage } from "./pages/AuditChecklistPage";
import { EvidenceRepositoryPage } from "./pages/EvidenceRepositoryPage";
import { ComplianceResultsPage } from "./pages/ComplianceResultsPage";
import { PDCAActionPlanPage } from "./pages/PDCAActionPlanPage";
import { RootCauseAnalysisPage } from "./pages/RootCauseAnalysisPage";
import { ReportsPage } from "./pages/ReportsPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { SettingsPage } from "./pages/SettingsPage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/barangays" element={<BarangayProfilePage />} />
        <Route path="/audit" element={<AuditChecklistPage />} />
        <Route path="/evidence" element={<EvidenceRepositoryPage />} />
        <Route path="/results" element={<ComplianceResultsPage />} />
        <Route path="/results/:submissionId" element={<ComplianceResultsPage />} />
        <Route path="/action-plan" element={<PDCAActionPlanPage />} />
        <Route path="/rca" element={<RootCauseAnalysisPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
