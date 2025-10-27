import { Button, Card, Group, Stack, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useCreateZoneMutation } from '../../../features/staff/hooks';
import { PageTitle } from '../../components/PageTitle';

export const StaffZoneCreatePage = () => {
  const navigate = useNavigate();
  const createZoneMutation = useCreateZoneMutation();

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) => (value.trim().length >= 2 ? null : 'Name must be at least 2 characters'),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const record = await createZoneMutation.mutateAsync({
        name: values.name.trim(),
        description: values.description.trim() || undefined,
      });
      showNotification({ color: 'green', title: 'Zone created', message: 'Zone added successfully.' });
      navigate(`/staff/zones/${record.id}`, { replace: true });
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Create failed', message: 'Unable to create zone.' });
    }
  });

  return (
    <Stack gap="md">
      <PageTitle
        title="New zone"
        description="Define a zone to group lockers."
        withBack
      />
      <Card withBorder shadow="sm">
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput label="Name" required {...form.getInputProps('name')} />
            <Textarea label="Description" minRows={3} {...form.getInputProps('description')} />
            <Group justify="flex-end">
              <Button type="submit" loading={createZoneMutation.isPending}>
                Create zone
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
};
