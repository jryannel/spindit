import { Card, Container, Stack, Text, Title } from '@mantine/core';
import { RequestForm } from '../../features/requests/components/RequestForm';

export const RequestLockerPage = () => (
  <Container size="lg" py="xl">
    <Stack gap="lg">
      <div>
        <Title order={2} mb="xs">
          Request a Locker
        </Title>
        <Text c="dimmed" size="sm">
          Provide your contact details and your student’s preferences. We use this information to match lockers and keep
          you informed about the assignment.
        </Text>
      </div>
      <Card withBorder shadow="sm" radius="md" p="xl">
        <RequestForm />
      </Card>
    </Stack>
  </Container>
);
