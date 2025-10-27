import {
  ActionIcon,
  Button,
  Card,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconEye, IconPencil, IconPlus, IconRefresh, IconTrash } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { Link } from 'react-router-dom';
import type { LockerRequestRecord } from '../../../features/requests/api';
import {
  useBulkUpdateRequestStatusMutation,
  useDeleteRequestsMutation,
  useStaffRequestsQuery,
  useUpdateRequestStatusMutation,
} from '../../../features/staff/hooks';
import { REQUEST_STATUS_OPTIONS } from '../../../features/staff/constants';
import { PageTitle } from '../../components/PageTitle';

const REQUESTS_PER_PAGE = 12;
const statusOptions = REQUEST_STATUS_OPTIONS;

export const StaffRequestsPage = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search] = useDebouncedValue(searchInput, 400);
  const [selectedRequests, setSelectedRequests] = useState<LockerRequestRecord[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('reserved');

  const selectedIds = useMemo(() => selectedRequests.map((record) => record.id), [selectedRequests]);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useStaffRequestsQuery({
    page,
    perPage: REQUESTS_PER_PAGE,
    search,
    status: statusFilter,
  });

  const updateStatusMutation = useUpdateRequestStatusMutation();
  const bulkUpdateMutation = useBulkUpdateRequestStatusMutation();
  const deleteRequestsMutation = useDeleteRequestsMutation();

  const requests = useMemo(() => data?.items ?? [], [data]);
  const totalItems = data?.totalItems ?? 0;

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    if (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to fetch requests.' });
    }
  }, [error]);

  useEffect(() => {
    setSelectedRequests((prev) => prev.filter((record) => requests.some((req) => req.id === record.id)));
  }, [requests]);

  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleStatusChange = async (request: LockerRequestRecord, nextStatus: string) => {
    if (nextStatus === request.status) return;
    try {
      await updateStatusMutation.mutateAsync({ id: request.id, status: nextStatus });
      showNotification({ color: 'green', title: 'Request updated', message: `Status changed to ${nextStatus}.` });
      refresh();
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Update failed', message: 'Unable to update request status.' });
    }
  };

  const handleBulkStatus = async () => {
    if (!selectedIds.length) return;
    try {
      await bulkUpdateMutation.mutateAsync({ ids: selectedIds, status: bulkStatus });
      showNotification({ color: 'green', title: 'Requests updated', message: `Marked ${selectedIds.length} request(s) as ${bulkStatus}.` });
      setSelectedRequests([]);
      refresh();
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Bulk update failed', message: 'Unable to update selected requests.' });
    }
  };

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;

    modals.openConfirmModal({
      title: 'Delete selected requests?',
      centered: true,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteRequestsMutation.mutateAsync(selectedIds);
          showNotification({ color: 'green', title: 'Requests deleted', message: 'Selected requests have been removed.' });
          setSelectedRequests([]);
          refresh();
        } catch (error) {
          console.error(error);
          showNotification({ color: 'red', title: 'Bulk delete failed', message: 'Unable to delete selected requests.' });
        }
      },
    });
  };

  const hasSelection = selectedIds.length > 0;
  const isBulkProcessing = bulkUpdateMutation.isPending || deleteRequestsMutation.isPending;
  const fetching = isLoading || isFetching || isBulkProcessing;

  return (
    <Stack gap="md">
      <PageTitle
        title="Requests"
        description="Track all locker requests and adjust their status as decisions are made."
      >
        <Button component={Link} to="/staff/requests/new" leftSection={<IconPlus size={16} />}>
          New request
        </Button>
      </PageTitle>
      <Group gap="sm">
        <TextInput
          placeholder="Search by student, requester, or contact"
          value={searchInput}
          onChange={(event) => setSearchInput(event.currentTarget.value)}
          flex={1}
        />
        <Select
          data={[{ value: 'all', label: 'All statuses' }, ...statusOptions.map((status) => ({ value: status, label: status }))]}
          value={statusFilter}
          onChange={(value) => setStatusFilter(value ?? 'all')}
        />
        <ActionIcon variant="light" onClick={refresh}>
          <IconRefresh size={16} />
        </ActionIcon>
      </Group>
      <Group gap="sm">
        <Select
          data={statusOptions.map((status) => ({ value: status, label: `Mark as ${status}` }))}
          value={bulkStatus}
          onChange={(value) => value && setBulkStatus(value)}
          disabled={!hasSelection || isBulkProcessing}
        />
        <Button onClick={handleBulkStatus} disabled={!hasSelection || isBulkProcessing}>
          Apply status
        </Button>
        <Button color="red" variant="light" onClick={handleBulkDelete} disabled={!hasSelection || isBulkProcessing}>
          Delete selected
        </Button>
        {hasSelection && (
          <Text size="sm" c="dimmed">
            {selectedIds.length} selected
          </Text>
        )}
      </Group>
      <Card withBorder shadow="sm" radius="md" padding="0">
        <DataTable
          idAccessor="id"
          records={requests}
          columns={[
            { accessor: 'student_name', title: 'Student' },
            { accessor: 'requester_name', title: 'Requester' },
            {
              accessor: 'submitted_at',
              title: 'Submitted',
              render: (record) => new Date(record.submitted_at).toLocaleString(),
            },
            {
              accessor: 'status',
              title: 'Status',
              render: (record) => (
                <Select
                  data={statusOptions.map((status) => ({ value: status, label: status }))}
                  value={record.status}
                  onChange={(value) => value && void handleStatusChange(record, value)}
                />
              ),
            },
            {
              accessor: 'preferred_zone',
              title: 'Preferred zone',
              render: (record) => record.expand?.preferred_zone?.name ?? '—',
            },
            {
              accessor: 'actions',
              title: 'Actions',
              textAlign: 'right',
              render: (record) => (
                <Group gap="xs" justify="flex-end">
                  <ActionIcon
                    component={Link}
                    to={`/staff/requests/${record.id}`}
                    variant="subtle"
                    aria-label="View details"
                  >
                    <IconEye size={16} />
                  </ActionIcon>
                  <ActionIcon
                    component={Link}
                    to={`/staff/requests/${record.id}/edit`}
                    variant="subtle"
                    aria-label="Edit request"
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                  <ActionIcon
                    component={Link}
                    to={`/staff/requests/${record.id}/delete`}
                    variant="subtle"
                    color="red"
                    aria-label="Delete request"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ),
            },
          ]}
          selectedRecords={selectedRequests}
          onSelectedRecordsChange={setSelectedRequests}
          selectionTrigger="checkbox"
          noRecordsText="No requests match the current filters."
          fetching={fetching}
          totalRecords={totalItems}
          recordsPerPage={REQUESTS_PER_PAGE}
          page={page}
          onPageChange={setPage}
          highlightOnHover
          striped
          loaderSize="sm"
          minHeight={320}
        />
      </Card>
    </Stack>
  );
};
