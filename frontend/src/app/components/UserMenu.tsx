import { Avatar, Button, Menu, Text } from '@mantine/core';
import { IconChevronDown, IconLogout, IconUser } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

interface UserMenuProps {
  email?: string | null;
  profilePath: string;
  onLogout: () => void;
}

const getInitials = (email?: string | null) => {
  if (!email) return '?';
  const [namePart] = email.split('@');
  return namePart.charAt(0).toUpperCase() || email.charAt(0).toUpperCase() || '?';
};

export const UserMenu = ({ email, profilePath, onLogout }: UserMenuProps) => {
  const initials = getInitials(email);
  const label = email ?? 'Account';

  return (
    <Menu shadow="md" width={220} position="bottom-end">
      <Menu.Target>
        <Button
          variant="subtle"
          color="gray"
          size="compact-sm"
          leftSection={<Avatar radius="xl" size={24}>{initials}</Avatar>}
          rightSection={<IconChevronDown size={14} />}
        >
          <Text size="sm" fw={500} visibleFrom="sm">
            {label}
          </Text>
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Account</Menu.Label>
        <Menu.Item component={Link} to={profilePath} leftSection={<IconUser size={16} />}>
          Profile
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<IconLogout size={16} />}
          color="red"
          onClick={onLogout}
        >
          Log out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
