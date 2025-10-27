import { Button, Card, Group, Loader, Stack, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteRequestsMutation, useStaffRequestQuery } from '../../../features/staff/hooks';
import { PageTitle } from '../../components/PageTitle';

export const StaffRequestDeletePage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { data: request, isLoading, error } = useStaffRequestQuery(requestId);
  const deleteRequestsMutation = useDeleteRequestsMutation();

  useEffect(() => {
    if (!requestId) {
      navigate('/staff/requests', { replace: true });
    }
  }, [navigate, requestId]);

  useEffect(() => {
    if (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to load the request.' });
      navigate('/staff/requests', { replace: true });
    }
  }, [error, navigate]);

  const goBack = () => navigate(-1);

  const handleDelete = async () => {
    if (!requestId) return;
    try {
      await deleteRequestsMutation.mutateAsync([requestId]);
      showNotification({ color: 'green', title: 'Request deleted', message: 'The request has been removed.' });
      navigate('/staff/requests', { replace: true });
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Delete failed', message: 'Unable to delete the request.' });
    }
  };

  const header = (
    <PageTitle
      title="Delete request"
      description="This action cannot be undone."
      withBack
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

  if (!request) {
    return (
      <Stack gap="md">
        {header}
        <Card withBorder shadow="sm">
          <Text c="dimmed">Request not found.</Text>
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
            Are you sure you want to delete the request for <strong>{request.student_name}</strong> submitted by{' '}
            <strong>{request.requester_name}</strong>?
          </Text>
          <Text c="dimmed" size="sm">
            Submitted on {new Date(request.submitted_at).toLocaleString()} with status {request.status}.
          </Text>
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={goBack} disabled={deleteRequestsMutation.isPending}>
              Cancel
            </Button>
            <Button color="red" onClick={handleDelete} loading={deleteRequestsMutation.isPending}>
              Delete request
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
};
