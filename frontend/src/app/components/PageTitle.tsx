import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import type { PropsWithChildren, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface PageTitleProps {
  title: string;
  description?: string;
  withBack?: boolean;
  backLabel?: string;
  onBack?: () => void;
  actions?: ReactNode;
}

export const PageTitle = ({
  title,
  description,
  withBack = false,
  backLabel = 'Go back',
  onBack,
  actions,
  children,
}: PropsWithChildren<PageTitleProps>) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return ( 
    <Group justify="space-between" align="center" wrap="nowrap">
      <Group align="center" gap="sm" wrap="nowrap">
        {withBack && (
          <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={handleBack}>
            {backLabel}
          </Button>
        )}
        <Stack gap={4} justify="center">
          <Title order={2}>{title}</Title>
          {description && (
            <Text c="dimmed" size="sm">
              {description}
            </Text>
          )}
        </Stack>
      </Group>
      {actions ?? children}
    </Group>
  );
};
