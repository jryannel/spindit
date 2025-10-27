import {
  Button,
  Group,
  Loader,
  Select,
  Stack,
  Tabs,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconChevronDown } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { LockerRecord } from '../../requests/api';
import { useZonesQuery } from '../../requests/hooks';
import { useLockerSearchInfiniteQuery } from '../hooks';

export type StaffRequestFormValues = {
  requester_name: string;
  requester_address: string;
  requester_phone: string;
  student_name: string;
  student_class: string;
  school_year: string;
  preferred_zone: string;
  preferred_locker: string;
  status: string;
};

type StaffRequestFormProps = {
  initialValues: StaffRequestFormValues;
  statusOptions: string[];
  submitLabel: string;
  submitting?: boolean;
  onSubmit: (values: StaffRequestFormValues, assignedLockerId: string | null) => Promise<void>;
  onCancel?: () => void;
  allowStatusEdit?: boolean;
  allowLockerAssignment?: boolean;
  initialAssignedLockerId?: string | null;
};

const EMPTY_VALUES: StaffRequestFormValues = {
  requester_name: '',
  requester_address: '',
  requester_phone: '',
  student_name: '',
  student_class: '',
  school_year: '',
  preferred_zone: '',
  preferred_locker: '',
  status: 'pending',
};

const shallowEqual = (a: StaffRequestFormValues, b: StaffRequestFormValues) => {
  return (
    a.requester_name === b.requester_name &&
    a.requester_address === b.requester_address &&
    a.requester_phone === b.requester_phone &&
    a.student_name === b.student_name &&
    a.student_class === b.student_class &&
    a.school_year === b.school_year &&
    a.preferred_zone === b.preferred_zone &&
    a.preferred_locker === b.preferred_locker &&
    a.status === b.status
  );
};

