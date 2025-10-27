import type { RecordModel } from 'pocketbase';
import { pb } from '../../lib/pocketbase';
import type { LockerRequestRecord, LockerRecord, ZoneRecord } from '../requests/api';

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

const escapeFilterValue = (value: string) => value.replace(/"/g, '\\"');

export interface StaffUserRecord extends RecordModel {
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  language?: string;
  is_staff?: boolean;
  emailVisibility?: boolean;
}

export async function listUsers(
  page = 1,
  perPage = 20,
  options?: { search?: string; staffOnly?: boolean | null },
): Promise<PaginatedResult<StaffUserRecord>> {
  const filters: string[] = [];
  if (options?.search) {
    const term = escapeFilterValue(options.search);
    filters.push(`(email ~ "${term}" || full_name ~ "${term}" || phone ~ "${term}")`);
  }
  if (options?.staffOnly === true) {
    filters.push('is_staff = true');
  } else if (options?.staffOnly === false) {
    filters.push('is_staff = false');
  }

  const result = await pb.collection('users').getList<StaffUserRecord>(page, perPage, {
    sort: 'email',
    filter: filters.length ? filters.join(' && ') : undefined,
  });
  return {
    items: result.items,
    page: result.page,
    perPage: result.perPage,
    totalItems: result.totalItems,
    totalPages: result.totalPages,
  };
}

export async function listAllRequests(
  page = 1,
  perPage = 20,
  options?: { search?: string; status?: string },
): Promise<PaginatedResult<LockerRequestRecord>> {
  const filters: string[] = [];
  if (options?.search) {
    const term = escapeFilterValue(options.search);
    filters.push(
      `(
        student_name ~ "${term}" ||
        requester_name ~ "${term}" ||
        requester_address ~ "${term}" ||
        requester_phone ~ "${term}"
      )`,
    );
  }
  if (options?.status && options.status !== 'all') {
    const term = escapeFilterValue(options.status);
    filters.push(`status = "${term}"`);
  }

  const result = await pb.collection('requests').getList<LockerRequestRecord>(page, perPage, {
    sort: '-submitted_at',
    expand: 'preferred_zone,user',
    filter: filters.length ? filters.join(' && ') : undefined,
  });
  return {
    items: result.items,
    page: result.page,
    perPage: result.perPage,
    totalItems: result.totalItems,
    totalPages: result.totalPages,
  };
}

export async function updateRequestStatus(id: string, status: string): Promise<LockerRequestRecord> {
  return pb.collection('requests').update<LockerRequestRecord>(id, { status });
}

export async function bulkUpdateRequestStatus(ids: string[], status: string): Promise<void> {
  if (!ids.length) return;
  await Promise.all(ids.map((id) => pb.collection('requests').update(id, { status })));
}

export async function deleteRequests(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await Promise.all(ids.map((id) => pb.collection('requests').delete(id)));
}

export interface RequestUpdatePayload {
  requester_name?: string;
  requester_address?: string;
  requester_phone?: string;
  student_name?: string;
  student_class?: string;
  school_year?: string;
  preferred_zone?: string | null;
  preferred_locker?: string | null;
  status?: string;
}

export async function updateRequest(id: string, payload: RequestUpdatePayload): Promise<LockerRequestRecord> {
  const data: Record<string, unknown> = { ...payload };

  if ('preferred_zone' in payload) {
    data.preferred_zone = payload.preferred_zone ? payload.preferred_zone : '';
  }

  if ('preferred_locker' in payload) {
    data.preferred_locker = payload.preferred_locker ? payload.preferred_locker : '';
  }

  return pb.collection('requests').update<LockerRequestRecord>(id, data);
}

export async function getRequestById(id: string): Promise<LockerRequestRecord> {
  return pb.collection('requests').getOne<LockerRequestRecord>(id, {
    expand: 'preferred_zone,user',
  });
}

export interface StaffRequestCreatePayload extends RequestUpdatePayload {
  user: string;
  submitted_at?: string;
}

export async function createRequest(payload: StaffRequestCreatePayload): Promise<LockerRequestRecord> {
  const data: Record<string, unknown> = {
    ...payload,
    status: payload.status ?? 'pending',
    submitted_at: payload.submitted_at ?? new Date().toISOString(),
  };

  if ('preferred_zone' in data) {
    data.preferred_zone = payload.preferred_zone ? payload.preferred_zone : '';
  }

  if ('preferred_locker' in data) {
    data.preferred_locker = payload.preferred_locker ? payload.preferred_locker : '';
  }

  return pb.collection('requests').create<LockerRequestRecord>(data);
}

export interface AssignmentRecordLite extends RecordModel {
  request: string;
  locker: string;
  assigned_at: string;
}

export async function getAssignmentForRequest(requestId: string): Promise<AssignmentRecordLite | null> {
  const result = await pb.collection('assignments').getList<AssignmentRecordLite>(1, 1, {
    filter: `request = "${requestId}"`,
  });
  return result.items.at(0) ?? null;
}

export async function upsertAssignment(requestId: string, lockerId: string | null): Promise<void> {
  const existing = await getAssignmentForRequest(requestId);

  if (!lockerId) {
    if (existing) {
      await updateLockerStatus(existing.locker, 'free');
      await pb.collection('assignments').delete(existing.id);
    }
    return;
  }

  if (existing) {
    if (existing.locker !== lockerId) {
      await updateLockerStatus(existing.locker, 'free');
      await pb.collection('assignments').update(existing.id, {
        locker: lockerId,
        assigned_at: new Date().toISOString(),
      });
    }
  } else {
    await pb.collection('assignments').create({
      request: requestId,
      locker: lockerId,
      assigned_at: new Date().toISOString(),
    });
  }

  await updateLockerStatus(lockerId, 'reserved');
}

export async function listLockers(
  page = 1,
  perPage = 20,
  options?: { search?: string; status?: string; zone?: string },
): Promise<PaginatedResult<LockerRecord>> {
  const filters: string[] = [];
  if (options?.status && options.status !== 'all') {
    const term = escapeFilterValue(options.status);
    filters.push(`status = "${term}"`);
  }
  if (options?.zone && options.zone !== 'all') {
    const term = escapeFilterValue(options.zone);
    filters.push(`zone = "${term}"`);
  }
  if (options?.search) {
    const term = escapeFilterValue(options.search);
    const numeric = Number(term);
    if (!Number.isNaN(numeric)) {
      filters.push(`number = ${numeric}`);
    } else {
      filters.push(`(note ~ "${term}" )`);
    }
  }

  const result = await pb.collection('lockers').getList<LockerRecord>(page, perPage, {
    sort: 'number',
    expand: 'zone',
    filter: filters.length ? filters.join(' && ') : undefined,
  });
  return {
    items: result.items,
    page: result.page,
    perPage: result.perPage,
    totalItems: result.totalItems,
    totalPages: result.totalPages,
  };
}

export async function updateLockerStatus(id: string, status: string): Promise<LockerRecord> {
  return pb.collection('lockers').update<LockerRecord>(id, { status });
}

export async function getLockerById(id: string): Promise<LockerRecord> {
  return pb.collection('lockers').getOne<LockerRecord>(id, { expand: 'zone' });
}

export async function listAllZones(
  page = 1,
  perPage = 20,
  options?: { search?: string },
): Promise<PaginatedResult<ZoneRecord>> {
  const filters: string[] = [];
  if (options?.search) {
    const term = escapeFilterValue(options.search);
    filters.push(`(name ~ "${term}" || description ~ "${term}")`);
  }

  const result = await pb.collection('zones').getList<ZoneRecord>(page, perPage, {
    sort: 'name',
    filter: filters.length ? filters.join(' && ') : undefined,
  });
  return {
    items: result.items,
    page: result.page,
    perPage: result.perPage,
    totalItems: result.totalItems,
    totalPages: result.totalPages,
  };
}

export async function createZone(payload: { name: string; description?: string }): Promise<ZoneRecord> {
  return pb.collection('zones').create<ZoneRecord>({
    name: payload.name,
    description: payload.description,
  });
}

export async function updateZone(id: string, payload: { name: string; description?: string }): Promise<ZoneRecord> {
  return pb.collection('zones').update<ZoneRecord>(id, {
    name: payload.name,
    description: payload.description,
  });
}

export async function deleteZone(id: string): Promise<void> {
  await pb.collection('zones').delete(id);
}

export async function getZoneById(id: string): Promise<ZoneRecord> {
  return pb.collection('zones').getOne<ZoneRecord>(id);
}

export interface StaffMetrics {
  totalUsers: number;
  newUsersThisWeek: number;
  totalRequests: number;
  pendingRequests: number;
  totalLockers: number;
  freeLockers: number;
  totalZones: number;
}

const isoFromNow = (days: number) => {
  const now = new Date();
  now.setDate(now.getDate() - days);
  return now.toISOString();
};

export async function getStaffMetrics(): Promise<StaffMetrics> {
  const weekAgoISO = isoFromNow(7);

  const [usersAll, usersRecent, requestsAll, requestsPending, lockersAll, lockersFree, zonesAll] = await Promise.all([
    pb.collection('users').getList<StaffUserRecord>(1, 1),
    pb
      .collection('users')
      .getList<StaffUserRecord>(1, 1, { filter: `created >= "${weekAgoISO}"` }),
    pb.collection('requests').getList<LockerRequestRecord>(1, 1),
    pb.collection('requests').getList<LockerRequestRecord>(1, 1, { filter: 'status = "pending"' }),
    pb.collection('lockers').getList<LockerRecord>(1, 1),
    pb.collection('lockers').getList<LockerRecord>(1, 1, { filter: 'status = "free"' }),
    pb.collection('zones').getList<ZoneRecord>(1, 1),
  ]);

  return {
    totalUsers: usersAll.totalItems,
    newUsersThisWeek: usersRecent.totalItems,
    totalRequests: requestsAll.totalItems,
    pendingRequests: requestsPending.totalItems,
    totalLockers: lockersAll.totalItems,
    freeLockers: lockersFree.totalItems,
    totalZones: zonesAll.totalItems,
  };
}

export async function getRecentRequests(limit = 5): Promise<LockerRequestRecord[]> {
  const result = await pb.collection('requests').getList<LockerRequestRecord>(1, limit, {
    sort: '-submitted_at',
    expand: 'user,preferred_zone',
  });
  return result.items;
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  address?: string;
  language?: string;
  is_staff?: boolean;
}

export interface UpdateUserInput {
  full_name?: string;
  phone?: string;
  address?: string;
  language?: string;
  is_staff?: boolean;
}

export async function createUserAccount(payload: CreateUserInput): Promise<StaffUserRecord> {
  const record = await pb.collection('users').create<StaffUserRecord>({
    email: payload.email,
    password: payload.password,
    passwordConfirm: payload.password,
    full_name: payload.full_name ?? '',
    phone: payload.phone ?? '',
    address: payload.address ?? '',
    language: payload.language ?? 'de',
    is_staff: payload.is_staff ?? false,
    emailVisibility: true,
  });
  return record;
}

export async function updateUserAccount(id: string, payload: UpdateUserInput): Promise<StaffUserRecord> {
  const record = await pb.collection('users').update<StaffUserRecord>(id, {
    full_name: payload.full_name,
    phone: payload.phone,
    address: payload.address,
    language: payload.language,
    is_staff: payload.is_staff,
  });
  return record;
}

export async function getUserById(id: string): Promise<StaffUserRecord> {
  return pb.collection('users').getOne<StaffUserRecord>(id);
}

export interface LockerPayload {
  number: number;
  status: string;
  zone: string;
  note?: string;
}

export async function createLocker(payload: LockerPayload): Promise<LockerRecord> {
  return pb.collection('lockers').create<LockerRecord>({
    number: payload.number,
    status: payload.status,
    zone: payload.zone,
    note: payload.note,
  });
}

export async function updateLocker(id: string, payload: LockerPayload): Promise<LockerRecord> {
  return pb.collection('lockers').update<LockerRecord>(id, {
    number: payload.number,
    status: payload.status,
    zone: payload.zone,
    note: payload.note,
  });
}

export async function deleteLocker(id: string): Promise<void> {
  await pb.collection('lockers').delete(id);
}

export async function deleteUser(id: string): Promise<void> {
  await pb.collection('users').delete(id);
}
