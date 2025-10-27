import { Card, Loader, Select, Stack } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateRequestMutation, useStaffUsersQuery, useUpsertAssignmentMutation } from '../../../features/staff/hooks';
import { StaffRequestForm, type StaffRequestFormValues } from '../../../features/staff/components/StaffRequestForm';
import { REQUEST_STATUS_OPTIONS } from '../../../features/staff/constants';
import { PageTitle } from '../../components/PageTitle';

const DEFAULT_VALUES: StaffRequestFormValues = {
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

export const StaffRequestCreatePage = () => {
  const navigate = useNavigate();
  const [userSearch, setUserSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(userSearch, 300);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const createRequestMutation = useCreateRequestMutation();
  const upsertAssignmentMutation = useUpsertAssignmentMutation();
  const {
    data: userResult,
    isLoading: isUsersLoading,
    isFetching: isUsersFetching,
    error: usersError,
  } = useStaffUsersQuery({
    page: 1,
    perPage: 20,
    search: debouncedSearch,
    role: 'all',
  });

  useEffect(() => {
    if (usersError) {
      console.error(usersError);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to load users.' });
    }
  }, [usersError]);

  const handleSubmit = async (values: StaffRequestFormValues, lockerId: string | null) => {
    if (!selectedUserId) {
      showNotification({ color: 'red', title: 'Missing user', message: 'Select a user before creating a request.' });
      return;
    }
    try {
      const record = await createRequestMutation.mutateAsync({
        user: selectedUserId,
        requester_name: values.requester_name,
        requester_address: values.requester_address,
        requester_phone: values.requester_phone,
        student_name: values.student_name,
        student_class: values.student_class,
        school_year: values.school_year,
        preferred_zone: values.preferred_zone || null,
        preferred_locker: values.preferred_locker || null,
        status: values.status,
      });

      if (lockerId) {
        await upsertAssignmentMutation.mutateAsync({ requestId: record.id, lockerId, userId: selectedUserId });
      }

      showNotification({ color: 'green', title: 'Request created', message: 'New request successfully created.' });
      navigate(`/staff/requests/${record.id}`, { replace: true });
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Create failed', message: 'Unable to create the request.' });
    }
  };

  const options = useMemo(
    () =>
      (userResult?.items ?? []).map((user) => ({
        value: user.id,
        label: `${user.full_name ?? user.email ?? user.id} (${user.email ?? 'no email'})`,
      })),
    [userResult?.items],
  );

  const usersLoading = isUsersLoading || isUsersFetching;

  const userSelectRightSection = useMemo(() => {
    return usersLoading ? <Loader size="xs" /> : undefined;
  }, [usersLoading]);

  const isSaving = createRequestMutation.isPending || upsertAssignmentMutation.isPending;

  return (
    <Stack gap="md">
      <PageTitle
        title="New request"
        description="Create a locker request on behalf of a family."
        withBack
      />
      <Card withBorder shadow="sm">
        <Stack gap="md">
          <Select
            label="User"
            placeholder="Search by email or name"
            data={options}
            value={selectedUserId}
            onChange={(value) => setSelectedUserId(value)}
            searchable
            searchValue={userSearch}
            onSearchChange={setUserSearch}
            rightSection={userSelectRightSection}
            nothingFoundMessage={usersLoading ? 'Loading…' : 'No users found'}
            required
          />
          <StaffRequestForm
            initialValues={DEFAULT_VALUES}
            statusOptions={[...REQUEST_STATUS_OPTIONS]}
            submitLabel="Create request"
            submitting={isSaving}
            onSubmit={handleSubmit}
            allowStatusEdit
            allowLockerAssignment
          />
        </Stack>
      </Card>
    </Stack>
  );
};
