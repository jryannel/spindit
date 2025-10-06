import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { AuthGuard } from './layouts/AuthGuard';
import { StaffGuard } from './layouts/StaffGuard';
import { LoginPage } from './pages/LoginPage';
import { ParentDashboard } from './pages/ParentDashboard';
import { StaffConsole } from './pages/StaffConsole';
import { RequestsPage } from './pages/RequestsPage';

export const App = () => {
  return (
    <MantineProvider defaultColorScheme="auto">
      <Notifications position="top-right" limit={3} />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AuthGuard />}>
              <Route element={<AppLayout />}>
                <Route index element={<ParentDashboard />} />
                <Route element={<StaffGuard />}>
                  <Route path="staff" element={<StaffConsole />} />
                  <Route path="requests" element={<RequestsPage />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </MantineProvider>
  );
};
