import {
  Button,
  Card,
  Checkbox,
  Group,
  PasswordInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useCreateUserAccountMutation } from '../../../features/staff/hooks';
import { PageTitle } from '../../components/PageTitle';

const languageOptions = [
  { value: 'de', label: 'German' },
  { value: 'en', label: 'English' },
];

export const StaffUserCreatePage = () => {
  const navigate = useNavigate();
  const createUserMutation = useCreateUserAccountMutation();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      full_name: '',
      phone: '',
      address: '',
      language: 'de',
      is_staff: false,
    },
    validate: {
      email: (value) => (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 8 ? null : 'Minimum 8 characters'),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const record = await createUserMutation.mutateAsync(values);
      showNotification({ color: 'green', title: 'User created', message: 'New user account created successfully.' });
      navigate(`/staff/users/${record.id}`, { replace: true });
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Create failed', message: 'Unable to create user.' });
    }
  });

  return (
    <Stack gap="md">
      <PageTitle
        title="New user"
        description="Create a staff or guardian account manually."
        withBack
      />
      <Card withBorder shadow="sm">
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput label="Email" placeholder="Email address" required {...form.getInputProps('email')} />
            <PasswordInput label="Password" placeholder="Minimum 8 characters" required {...form.getInputProps('password')} />
            <TextInput label="Full name" placeholder="Optional" {...form.getInputProps('full_name')} />
            <Group grow>
              <TextInput label="Phone" placeholder="Optional" {...form.getInputProps('phone')} />
              <Select label="Language" data={languageOptions} {...form.getInputProps('language')} />
            </Group>
            <TextInput label="Address" placeholder="Optional" {...form.getInputProps('address')} />
            <Checkbox label="Staff member" {...form.getInputProps('is_staff', { type: 'checkbox' })} />
            <Group justify="flex-end" mt="sm">
              <Button type="submit" loading={createUserMutation.isPending}>
                Create user
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
};
