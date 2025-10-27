import {
  Button,
  Card,
  Checkbox,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStaffUserQuery, useUpdateUserAccountMutation } from '../../../features/staff/hooks';
import { PageTitle } from '../../components/PageTitle';

const languageOptions = [
  { value: 'de', label: 'German' },
  { value: 'en', label: 'English' },
];

export const StaffUserEditPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const lastAppliedValuesRef = useRef<string | null>(null);
  const { data: user, isLoading, error } = useStaffUserQuery(userId);
  const updateUserMutation = useUpdateUserAccountMutation();

  useEffect(() => {
    if (!userId) {
      navigate('/staff/users', { replace: true });
    }
  }, [navigate, userId]);

  useEffect(() => {
    if (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to load the user.' });
      navigate('/staff/users', { replace: true });
    }
  }, [error, navigate]);

  const form = useForm({
    initialValues: {
      full_name: '',
      phone: '',
      address: '',
      language: 'de',
      is_staff: false,
    },
  });

  useEffect(() => {
    if (!user) return;
    const nextValues = {
      full_name: user.full_name ?? '',
      phone: user.phone ?? '',
      address: user.address ?? '',
      language: user.language ?? 'de',
      is_staff: Boolean(user.is_staff),
    };
    const signature = JSON.stringify(nextValues);
    if (lastAppliedValuesRef.current === signature) {
      return;
    }
    lastAppliedValuesRef.current = signature;
    form.setValues(nextValues);
    form.resetDirty(nextValues);
  }, [form, user]);

  const handleSubmit = form.onSubmit(async (values) => {
    if (!userId) return;
    try {
      await updateUserMutation.mutateAsync({ id: userId, payload: values });
      showNotification({ color: 'green', title: 'User updated', message: 'User details saved.' });
      navigate(`/staff/users/${userId}`, { replace: true });
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Update failed', message: 'Unable to update user.' });
    }
  });

  const goBack = () => navigate(-1);

  if (isLoading) {
    return (
      <Stack gap="md">
        <PageTitle title="Edit user" description="Update profile information and permissions." withBack />
        <Text c="dimmed">Loading user details…</Text>
      </Stack>
    );
  }

  if (!user) {
    return (
      <Stack gap="md">
        <PageTitle title="Edit user" description="Update profile information and permissions." withBack />
        <Card withBorder shadow="sm">
          <Text c="dimmed">User not found.</Text>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <PageTitle
        title="Edit user"
        description="Update profile information and permissions."
        withBack
        actions={<Button variant="default" onClick={goBack}>Cancel</Button>}
      />
      <Card withBorder shadow="sm">
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput label="Email" value={user.email} readOnly />
            <TextInput label="Full name" placeholder="Optional" {...form.getInputProps('full_name')} />
            <Group grow>
              <TextInput label="Phone" placeholder="Optional" {...form.getInputProps('phone')} />
              <Select label="Language" data={languageOptions} {...form.getInputProps('language')} />
            </Group>
            <TextInput label="Address" placeholder="Optional" {...form.getInputProps('address')} />
            <Checkbox label="Staff member" {...form.getInputProps('is_staff', { type: 'checkbox' })} />
            <Group justify="flex-end" mt="sm">
              <Button type="submit" loading={updateUserMutation.isPending}>
                Save changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
};
