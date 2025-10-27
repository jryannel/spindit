import { Button, Card, Group, Loader, Stack, Text } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';
import { useStaffRequestQuery } from '../../../features/staff/hooks';
import { PageTitle } from '../../components/PageTitle';

export const StaffRequestDetailsPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { data: request, isLoading, error } = useStaffRequestQuery(requestId);

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

  const title = (
    <PageTitle
      title="Request details"
      description="Review the selected locker request."
      withBack
      actions={
        request ? (
          <Group gap="sm">
            <Button component={Link} to={`/staff/requests/${request.id}/edit`} leftSection={<IconPencil size={16} />}>
              Edit
            </Button>
            <Button
              component={Link}
              to={`/staff/requests/${request?.id}/delete`}
              color="red"
              leftSection={<IconTrash size={16} />}
            >
              Delete
            </Button>
          </Group>
        ) : null
      }
    />
  );

  if (isLoading) {
    return (
      <Stack gap="md">
        {title}
        <Group justify="center" mt="xl">
          <Loader />
        </Group>
      </Stack>
    );
  }

  if (!request) {
    return (
      <Stack gap="md">
        {title}
        <Card withBorder shadow="sm">
          <Text c="dimmed">Request not found.</Text>
        </Card>
      </Stack>
    );
  }

  const expandedUser = request.expand?.user as { email?: string } | undefined;
  const userLabel = expandedUser?.email ?? request.user;

  return (
    <Stack gap="lg">
      {title}
      <Card withBorder shadow="sm">
        <Stack gap="md">
          <div>
            <Text fw={500}>Student details</Text>
            <Text size="sm">
              {request.student_name} – Class {request.student_class} ({request.school_year})
            </Text>
          </div>
          <div>
            <Text fw={500}>Requester</Text>
            <Text size="sm">
              {request.requester_name}
              <br />
              {request.requester_address}
              <br />
              {request.requester_phone}
            </Text>
          </div>
          <div>
            <Text fw={500}>Preferred locker</Text>
            <Text size="sm">
              {request.preferred_zone
                ? `Zone: ${request.expand?.preferred_zone?.name ?? request.preferred_zone}`
                : '—'}
              <br />
              {request.preferred_locker ? `Locker: ${request.preferred_locker}` : 'No specific locker'}
            </Text>
          </div>
          <div>
            <Text fw={500}>Status</Text>
            <Text size="sm">{request.status}</Text>
          </div>
          <div>
            <Text fw={500}>Submitted</Text>
            <Text size="sm">{new Date(request.submitted_at).toLocaleString()}</Text>
          </div>
          <div>
            <Text fw={500}>User</Text>
            <Text size="sm">{userLabel}</Text>
          </div>
        </Stack>
      </Card>
    </Stack>
  );
};
