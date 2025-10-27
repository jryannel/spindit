import { Button, Card, Group, Loader, Stack, Text } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStaffUserQuery } from '../../../features/staff/hooks';
import { PageTitle } from '../../components/PageTitle';

export const StaffUserDetailsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useStaffUserQuery(userId);

  useEffect(() => {
    if (!userId) {
      navigate('/staff/users', { replace: true });
    }
  }, [navigate, userId]);

  useEffect(() => {
    if (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to load the user.' });
      navigate('/staff/users', { replace: true });
    }
  }, [error, navigate]);

  useEffect(() => {
    if (!error && userId && isLoading === false && !user) {
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to load the user.' });
      navigate('/staff/users', { replace: true });
    }
  }, [error, isLoading, navigate, user, userId]);

  const header = (
    <PageTitle
      title="User details"
      description="Review account information and permissions."
      withBack
      actions={
        user ? (
          <Group gap="sm">
            <Button component={Link} to={`/staff/users/${user.id}/edit`} leftSection={<IconPencil size={16} />}>
              Edit
            </Button>
            <Button
              component={Link}
              to={`/staff/users/${user.id}/delete`}
              color="red"
              leftSection={<IconTrash size={16} />}
            >
              Delete
            </Button>
          </Group>
        ) : undefined
      }
    />
  );

  if (isLoading) {
    return (
      <Stack gap="md">
        {header}
        <Group justify="center" mt="xl">
          <Loader />
        </Group>
      </Stack>
    );
  }

  if (!user) {
    return (
      <Stack gap="md">
        {header}
        <Card withBorder shadow="sm">
          <Text c="dimmed">User not found.</Text>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      {header}
      <Card withBorder shadow="sm">
        <Stack gap="md">
          <div>
            <Text fw={500}>Email</Text>
            <Text size="sm">{user.email}</Text>
          </div>
          <div>
            <Text fw={500}>Full name</Text>
            <Text size="sm">{user.full_name || '—'}</Text>
          </div>
          <div>
            <Text fw={500}>Phone</Text>
            <Text size="sm">{user.phone || '—'}</Text>
          </div>
          <div>
            <Text fw={500}>Address</Text>
            <Text size="sm">{user.address || '—'}</Text>
          </div>
          <div>
            <Text fw={500}>Language</Text>
            <Text size="sm">{user.language?.toUpperCase() || '—'}</Text>
          </div>
          <div>
            <Text fw={500}>Role</Text>
            <Text size="sm">{user.is_staff ? 'Staff' : 'Family'}</Text>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
};
