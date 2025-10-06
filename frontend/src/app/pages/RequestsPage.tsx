import { Card, Table, Title } from '@mantine/core';

const mockData = [
  { id: 'REQ-1001', student: 'Emma S.', zone: 'A', status: 'reserved' },
  { id: 'REQ-1002', student: 'Noah L.', zone: 'B', status: 'pending' },
];

export const RequestsPage = () => {
  return (
    <Card withBorder shadow="xs" radius="md" padding="lg">
      <Title order={3} mb="md">
        Recent Requests (sample data)
      </Title>
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Request ID</Table.Th>
            <Table.Th>Student</Table.Th>
            <Table.Th>Preferred Zone</Table.Th>
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {mockData.map((row) => (
            <Table.Tr key={row.id}>
              <Table.Td>{row.id}</Table.Td>
              <Table.Td>{row.student}</Table.Td>
              <Table.Td>{row.zone}</Table.Td>
              <Table.Td>{row.status}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
};
