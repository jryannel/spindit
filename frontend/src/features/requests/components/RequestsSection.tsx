import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Group, Select, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { useAuth } from '../../auth/AuthContext';
import { createLockerRequest, listRequests, listZones } from '../api';
import type { LockerRequestInput, LockerRequestRecord, ZoneRecord } from '../api';

interface RequestFormValues extends Omit<LockerRequestInput, 'submitted_at'> {
  submittedDate: Date | null;
}

export const RequestsSection = () => {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [requests, setRequests] = useState<LockerRequestRecord[]>([]);
  const [zones, setZones] = useState<ZoneRecord[]>([]);

  const loadData = useMemo(
    () =>
      async () => {
        if (!userId) return;
        try {
          const [reqs, zoneRecords] = await Promise.all([
            listRequests(userId),
            listZones(),
          ]);
          setRequests(reqs);
          setZones(zoneRecords);
        } catch (error) {
          console.error(error);
          showNotification({
            color: 'red',
            title: 'Load error',
            message: 'Unable to load requests at this time.',
          });
        }
      },
    [userId],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const form = useForm<RequestFormValues>({
    initialValues: {
      student_name: '',
      student_class: '',
      school_year: '2025/26',
      preferred_zone: '',
      preferred_locker: '',
      submittedDate: new Date(),
    },
  });

  const handleSubmit = form.onSubmit(async ({ submittedDate, ...values }) => {
    if (!userId) return;
    try {
      const payload: LockerRequestInput = {
        ...values,
        student_name: values.student_name.trim(),
        student_class: values.student_class.trim(),
        preferred_zone: values.preferred_zone || undefined,
        preferred_locker: values.preferred_locker?.trim() || undefined,
        submitted_at: submittedDate?.toISOString(),
      };

      await createLockerRequest(userId, payload);
      showNotification({ color: 'green', title: 'Request sent', message: 'Locker request submitted.' });
      form.reset();
      form.setValues({
        student_name: '',
        student_class: '',
        school_year: '2025/26',
        preferred_zone: '',
        preferred_locker: '',
        submittedDate: new Date(),
      });
      await loadData();
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Submit error', message: 'Unable to submit request right now.' });
    }
  });

  return (
    <Stack gap="lg">
      <Card withBorder>
        <form onSubmit={handleSubmit}>
          <Stack>
            <Title order={4}>Request a Locker</Title>
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
                data={zones.map((zone) => ({ value: zone.id, label: zone.name }))}
                clearable
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
            <Button type="submit" leftSection={<IconPlus size={16} />} disabled={!userId}>
              Submit Request
            </Button>
          </Stack>
        </form>
      </Card>

      <Card withBorder>
        <Title order={4} mb="sm">
          Request History
        </Title>
        {requests.length === 0 ? (
          <Text c="dimmed">No requests yet. Submit a locker request to see history here.</Text>
        ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>ID</Table.Th>
                  <Table.Th>Student</Table.Th>
                  <Table.Th>Class</Table.Th>
                  <Table.Th>Zone</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Submitted</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {requests.map((request) => (
                  <Table.Tr key={request.id}>
                    <Table.Td>{request.id}</Table.Td>
                    <Table.Td>{request.student_name}</Table.Td>
                    <Table.Td>{request.student_class}</Table.Td>
                    <Table.Td>{request.expand?.preferred_zone?.name ?? request.preferred_zone ?? '—'}</Table.Td>
                    <Table.Td>{request.status}</Table.Td>
                    <Table.Td>{new Date(request.submitted_at ?? request.created).toLocaleDateString()}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
          </Table>
        )}
      </Card>
    </Stack>
  );
};
