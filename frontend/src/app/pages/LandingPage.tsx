import { Button, Container, Group, List, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { appConfig } from '../../lib/config';

export const LandingPage = () => {
  return (
    <Container size="lg" py="6rem">
      <Stack gap="xl">
        <Stack gap="md" align="center">
          <Title order={1} ta="center">
            Manage school locker access with ease.
          </Title>
          <Text c="dimmed" size="lg" ta="center">
            Spindit streamlines student locker reservations for families and school staff. Request, review, and assign
            lockers in one secure portal.
          </Text>
          <Group gap="md" justify="center">
            <Button component={Link} to="/signup" size="md">
              Create an account
            </Button>
            <Button component={Link} to="/login" variant="light" size="md">
              Sign in
            </Button>
            {appConfig.developerMode && (
              <Button component={Link} to="/dev" variant="outline" size="md">
                Developer toolkit
              </Button>
            )}
          </Group>
        </Stack>
        <Stack gap="md">
          <Title order={3}>Why Spindit?</Title>
          <List spacing="sm" size="md" c="dimmed">
            <List.Item>Parents submit locker requests securely without paper forms.</List.Item>
            <List.Item>Staff monitor demand, reserve lockers, and finalize assignments quickly.</List.Item>
            <List.Item>Automatic status tracking keeps everyone aligned throughout the school year.</List.Item>
          </List>
        </Stack>
      </Stack>
    </Container>
  );
};
