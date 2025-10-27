import { Card, Grid, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { useEffect } from 'react';
import { showNotification } from '@mantine/notifications';
import { useRecentRequestsQuery, useStaffMetricsQuery } from '../../../features/staff/hooks';
import type { LockerRequestRecord } from '../../../features/requests/api';

interface MetricCardProps {
  label: string;
  value: number;
  hint?: string;
}

const MetricCard = ({ label, value, hint }: MetricCardProps) => (
  <Card withBorder shadow="sm" radius="md" padding="lg">
    <Stack gap="xs">
      <Text c="dimmed" size="sm" tt="uppercase">
        {label}
      </Text>
      <Title order={2}>{value}</Title>
      {hint && (
        <Text c="dimmed" size="sm">
          {hint}
        </Text>
      )}
    </Stack>
  </Card>
);

const RequestRow = ({ request }: { request: LockerRequestRecord }) => (
  <Group justify="space-between">
    <Stack gap={2}>
      <Text fw={500}>{request.student_name}</Text>
      <Text size="sm" c="dimmed">
        Requested by {request.requester_name}
      </Text>
    </Stack>
    <Stack gap={2} align="flex-end">
      <Text size="sm" c="dimmed">
        {new Date(request.submitted_at ?? request.created).toLocaleString()}
      </Text>
      <Text size="sm">{request.status}</Text>
    </Stack>
  </Group>
);

export const StaffDashboardPage = () => {
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useStaffMetricsQuery();
  const {
    data: recentRequests = [],
    isLoading: recentLoading,
    error: recentError,
  } = useRecentRequestsQuery(5);

  useEffect(() => {
    if (metricsError) {
      console.error(metricsError);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to load staff metrics.' });
    }
  }, [metricsError]);

  useEffect(() => {
    if (recentError) {
      console.error(recentError);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to load recent requests.' });
    }
  }, [recentError]);

  if (metricsLoading && !metrics) {
    return (
      <Group justify="center">
        <Loader />
      </Group>
    );
  }

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={2}>Staff Dashboard</Title>
        <Text c="dimmed">
          Overview of current activity across the locker program. Use the navigation above for detailed management.
        </Text>
      </Stack>
      {metrics && (
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <MetricCard label="Total users" value={metrics.totalUsers} hint={`${metrics.newUsersThisWeek} signed up last 7 days`} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <MetricCard label="Locker requests" value={metrics.totalRequests} hint={`${metrics.pendingRequests} pending`} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <MetricCard label="Lockers" value={metrics.totalLockers} hint={`${metrics.freeLockers} marked free`} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, lg: 3 }}>
            <MetricCard label="Zones" value={metrics.totalZones} />
          </Grid.Col>
        </Grid>
      )}
      <Card withBorder shadow="sm" radius="md" padding="lg">
        <Stack gap="md">
          <Title order={4}>Latest requests</Title>
          {recentLoading ? (
            <Loader size="sm" />
          ) : recentRequests.length === 0 ? (
            <Text size="sm" c="dimmed">
              No requests submitted yet.
            </Text>
          ) : (
            <Stack gap="md">
              {recentRequests.map((request) => (
                <RequestRow key={request.id} request={request} />
              ))}
            </Stack>
          )}
        </Stack>
      </Card>
    </Stack>
  );
};
