import { db } from '~/server/db/db';
import { userLike } from '~/server/db/schema';
import { CreateUserLikeDto } from './dtos/create-user-like';
import { eq } from 'drizzle-orm';

export const createUserLike = async (
  createUserLikeDto: CreateUserLikeDto
): Promise<void> => {
  await db.insert(userLike).values({
    userId: createUserLikeDto.userId,
    thesisProjectId: createUserLikeDto.projectId,
  });
};

export const deleteUserLike = async (projectId: string): Promise<void> => {
  await db.delete(userLike).where(eq(userLike.thesisProjectId, projectId));
};
