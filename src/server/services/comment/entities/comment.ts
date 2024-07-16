import { SelectComment, SelectUser } from '~/server/db/schema';

export type Comment = SelectComment & {
  user: {
    id: SelectUser['id'];
    name: SelectUser['name'];
    lastName: SelectUser['lastName'];
    role: SelectUser['role'];
  };
};
