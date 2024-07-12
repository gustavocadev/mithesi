import { SelectUser } from '~/server/db/schema';

export type UserComitteeMember = Pick<
  SelectUser,
  'id' | 'name' | 'email' | 'lastName'
>;
