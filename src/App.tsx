import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ResultChecker from "./pages/ResultChecker";
import ResultsLookup from "./pages/ResultsLookup";
import ScratchCardValidation from "./pages/ScratchCardValidation";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import SchoolVerification from "./pages/auth/SchoolVerification";
import PendingVerification from "./pages/auth/PendingVerification";
import PasswordReset from "./pages/auth/PasswordReset";
import PasswordResetConfirm from "./pages/auth/PasswordResetConfirm";
import { OnboardingWizard } from "./pages/onboarding";
import { PaymentComplete } from "./pages/PaymentComplete";
import ProtectedSuperAdminRoute from "./components/ProtectedSuperAdminRoute";
import SuperAdminOverview from "./pages/super-admin/Overview";
import SchoolVerifications from "./pages/super-admin/SchoolVerifications";
import SchoolsManagement from "./pages/super-admin/SchoolsManagement";
import FinancialDashboard from "./pages/super-admin/FinancialDashboard";
import ScratchCardManagement from "./pages/super-admin/ScratchCardMgmt";
import SubscriptionsManagement from "./pages/super-admin/Subscriptions";
import Analytics from "./pages/super-admin/Analytics";
import SupportTickets from "./pages/super-admin/Support";
import SystemSettings from "./pages/super-admin/Settings";
import SuperAdminProfile from "./pages/super-admin/Profile";
import SuperAdminNotifications from "./pages/super-admin/Notifications";
import SchoolAdminLayout from "./components/SchoolAdminLayout";
import SchoolRejected from "./pages/school-admin/SchoolRejected";
import {
  Overview as SchoolOverview,
  SessionTermManagement,
  ClassManagement,
  SubjectManagement,
  GradingSystemSetup,
  CSVUpload,
  CSVPreviewValidation,
  StudentsList,
  StudentProfile,
  ResultsEntry,
  BulkResultsManagement,
  ResultsPublishing,
  AnalyticsDashboard,
  LeaderboardManagement,
  ParentAccountsManagement,
  ReportCardDesigner,
  SchoolSettings,
  BillingSubscription,
  Profile as SchoolAdminProfile,
  Notifications as SchoolAdminNotifications,
} from "./pages/school-admin";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/results" element={<ResultsLookup />} />
          <Route path="/scratch-card" element={<ScratchCardValidation />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/school-verification" element={<SchoolVerification />} />
          <Route path="/auth/pending-verification" element={<PendingVerification />} />
          <Route path="/auth/password-reset" element={<PasswordReset />} />
          <Route path="/auth/password-reset-confirm" element={<PasswordResetConfirm />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />
          <Route path="/payment-complete" element={<PaymentComplete />} />
          {/* Super Admin Routes - Protected */}
          <Route path="/super-admin/verifications" element={<ProtectedSuperAdminRoute><SchoolVerifications /></ProtectedSuperAdminRoute>} />
          <Route path="/super-admin/overview" element={<ProtectedSuperAdminRoute><SuperAdminOverview /></ProtectedSuperAdminRoute>} />
          <Route path="/super-admin/schools" element={<ProtectedSuperAdminRoute><SchoolsManagement /></ProtectedSuperAdminRoute>} />
          <Route path="/super-admin/financials" element={<ProtectedSuperAdminRoute><FinancialDashboard /></ProtectedSuperAdminRoute>} />
          <Route path="/super-admin/scratch-cards" element={<ProtectedSuperAdminRoute><ScratchCardManagement /></ProtectedSuperAdminRoute>} />
          <Route path="/super-admin/subscriptions" element={<ProtectedSuperAdminRoute><SubscriptionsManagement /></ProtectedSuperAdminRoute>} />
          <Route path="/super-admin/analytics" element={<ProtectedSuperAdminRoute><Analytics /></ProtectedSuperAdminRoute>} />
          <Route path="/super-admin/support" element={<ProtectedSuperAdminRoute><SupportTickets /></ProtectedSuperAdminRoute>} />
          <Route path="/super-admin/settings" element={<ProtectedSuperAdminRoute><SystemSettings /></ProtectedSuperAdminRoute>} />
          <Route path="/super-admin/profile" element={<ProtectedSuperAdminRoute><SuperAdminProfile /></ProtectedSuperAdminRoute>} />
          <Route path="/super-admin/notifications" element={<ProtectedSuperAdminRoute><SuperAdminNotifications /></ProtectedSuperAdminRoute>} />
          
          {/* School Admin Routes */}
          <Route path="/school-admin/overview" element={<SchoolAdminLayout><SchoolOverview /></SchoolAdminLayout>} />
          <Route path="/school-admin/sessions" element={<SchoolAdminLayout><SessionTermManagement /></SchoolAdminLayout>} />
          <Route path="/school-admin/classes" element={<SchoolAdminLayout><ClassManagement /></SchoolAdminLayout>} />
          <Route path="/school-admin/subjects" element={<SchoolAdminLayout><SubjectManagement /></SchoolAdminLayout>} />
          <Route path="/school-admin/grading" element={<SchoolAdminLayout><GradingSystemSetup /></SchoolAdminLayout>} />
          <Route path="/school-admin/csv-upload" element={<SchoolAdminLayout><CSVUpload /></SchoolAdminLayout>} />
          <Route path="/school-admin/csv-preview" element={<SchoolAdminLayout><CSVPreviewValidation /></SchoolAdminLayout>} />
          <Route path="/school-admin/students" element={<SchoolAdminLayout><StudentsList /></SchoolAdminLayout>} />
          <Route path="/school-admin/student-profile" element={<SchoolAdminLayout><StudentProfile /></SchoolAdminLayout>} />
          <Route path="/school-admin/results-entry" element={<SchoolAdminLayout><ResultsEntry /></SchoolAdminLayout>} />
          <Route path="/school-admin/bulk-results" element={<SchoolAdminLayout><BulkResultsManagement /></SchoolAdminLayout>} />
          <Route path="/school-admin/publishing" element={<SchoolAdminLayout><ResultsPublishing /></SchoolAdminLayout>} />
          <Route path="/school-admin/analytics" element={<SchoolAdminLayout><AnalyticsDashboard /></SchoolAdminLayout>} />
          <Route path="/school-admin/leaderboard" element={<SchoolAdminLayout><LeaderboardManagement /></SchoolAdminLayout>} />
          <Route path="/school-admin/parents" element={<SchoolAdminLayout><ParentAccountsManagement /></SchoolAdminLayout>} />
          <Route path="/school-admin/report-cards" element={<SchoolAdminLayout><ReportCardDesigner /></SchoolAdminLayout>} />
          <Route path="/school-admin/settings" element={<SchoolAdminLayout><SchoolSettings /></SchoolAdminLayout>} />
          <Route path="/school-admin/billing" element={<SchoolAdminLayout><BillingSubscription /></SchoolAdminLayout>} />
          <Route path="/school-admin/profile" element={<SchoolAdminLayout><SchoolAdminProfile /></SchoolAdminLayout>} />
          <Route path="/school-admin/notifications" element={<SchoolAdminLayout><SchoolAdminNotifications /></SchoolAdminLayout>} />
          <Route path="/school-admin/school-rejected" element={<SchoolRejected />} />
          
          <Route path="/:schoolSlug/result-checker" element={<ResultChecker />} />
          <Route path="/original" element={<Index />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