export const StaffRequestForm = ({
  initialValues,
  statusOptions,
  submitLabel,
  submitting = false,
  onSubmit,
  onCancel,
  allowStatusEdit = true,
  allowLockerAssignment = true,
  initialAssignedLockerId = null,
}: StaffRequestFormProps) => {
  const [assignedLockerId, setAssignedLockerId] = useState<string | null>(initialAssignedLockerId);
  const lastInitialValuesRef = useRef<StaffRequestFormValues | null>(null);

  const form = useForm<StaffRequestFormValues>({
    initialValues: initialValues ?? EMPTY_VALUES,
  });

  useEffect(() => {
    const nextValues = initialValues ?? EMPTY_VALUES;
    if (lastInitialValuesRef.current && shallowEqual(lastInitialValuesRef.current, nextValues)) {
      return;
    }
    form.setValues(nextValues);
    form.resetDirty(nextValues);
    lastInitialValuesRef.current = nextValues;
  }, [form, initialValues]);

  useEffect(() => {
    setAssignedLockerId(initialAssignedLockerId ?? null);
  }, [initialAssignedLockerId]);

  const {
    data: zonesData = [],
    isLoading: isZonesLoading,
    isFetching: isZonesFetching,
    error: zonesError,
  } = useZonesQuery();

  useEffect(() => {
    if (zonesError) {
      console.error(zonesError);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to load zones.' });
    }
  }, [zonesError]);

  const [zoneFilter, setZoneFilter] = useState<string>(initialValues.preferred_zone || 'all');

  const {
    data: lockerPages,
    isLoading: isLockerLoading,
    isFetching: isLockerFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error: lockerError,
  } = useLockerSearchInfiniteQuery({
    zone: zoneFilter || 'all',
    enabled: allowLockerAssignment,
  });

  useEffect(() => {
    if (lockerError) {
      console.error(lockerError);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to load lockers.' });
    }
  }, [lockerError]);

  useEffect(() => {
    setZoneFilter(initialValues.preferred_zone || 'all');
  }, [initialValues.preferred_zone]);

  const zonesLoading = isZonesLoading || isZonesFetching;

  const zoneOptions = useMemo(
    () => zonesData.map((zone) => ({ value: zone.id, label: zone.name })),
    [zonesData],
  );

  const lockers = useMemo<LockerRecord[]>(() => {
    if (!lockerPages) {
      return [];
    }
    return lockerPages.pages.flatMap((page) => page.items);
  }, [lockerPages]);

  const lockerOptions = useMemo(
    () =>
      lockers.map((locker) => ({
        value: locker.id,
        label: `#${locker.number} · ${locker.expand?.zone?.name ?? 'No zone'} (${locker.status})`,
        zoneId: locker.zone ?? '',
      })),
    [lockers],
  );

  const filteredLockerOptions = useMemo(() => {
    if (!form.values.preferred_zone) {
      return lockerOptions;
    }
    return lockerOptions.filter((locker) => locker.zoneId === form.values.preferred_zone);
  }, [form.values.preferred_zone, lockerOptions]);

  const lockersLoading = isLockerLoading || isLockerFetching;
  const lockerHasMore = Boolean(hasNextPage);

  const handleZoneChange = useCallback(
    (value: string | null) => {
      const nextZone = value ?? '';
      form.setFieldValue('preferred_zone', nextZone);

      if (!allowLockerAssignment) {
        return;
      }

      if (assignedLockerId) {
        const locker = lockers.find((item) => item.id === assignedLockerId);
        const lockerZone = locker?.zone ?? '';
        if (lockerZone !== nextZone) {
          setAssignedLockerId(null);
        }
      }
      setZoneFilter(nextZone || 'all');
    },
    [allowLockerAssignment, assignedLockerId, form, lockers],
  );

  const handleSubmit = form.onSubmit(async (values) => {
    const normalized: StaffRequestFormValues = {
      requester_name: values.requester_name.trim(),
      requester_address: values.requester_address.trim(),
      requester_phone: values.requester_phone.trim(),
      student_name: values.student_name.trim(),
      student_class: values.student_class.trim(),
      school_year: values.school_year.trim(),
      preferred_zone: values.preferred_zone,
      preferred_locker: values.preferred_locker.trim(),
      status: values.status,
    };
    await onSubmit(normalized, assignedLockerId);
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="sm">
        <Tabs defaultValue="requester" keepMounted={false} variant="outline">
          <Tabs.List>
            <Tabs.Tab value="requester">Requester</Tabs.Tab>
            <Tabs.Tab value="student">Student</Tabs.Tab>
            {allowLockerAssignment && <Tabs.Tab value="locker">Locker</Tabs.Tab>}
          </Tabs.List>

          <Tabs.Panel value="requester">
            <Stack gap="sm" mt="sm">
              <TextInput label="Requester name" required {...form.getInputProps('requester_name')} />
              <Textarea label="Requester address" required {...form.getInputProps('requester_address')} />
              <TextInput label="Requester phone" required {...form.getInputProps('requester_phone')} />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="student">
            <Stack gap="sm" mt="sm">
              <Group grow>
                <TextInput label="Student name" required {...form.getInputProps('student_name')} />
                <TextInput label="Class" required {...form.getInputProps('student_class')} />
                <TextInput label="School year" required {...form.getInputProps('school_year')} />
              </Group>
            </Stack>
          </Tabs.Panel>

          {allowLockerAssignment && (
            <Tabs.Panel value="locker">
              <Stack gap="sm" mt="sm">
                <Select
                  label="Preferred zone"
                  placeholder={zonesLoading ? 'Loading zones…' : 'No preference'}
                  data={[{ value: '', label: 'No preference' }, ...zoneOptions]}
                  value={form.values.preferred_zone}
                  onChange={handleZoneChange}
                  rightSection={zonesLoading ? <Loader size="xs" /> : undefined}
                  searchable
                />
                <TextInput
                  label="Preferred locker number"
                  placeholder="Optional"
                  {...form.getInputProps('preferred_locker')}
                />
                <Select
                  label="Assigned locker"
                  placeholder={lockersLoading ? 'Loading lockers…' : 'Select locker'}
                  data={filteredLockerOptions}
                  value={assignedLockerId}
                  onChange={(value) => setAssignedLockerId(value ?? null)}
                  searchable
                  clearable
                  nothingFoundMessage={lockersLoading ? 'Loading…' : 'No lockers'}
                />
                {lockerHasMore && (
                  <Button
                    variant="light"
                    leftSection={<IconChevronDown size={14} />}
                    onClick={() => fetchNextPage()}
                    loading={isFetchingNextPage}
                  >
                    Load more lockers
                  </Button>
                )}
                {allowStatusEdit && (
                  <Select
                    label="Status"
                    data={statusOptions.map((status) => ({ value: status, label: status }))}
                    value={form.values.status}
                    onChange={(value) => value && form.setFieldValue('status', value)}
                  />
                )}
              </Stack>
            </Tabs.Panel>
          )}
        </Tabs>
        {!allowLockerAssignment && allowStatusEdit && (
          <Select
            label="Status"
            data={statusOptions.map((status) => ({ value: status, label: status }))}
            value={form.values.status}
            onChange={(value) => value && form.setFieldValue('status', value)}
          />
        )}
        <Group justify="flex-end" mt="sm">
          {onCancel && (
            <Button variant="default" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" loading={submitting}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
