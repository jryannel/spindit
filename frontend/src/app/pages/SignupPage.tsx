import { Anchor, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth';

interface SignupForm {
  email: string;
  password: string;
  passwordConfirm: string;
}

export const SignupPage = () => {
  const { signup, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<SignupForm>({
    initialValues: {
      email: '',
      password: '',
      passwordConfirm: '',
    },
    validate: {
      email: (value) => (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? null : 'Invalid email'),
      password: (value) => (value.length >= 8 ? null : 'Password must be at least 8 characters'),
      passwordConfirm: (value, values) => (value === values.password ? null : 'Passwords do not match'),
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setError(null);
    try {
      await signup(values);
      navigate('/app', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Sign up failed. Please try again or contact support.');
    }
  });

  return (
    <Stack align="center" justify="center" mih="100vh" px="md">
      <Paper withBorder shadow="sm" radius="md" p="xl" maw={520} w="100%">
        <Stack>
          <Title order={2} ta="center">
            Create your Spindit account
          </Title>
          <form onSubmit={handleSubmit}>
            <Stack>
              <TextInput label="Email" {...form.getInputProps('email')} required />
              <PasswordInput label="Password" {...form.getInputProps('password')} required />
              <PasswordInput label="Confirm password" {...form.getInputProps('passwordConfirm')} required />
              {error && (
                <Text c="red" size="sm">
                  {error}
                </Text>
              )}
              <Button type="submit" loading={isLoading} fullWidth>
                Sign up
              </Button>
              <Text c="dimmed" size="sm">
                After signing in you can complete your profile with address, phone, and preferred language before
                submitting locker requests.
              </Text>
            </Stack>
          </form>
          <Anchor size="sm" c="dimmed" component={Link} to="/login">
            Already have an account? Sign in.
          </Anchor>
        </Stack>
      </Paper>
    </Stack>
  );
};
