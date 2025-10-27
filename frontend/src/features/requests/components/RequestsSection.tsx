import { Accordion, Badge, Button, Card, Group, Loader, Stack, Table, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useEffect } from 'react';
import { showNotification } from '@mantine/notifications';
import { IconClipboardPlus } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth';
import { type LockerRecord, type LockerRequestRecord } from '../api';
import { useCancelRequestMutation, useUserAssignmentsQuery, useUserRequestsQuery } from '../hooks';

const formatDate = (value?: string) => (value ? new Date(value).toLocaleDateString() : '—');

export const RequestsSection = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const cancelMutation = useCancelRequestMutation();
  const {
    data: requests = [],
    isLoading: isRequestsLoading,
    isFetching: isRequestsFetching,
    error: requestsError,
  } = useUserRequestsQuery(userId);
  const {
    data: assignments = [],
    isLoading: isAssignmentsLoading,
    isFetching: isAssignmentsFetching,
    error: assignmentsError,
  } = useUserAssignmentsQuery(userId);

  const assignmentsLoading = isAssignmentsLoading || isAssignmentsFetching;
  const requestsLoading = isRequestsLoading || isRequestsFetching;

  const handleCancelRequest = (request: LockerRequestRecord) => {
    if (!userId) return;
    modals.openConfirmModal({
      title: 'Cancel locker request?',
      centered: true,
      children: (
        <Text size="sm">
          Cancelling will remove this request from processing. You can submit a new request at any time.
        </Text>
      ),
      labels: { confirm: 'Cancel request', cancel: 'Keep request' },
      confirmProps: { color: 'red', loading: cancelMutation.isPending },
      onConfirm: async () => {
        try {
          await cancelMutation.mutateAsync({ userId, requestId: request.id });
          showNotification({
            color: 'green',
            title: 'Request cancelled',
            message: 'Your locker request has been cancelled.',
          });
        } catch (error) {
          console.error(error);
          showNotification({
            color: 'red',
            title: 'Cancel failed',
            message: 'Unable to cancel the request right now.',
          });
        }
      },
    });
  };

  useEffect(() => {
    if (requestsError) {
      console.error(requestsError);
      showNotification({
        color: 'red',
        title: 'Load failed',
        message: 'Unable to fetch locker requests.',
      });
    }
  }, [requestsError]);

  useEffect(() => {
    if (assignmentsError) {
      console.error(assignmentsError);
      showNotification({
        color: 'red',
        title: 'Load failed',
        message: 'Unable to fetch locker assignments.',
      });
    }
  }, [assignmentsError]);

  return (
    <Stack gap="lg">
      <Card withBorder>
        <Stack gap="sm">
          <Group justify="space-between">
            <Title order={4}>My Lockers</Title>
            <Button component={Link} to="/app/request" leftSection={<IconClipboardPlus size={16} />}>
              Request a Locker
            </Button>
          </Group>
          {assignmentsLoading ? (
            <Group justify="center" py="md">
              <Loader size="sm" />
            </Group>
          ) : assignments.length === 0 ? (
            <Text c="dimmed">No lockers assigned yet. Locker details will appear here after approval.</Text>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Locker</Table.Th>
                  <Table.Th>Zone</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Assigned</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {assignments.map((assignment) => {
                  const locker = assignment.expand?.locker as LockerRecord | undefined;
                  const zone = locker?.expand?.zone ?? assignment.expand?.request?.expand?.preferred_zone;
                  return (
                    <Table.Tr key={assignment.id}>
                      <Table.Td>{locker?.number ?? '—'}</Table.Td>
                      <Table.Td>{zone?.name ?? '—'}</Table.Td>
                      <Table.Td>
                        <Badge color={locker?.status === 'occupied' ? 'blue' : 'gray'}>{locker?.status ?? 'unknown'}</Badge>
                      </Table.Td>
                      <Table.Td>{formatDate(assignment.assigned_at)}</Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          )}
        </Stack>
      </Card>

      <Card withBorder>
        <Stack gap="sm">
          <Title order={4}>My Requests</Title>
          {requestsLoading ? (
            <Group justify="center" py="md">
              <Loader size="sm" />
            </Group>
          ) : requests.length === 0 ? (
            <Text c="dimmed">No requests yet. Use the “Request a Locker” button to start the process.</Text>
          ) : (
            <Accordion multiple>
              {requests.map((request) => (
                <Accordion.Item value={request.id} key={request.id}>
                  <Accordion.Control>
                    <Group gap="md" wrap="nowrap">
                      <Stack gap={0}>
                        <Text fw={600}>{request.student_name}</Text>
                        <Text size="sm" c="dimmed">
                          Class {request.student_class} · {request.school_year}
                        </Text>
                      </Stack>
                      <Badge color={request.status === 'pending' ? 'yellow' : 'green'}>{request.status}</Badge>
                      <Text size="sm" c="dimmed">
                        Submitted {formatDate(request.submitted_at ?? request.created)}
                      </Text>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="xs">
                      <Group gap="lg" align="flex-start">
                        <Stack gap={2}>
                          <Text fw={600}>Requester</Text>
                          <Text>{request.requester_name}</Text>
                          <Text size="sm" c="dimmed">
                            {request.requester_address}
                          </Text>
                          <Text size="sm" c="dimmed">
                            {request.requester_phone}
                          </Text>
                        </Stack>
                        <Stack gap={2}>
                          <Text fw={600}>Preferences</Text>
                          <Text size="sm">
                            Zone: {request.expand?.preferred_zone?.name ?? request.preferred_zone ?? 'No preference'}
                          </Text>
                          <Text size="sm">Locker: {request.preferred_locker ?? 'No preference'}</Text>
                        </Stack>
                      </Group>
                      <Text size="sm" c="dimmed">
                        Request ID: {request.id}
                      </Text>
                      {['pending', 'reserved'].includes(request.status?.toLowerCase() ?? '') && (
                        <Group justify="flex-end" mt="xs">
                          <Button
                            variant="light"
                            color="red"
                            onClick={() => handleCancelRequest(request)}
                            loading={cancelMutation.isPending}
                          >
                            Cancel request
                          </Button>
                        </Group>
                      )}
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          )}
        </Stack>
      </Card>
    </Stack>
  );
};
