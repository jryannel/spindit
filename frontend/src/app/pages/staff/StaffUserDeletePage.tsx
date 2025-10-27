import { Button, Card, Group, Loader, Stack, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteUserMutation, useStaffUserQuery } from '../../../features/staff/hooks';
import { PageTitle } from '../../components/PageTitle';

export const StaffUserDeletePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useStaffUserQuery(userId);
  const deleteUserMutation = useDeleteUserMutation();

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

  const goBack = () => navigate(-1);

  const handleDelete = async () => {
    if (!userId) return;
    try {
      await deleteUserMutation.mutateAsync(userId);
      showNotification({ color: 'green', title: 'User deleted', message: 'The user has been removed.' });
      navigate('/staff/users', { replace: true });
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Delete failed', message: 'Unable to delete the user.' });
    }
  };

  const header = (
    <PageTitle title="Delete user" description="This action cannot be undone." withBack />
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
    <Stack gap="md">
      {header}
      <Card withBorder shadow="sm">
        <Stack gap="sm">
          <Text>
            Are you sure you want to delete <strong>{user.email}</strong>? This will remove their access permanently.
          </Text>
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={goBack} disabled={deleteUserMutation.isPending}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={deleteUserMutation.isPending}>
              Delete user
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
};
