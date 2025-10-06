import type { RecordModel } from 'pocketbase';
import { pb } from '../../lib/pocketbase';

export interface ChildInput {
  full_name: string;
  class: string;
}

export type ChildRecord = RecordModel & ChildInput & {
  parent: string;
};

export async function listChildren(parentId: string): Promise<ChildRecord[]> {
  return pb.collection('children').getFullList<ChildRecord>({
    filter: `parent = "${parentId}"`,
    sort: 'full_name',
  });
}

export async function createChild(parentId: string, data: ChildInput): Promise<ChildRecord> {
  return pb.collection('children').create<ChildRecord>({
    parent: parentId,
    ...data,
  });
}
