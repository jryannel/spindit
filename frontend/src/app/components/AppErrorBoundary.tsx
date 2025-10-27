import { Alert, Button, Card, Container, CopyButton, Group, Stack, Text, Title } from '@mantine/core';
import React from 'react';

interface ErrorBoundaryState {
  error: Error | null;
  info: React.ErrorInfo | null;
}

interface AppErrorBoundaryProps {
  children: React.ReactNode;
  currentPath?: string;
}

const formatAiSummary = (error: Error | null, info: React.ErrorInfo | null, currentPath?: string): string => {
  const message = error?.message ?? 'unknown error';
  const locationLine = info?.componentStack
    ?.split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .at(0) ?? 'location unavailable';
  const route = currentPath ?? window.location?.pathname ?? 'route unavailable';
  return `error: ${message} | component: ${locationLine} | route: ${route}`;
};

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, info: null };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ error, info });
    console.error('App crashed:', error, info);
  }

  override render() {
    const { error, info } = this.state;
    if (!error) {
      return this.props.children;
    }

    const { currentPath } = this.props;
    const aiSummary = formatAiSummary(error, info, currentPath);
    const routeDisplay = currentPath ?? window.location?.pathname ?? 'Unknown';

    return (
      <Container size="sm" py="xl">
        <Card withBorder shadow="md" radius="md" padding="xl">
          <Stack gap="md">
            <Title order={2}>Something went wrong</Title>
            <Alert color="red" title="What happened?" withCloseButton={false}>
              {error.message || 'An unexpected error occurred. Please reload the page or share the summary below.'}
            </Alert>
            <Stack gap={4}>
              <Text fw={500}>Route</Text>
              <Card withBorder radius="sm" padding="sm" bg="gray.1">
                <Text size="sm" ff="monospace">
                  {routeDisplay}
                </Text>
              </Card>
            </Stack>
            <Stack gap={4}>
              <Text fw={500}>Summary for support</Text>
              <Card withBorder radius="sm" padding="sm" bg="gray.1">
                <Text size="sm" ff="monospace">
                  {aiSummary}
                </Text>
              </Card>
              <Group justify="flex-end">
                <CopyButton value={aiSummary}>
                  {({ copy, copied }) => (
                    <Button size="xs" variant={copied ? 'light' : 'filled'} onClick={copy}>
                      {copied ? 'Copied!' : 'Copy for AI helper'}
                    </Button>
                  )}
                </CopyButton>
              </Group>
            </Stack>
            <Text size="sm" c="dimmed">
              Tip: paste the copied summary into your coding agent to get immediate guidance.
            </Text>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }
}
