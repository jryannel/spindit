import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';

export const ThemeToggle = () => {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const nextColorScheme = computedColorScheme === 'dark' ? 'light' : 'dark';

  return (
    <ActionIcon
      variant="subtle"
      color={computedColorScheme === 'dark' ? 'yellow' : 'blue'}
      aria-label="Toggle theme"
      onClick={() => setColorScheme(nextColorScheme)}
    >
      {computedColorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
    </ActionIcon>
  );
};
