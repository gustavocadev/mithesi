import { SelectProject } from '~/server/db/schema';

export type CreateProjectDto = Omit<
  SelectProject,
  'createdAt' | 'updatedAt' | 'id' | 'status' | 'isVisible'
>;
