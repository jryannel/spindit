import PocketBase from 'pocketbase';

declare global {
  interface ImportMetaEnv {
    readonly VITE_PB_URL?: string;
  }
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export const pb = new PocketBase(import.meta.env.VITE_PB_URL ?? 'http://127.0.0.1:8090');

export const defaultCollections = {
  users: 'users',
  requests: 'requests',
  invoices: 'invoices',
} as const;

export type AuthModel = typeof pb.authStore.model;
