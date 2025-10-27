import { Button, Card, Group, Loader, Stack, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteZoneMutation, useStaffZoneQuery } from '../../../features/staff/hooks';
import { PageTitle } from '../../components/PageTitle';

export const StaffZoneDeletePage = () => {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const { data: zone, isLoading, error } = useStaffZoneQuery(zoneId);
  const deleteZoneMutation = useDeleteZoneMutation();

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

  const goBack = () => navigate(-1);

  const handleDelete = async () => {
    if (!zoneId) return;
    try {
      await deleteZoneMutation.mutateAsync(zoneId);
      showNotification({ color: 'green', title: 'Zone deleted', message: 'Zone removed successfully.' });
      navigate('/staff/zones', { replace: true });
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Delete failed', message: 'Unable to delete zone.' });
    }
  };

  const header = (
    <PageTitle title="Delete zone" description="This action cannot be undone." withBack />
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
    <Stack gap="md">
      {header}
      <Card withBorder shadow="sm">
        <Stack gap="sm">
          <Text>
            Are you sure you want to delete <strong>{zone.name}</strong>? Removing the zone will not move lockers but may
            affect reporting.
          </Text>
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={goBack} disabled={deleteZoneMutation.isPending}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={deleteZoneMutation.isPending}>
              Delete zone
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
};
