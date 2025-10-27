import { Button, Card, Loader, Stack, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { LockerRequestRecord } from '../../../features/requests/api';
import {
  useStaffAssignmentQuery,
  useStaffRequestQuery,
  useUpdateRequestMutation,
  useUpsertAssignmentMutation,
} from '../../../features/staff/hooks';
import { StaffRequestForm, type StaffRequestFormValues } from '../../../features/staff/components/StaffRequestForm';
import { REQUEST_STATUS_OPTIONS } from '../../../features/staff/constants';
import { PageTitle } from '../../components/PageTitle';

const mapRequestToValues = (request: LockerRequestRecord | null): StaffRequestFormValues => ({
  requester_name: request?.requester_name ?? '',
  requester_address: request?.requester_address ?? '',
  requester_phone: request?.requester_phone ?? '',
  student_name: request?.student_name ?? '',
  student_class: request?.student_class ?? '',
  school_year: request?.school_year ?? '',
  preferred_zone: request?.preferred_zone ?? '',
  preferred_locker: request?.preferred_locker ?? '',
  status: request?.status ?? 'pending',
});

export const StaffRequestEditPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [assignedLockerId, setAssignedLockerId] = useState<string | null>(null);
  const { data: requestData, isLoading: isRequestLoading, error: requestError } = useStaffRequestQuery(requestId);
  const {
    data: assignmentData,
    isLoading: isAssignmentLoading,
    error: assignmentError,
  } = useStaffAssignmentQuery(requestId);
  const updateRequestMutation = useUpdateRequestMutation();
  const upsertAssignmentMutation = useUpsertAssignmentMutation();

  const isSaving = updateRequestMutation.isPending || upsertAssignmentMutation.isPending;
  const isLoading = isRequestLoading || isAssignmentLoading;
  const request = requestData ?? null;

  useEffect(() => {
    if (!requestId) {
      navigate('/staff/requests', { replace: true });
    }
  }, [navigate, requestId]);

  useEffect(() => {
    if (requestError) {
      console.error(requestError);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to load the request.' });
      navigate('/staff/requests', { replace: true });
    }
  }, [navigate, requestError]);

  useEffect(() => {
    if (assignmentError) {
      console.error(assignmentError);
      showNotification({ color: 'red', title: 'Load failed', message: 'Unable to load locker assignment.' });
    }
  }, [assignmentError]);

  useEffect(() => {
    if (assignmentData !== undefined) {
      setAssignedLockerId(assignmentData?.locker ?? null);
    }
  }, [assignmentData]);

  const initialValues = useMemo(() => mapRequestToValues(request), [request]);

  const handleSubmit = async (values: StaffRequestFormValues, lockerId: string | null) => {
    if (!requestId) return;
    try {
      await updateRequestMutation.mutateAsync({
        id: requestId,
        payload: {
        requester_name: values.requester_name,
        requester_address: values.requester_address,
        requester_phone: values.requester_phone,
        student_name: values.student_name,
        student_class: values.student_class,
        school_year: values.school_year,
        preferred_zone: values.preferred_zone || null,
        preferred_locker: values.preferred_locker || null,
        status: values.status,
        },
      });
      await upsertAssignmentMutation.mutateAsync({
        requestId,
        lockerId,
        userId: request?.user,
      });
      showNotification({ color: 'green', title: 'Request updated', message: 'Changes have been saved.' });
      navigate(`/staff/requests/${requestId}`, { replace: true });
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Save failed', message: 'Unable to update the request.' });
    }
  };

  const goBack = () => navigate(-1);

  const header = (
    <PageTitle
      title="Edit request"
      description="Update the request details and assignment."
      withBack
      actions={
        request ? (
          <Button variant="default" onClick={goBack}>
            Cancel
          </Button>
        ) : undefined
      }
    />
  );

  if (isLoading) {
    return (
      <Stack gap="md">
        {header}
        <Stack justify="center" align="center" mt="xl">
          <Loader />
        </Stack>
      </Stack>
    );
  }

  if (!request) {
    return (
      <Stack gap="md">
        {header}
        <Card withBorder shadow="sm">
          <Text c="dimmed">Request not found.</Text>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {header}
      <Card withBorder shadow="sm">
        <StaffRequestForm
          initialValues={initialValues}
          statusOptions={[...REQUEST_STATUS_OPTIONS]}
          submitLabel="Save changes"
          submitting={isSaving}
          onSubmit={handleSubmit}
          onCancel={goBack}
          initialAssignedLockerId={assignedLockerId}
        />
      </Card>
    </Stack>
  );
};
