import {
  Button,
  Card,
  Group,
  Loader,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStaffLockerQuery, useUpdateLockerMutation } from '../../../features/staff/hooks';
import { useZonesQuery } from '../../../features/requests/hooks';
import { PageTitle } from '../../components/PageTitle';

const lockerStatuses = ['free', 'reserved', 'occupied', 'maintenance'];

export const StaffLockerEditPage = () => {
  const { lockerId } = useParams();
  const navigate = useNavigate();
  const lastAppliedValuesRef = useRef<string | null>(null);
  const { data: locker, isLoading, error } = useStaffLockerQuery(lockerId);
  const updateLockerMutation = useUpdateLockerMutation();
  const {
    data: zones = [],
    isLoading: isZonesLoading,
    isFetching: isZonesFetching,
    error: zonesError,
  } = useZonesQuery();

  useEffect(() => {
    if (!lockerId) {
      navigate('/staff/lockers', { replace: true });
    }
  }, [lockerId, navigate]);

  useEffect(() => {
    if (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to load locker details.' });
      navigate('/staff/lockers', { replace: true });
    }
  }, [error, navigate]);

  useEffect(() => {
    if (zonesError) {
      console.error(zonesError);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to load zones.' });
    }
  }, [zonesError]);

  const form = useForm({
    initialValues: {
      number: 0,
      status: 'free',
      zone: '',
      note: '',
    },
  });

  useEffect(() => {
    if (!locker) return;
    const nextValues = {
      number: locker.number,
      status: locker.status,
      zone: locker.zone ?? '',
      note: locker.note ?? '',
    };
    const signature = JSON.stringify(nextValues);
    if (lastAppliedValuesRef.current === signature) {
      return;
    }
    lastAppliedValuesRef.current = signature;
    form.setValues(nextValues);
    form.resetDirty(nextValues);
  }, [form, locker]);

  const handleSubmit = form.onSubmit(async (values) => {
    if (!lockerId) return;
    try {
      await updateLockerMutation.mutateAsync({
        id: lockerId,
        payload: {
          number: values.number,
          status: values.status,
          zone: values.zone,
          note: values.note || undefined,
        },
      });
      showNotification({ color: 'green', title: 'Locker updated', message: 'Locker details saved.' });
      navigate(`/staff/lockers/${lockerId}`, { replace: true });
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Save failed', message: 'Unable to update locker.' });
    }
  });

  const zoneOptions = useMemo(
    () => zones.map((zone) => ({ value: zone.id, label: zone.name })),
    [zones],
  );

  const goBack = () => navigate(-1);

  if (isLoading) {
    return (
      <Stack gap="md">
        <PageTitle title="Edit locker" description="Update locker status, zone, or notes." withBack />
        <Text c="dimmed">Loading locker details…</Text>
      </Stack>
    );
  }

  if (!locker) {
    return (
      <Stack gap="md">
        <PageTitle title="Edit locker" description="Update locker status, zone, or notes." withBack />
        <Card withBorder shadow="sm">
          <Text c="dimmed">Locker not found.</Text>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      <PageTitle
        title="Edit locker"
        description="Update locker status, zone, or notes."
        withBack
        actions={<Button variant="default" onClick={goBack}>Cancel</Button>}
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
                data={zoneOptions}
                rightSection={isZonesLoading || isZonesFetching ? <Loader size="xs" /> : undefined}
                {...form.getInputProps('zone')}
              />
            </Group>
            <Textarea label="Note" placeholder="Optional notes" minRows={3} {...form.getInputProps('note')} />
            <Group justify="flex-end" mt="sm">
              <Button type="submit" loading={updateLockerMutation.isPending}>
                Save changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
};
