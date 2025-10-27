import type { RecordModel } from 'pocketbase';
import { pb } from '../../lib/pocketbase';

export interface LockerRequestInput {
  requester_name: string;
  requester_address: string;
  requester_phone: string;
  student_name: string;
  student_class: string;
  school_year: string;
  preferred_zone?: string;
  preferred_locker?: string;
  submitted_at?: string;
}

export type LockerRequestRecord = RecordModel & LockerRequestInput & {
  user: string;
  status: string;
  submitted_at: string;
  expand?: {
    preferred_zone?: ZoneRecord;
    user?: RecordModel;
  };
};

export type AssignmentRecord = RecordModel & {
  request: string;
  locker: string;
  assigned_at: string;
  expand?: {
    request?: LockerRequestRecord;
    locker?: LockerRecord;
  };
};

export interface LockerRecord extends RecordModel {
  number: number;
  status: string;
  zone?: string;
  note?: string;
  expand?: {
    zone?: ZoneRecord;
  };
}

export async function listRequests(userId: string): Promise<LockerRequestRecord[]> {
  return pb.collection('requests').getFullList<LockerRequestRecord>({
    filter: `user = "${userId}"`,
    sort: '-submitted_at',
    expand: 'preferred_zone',
  });
}

export async function createLockerRequest(userId: string, data: LockerRequestInput): Promise<LockerRequestRecord> {
  return pb.collection('requests').create<LockerRequestRecord>({
    user: userId,
    status: 'pending',
    submitted_at: data.submitted_at ?? new Date().toISOString(),
    ...data,
  });
}

export async function cancelLockerRequest(requestId: string): Promise<LockerRequestRecord> {
  return pb.collection('requests').update<LockerRequestRecord>(requestId, { status: 'cancelled' });
}

export async function listAssignments(userId: string): Promise<AssignmentRecord[]> {
  return pb.collection('assignments').getFullList<AssignmentRecord>({
    filter: `request.user = "${userId}"`,
    sort: '-assigned_at',
    expand: 'request,locker,locker.zone,request.preferred_zone',
  });
}

export interface ZoneRecord extends RecordModel {
  name: string;
}

export async function listZones(): Promise<ZoneRecord[]> {
  return pb.collection('zones').getFullList<ZoneRecord>({ sort: 'name' });
}
