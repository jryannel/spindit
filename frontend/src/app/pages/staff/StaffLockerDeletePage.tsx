import { Button, Card, Group, Loader, Stack, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteLockerMutation, useStaffLockerQuery } from '../../../features/staff/hooks';
import { PageTitle } from '../../components/PageTitle';

export const StaffLockerDeletePage = () => {
  const { lockerId } = useParams();
  const navigate = useNavigate();
  const { data: locker, isLoading, error } = useStaffLockerQuery(lockerId);
  const deleteLockerMutation = useDeleteLockerMutation();

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

  const goBack = () => navigate(-1);

  const handleDelete = async () => {
    if (!lockerId) return;
    try {
      await deleteLockerMutation.mutateAsync(lockerId);
      showNotification({ color: 'green', title: 'Locker deleted', message: 'Locker removed successfully.' });
      navigate('/staff/lockers', { replace: true });
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Delete failed', message: 'Unable to delete the locker.' });
    }
  };

  const header = (
    <PageTitle title="Delete locker" description="This action cannot be undone." withBack />
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
    <Stack gap="md">
      {header}
      <Card withBorder shadow="sm">
        <Stack gap="sm">
          <Text>
            Are you sure you want to delete locker <strong>#{locker.number}</strong>? All assignments referencing this locker
            will need to be updated manually.
          </Text>
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={goBack} disabled={deleteLockerMutation.isPending}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={deleteLockerMutation.isPending}>
              Delete locker
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
};
