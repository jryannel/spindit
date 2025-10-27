import { Button, Paper, Select, Stack, Text, TextInput, Textarea, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useEffect } from 'react';
import { useAuth } from '../../features/auth';

const languageOptions = [
  { value: 'de', label: 'German' },
  { value: 'en', label: 'English' },
];

interface ProfileFormValues {
  full_name: string;
  address: string;
  phone: string;
  language: string;
}

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const form = useForm<ProfileFormValues>({
    initialValues: {
      full_name: user?.full_name ?? '',
      address: user?.address ?? '',
      phone: user?.phone ?? '',
      language: user?.language ?? 'de',
    },
    validate: {
      full_name: (value) => (value.trim().length >= 2 ? null : 'Please enter at least 2 characters'),
      address: (value) => (value.trim().length >= 4 ? null : 'Address must be at least 4 characters'),
      phone: (value) =>
        value.trim() === '' || /^\+?[0-9\s-]{7,}$/.test(value.trim())
          ? null
          : 'Use digits, spaces, dashes, and optional leading +',
      language: (value) => (value ? null : 'Select a language'),
    },
  });

  useEffect(() => {
    if (!user) return;
    const nextValues: ProfileFormValues = {
      full_name: user.full_name ?? '',
      address: user.address ?? '',
      phone: user.phone ?? '',
      language: user.language ?? 'de',
    };
    const hasChanges = Object.entries(nextValues).some(([key, value]) => form.values[key as keyof ProfileFormValues] !== value);
    if (hasChanges) {
      form.setValues(nextValues);
      form.resetDirty(nextValues);
    }
  }, [user, form]);

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await updateProfile({
        full_name: values.full_name.trim(),
        address: values.address.trim(),
        phone: values.phone.trim(),
        language: values.language,
      });
      showNotification({ color: 'green', title: 'Profile updated', message: 'Your contact details have been saved.' });
      form.resetDirty();
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Update failed', message: 'Unable to save your profile right now.' });
    }
  });

  return (
    <Stack align="center">
      <Paper withBorder shadow="sm" radius="md" p="xl" maw={560} w="100%">
        <form onSubmit={handleSubmit}>
          <Stack>
            <Title order={3}>Profile</Title>
            <Text c="dimmed" size="sm">
              Keep your contact information up to date so we can reach you about locker reservations.
            </Text>
            <TextInput label="Full name" required {...form.getInputProps('full_name')} />
            <Textarea
              label="Mailing address"
              minRows={3}
              required
              {...form.getInputProps('address')}
            />
            <TextInput label="Phone" placeholder="Optional" {...form.getInputProps('phone')} />
            <Select label="Preferred language" data={languageOptions} required {...form.getInputProps('language')} />
            <Button type="submit" disabled={!form.isDirty()}>
              Save changes
            </Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
};
