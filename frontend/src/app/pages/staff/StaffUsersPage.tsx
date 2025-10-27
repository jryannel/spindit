import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconEye, IconPencil, IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useCallback, useEffect, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { Link } from 'react-router-dom';
import { useStaffUsersQuery } from '../../../features/staff/hooks';
import type { StaffUserRecord } from '../../../features/staff/api';
import { PageTitle } from '../../components/PageTitle';

const USERS_PER_PAGE = 12;
type RoleFilter = 'all' | 'staff' | 'family';

export const StaffUsersPage = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [search] = useDebouncedValue(searchInput, 400);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useStaffUsersQuery({
    page,
    perPage: USERS_PER_PAGE,
    search,
    role: roleFilter,
  });

  const users = data?.items ?? [];
  const totalItems = data?.totalItems ?? 0;

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  useEffect(() => {
    if (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to fetch users.' });
    }
  }, [error]);

  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const fetching = isLoading || isFetching;

  const roleBadge = useCallback((user: StaffUserRecord) => {
    if (user.is_staff) {
      return (
        <Badge color="blue" variant="light">
          Staff
        </Badge>
      );
    }
    return (
      <Badge color="gray" variant="light">
        Family
      </Badge>
    );
  }, []);

  return (
    <Stack gap="md">
      <PageTitle
        title="Users"
        description="Manage guardian and staff accounts. Create new users or update their permissions."
      >
        <Button component={Link} to="/staff/users/new" leftSection={<IconPlus size={16} />}>
          New user
        </Button>
      </PageTitle>
      <Group gap="sm">
        <TextInput
          placeholder="Search by name, email, or phone"
          value={searchInput}
          onChange={(event) => setSearchInput(event.currentTarget.value)}
          flex={1}
        />
        <Select
          data={[
            { value: 'all', label: 'All roles' },
            { value: 'staff', label: 'Staff only' },
            { value: 'family', label: 'Family/Parents' },
          ]}
          value={roleFilter}
          onChange={(value) => setRoleFilter((value as RoleFilter) ?? 'all')}
          allowDeselect={false}
        />
        <ActionIcon variant="light" onClick={refresh}>
          <IconRefresh size={16} />
        </ActionIcon>
      </Group>
      <Card withBorder shadow="sm" radius="md" padding="0">
        <DataTable
          idAccessor="id"
          records={users}
          columns={[
            { accessor: 'email', title: 'Email' },
            { accessor: 'full_name', title: 'Name', render: (record) => record.full_name || '—' },
            { accessor: 'phone', title: 'Phone', render: (record) => record.phone || '—' },
            { accessor: 'language', title: 'Language', render: (record) => record.language?.toUpperCase() || '—' },
            { accessor: 'role', title: 'Role', render: (record) => roleBadge(record) },
            {
              accessor: 'actions',
              title: 'Actions',
              textAlign: 'right',
              render: (record) => (
                <Group gap="xs" justify="flex-end">
                  <ActionIcon component={Link} to={`/staff/users/${record.id}`} variant="subtle" aria-label="View user">
                    <IconEye size={16} />
                  </ActionIcon>
                  <ActionIcon
                    component={Link}
                    to={`/staff/users/${record.id}/edit`}
                    variant="subtle"
                    aria-label="Edit user"
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    component={Link}
                    to={`/staff/users/${record.id}/delete`}
                    variant="subtle"
                    color="red"
                    aria-label="Delete user"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ),
            },
          ]}
          noRecordsText="No users match the current filters."
          fetching={fetching}
          totalRecords={totalItems}
          recordsPerPage={USERS_PER_PAGE}
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
