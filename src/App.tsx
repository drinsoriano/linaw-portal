import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { EcaProvider } from "./context/EcaContext";
import { FeedbackProvider } from "./context/FeedbackContext";
import { SubmissionsProvider } from "./context/SubmissionsContext";
import { ContactProvider } from "./context/ContactContext";
import { IECProvider } from "./context/IECContext";
import { AppLayout } from "./components/layout/AppLayout";

// Existing pages
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

// CENRO pages
import { CenroDashboard } from "./pages/cenro/CenroDashboard";
import { EcaTrackerPage } from "./pages/cenro/EcaTrackerPage";
import { PerformanceRankingPage } from "./pages/cenro/PerformanceRankingPage";
import { HaulerAccreditationPage } from "./pages/cenro/HaulerAccreditationPage";
import { FeedbackManagementPage } from "./pages/cenro/FeedbackManagementPage";

// Barangay pages
import { BarangayDashboard } from "./pages/barangay/BarangayDashboard";
import { EcaReportPage } from "./pages/barangay/EcaReportPage";
import { CollectionMonitoringPage } from "./pages/barangay/CollectionMonitoringPage";
import { RecyclerRegistryPage } from "./pages/barangay/RecyclerRegistryPage";
import { FinancialSummaryPage } from "./pages/barangay/FinancialSummaryPage";
import { IncidentReportPage } from "./pages/barangay/IncidentReportPage";
import { IECActivitiesPage } from "./pages/barangay/IECActivitiesPage";
import { FeedbackViewPage } from "./pages/barangay/FeedbackViewPage";

// Public pages
import { PublicDashboard } from "./pages/public/PublicDashboard";
import { CitizenReportPage } from "./pages/public/CitizenReportPage";

// Contact management
import { ContactSettingsPage } from "./pages/barangay/ContactSettingsPage";
import { CenroContactPage } from "./pages/cenro/CenroContactPage";

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function SmartRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "CENRO_EVALUATOR":
      return <Navigate to="/cenro/dashboard" replace />;
    case "BARANGAY_SECRETARY":
    case "BARANGAY_COUNCILOR":
    case "BARANGAY_CAPTAIN":
      return <Navigate to="/barangay/dashboard" replace />;
    case "CITIZEN":
      return <Navigate to="/public" replace />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/public" element={<PublicDashboard />} />
      <Route path="/citizen/report" element={<CitizenReportPage />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<SmartRedirect />} />

        {/* Admin / Researcher shared */}
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

        {/* CENRO */}
        <Route path="/cenro/dashboard" element={<CenroDashboard />} />
        <Route path="/cenro/eca-tracker" element={<EcaTrackerPage />} />
        <Route path="/cenro/ranking" element={<PerformanceRankingPage />} />
        <Route path="/cenro/haulers" element={<HaulerAccreditationPage />} />
        <Route path="/cenro/feedback" element={<FeedbackManagementPage />} />

        {/* Barangay */}
        <Route path="/barangay/dashboard" element={<BarangayDashboard />} />
        <Route path="/barangay/eca" element={<EcaReportPage />} />
        <Route path="/barangay/collection" element={<CollectionMonitoringPage />} />
        <Route path="/barangay/recyclers" element={<RecyclerRegistryPage />} />
        <Route path="/barangay/financial" element={<FinancialSummaryPage />} />
        <Route path="/barangay/incidents" element={<IncidentReportPage />} />
        <Route path="/barangay/iec" element={<IECActivitiesPage />} />
        <Route path="/barangay/feedback" element={<FeedbackViewPage />} />
        <Route path="/barangay/contact" element={<ContactSettingsPage />} />

        {/* CENRO contact */}
        <Route path="/cenro/contact" element={<CenroContactPage />} />

        <Route path="*" element={<SmartRedirect />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SubmissionsProvider>
        <ContactProvider>
          <IECProvider>
          <EcaProvider>
            <FeedbackProvider>
              <ToastProvider>
                <AppRoutes />
              </ToastProvider>
            </FeedbackProvider>
          </EcaProvider>
          </IECProvider>
        </ContactProvider>
      </SubmissionsProvider>
    </AuthProvider>
  );
}
