import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Group, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconUserPlus } from '@tabler/icons-react';
import { useAuth } from '../../auth/AuthContext';
import { createChild, listChildren } from '../api';
import type { ChildInput, ChildRecord } from '../api';

export const ChildrenSection = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const parentId = user?.id ?? '';

  const fetchChildren = useMemo(
    () =>
      async () => {
        if (!parentId) return;
        setLoading(true);
        try {
          const data = await listChildren(parentId);
          setChildren(data);
        } catch (error) {
          console.error(error);
          showNotification({ color: 'red', title: 'Load error', message: 'Unable to load student profiles.' });
        } finally {
          setLoading(false);
        }
      },
    [parentId],
  );

  useEffect(() => {
    void fetchChildren();
  }, [fetchChildren]);

  const form = useForm<ChildInput>({ initialValues: { full_name: '', class: '' } });

  const handleSubmit = form.onSubmit(async (values) => {
    if (!parentId) return;
    try {
      const created = await createChild(parentId, values);
      setChildren((prev) => [...prev, created].sort((a, b) => a.full_name.localeCompare(b.full_name)));
      form.reset();
      showNotification({ color: 'green', title: 'Child added', message: `${values.full_name} saved successfully.` });
    } catch (error) {
      console.error(error);
      showNotification({ color: 'red', title: 'Save error', message: 'Unable to add child right now.' });
    }
  });

  return (
    <Stack gap="lg">
      <Card withBorder>
        <form onSubmit={handleSubmit}>
          <Stack>
            <Title order={4}>Add Student</Title>
            <Group grow>
              <TextInput label="Full name" required {...form.getInputProps('full_name')} />
              <TextInput label="Class" placeholder="7A" required {...form.getInputProps('class')} />
            </Group>
            <Button type="submit" leftSection={<IconUserPlus size={16} />} disabled={!parentId}>
              Save Student
            </Button>
          </Stack>
        </form>
      </Card>

      <Card withBorder>
        <Title order={4} mb="sm">
          Your Students
        </Title>
        {children.length === 0 ? (
          <Text c="dimmed">Add your children to start the locker request process.</Text>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Class</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {children.map((child) => (
                <Table.Tr key={child.id}>
                  <Table.Td>{child.full_name}</Table.Td>
                  <Table.Td>{child.class}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
      {loading && <Text c="dimmed">Refreshing student list…</Text>}
    </Stack>
  );
};
