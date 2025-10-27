import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryKeys';
import {
  cancelLockerRequest,
  createLockerRequest,
  listAssignments,
  listRequests,
  listZones,
  type LockerRequestInput,
  type LockerRequestRecord,
  type ZoneRecord,
} from './api';

export const useUserRequestsQuery = (userId: string | null | undefined) =>
  useQuery({
    queryKey: queryKeys.requests.byUser(userId ?? 'anonymous'),
    enabled: Boolean(userId),
    queryFn: async (): Promise<LockerRequestRecord[]> => {
      if (!userId) {
        return [];
      }
      return listRequests(userId);
    },
    placeholderData: (previous) => previous,
  });

export const useUserAssignmentsQuery = (userId: string | null | undefined) =>
  useQuery({
    queryKey: queryKeys.requests.assignmentsByUser(userId ?? 'anonymous'),
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      return listAssignments(userId);
    },
    placeholderData: (previous) => previous,
  });

export const useZonesQuery = () =>
  useQuery({
    queryKey: queryKeys.requests.zones,
    queryFn: (): Promise<ZoneRecord[]> => listZones(),
    staleTime: 5 * 60_000,
  });

export const useCreateLockerRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      input,
    }: {
      userId: string;
      input: LockerRequestInput;
    }) => createLockerRequest(userId, input),
    onSuccess: (created, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.byUser(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.assignmentsByUser(userId) });
      // ensure zones are fresh in case creation added a new zone reference
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.zones });
      queryClient.invalidateQueries({ queryKey: ['staff', 'lockers'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.metrics });
      return created;
    },
  });
};

export const useCancelRequestMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId }: { userId: string; requestId: string }) => cancelLockerRequest(requestId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.byUser(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests.assignmentsByUser(userId) });
      queryClient.invalidateQueries({ queryKey: ['staff', 'lockers'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.metrics });
    },
  });
};
