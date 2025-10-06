import { AppShell, Burger, Group, NavLink, ScrollArea } from '@mantine/core';
import { IconKey, IconLayoutDashboard, IconLogout, IconTools } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuth } from '../../features/auth/AuthContext';

export const AppLayout = () => {
  const [opened, { toggle }] = useDisclosure();
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = useMemo(() => {
    const items = [{ label: 'Portal', icon: IconLayoutDashboard, to: '/' }];
    if (user?.is_staff) {
      items.push(
        { label: 'Staff Console', icon: IconTools, to: '/staff' },
        { label: 'Requests', icon: IconKey, to: '/requests' },
      );
    }
    return items;
  }, [user?.is_staff]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" aria-label="Toggle navigation" />
            <strong>Spindit Lockers</strong>
          </Group>
          <Group gap="sm">
            <span>{user?.email}</span>
            <IconLogout
              aria-label="Log out"
              onClick={() => logout()}
              style={{ cursor: 'pointer' }}
              size={18}
            />
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
            active={location.pathname === item.to}
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
