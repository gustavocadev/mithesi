import { SelectProject, SelectUser, SelectUserLike } from '~/server/db/schema';

export type Project = SelectProject & {
  user: SelectUser;
  userLike?: SelectUserLike | null;
  likes: number;
};
