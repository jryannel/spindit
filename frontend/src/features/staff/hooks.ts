import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import {
  bulkUpdateRequestStatus,
  createLocker,
  createRequest,
  createUserAccount,
  createZone,
  deleteLocker,
  deleteRequests,
  deleteUser,
  deleteZone,
  getAssignmentForRequest,
  getLockerById,
  getRecentRequests,
  getRequestById,
  getStaffMetrics,
  getUserById,
  getZoneById,
  listAllRequests,
  listAllZones,
  listLockers,
  listUsers,
  type AssignmentRecordLite,
  type LockerPayload,
  type PaginatedResult,
  type RequestUpdatePayload,
  type StaffMetrics,
  type StaffUserRecord,
  type UpdateUserInput,
  updateLocker,
  updateLockerStatus,
  updateRequest,
  updateRequestStatus,
  updateUserAccount,
  updateZone,
  upsertAssignment,
} from './api';
import type { LockerRecord, LockerRequestRecord, ZoneRecord } from '../requests/api';

type RoleFilter = 'all' | 'staff' | 'family';

const usersInvalidate = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: ['staff', 'users'] });
};

const zonesInvalidate = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: ['staff', 'zones'] });
  void queryClient.invalidateQueries({ queryKey: queryKeys.requests.zones });
};

const requestsInvalidate = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: ['staff', 'requests'] });
};

const lockersInvalidate = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: ['staff', 'lockers'] });
};

export const useStaffUsersQuery = (params: {
  page: number;
  perPage: number;
  search: string;
  role: RoleFilter;
}) =>
  useQuery({
    queryKey: queryKeys.staff.users(params),
    queryFn: (): Promise<PaginatedResult<StaffUserRecord>> =>
      listUsers(params.page, params.perPage, {
        search: params.search.trim() || undefined,
        staffOnly: params.role === 'all' ? null : params.role === 'staff',
      }),
    placeholderData: (previous) => previous,
  });

export const useStaffZonesQuery = (params: { page: number; perPage: number; search: string }) =>
  useQuery({
    queryKey: queryKeys.staff.zones(params),
    queryFn: (): Promise<PaginatedResult<ZoneRecord>> =>
      listAllZones(params.page, params.perPage, {
        search: params.search.trim() || undefined,
      }),
    placeholderData: (previous) => previous,
  });

export const useStaffRequestsQuery = (params: { page: number; perPage: number; search: string; status: string }) =>
  useQuery({
    queryKey: queryKeys.requests.staffList({
      page: params.page,
      search: params.search,
      status: params.status,
    }),
    queryFn: (): Promise<PaginatedResult<LockerRequestRecord>> =>
      listAllRequests(params.page, params.perPage, {
        search: params.search.trim() || undefined,
        status: params.status,
      }),
    placeholderData: (previous) => previous,
  });

export const useStaffLockersQuery = (params: {
  page: number;
  perPage: number;
  search: string;
  status: string;
  zone: string;
}) =>
  useQuery({
    queryKey: queryKeys.staff.lockers(params),
    queryFn: (): Promise<PaginatedResult<LockerRecord>> =>
      listLockers(params.page, params.perPage, {
        search: params.search.trim() || undefined,
        status: params.status,
        zone: params.zone,
      }),
    placeholderData: (previous) => previous,
  });

export const useStaffMetricsQuery = () =>
  useQuery({
    queryKey: queryKeys.staff.metrics,
    queryFn: (): Promise<StaffMetrics> => getStaffMetrics(),
    staleTime: 5 * 60_000,
  });

export const useRecentRequestsQuery = (limit: number) =>
  useQuery({
    queryKey: queryKeys.requests.recent(limit),
    queryFn: (): Promise<LockerRequestRecord[]> => getRecentRequests(limit),
    staleTime: 60_000,
  });

export const useStaffUserQuery = (id: string | undefined) =>
  useQuery({
    queryKey: queryKeys.staff.user(id ?? 'unknown'),
    enabled: Boolean(id),
    queryFn: (): Promise<StaffUserRecord> => getUserById(id!),
  });

export const useStaffRequestQuery = (id: string | undefined) =>
  useQuery({
    queryKey: queryKeys.staff.request(id ?? 'unknown'),
    enabled: Boolean(id),
    queryFn: (): Promise<LockerRequestRecord> => getRequestById(id!),
  });

