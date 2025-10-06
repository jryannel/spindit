import { Tabs, Title } from '@mantine/core';
import { ChildrenSection } from '../../features/children/components/ChildrenSection';
import { RequestsSection } from '../../features/requests/components/RequestsSection';

export const ParentDashboard = () => {
  return (
    <div>
      <Title order={2} mb="lg">
        Parent Portal
      </Title>
      <Tabs defaultValue="requests" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="requests">Locker Requests</Tabs.Tab>
          <Tabs.Tab value="children">Children</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="requests" pt="md">
          <RequestsSection />
        </Tabs.Panel>
        <Tabs.Panel value="children" pt="md">
          <ChildrenSection />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};
