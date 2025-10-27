import {
  Button,
  Card,
  Group,
  Loader,
  NumberInput,
  Select,
  Stack,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useZonesQuery } from '../../../features/requests/hooks';
import { useCreateLockerMutation } from '../../../features/staff/hooks';
import { PageTitle } from '../../components/PageTitle';

const lockerStatuses = ['free', 'reserved', 'occupied', 'maintenance'];

export const StaffLockerCreatePage = () => {
  const navigate = useNavigate();
  const {
    data: zones = [],
    isLoading: isZonesLoading,
    isFetching: isZonesFetching,
    error: zonesError,
  } = useZonesQuery();
  const createLockerMutation = useCreateLockerMutation();

  useEffect(() => {
    if (zonesError) {
      console.error(zonesError);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to fetch zones.' });
    }
  }, [zonesError]);

  const form = useForm({
    initialValues: {
      number: 0,
      status: 'free',
      zone: '',
      note: '',
    },
    validate: {
      number: (value) => (value > 0 ? null : 'Locker number must be positive'),
      zone: (value) => (value ? null : 'Select a zone'),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const record = await createLockerMutation.mutateAsync({
        number: values.number,
        status: values.status,
        zone: values.zone,
        note: values.note || undefined,
      });
      showNotification({ color: 'green', title: 'Locker created', message: 'Locker added successfully.' });
      navigate(`/staff/lockers/${record.id}`, { replace: true });
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Save failed', message: 'Unable to create locker.' });
    }
  });

  const zoneOptions = useMemo(
    () => zones.map((zone) => ({ value: zone.id, label: zone.name })),
    [zones],
  );

  return (
    <Stack gap="md">
      <PageTitle
        title="Add locker"
        description="Create a new locker and assign it to a zone."
        withBack
      />
      <Card withBorder shadow="sm">
        <form onSubmit={handleSubmit}>
          <Stack gap="sm">
            <NumberInput label="Locker number" min={1} {...form.getInputProps('number')} />
            <Group grow>
              <Select
                label="Status"
                data={lockerStatuses.map((status) => ({ value: status, label: status }))}
                {...form.getInputProps('status')}
              />
              <Select
                label="Zone"
                placeholder="Select zone"
                data={zoneOptions}
                {...form.getInputProps('zone')}
                rightSection={isZonesLoading || isZonesFetching ? <Loader size="xs" /> : undefined}
              />
            </Group>
            <Textarea label="Note" placeholder="Optional notes" minRows={3} {...form.getInputProps('note')} />
            <Group justify="flex-end" mt="sm">
              <Button type="submit" loading={createLockerMutation.isPending}>
                Create locker
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
};
