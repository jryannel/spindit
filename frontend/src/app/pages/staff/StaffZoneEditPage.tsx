import { Button, Card, Group, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStaffZoneQuery, useUpdateZoneMutation } from '../../../features/staff/hooks';
import { PageTitle } from '../../components/PageTitle';

export const StaffZoneEditPage = () => {
  const { zoneId } = useParams();
  const navigate = useNavigate();
  const lastAppliedRef = useRef<string | null>(null);
  const { data: zone, isLoading, error } = useStaffZoneQuery(zoneId);
  const updateZoneMutation = useUpdateZoneMutation();

  useEffect(() => {
    if (!zoneId) {
      navigate('/staff/zones', { replace: true });
    }
  }, [navigate, zoneId]);

  useEffect(() => {
    if (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to load the zone.' });
      navigate('/staff/zones', { replace: true });
    }
  }, [error, navigate]);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) => (value.trim().length >= 2 ? null : 'Name must be at least 2 characters'),
    },
  });

  useEffect(() => {
    if (!zone) return;
    const nextValues = {
      name: zone.name,
      description: zone.description ?? '',
    };
    const signature = JSON.stringify(nextValues);
    if (lastAppliedRef.current === signature) {
      return;
    }
    lastAppliedRef.current = signature;
    form.setValues(nextValues);
    form.resetDirty(nextValues);
  }, [form, zone]);

  const handleSubmit = form.onSubmit(async (values) => {
    if (!zoneId) return;
    try {
      await updateZoneMutation.mutateAsync({
        id: zoneId,
        payload: {
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        },
      });
      showNotification({ color: 'green', title: 'Zone updated', message: 'Zone details saved.' });
      navigate(`/staff/zones/${zoneId}`, { replace: true });
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Save failed', message: 'Unable to update zone.' });
    }
  });

  const goBack = () => navigate(-1);

  if (isLoading) {
    return (
      <Stack gap="md">
        <PageTitle title="Edit zone" description="Update zone information." withBack />
        <Text c="dimmed">Loading zone details…</Text>
      </Stack>
    );
  }

  if (!zone) {
    return (
      <Stack gap="md">
        <PageTitle title="Edit zone" description="Update zone information." withBack />
        <Card withBorder shadow="sm">
          <Text c="dimmed">Zone not found.</Text>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <PageTitle
        title="Edit zone"
        description="Update zone information."
        withBack
        actions={<Button variant="default" onClick={goBack}>Cancel</Button>}
      />
      <Card withBorder shadow="sm">
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <TextInput label="Name" required {...form.getInputProps('name')} />
            <Textarea label="Description" minRows={3} {...form.getInputProps('description')} />
            <Group justify="flex-end">
              <Button type="submit" loading={updateZoneMutation.isPending}>
                Save changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
};
