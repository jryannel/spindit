import type { RecordModel } from 'pocketbase';
import { pb } from '../../lib/pocketbase';
import type { ChildRecord } from '../children/api';

export interface LockerRequestInput {
  child: string;
  school_year: string;
  preferred_zone?: string;
  preferred_locker?: string;
  submitted_at?: string;
}

export type LockerRequestRecord = RecordModel & LockerRequestInput & {
  parent: string;
  status: string;
  submitted_at: string;
  expand?: {
    child?: ChildRecord;
    preferred_zone?: ZoneRecord;
  };
};

export async function listRequests(parentId: string): Promise<LockerRequestRecord[]> {
  return pb.collection('requests').getFullList<LockerRequestRecord>({
    filter: `parent = "${parentId}"`,
    sort: '-created',
    expand: 'child,preferred_zone',
  });
}

export async function createLockerRequest(parentId: string, data: LockerRequestInput): Promise<LockerRequestRecord> {
  return pb.collection('requests').create<LockerRequestRecord>({
    parent: parentId,
    status: 'pending',
    submitted_at: data.submitted_at ?? new Date().toISOString(),
    ...data,
  });
}

export interface ZoneRecord extends RecordModel {
  name: string;
}

export async function listZones(): Promise<ZoneRecord[]> {
  return pb.collection('zones').getFullList<ZoneRecord>({ sort: 'name' });
}
