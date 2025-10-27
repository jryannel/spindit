import { useCallback, useEffect, useMemo, useState } from 'react';
import { pb } from '../../lib/pocketbase';
import { AuthContext } from './context';
import type { AuthUser, ProfileUpdatePayload, SignupPayload } from './types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(pb.authStore.model as AuthUser | null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return pb.authStore.onChange(() => {
      setUser(pb.authStore.model as AuthUser | null);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await pb.collection('users').authWithPassword(email, password);
      const model = pb.authStore.model as AuthUser | null;
      setUser(model);
      return model;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    setIsLoading(true);
    try {
      const profile = payload.profile ?? {};
      await pb.collection('users').create({
        email: payload.email,
        password: payload.password,
        passwordConfirm: payload.passwordConfirm,
        full_name: profile.full_name ?? '',
        address: profile.address ?? '',
        phone: profile.phone ?? '',
        language: profile.language ?? 'de',
        is_staff: false,
        emailVisibility: true,
      });

      await pb.collection('users').authWithPassword(payload.email, payload.password);
      setUser(pb.authStore.model as AuthUser | null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    pb.authStore.clear();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (payload: ProfileUpdatePayload) => {
      const recordId = pb.authStore.model?.id;
      if (!recordId) {
        throw new Error('No authenticated user');
      }

      const updated = await pb.collection('users').update<AuthUser>(recordId, payload);
      const token = pb.authStore.token || '';
      pb.authStore.save(token, updated);
      setUser(updated);
      return updated;
    },
    [],
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      signup,
      updateProfile,
      logout,
    }),
    [user, isLoading, login, signup, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
