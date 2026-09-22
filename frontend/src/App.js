import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/PageLoader';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const VerifyEmailOTPPage = lazy(() => import('./pages/VerifyEmailOTPPage'));
const LobbyPage = lazy(() => import('./pages/LobbyPage'));
const DebateRoomPage = lazy(() => import('./pages/DebateRoomPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PerformanceCenterPage = lazy(() => import('./pages/PerformanceCenterPage'));
const PracticePlanPage = lazy(() => import('./pages/PracticePlanPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const DebateHistoryPage = lazy(() => import('./pages/DebateHistoryPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
import AppNavbar from './components/AppNavbar';
import AppFooter from './components/AppFooter';
import BottomNav from './components/BottomNav';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <ToastContainer />
            <AppNavbar />
            <BottomNav />
            <Analytics />
            <PageLoader>
              <Suspense fallback={<div className="df-center"><div className="df-spinner" /></div>}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                  <Route path="/verify-email-otp" element={<VerifyEmailOTPPage />} />

                  {/* Practice Arena Selection */}
                  <Route
                    path="/lobby"
                    element={
                      <ProtectedRoute>
                        <LobbyPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/practice"
                    element={<Navigate to="/lobby" replace />}
                  />

                  {/* Interactive Practice Arena */}
                  <Route
                    path="/debate/:id"
                    element={
                      <ProtectedRoute>
                        <DebateRoomPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Dashboard */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Performance Center */}
                  <Route
                    path="/performance"
                    element={
                      <ProtectedRoute>
                        <PerformanceCenterPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Practice Plan */}
                  <Route
                    path="/plan"
                    element={
                      <ProtectedRoute>
                        <PracticePlanPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Practice History */}
                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute>
                        <DebateHistoryPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Profile & Settings */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Rankings & Community */}
                  <Route
                    path="/leaderboard"
                    element={
                      <ProtectedRoute>
                        <LeaderboardPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </PageLoader>
            <AppFooter />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