export const useStaffZoneQuery = (id: string | undefined) =>
  useQuery({
    queryKey: queryKeys.staff.zone(id ?? 'unknown'),
    enabled: Boolean(id),
    queryFn: (): Promise<ZoneRecord> => getZoneById(id!),
  });

export const useStaffLockerQuery = (id: string | undefined) =>
  useQuery({
    queryKey: queryKeys.staff.locker(id ?? 'unknown'),
    enabled: Boolean(id),
    queryFn: (): Promise<LockerRecord> => getLockerById(id!),
  });

export const useRequestAssignmentQuery = (requestId: string | undefined) =>
  useQuery({
    queryKey: ['staff', 'assignments', requestId ?? 'unknown'],
    enabled: Boolean(requestId),
    queryFn: (): Promise<AssignmentRecordLite | null> => getAssignmentForRequest(requestId!),
  });

export const useCreateUserAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserAccount,
    onSuccess: () => {
      usersInvalidate(queryClient);
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.metrics });
    },
  });
};

export const useUpdateUserAccountMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserInput }) => updateUserAccount(id, payload),
    onSuccess: (_, { id }) => {
      usersInvalidate(queryClient);
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.user(id) });
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, id) => {
      usersInvalidate(queryClient);
      void queryClient.removeQueries({ queryKey: queryKeys.staff.user(id) });
    },
  });
};

export const useCreateZoneMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createZone,
    onSuccess: () => zonesInvalidate(queryClient),
  });
};

export const useUpdateZoneMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string; description?: string } }) =>
      updateZone(id, payload),
    onSuccess: (_, { id }) => {
      zonesInvalidate(queryClient);
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.zone(id) });
    },
  });
};

export const useDeleteZoneMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteZone,
    onSuccess: (_, id) => {
      zonesInvalidate(queryClient);
      void queryClient.removeQueries({ queryKey: queryKeys.staff.zone(id) });
    },
  });
};

export const useCreateRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRequest,
    onSuccess: () => {
      requestsInvalidate(queryClient);
      void queryClient.invalidateQueries({ queryKey: queryKeys.requests.recent(5) });
    },
  });
};

export const useUpdateRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RequestUpdatePayload }) => updateRequest(id, payload),
    onSuccess: (_, { id }) => {
      requestsInvalidate(queryClient);
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.request(id) });
    },
  });
};

export const useUpdateRequestStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateRequestStatus(id, status),
    onSuccess: (_, { id }) => {
      requestsInvalidate(queryClient);
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.request(id) });
    },
  });
};

export const useBulkUpdateRequestStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: string }) => bulkUpdateRequestStatus(ids, status),
    onSuccess: () => {
      requestsInvalidate(queryClient);
    },
  });
};

export const useDeleteRequestsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteRequests,
    onSuccess: () => {
      requestsInvalidate(queryClient);
    },
  });
};

export const useUpsertAssignmentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      lockerId,
    }: {
      requestId: string;
      lockerId: string | null;
      userId?: string;
    }) => upsertAssignment(requestId, lockerId),
    onSuccess: (_, { requestId, userId }) => {
      requestsInvalidate(queryClient);
      lockersInvalidate(queryClient);
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.requests.byUser(userId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.requests.assignmentsByUser(userId) });
      }
      void queryClient.invalidateQueries({ queryKey: ['staff', 'assignments', requestId] });
    },
  });
};

export const useStaffAssignmentQuery = useRequestAssignmentQuery;

export const useCreateLockerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLocker,
    onSuccess: () => lockersInvalidate(queryClient),
  });
};

export const useUpdateLockerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: LockerPayload }) => updateLocker(id, payload),
    onSuccess: (_, { id }) => {
      lockersInvalidate(queryClient);
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.locker(id) });
    },
  });
};

export const useDeleteLockerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLocker,
    onSuccess: (_, id) => {
      lockersInvalidate(queryClient);
      void queryClient.removeQueries({ queryKey: queryKeys.staff.locker(id) });
    },
  });
};

export const useUpdateLockerStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateLockerStatus(id, status),
    onSuccess: (_, { id }) => {
      lockersInvalidate(queryClient);
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.locker(id) });
    },
  });
};

export const useLockerSearchInfiniteQuery = (params: { zone: string; enabled: boolean }) =>
  useInfiniteQuery({
    queryKey: ['staff', 'locker-search', params.zone],
    enabled: params.enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      listLockers(pageParam, 20, {
        search: '',
        status: 'all',
        zone: params.zone,
      }),
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
  });
