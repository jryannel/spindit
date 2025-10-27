import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../features/auth';
import { appConfig } from '../lib/config';
import { queryClient } from '../lib/queryClient';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { RentLayout } from './layouts/RentLayout';
import { AuthGuard } from './layouts/AuthGuard';
import { StaffGuard } from './layouts/StaffGuard';
import { StaffLayout } from './layouts/StaffLayout';
import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { ParentDashboard } from './pages/ParentDashboard';
import { SignupPage } from './pages/SignupPage';
import { RequestLockerPage } from './pages/RequestLockerPage';
import { ProfilePage } from './pages/ProfilePage';
import { DeveloperToolsPage } from './pages/DeveloperToolsPage';
import { DeveloperLayout } from './layouts/DeveloperLayout';
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { StaffUsersPage } from './pages/staff/StaffUsersPage';
import { StaffUserCreatePage } from './pages/staff/StaffUserCreatePage';
import { StaffUserDetailsPage } from './pages/staff/StaffUserDetailsPage';
import { StaffUserEditPage } from './pages/staff/StaffUserEditPage';
import { StaffUserDeletePage } from './pages/staff/StaffUserDeletePage';
import { StaffRequestsPage } from './pages/staff/StaffRequestsPage';
import { StaffRequestCreatePage } from './pages/staff/StaffRequestCreatePage';
import { StaffRequestDetailsPage } from './pages/staff/StaffRequestDetailsPage';
import { StaffRequestEditPage } from './pages/staff/StaffRequestEditPage';
import { StaffRequestDeletePage } from './pages/staff/StaffRequestDeletePage';
import { StaffLockersPage } from './pages/staff/StaffLockersPage';
import { StaffLockerCreatePage } from './pages/staff/StaffLockerCreatePage';
import { StaffLockerDetailsPage } from './pages/staff/StaffLockerDetailsPage';
import { StaffLockerEditPage } from './pages/staff/StaffLockerEditPage';
import { StaffLockerDeletePage } from './pages/staff/StaffLockerDeletePage';
import { StaffZonesPage } from './pages/staff/StaffZonesPage';
import { StaffZoneCreatePage } from './pages/staff/StaffZoneCreatePage';
import { StaffZoneDetailsPage } from './pages/staff/StaffZoneDetailsPage';
import { StaffZoneEditPage } from './pages/staff/StaffZoneEditPage';
import { StaffZoneDeletePage } from './pages/staff/StaffZoneDeletePage';

const colorSchemeManager = localStorageColorSchemeManager({ key: 'spindit-color-scheme' });

const RentHome = () => {
  return <ParentDashboard />;
};

const RouterErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const currentPath = `${location.pathname}${location.search}${location.hash}`;
  return <AppErrorBoundary currentPath={currentPath}>{children}</AppErrorBoundary>;
};

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider defaultColorScheme="auto" colorSchemeManager={colorSchemeManager}>
        <Notifications position="top-right" limit={3} />
        <ModalsProvider>
          <BrowserRouter>
            <RouterErrorBoundary>
              <AuthProvider>
                <Routes>
                <Route index element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                {appConfig.developerMode && (
                  <Route path="/dev" element={<DeveloperLayout />}>
                    <Route index element={<DeveloperToolsPage />} />
                  </Route>
                )}
                <Route path="/app" element={<AuthGuard />}>
                  <Route element={<RentLayout />}>
                    <Route index element={<RentHome />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="request" element={<RequestLockerPage />} />
                  </Route>
                </Route>
                <Route path="/staff" element={<AuthGuard />}>
                  <Route element={<StaffGuard />}>
                    <Route element={<StaffLayout />}>
                      <Route index element={<Navigate to="dashboard" replace />} />
                      <Route path="dashboard" element={<StaffDashboardPage />} />
                      <Route path="users">
                        <Route index element={<StaffUsersPage />} />
                        <Route path="new" element={<StaffUserCreatePage />} />
                        <Route path=":userId" element={<StaffUserDetailsPage />} />
                        <Route path=":userId/edit" element={<StaffUserEditPage />} />
                        <Route path=":userId/delete" element={<StaffUserDeletePage />} />
                      </Route>
                      <Route path="requests">
                        <Route index element={<StaffRequestsPage />} />
                        <Route path="new" element={<StaffRequestCreatePage />} />
                        <Route path=":requestId" element={<StaffRequestDetailsPage />} />
                        <Route path=":requestId/edit" element={<StaffRequestEditPage />} />
                        <Route path=":requestId/delete" element={<StaffRequestDeletePage />} />
                      </Route>
                      <Route path="lockers">
                        <Route index element={<StaffLockersPage />} />
                        <Route path="new" element={<StaffLockerCreatePage />} />
                        <Route path=":lockerId" element={<StaffLockerDetailsPage />} />
                        <Route path=":lockerId/edit" element={<StaffLockerEditPage />} />
                        <Route path=":lockerId/delete" element={<StaffLockerDeletePage />} />
                      </Route>
                      <Route path="zones">
                        <Route index element={<StaffZonesPage />} />
                        <Route path="new" element={<StaffZoneCreatePage />} />
                        <Route path=":zoneId" element={<StaffZoneDetailsPage />} />
                        <Route path=":zoneId/edit" element={<StaffZoneEditPage />} />
                        <Route path=":zoneId/delete" element={<StaffZoneDeletePage />} />
                      </Route>
                    </Route>
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AuthProvider>
            </RouterErrorBoundary>
          </BrowserRouter>
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
};
