import { Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconFileInvoice, IconLock, IconClock } from '@tabler/icons-react';

export const ParentDashboard = () => {
  return (
    <Stack gap="lg">
      <Title order={2}>Parent Overview</Title>
      <Group grow align="flex-start">
        <Card withBorder shadow="xs" radius="md" padding="lg">
          <Group gap="xs">
            <IconLock size={20} />
            <Text fw={600}>Active Lockers</Text>
          </Group>
          <Text c="dimmed">Locker assignments sync once staff confirm payments.</Text>
        </Card>
        <Card withBorder shadow="xs" radius="md" padding="lg">
          <Group gap="xs">
            <IconFileInvoice size={20} />
            <Text fw={600}>Invoices</Text>
          </Group>
          <Text c="dimmed">View pending and paid invoices in upcoming iterations.</Text>
        </Card>
        <Card withBorder shadow="xs" radius="md" padding="lg">
          <Group gap="xs">
            <IconClock size={20} />
            <Text fw={600}>Renewal Timeline</Text>
          </Group>
          <Text c="dimmed">Spring renewals trigger automated reminders.</Text>
        </Card>
      </Group>
    </Stack>
  );
};
