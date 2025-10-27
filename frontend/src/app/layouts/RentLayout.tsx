import { Anchor, AppShell, Burger, Group, NavLink, ScrollArea } from '@mantine/core';
import { IconLayoutDashboard, IconUser, IconKey } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuth } from '../../features/auth';
import { appConfig } from '../../lib/config';
import { ThemeToggle } from '../components/ThemeToggle';
import { UserMenu } from '../components/UserMenu';

export const RentLayout = () => {
  const [opened, { toggle }] = useDisclosure();
  const { logout, user } = useAuth();
  const location = useLocation();

  const modeLinks = useMemo(() => {
    const links = [{ label: 'Rent mode', to: '/app', key: 'rent' }];
    if (user?.is_staff) {
      links.push({ label: 'Staff mode', to: '/staff/dashboard', key: 'staff' });
    }
    if (appConfig.developerMode) {
      links.push({ label: 'Dev mode', to: '/dev', key: 'dev' });
    }
    return links;
  }, [user?.is_staff]);

  const navItems = useMemo(
    () => [
      { label: 'Portal overview', icon: IconLayoutDashboard, to: '/app' },
      { label: 'Profile', icon: IconUser, to: '/app/profile' },
      { label: 'Request locker', icon: IconKey, to: '/app/request' },
    ],
    [],
  );

  const activeMode = location.pathname.startsWith('/staff')
    ? 'staff'
    : location.pathname.startsWith('/dev')
    ? 'dev'
    : 'rent';

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 220, breakpoint: 'md', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" aria-label="Toggle navigation" />
            <strong>Spindit Lockers</strong>
          </Group>
          <Group gap="sm" align="center">
            {modeLinks.length > 1 && (
              <Group gap="xs" visibleFrom="sm" c="dimmed" fw={500}>
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
            )}
            <ThemeToggle />
            <UserMenu email={user?.email} profilePath="/app/profile" onLogout={() => logout()} />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md" component={ScrollArea}>
        {navItems.map((item) => (
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
