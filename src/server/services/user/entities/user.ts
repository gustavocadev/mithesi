import type { SelectProject, SelectUser } from '~/server/db/schema';

export type User = SelectUser & {
  projects?: SelectProject[];
};
