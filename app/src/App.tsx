import { Routes, Route, Navigate, useLocation } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import ApiKeysPage from '@/pages/ApiKeys';
import UsagePage from '@/pages/Usage';
import DocumentationPage from '@/pages/Documentation';
import SettingsPage from '@/pages/Settings';
import BillingPage from '@/pages/Billing';
import AdminPage from '@/pages/Admin';
import InvoicesPage from '@/pages/Invoices';
import CustomersPage from '@/pages/Customers';
import ReceiptsPage from '@/pages/Receipts';
import PaymentVouchersPage from '@/pages/PaymentVouchers';
import PaymentsPage from '@/pages/Payments';
import DevelopersPage from '@/pages/Developers';
import AdminPaymentsPage from '@/pages/AdminPayments';
import ExchangeRatesPage from '@/pages/ExchangeRates';
import PhoneVerifyPage from '@/pages/PhoneVerify';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={auth.user} onLogout={auth.logout} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({
  children,
  adminOnly,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !auth.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

const dashboardRoutes = [
  '/dashboard',
  '/invoices',
  '/customers',
  '/receipts',
  '/payment-vouchers',
  '/payments',
  '/keys',
  '/usage',
  '/settings',
  '/billing',
  '/admin',
  '/developers',
  '/exchange-rates',
'/phone-verify',
];

export default function App() {
  const auth = useAuth();
  const location = useLocation();

  const isDashboardRoute = dashboardRoutes.some(
    (r) =>
      location.pathname === r ||
      location.pathname.startsWith(r + '/')
  );

  if (isDashboardRoute) {
    return (
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard user={auth.user} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <InvoicesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <CustomersPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/receipts"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ReceiptsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment-vouchers"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PaymentVouchersPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
  path="/exchange-rates"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <ExchangeRatesPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/phone-verify"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <PhoneVerifyPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
        
        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PaymentsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/keys"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ApiKeysPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/usage"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <UsagePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/developers"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DevelopersPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SettingsPage
                  user={auth.user}
                  onUpdateProfile={() => {}}
                />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <BillingPage user={auth.user} />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <DashboardLayout>
                <AdminPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute adminOnly>
              <DashboardLayout>
                <AdminPaymentsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={auth.user} onLogout={auth.logout} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route
            path="/login"
            element={
              auth.isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login
                  onLogin={auth.login}
                  onRegister={auth.register}
                  isLoading={auth.isLoading}
                />
              )
            }
          />

          <Route path="/docs" element={<DocumentationPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isDashboardRoute && <Footer />}
    </div>
  );
}
