import { Button, Card, Group, Loader, Stack, Text } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStaffZoneQuery } from '../../../features/staff/hooks';
import { PageTitle } from '../../components/PageTitle';

export const StaffZoneDetailsPage = () => {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const { data: zone, isLoading, error } = useStaffZoneQuery(zoneId);

  useEffect(() => {
    if (!zoneId) {
      navigate('/staff/zones', { replace: true });
    }
  }, [navigate, zoneId]);

  useEffect(() => {
    if (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to load the zone.' });
      navigate('/staff/zones', { replace: true });
    }
  }, [error, navigate]);

  const header = (
    <PageTitle
      title={zone?.name ?? 'Zone details'}
      description="Review zone details."
      withBack
      actions={
        zone ? (
          <Group gap="sm">
            <Button component={Link} to={`/staff/zones/${zone.id}/edit`} leftSection={<IconPencil size={16} />}>
              Edit
            </Button>
            <Button
              component={Link}
              to={`/staff/zones/${zone.id}/delete`}
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

  if (!zone) {
    return (
      <Stack gap="md">
        {header}
        <Card withBorder shadow="sm">
          <Text c="dimmed">Zone not found.</Text>
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
            <Text fw={500}>Description</Text>
            <Text size="sm">{zone.description || '—'}</Text>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
};
