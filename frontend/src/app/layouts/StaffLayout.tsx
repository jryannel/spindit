import { Anchor, AppShell, Burger, Group, NavLink, ScrollArea } from '@mantine/core';
import { IconGauge, IconKey, IconMap, IconUsers, IconBuildingWarehouse } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth';
import { appConfig } from '../../lib/config';
import { ThemeToggle } from '../components/ThemeToggle';
import { UserMenu } from '../components/UserMenu';

const staffNav = [
  { label: 'Dashboard', icon: IconGauge, to: '/staff/dashboard' },
  { label: 'Users', icon: IconUsers, to: '/staff/users' },
  { label: 'Requests', icon: IconKey, to: '/staff/requests' },
  { label: 'Lockers', icon: IconBuildingWarehouse, to: '/staff/lockers' },
  { label: 'Zones', icon: IconMap, to: '/staff/zones' },
];

export const StaffLayout = () => {
  const [opened, { toggle }] = useDisclosure();
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user?.is_staff) {
    return <Navigate to="/app" replace />;
  }

  const modeLinks = [{ label: 'Rent mode', to: '/app', key: 'rent' }, { label: 'Staff mode', to: '/staff/dashboard', key: 'staff' }];
  if (appConfig.developerMode) {
    modeLinks.push({ label: 'Dev mode', to: '/dev', key: 'dev' });
  }

  const activeMode = location.pathname.startsWith('/staff')
    ? 'staff'
    : location.pathname.startsWith('/dev')
    ? 'dev'
    : 'rent';

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 230, breakpoint: 'md', collapsed: { mobile: !opened } }}
      padding="md"
      styles={{
        main: {
          backgroundColor: '#f6f8fb',
        },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" aria-label="Toggle navigation" />
            <strong>Spindit Staff Console</strong>
          </Group>
          <Group gap="sm" align="center">
            <Group gap="xs" visibleFrom="sm" c="dimmed">
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
            <UserMenu email={user.email} profilePath="/app/profile" onLogout={() => logout()} />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md" component={ScrollArea}>
        {staffNav.map((item) => (
          <NavLink
            key={item.to}
            component={Link}
            to={item.to}
            label={item.label}
            leftSection={<item.icon size={16} />}
            active={location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)}
            onClick={() => {
              if (opened) toggle();
            }}
          />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
