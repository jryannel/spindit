import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconEye, IconPencil, IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { Link } from 'react-router-dom';
import type { LockerRecord } from '../../../features/requests/api';
import { useStaffLockersQuery } from '../../../features/staff/hooks';
import { useZonesQuery } from '../../../features/requests/hooks';
import { PageTitle } from '../../components/PageTitle';

const LOCKERS_PER_PAGE = 15;
const lockerStatuses = ['free', 'reserved', 'occupied', 'maintenance'];

export const StaffLockersPage = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [search] = useDebouncedValue(searchInput, 400);
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useStaffLockersQuery({
    page,
    perPage: LOCKERS_PER_PAGE,
    search,
    status: statusFilter,
    zone: zoneFilter,
  });
  const {
    data: zonesData,
    isLoading: isZonesLoading,
    isFetching: isZonesFetching,
    error: zonesError,
  } = useZonesQuery();

  const lockers = data?.items ?? [];
  const totalItems = data?.totalItems ?? 0;

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, zoneFilter]);

  useEffect(() => {
    if (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to fetch lockers.' });
    }
  }, [error]);

  useEffect(() => {
    if (zonesError) {
      console.error(zonesError);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to fetch zones.' });
    }
  }, [zonesError]);

  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const zoneOptions = useMemo(
    () => (zonesData ?? []).map((zone) => ({ value: zone.id, label: zone.name })),
    [zonesData],
  );

  const statusBadge = useCallback((locker: LockerRecord) => {
    switch (locker.status) {
      case 'free':
        return <Badge color="green">Free</Badge>;
      case 'reserved':
        return <Badge color="yellow">Reserved</Badge>;
      case 'occupied':
        return <Badge color="blue">Assigned</Badge>;
      case 'maintenance':
        return <Badge color="red">Maintenance</Badge>;
      default:
        return <Badge color="gray">{locker.status}</Badge>;
    }
  }, []);

  return (
    <Stack gap="md">
      <PageTitle
        title="Lockers"
        description="Maintain the locker inventory, track status, and assign lockers to zones."
      >
        <Button component={Link} to="/staff/lockers/new" leftSection={<IconPlus size={16} />}>
          Add locker
        </Button>
      </PageTitle>
      <Group gap="sm">
        <TextInput
          placeholder="Find by locker number or note"
          value={searchInput}
          onChange={(event) => setSearchInput(event.currentTarget.value)}
          flex={1}
        />
        <Select
          data={[{ value: 'all', label: 'All statuses' }, ...lockerStatuses.map((status) => ({ value: status, label: status }))]}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value ?? 'all')}
        />
        <Select
          placeholder="All zones"
          data={[{ value: 'all', label: 'All zones' }, ...zoneOptions]}
          value={zoneFilter}
          onChange={(value) => setZoneFilter(value ?? 'all')}
          rightSection={isZonesLoading || isZonesFetching ? <Loader size="xs" /> : undefined}
        />
        <ActionIcon variant="light" onClick={refresh}>
          <IconRefresh size={16} />
        </ActionIcon>
      </Group>
      <Card withBorder shadow="sm" radius="md" padding="0">
        <DataTable
          idAccessor="id"
          records={lockers}
          columns={[
            { accessor: 'number', title: '#', render: (record) => `#${record.number}` },
            { accessor: 'status', title: 'Status', render: (record) => statusBadge(record) },
            { accessor: 'zone', title: 'Zone', render: (record) => record.expand?.zone?.name ?? '—' },
            { accessor: 'note', title: 'Note', render: (record) => record.note || '—' },
            {
              accessor: 'actions',
              title: 'Actions',
              textAlign: 'right',
              render: (record) => (
                <Group gap="xs" justify="flex-end">
                  <ActionIcon
                    component={Link}
                    to={`/staff/lockers/${record.id}`}
                    variant="subtle"
                    aria-label="View locker"
                  >
                    <IconEye size={16} />
                  </ActionIcon>
                  <ActionIcon
                    component={Link}
                    to={`/staff/lockers/${record.id}/edit`}
                    variant="subtle"
                    aria-label="Edit locker"
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    component={Link}
                    to={`/staff/lockers/${record.id}/delete`}
                    variant="subtle"
                    color="red"
                    aria-label="Delete locker"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ),
            },
          ]}
          noRecordsText="No lockers match the current filters."
          fetching={isLoading || isFetching}
          totalRecords={totalItems}
          recordsPerPage={LOCKERS_PER_PAGE}
          page={page}
          onPageChange={setPage}
          highlightOnHover
          striped
          minHeight={320}
        />
      </Card>
    </Stack>
  );
};
