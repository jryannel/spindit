import { Anchor, Card, List, Stack, Text, Title } from '@mantine/core';

export const StaffConsole = () => {
  return (
    <Stack gap="lg">
      <Title order={2}>Staff Console</Title>
      <Card withBorder shadow="xs" radius="md" padding="lg">
        <Stack gap="sm">
          <Text fw={600}>Quick Links</Text>
          <List spacing="xs">
            <List.Item>
              Review locker requests awaiting payment confirmation (UI pending).
            </List.Item>
            <List.Item>Send manual reminders from the email queue.</List.Item>
            <List.Item>
              Update locker zoning maps in PocketBase admin until inline editor ships.
            </List.Item>
          </List>
          <Anchor size="sm" target="_blank" rel="noreferrer" href="http://127.0.0.1:8090/_/">
            Open PocketBase Admin
          </Anchor>
        </Stack>
      </Card>
    </Stack>
  );
};
