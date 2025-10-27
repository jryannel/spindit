import { Button, Card, Group, Loader, Stack, Text } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStaffLockerQuery } from '../../../features/staff/hooks';
import { PageTitle } from '../../components/PageTitle';

export const StaffLockerDetailsPage = () => {
  const { lockerId } = useParams();
  const navigate = useNavigate();
  const { data: locker, isLoading, error } = useStaffLockerQuery(lockerId);

  useEffect(() => {
    if (!lockerId) {
      navigate('/staff/lockers', { replace: true });
    }
  }, [lockerId, navigate]);

  useEffect(() => {
    if (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to load the locker.' });
      navigate('/staff/lockers', { replace: true });
    }
  }, [error, navigate]);

  const header = (
    <PageTitle
      title={locker ? `Locker #${locker.number}` : 'Locker details'}
      description="Review locker details and status."
      withBack
      actions={
        locker ? (
          <Group gap="sm">
            <Button component={Link} to={`/staff/lockers/${locker.id}/edit`} leftSection={<IconPencil size={16} />}>
              Edit
            </Button>
            <Button
              component={Link}
              to={`/staff/lockers/${locker.id}/delete`}
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

  if (!locker) {
    return (
      <Stack gap="md">
        {header}
        <Card withBorder shadow="sm">
          <Text c="dimmed">Locker not found.</Text>
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
            <Text fw={500}>Status</Text>
            <Text size="sm">{locker.status}</Text>
          </div>
          <div>
            <Text fw={500}>Zone</Text>
            <Text size="sm">{locker.expand?.zone?.name ?? '—'}</Text>
          </div>
          <div>
            <Text fw={500}>Note</Text>
            <Text size="sm">{locker.note || '—'}</Text>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
};
