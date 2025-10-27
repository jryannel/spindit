import { Stack, Text, Title } from '@mantine/core';
import { RequestsSection } from '../../features/requests/components/RequestsSection';

export const ParentDashboard = () => (
  <Stack gap="lg">
    <div>
      <Title order={2} mb="xs">
        Parent Portal
      </Title>
      <Text c="dimmed" size="sm">
        Review your current lockers and submissions. When you are ready to request a new locker, use the button above the
        table to provide your contact information and student preferences.
      </Text>
    </div>
    <RequestsSection />
  </Stack>
);
