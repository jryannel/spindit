import { Anchor, AppShell, Group } from '@mantine/core';
import { useMemo } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth';
import { appConfig } from '../../lib/config';
import { ThemeToggle } from '../components/ThemeToggle';
import { UserMenu } from '../components/UserMenu';

export const DeveloperLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const modeLinks = useMemo(() => {
    const links: Array<{ label: string; to: string; key: string }> = [
      { label: 'Rent mode', to: '/app', key: 'rent' },
    ];
    if (user?.is_staff) {
      links.push({ label: 'Staff mode', to: '/staff/dashboard', key: 'staff' });
    }
    if (appConfig.developerMode) {
      links.push({ label: 'Dev mode', to: '/dev', key: 'dev' });
    }
    return links;
  }, [user?.is_staff]);

  const activeMode = location.pathname.startsWith('/staff')
    ? 'staff'
    : location.pathname.startsWith('/dev')
    ? 'dev'
    : 'rent';

  return (
    <AppShell header={{ height: 60 }} padding="lg">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <strong>Spindit Developer Toolkit</strong>
          <Group gap="sm" align="center" c="dimmed">
            <Group gap="xs" visibleFrom="sm">
              {modeLinks.map((link) => (
                <Anchor
                  key={link.key}
                  component={Link}
                  to={link.to}
                  fw={activeMode === link.key ? 700 : 500}
                  c={activeMode === link.key ? 'blue' : 'dimmed'}
                >
                  {link.label}
                </Anchor>
              ))}
            </Group>
            <ThemeToggle />
            {user ? (
              <UserMenu email={user.email} profilePath="/app/profile" onLogout={() => logout()} />
            ) : (
              <Anchor component={Link} to="/login">
                Sign in
              </Anchor>
            )}
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
