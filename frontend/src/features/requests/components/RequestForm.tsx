import { useMemo, useEffect } from 'react';
import { Button, Checkbox, Fieldset, Group, Loader, Select, Stack, TextInput, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { useAuth } from '../../auth';
import type { LockerRequestInput } from '../api';
import { useCreateLockerRequestMutation, useZonesQuery } from '../hooks';
import { useNavigate } from 'react-router-dom';

interface RequestFormValues extends Omit<LockerRequestInput, 'submitted_at'> {
  submittedDate: Date | null;
  rememberProfile: boolean;
}

export const RequestForm = () => {
  const { user, updateProfile } = useAuth();
  const userId = user?.id ?? '';
  const navigate = useNavigate();
  const {
    data: zones = [],
    isLoading: isZonesLoading,
    isFetching: isZonesFetching,
    error: zonesError,
  } = useZonesQuery();
  const createRequestMutation = useCreateLockerRequestMutation();

  useEffect(() => {
    if (zonesError) {
      console.error(zonesError);
      showNotification({
        color: 'red',
        title: 'Load error',
        message: 'Unable to load zones right now.',
      });
    }
  }, [zonesError]);

  const form = useForm<RequestFormValues>({
    initialValues: {
      requester_name: user?.full_name ?? '',
      requester_address: user?.address ?? '',
      requester_phone: user?.phone ?? '',
      student_name: '',
      student_class: '',
      school_year: '2025/26',
      preferred_zone: '',
      preferred_locker: '',
      submittedDate: new Date(),
      rememberProfile: true,
    },
    validate: {
      requester_name: (value) => (value.trim().length >= 2 ? null : 'Please enter your name'),
      requester_address: (value) => (value.trim().length >= 4 ? null : 'Please enter your address'),
      requester_phone: (value) =>
        /^[0-9+()\s-]{7,}$/.test(value.trim()) ? null : 'Use digits, spaces, parentheses, dashes, or leading +',
      student_name: (value) => (value.trim().length >= 2 ? null : 'Enter the student name'),
      student_class: (value) => (value.trim().length >= 1 ? null : 'Enter the student class'),
      school_year: (value) =>
        /^\d{4}\/\d{2}$/.test(value.trim()) ? null : 'Format school year as YYYY/YY (e.g. 2025/26)',
    },
  });

  useEffect(() => {
    if (!user) return;
    const updates: Partial<RequestFormValues> = {};

    if (!form.isDirty('requester_name') && !form.values.requester_name && user.full_name) {
      updates.requester_name = user.full_name;
    }
    if (!form.isDirty('requester_address') && !form.values.requester_address && user.address) {
      updates.requester_address = user.address;
    }
    if (!form.isDirty('requester_phone') && !form.values.requester_phone && user.phone) {
      updates.requester_phone = user.phone;
    }
    if (!form.isDirty('submittedDate') && !form.values.submittedDate) {
      updates.submittedDate = new Date();
    }

    if (Object.keys(updates).length > 0) {
      form.setValues((current) => ({ ...current, ...updates }));
    }
  }, [user, form]);

  const handleSubmit = form.onSubmit(async ({ submittedDate, rememberProfile, ...values }) => {
    if (!userId) return;

    try {
      const payload: LockerRequestInput = {
        ...values,
        requester_name: values.requester_name.trim(),
        requester_address: values.requester_address.trim(),
        requester_phone: values.requester_phone.trim(),
        student_name: values.student_name.trim(),
        student_class: values.student_class.trim(),
        preferred_zone: values.preferred_zone || undefined,
        preferred_locker: values.preferred_locker?.trim() || undefined,
        submitted_at: submittedDate?.toISOString(),
      };

      await createRequestMutation.mutateAsync({ userId, input: payload });

      if (rememberProfile) {
        try {
          await updateProfile({
            full_name: payload.requester_name,
            address: payload.requester_address,
            phone: payload.requester_phone,
          });
        } catch (profileErr) {
          console.error(profileErr);
        }
      }

      showNotification({ color: 'green', title: 'Request sent', message: 'Locker request submitted.' });
      navigate('/app', { replace: true });
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Submit error', message: 'Unable to submit request right now.' });
    }
  });

  const zoneOptions = useMemo(
    () => zones.map((zone) => ({ value: zone.id, label: zone.name })),
    [zones],
  );
  const zonesLoading = isZonesLoading || isZonesFetching;

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Fieldset legend="Contact information">
          <Stack gap="sm">
            <TextInput
              label="Your name"
              placeholder="e.g. Maria Rossi"
              required
              {...form.getInputProps('requester_name')}
            />
            <Textarea
              label="Mailing address"
              minRows={3}
              placeholder="Street, house number, postal code, city"
              required
              {...form.getInputProps('requester_address')}
            />
            <TextInput
              label="Phone"
              placeholder="e.g. +41 44 123 45 67"
              required
              {...form.getInputProps('requester_phone')}
            />
            <Checkbox
              label="Save these details to my profile for next time"
              {...form.getInputProps('rememberProfile', { type: 'checkbox' })}
            />
          </Stack>
        </Fieldset>
        <Fieldset legend="Student details">
          <Stack gap="sm">
            <Group grow>
              <TextInput
                label="Student name"
                placeholder="e.g. Emma Schneider"
                required
                {...form.getInputProps('student_name')}
              />
              <TextInput
                label="Class"
                placeholder="e.g. 7A"
                required
                {...form.getInputProps('student_class')}
              />
              <TextInput
                label="School year"
                placeholder="2025/26"
                required
                {...form.getInputProps('school_year')}
              />
              <Select
                label="Preferred zone"
                placeholder="Optional"
                data={zoneOptions}
                clearable
                rightSection={zonesLoading ? <Loader size="xs" /> : undefined}
                {...form.getInputProps('preferred_zone')}
              />
            </Group>
            <Group grow>
              <TextInput
                label="Preferred locker number"
                placeholder="Optional"
                {...form.getInputProps('preferred_locker')}
              />
              <DateInput label="Submitted" {...form.getInputProps('submittedDate')} required />
            </Group>
          </Stack>
        </Fieldset>
        <Button
          type="submit"
          leftSection={<IconPlus size={16} />}
          disabled={!userId}
          loading={createRequestMutation.isPending}
        >
          Submit Request
        </Button>
      </Stack>
    </form>
  );
};
