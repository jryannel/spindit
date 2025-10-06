import { Stack, Text, Title } from '@mantine/core';
import { RequestsSection } from '../../features/requests/components/RequestsSection';

export const ParentDashboard = () => (
  <Stack gap="lg">
    <div>
      <Title order={2} mb="xs">
        Parent Portal
      </Title>
      <Text c="dimmed" size="sm">
        Submit locker requests for each student by providing their name and class. We store only the details required to
        process the request.
      </Text>
    </div>
    <RequestsSection />
  </Stack>
);
