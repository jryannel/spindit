import {
  ActionIcon,
  Button,
  Card,
  Group,
  Stack,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconEye, IconPencil, IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useCallback, useEffect, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { Link } from 'react-router-dom';
import { useStaffZonesQuery } from '../../../features/staff/hooks';
import { PageTitle } from '../../components/PageTitle';

const ZONES_PER_PAGE = 12;

export const StaffZonesPage = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search] = useDebouncedValue(searchInput, 400);
  const { data, isLoading, isFetching, error, refetch } = useStaffZonesQuery({
    page,
    perPage: ZONES_PER_PAGE,
    search,
  });

  const zones = data?.items ?? [];
  const totalItems = data?.totalItems ?? 0;

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to load zones.' });
    }
  }, [error]);

  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <Stack gap="md">
      <PageTitle
        title="Zones"
        description="Organize lockers into manageable areas for staff assignments."
      >
        <Button component={Link} to="/staff/zones/new" leftSection={<IconPlus size={16} />}>
          New zone
        </Button>
      </PageTitle>
      <Group gap="sm">
        <TextInput
          placeholder="Search by name or description"
          value={searchInput}
          onChange={(event) => setSearchInput(event.currentTarget.value)}
          flex={1}
        />
        <ActionIcon variant="light" onClick={refresh}>
          <IconRefresh size={16} />
        </ActionIcon>
      </Group>
      <Card withBorder shadow="sm" radius="md" padding="0">
        <DataTable
          idAccessor="id"
          records={zones}
          columns={[
            { accessor: 'name', title: 'Name' },
            { accessor: 'description', title: 'Description', render: (record) => record.description || '—' },
            {
              accessor: 'actions',
              title: 'Actions',
              textAlign: 'right',
              render: (record) => (
                <Group gap="xs" justify="flex-end">
                  <ActionIcon
                    component={Link}
                    to={`/staff/zones/${record.id}`}
                    variant="subtle"
                    aria-label="View zone"
                  >
                    <IconEye size={16} />
                  </ActionIcon>
                  <ActionIcon
                    component={Link}
                    to={`/staff/zones/${record.id}/edit`}
                    variant="subtle"
                    aria-label="Edit zone"
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    component={Link}
                    to={`/staff/zones/${record.id}/delete`}
                    variant="subtle"
                    color="red"
                    aria-label="Delete zone"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ),
            },
          ]}
          noRecordsText="No zones found."
          fetching={isLoading || isFetching}
          totalRecords={totalItems}
          recordsPerPage={ZONES_PER_PAGE}
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
