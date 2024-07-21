import { SelectProject, SelectUser } from '~/server/db/schema';

export type Project = SelectProject & {
  user: {
    id: SelectUser['id'];
    name: SelectUser['name'];
    lastName: SelectUser['lastName'];
    role: SelectUser['role'];
  };
  likes: number;
  userLikeIds: string[];
  isLikedByTheUserAuth: boolean;
};
