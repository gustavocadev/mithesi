import { SelectProject, SelectUser } from '~/server/db/schema';

export type Project = SelectProject & {
  user: SelectUser;
};
