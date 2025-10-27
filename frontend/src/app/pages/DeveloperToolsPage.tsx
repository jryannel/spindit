import { Alert, Badge, Button, Card, Code, Container, Divider, Group, Loader, PasswordInput, Select, Stack, Text, TextInput, Textarea, Title } from '@mantine/core';
import { IconInfoCircle, IconPlayerPlay } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth, type AuthUser } from '../../features/auth';
import { useCreateLockerRequestMutation, useZonesQuery } from '../../features/requests/hooks';
import { pb } from '../../lib/pocketbase';

const languageOptions = [
  { value: 'de', label: 'German' },
  { value: 'en', label: 'English' },
];

type StepKey = 'signup' | 'login' | 'profile' | 'request';
type StepPhase = 'idle' | 'pending' | 'success' | 'error';

interface StepState {
  status: StepPhase;
  message?: string;
}

interface UserTemplate {
  id: string;
  label: string;
  email: string;
  password: string;
}

interface ProfileTemplate {
  id: string;
  label: string;
  full_name: string;
  address: string;
  phone: string;
  language: 'de' | 'en';
}

interface RequestTemplate {
  id: string;
  label: string;
  student_name: string;
  student_class: string;
  school_year: string;
  preferred_locker?: string;
  preferred_zone?: string;
}

const parentNames = [
  'Alex Johnson',
  'Jamie Smith',
  'Patricia Müller',
  'Lea Schneider',
  'Marco Rossi',
  'Linda Keller',
  'Stefan Weber',
  'Nora Fischer',
  'Daniel Baumann',
  'Sofia Winkler',
] as const;

const addresses = [
  'Bahnhofstrasse 10\n8001 Zürich',
  'Seestrasse 25\n8008 Zürich',
  'Lindenweg 4\n8302 Kloten',
  'Gartenstrasse 16\n8700 Küsnacht',
  'Postgasse 3\n3011 Bern',
  'Alpenblick 8\n6003 Luzern',
  'Hauptstrasse 45\n4410 Liestal',
  'Schulweg 12\n5000 Aarau',
  'Bergstrasse 9\n9000 St. Gallen',
  'Sonnenweg 22\n7000 Chur',
] as const;

const phoneNumbers = [
  '+41442010001',
  '+41435551202',
  '+41448893303',
  '+41443004404',
  '+41312205505',
  '+41412296606',
  '+41613007707',
  '+41628328808',
  '+41712219909',
  '+41812551110',
] as const;

const studentNames = [
  'Emma Johnson',
  'Luca Smith',
  'Mia Müller',
  'Noah Schneider',
  'Giulia Rossi',
  'Tim Keller',
  'Lena Weber',
  'Finn Fischer',
  'Nina Baumann',
  'Jonas Winkler',
] as const;

const studentClasses = ['6A', '6B', '7A', '7B', '8A', '8B', '9A', '9B', '10A', '10B'] as const;
const lockerNumbers = ['102', '118', '205', '212', '305', '322', '410', '512', '606', '710'] as const;
const schoolYearDefault = '2025/26';

const userTemplates: UserTemplate[] = parentNames.map((name, index) => ({
  id: `user${index + 1}`,
  label: `User ${index + 1} – ${name}`,
  email: `dev-user${index + 1}@example.test`,
  password: `Spindit#${index + 1}0`,
}));

const profileTemplates: ProfileTemplate[] = parentNames.map((name, index) => ({
  id: `profile${index + 1}`,
  label: `Profile ${index + 1} – ${name}`,
  full_name: name,
  address: addresses[index],
  phone: phoneNumbers[index],
  language: index % 3 === 1 ? 'en' : 'de',
}));

const requestTemplates: RequestTemplate[] = parentNames.map((_, index) => ({
  id: `request${index + 1}`,
  label: `Request ${index + 1} – ${studentNames[index]}`,
  student_name: studentNames[index],
  student_class: studentClasses[index],
  school_year: schoolYearDefault,
  preferred_locker: lockerNumbers[index],
  preferred_zone: '',
}));

