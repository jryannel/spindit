import type { RecordModel } from 'pocketbase';

export type AuthUser = RecordModel & {
  is_staff?: boolean;
  language?: string;
  full_name?: string;
  address?: string;
  phone?: string;
};

export interface ProfileUpdatePayload {
  full_name?: string;
  address?: string;
  phone?: string;
  language?: string;
}

export interface SignupPayload {
  email: string;
  password: string;
  passwordConfirm: string;
  profile?: ProfileUpdatePayload;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  signup: (payload: SignupPayload) => Promise<void>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
}
