export const queryKeys = {
  auth: {
    user: ['auth', 'user'] as const,
  },
  requests: {
    byUser: (userId: string) => ['requests', 'user', userId] as const,
    assignmentsByUser: (userId: string) => ['assignments', 'user', userId] as const,
    zones: ['zones', 'all'] as const,
    staffList: (params: { page: number; search?: string; status?: string }) =>
      ['staff', 'requests', params.page, params.search ?? '', params.status ?? 'all'] as const,
    recent: (limit: number) => ['staff', 'requests', 'recent', limit] as const,
  },
  staff: {
    metrics: ['staff', 'metrics'] as const,
    users: (params: { page: number; perPage: number; search: string; role: string }) =>
      ['staff', 'users', params.page, params.perPage, params.search, params.role] as const,
    zones: (params: { page: number; perPage: number; search: string }) =>
      ['staff', 'zones', params.page, params.perPage, params.search] as const,
    lockers: (params: { page: number; perPage: number; search: string; status: string; zone: string }) =>
      ['staff', 'lockers', params.page, params.perPage, params.search, params.status, params.zone] as const,
    user: (id: string) => ['staff', 'users', id] as const,
    request: (id: string) => ['staff', 'requests', id] as const,
    zone: (id: string) => ['staff', 'zones', id] as const,
    locker: (id: string) => ['staff', 'lockers', id] as const,
  },
};
