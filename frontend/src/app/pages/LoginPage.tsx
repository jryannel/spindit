import { Anchor, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { useLocation, useNavigate, type Location, Link } from 'react-router-dom';
import { useAuth, type AuthUser } from '../../features/auth';
import { pb } from '../../lib/pocketbase';

interface LoginForm {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: Location } };

  const form = useForm<LoginForm>({
    initialValues: { email: '', password: '' },
    validate: {
      email: (value: string) => (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? null : 'Invalid email'),
      password: (value: string) => (value.length >= 6 ? null : 'Minimum 6 characters'),
    },
  });

  const handleSubmit = form.onSubmit(async (values: LoginForm) => {
    setError(null);
    try {
      const loggedIn = (await login(values.email, values.password)) ?? (pb.authStore.model as AuthUser | null);
      const redirectFallback = loggedIn?.is_staff ? '/staff/dashboard' : '/app';
      const redirectTo = location?.state?.from?.pathname ?? redirectFallback;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error(err);
      setError('Login failed. Check credentials or contact support.');
    }
  });

  return (
    <Stack align="center" justify="center" mih="100vh" px="md">
      <Paper withBorder shadow="sm" radius="md" p="xl" maw={420} w="100%">
        <Stack>
          <Title order={2} ta="center">
            Spindit Locker Portal
          </Title>
          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput label="Email" placeholder="family@example.edu" {...form.getInputProps('email')} required />
              <PasswordInput label="Password" placeholder="•••••••" {...form.getInputProps('password')} required />
              {error && (
                <Text c="red" size="sm">
                  {error}
                </Text>
              )}
              <Button type="submit" loading={isLoading} fullWidth>
                Sign in
              </Button>
            </Stack>
          </form>
          <Anchor size="sm" c="dimmed" component={Link} to="/signup">
            Need access? Create an account.
          </Anchor>
        </Stack>
      </Paper>
    </Stack>
  );
};