const createInitialStepState = (): Record<StepKey, StepState> => ({
  signup: { status: 'idle' },
  login: { status: 'idle' },
  profile: { status: 'idle' },
  request: { status: 'idle' },
});

const badgeFor = (state: StepState) => {
  const colorMap: Record<StepPhase, string> = {
    idle: 'gray',
    pending: 'blue',
    success: 'green',
    error: 'red',
  };

  return (
    <Badge color={colorMap[state.status]} variant="light">
      {state.status.toUpperCase()}
    </Badge>
  );
};

export const DeveloperToolsPage = () => {
  const { signup, login, updateProfile, logout, user } = useAuth();

  const initialUserTemplate = userTemplates[0];
  const initialProfileTemplate = profileTemplates[0];
  const initialRequestTemplate = requestTemplates[0];

  const [selectedUserTemplate, setSelectedUserTemplate] = useState(initialUserTemplate.id);
  const [email, setEmail] = useState(initialUserTemplate.email);
  const [password, setPassword] = useState(initialUserTemplate.password);

  const [selectedProfileTemplate, setSelectedProfileTemplate] = useState(initialProfileTemplate.id);
  const [profileName, setProfileName] = useState(initialProfileTemplate.full_name);
  const [profileAddress, setProfileAddress] = useState(initialProfileTemplate.address);
  const [profilePhone, setProfilePhone] = useState(initialProfileTemplate.phone);
  const [profileLanguage, setProfileLanguage] = useState<string | null>(initialProfileTemplate.language);

  const [selectedRequestTemplate, setSelectedRequestTemplate] = useState(initialRequestTemplate.id);
  const [studentName, setStudentName] = useState(initialRequestTemplate.student_name);
  const [studentClass, setStudentClass] = useState(initialRequestTemplate.student_class);
  const [schoolYear, setSchoolYear] = useState(initialRequestTemplate.school_year);
  const [preferredZoneId, setPreferredZoneId] = useState(initialRequestTemplate.preferred_zone ?? '');
  const [preferredLocker, setPreferredLocker] = useState(initialRequestTemplate.preferred_locker ?? '');

  const [stepState, setStepState] = useState<Record<StepKey, StepState>>(createInitialStepState);
  const [latestUserId, setLatestUserId] = useState<string | null>(null);
  const [latestRequestId, setLatestRequestId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const createLockerRequestMutation = useCreateLockerRequestMutation();
  const {
    data: zones = [],
    isLoading: isZonesLoading,
    isFetching: isZonesFetching,
    error: zonesError,
  } = useZonesQuery();
  const zonesLoading = isZonesLoading || isZonesFetching;

  useEffect(() => {
    if (zonesError) {
      console.error(zonesError);
    }
  }, [zonesError]);

  const currentUser = useMemo<AuthUser | null>(() => {
    return user ?? (pb.authStore.model as AuthUser | null) ?? null;
  }, [user]);

  const zoneSelectData = useMemo(
    () => [{ value: '', label: 'No preference' }, ...zones.map((zone) => ({ value: zone.id, label: zone.name }))],
    [zones],
  );

  const setStep = (key: StepKey, next: StepState) => {
    setStepState((prev) => ({
      ...prev,
      [key]: {
        status: next.status,
        message: next.message,
      },
    }));
  };

  const applyUserTemplate = (templateId: string) => {
    const template = userTemplates.find((item) => item.id === templateId);
    if (!template) return;
    setSelectedUserTemplate(template.id);
    setEmail(template.email);
    setPassword(template.password);
  };

  const applyProfileTemplate = (templateId: string) => {
    const template = profileTemplates.find((item) => item.id === templateId);
    if (!template) return;
    setSelectedProfileTemplate(template.id);
    setProfileName(template.full_name);
    setProfileAddress(template.address);
    setProfilePhone(template.phone);
    setProfileLanguage(template.language);
  };

  const applyRequestTemplate = (templateId: string) => {
    const template = requestTemplates.find((item) => item.id === templateId);
    if (!template) return;
    setSelectedRequestTemplate(template.id);
    setStudentName(template.student_name);
    setStudentClass(template.student_class);
    setSchoolYear(template.school_year);
    setPreferredZoneId(template.preferred_zone ?? '');
    setPreferredLocker(template.preferred_locker ?? '');
  };

  const resetStatuses = () => {
    setStepState(createInitialStepState());
    setLatestUserId(null);
    setLatestRequestId(null);
  };

  const runSignup = async () => {
    setStep('signup', { status: 'pending' });
    try {
      await signup({
        email: email.trim(),
        password,
        passwordConfirm: password,
        profile: {
          full_name: profileName.trim(),
          address: profileAddress.trim(),
          phone: profilePhone.trim(),
          language: (profileLanguage ?? 'de') as 'de' | 'en',
        },
      });
      const model = pb.authStore.model as AuthUser | null;
      const createdId = model?.id ?? null;
      setLatestUserId(createdId);
      setStep('signup', { status: 'success', message: createdId ? `User ${createdId}` : undefined });
      setStep('login', { status: 'success', message: 'Authenticated after sign up' });
      return true;
    } catch (error) {
      console.error(error);
      setStep('signup', { status: 'error', message: 'Sign up failed. Try a different template or inspect console.' });
      return false;
    }
  };

  const runLogin = async () => {
    setStep('login', { status: 'pending' });
    try {
      const model = (await login(email.trim(), password)) ?? (pb.authStore.model as AuthUser | null);
      const loggedId = model?.id ?? null;
      setLatestUserId(loggedId);
      setStep('login', { status: 'success', message: loggedId ? `Logged in as ${loggedId}` : undefined });
      return true;
    } catch (error) {
      console.error(error);
      setStep('login', { status: 'error', message: 'Login failed. Check credentials or create the user first.' });
      return false;
    }
  };

  const runProfileUpdate = async () => {
    setStep('profile', { status: 'pending' });
    try {
      const updated = await updateProfile({
        full_name: profileName.trim(),
        address: profileAddress.trim(),
        phone: profilePhone.trim(),
        language: profileLanguage ?? 'de',
      });
      setStep('profile', { status: 'success', message: `Saved for ${updated.id}` });
      setLatestUserId(updated.id);
      return true;
    } catch (error) {
      console.error(error);
      setStep('profile', { status: 'error', message: 'Profile update failed.' });
      return false;
    }
  };

  const runRequestCreation = async () => {
    setStep('request', { status: 'pending' });
    try {
      const model = (pb.authStore.model as AuthUser | null) ?? user;
      const userId = model?.id;
      if (!userId) {
        throw new Error('No authenticated user available');
      }
      const record = await createLockerRequestMutation.mutateAsync({
        userId,
        input: {
          requester_name: profileName.trim(),
          requester_address: profileAddress.trim(),
          requester_phone: profilePhone.trim(),
          student_name: studentName.trim(),
          student_class: studentClass.trim(),
          school_year: schoolYear.trim(),
          preferred_zone: preferredZoneId.trim() || undefined,
          preferred_locker: preferredLocker.trim() || undefined,
          submitted_at: new Date().toISOString(),
        },
      });
      setLatestRequestId(record.id);
      setStep('request', { status: 'success', message: `Request ${record.id}` });
      return true;
    } catch (error) {
      console.error(error);
      setStep('request', { status: 'error', message: 'Request creation failed.' });
      return false;
    }
  };

  const runWithBusy = async (operation: () => Promise<boolean | void>) => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await operation();
    } finally {
      setIsBusy(false);
    }
  };

  const handleRunAll = async () => {
    if (isBusy) return;
    setIsBusy(true);
    resetStatuses();
    try {
      const didSignup = await runSignup();
      if (!didSignup) {
        return;
      }
      const didProfile = await runProfileUpdate();
      if (!didProfile) {
        return;
      }
      await runRequestCreation();
    } finally {
      setIsBusy(false);
    }
  };

  const handleLogout = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await logout();
      setLatestUserId(null);
      setStep('login', { status: 'idle', message: 'Session cleared' });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Stack gap={4}>
          <Title order={1}>Developer Toolkit</Title>
          <Text c="dimmed">
            Automate the happy path for a guardian account: register, authenticate, save profile details, and submit a
            locker request with one click.
          </Text>
        </Stack>
        <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
          Developer mode is intended for local PocketBase instances. Each run creates real records; clear them before
          demos.
        </Alert>
        <Card withBorder shadow="sm" radius="md" p="xl">
          <Stack gap="md">
            <Group justify="space-between" align="flex-end">
              <div>
                <Title order={3}>Account credentials</Title>
                <Text size="sm" c="dimmed">
                  Pick a template to populate the sign up and login fields automatically.
                </Text>
              </div>
              <Group gap="xs">
                <Button variant="subtle" onClick={handleLogout} disabled={isBusy}>
                  Clear session
                </Button>
              </Group>
            </Group>
            <Select
              label="Account template"
              data={userTemplates.map((template) => ({ value: template.id, label: template.label }))}
              value={selectedUserTemplate}
              onChange={(value) => {
                if (value) applyUserTemplate(value);
              }}
              disabled={isBusy}
            />
            <TextInput
              label="Email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
            />
            <PasswordInput
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              description="Must match password confirmation during sign up."
            />
            <Divider />
            <Stack gap="xs">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={500}>Create account</Text>
                  <Text size="sm" c="dimmed">
                    Registers the user and authenticates immediately.
                  </Text>
                </div>
                <Group gap="xs">
                  {badgeFor(stepState.signup)}
                  <Button onClick={() => runWithBusy(runSignup)} disabled={isBusy}>
                    Sign up
                  </Button>
                </Group>
              </Group>
              {stepState.signup.message && (
                <Text size="sm" c={stepState.signup.status === 'error' ? 'red' : 'dimmed'}>
                  {stepState.signup.message}
                </Text>
              )}
            </Stack>
            <Stack gap="xs">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text fw={500}>Login</Text>
                  <Text size="sm" c="dimmed">
                    Re-authenticates with the credentials above. Handy after editing records manually.
                  </Text>
                </div>
                <Group gap="xs">
                  {badgeFor(stepState.login)}
                  <Button variant="light" onClick={() => runWithBusy(runLogin)} disabled={isBusy}>
                    Login
                  </Button>
                </Group>
              </Group>
              {stepState.login.message && (
                <Text size="sm" c={stepState.login.status === 'error' ? 'red' : 'dimmed'}>
                  {stepState.login.message}
                </Text>
              )}
            </Stack>
            <Divider />
            <Stack gap={4}>
              <Text size="sm" c="dimmed">
                Current session:
              </Text>
              {currentUser ? (
                <Group gap="xs">
                  <Text>{currentUser.email}</Text>
                  <Code>{currentUser.id}</Code>
                </Group>
              ) : (
                <Text size="sm" c="red">
                  No authenticated user.
                </Text>
              )}
              {latestUserId && (
                <Text size="sm" c="dimmed">
                  Last touched user: <Code>{latestUserId}</Code>
                </Text>
              )}
            </Stack>
          </Stack>
        </Card>
        <Card withBorder shadow="sm" radius="md" p="xl">
          <Stack gap="md">
            <Title order={3}>Profile template</Title>
            <Text size="sm" c="dimmed">
              Values saved when running the profile step. Adjust them or pick another template.
            </Text>
            <Select
              label="Profile template"
              data={profileTemplates.map((template) => ({ value: template.id, label: template.label }))}
              value={selectedProfileTemplate}
              onChange={(value) => {
                if (value) applyProfileTemplate(value);
              }}
              disabled={isBusy}
            />
            <TextInput
              label="Full name"
              value={profileName}
              onChange={(event) => setProfileName(event.currentTarget.value)}
            />
            <Textarea
              label="Address"
              minRows={3}
              value={profileAddress}
              onChange={(event) => setProfileAddress(event.currentTarget.value)}
            />
            <TextInput
              label="Phone"
              value={profilePhone}
              onChange={(event) => setProfilePhone(event.currentTarget.value)}
            />
            <Select
              label="Language"
              data={languageOptions}
              value={profileLanguage}
              onChange={setProfileLanguage}
            />
            <Group justify="space-between" align="flex-start">
              <Text fw={500}>Save profile</Text>
              <Group gap="xs">
                {badgeFor(stepState.profile)}
                <Button variant="light" onClick={() => runWithBusy(runProfileUpdate)} disabled={isBusy}>
                  Update profile
                </Button>
              </Group>
            </Group>
            {stepState.profile.message && (
              <Text size="sm" c={stepState.profile.status === 'error' ? 'red' : 'dimmed'}>
                {stepState.profile.message}
              </Text>
            )}
          </Stack>
        </Card>
        <Card withBorder shadow="sm" radius="md" p="xl">
          <Stack gap="md">
            <Title order={3}>Locker request</Title>
            <Text size="sm" c="dimmed">
              Data used when creating a request for the authenticated user.
            </Text>
            <Select
              label="Request template"
              data={requestTemplates.map((template) => ({ value: template.id, label: template.label }))}
              value={selectedRequestTemplate}
              onChange={(value) => {
                if (value) applyRequestTemplate(value);
              }}
              disabled={isBusy}
            />
            <Group grow>
              <TextInput
                label="Student name"
                value={studentName}
                onChange={(event) => setStudentName(event.currentTarget.value)}
              />
              <TextInput
                label="Class"
                value={studentClass}
                onChange={(event) => setStudentClass(event.currentTarget.value)}
              />
              <TextInput
                label="School year"
                value={schoolYear}
                onChange={(event) => setSchoolYear(event.currentTarget.value)}
              />
            </Group>
            <Group grow>
              <Select
                label="Preferred zone"
                data={zoneSelectData}
                value={preferredZoneId}
                onChange={(value) => setPreferredZoneId(value ?? '')}
                searchable
                rightSection={zonesLoading ? <Loader size="xs" /> : undefined}
              />
              <TextInput
                label="Preferred locker number"
                placeholder="Optional"
                value={preferredLocker}
                onChange={(event) => setPreferredLocker(event.currentTarget.value)}
              />
            </Group>
            <Group justify="space-between" align="flex-start">
              <Text fw={500}>Create request</Text>
              <Group gap="xs">
                {badgeFor(stepState.request)}
                <Button variant="light" onClick={() => runWithBusy(runRequestCreation)} disabled={isBusy}>
                  Submit request
                </Button>
              </Group>
            </Group>
            {stepState.request.message && (
              <Text size="sm" c={stepState.request.status === 'error' ? 'red' : 'dimmed'}>
                {stepState.request.message}
              </Text>
            )}
            {latestRequestId && (
              <Text size="sm" c="dimmed">
                Last request id: <Code>{latestRequestId}</Code>
              </Text>
            )}
          </Stack>
        </Card>
        <Group justify="space-between">
          <Button leftSection={<IconPlayerPlay size={16} />} onClick={handleRunAll} disabled={isBusy}>
            Run full flow
          </Button>
          <Button variant="subtle" onClick={resetStatuses} disabled={isBusy}>
            Reset statuses
          </Button>
        </Group>
      </Stack>
    </Container>
  );
};
