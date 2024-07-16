import { db } from '~/server/db/db';
import { CreateCommentDto } from './dtos/comment';
import { comment, userTable } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { Comment } from './entities/comment';

export const getCommentsByProjectId = async (
  projectId: string
): Promise<Comment[]> => {
  const comments = await db
    .select({
      comment: comment,
      user: userTable,
    })
    .from(comment)
    .innerJoin(userTable, eq(comment.userId, userTable.id))
    .where(eq(comment.thesisProjectId, projectId));

  return comments.map((comment) => ({
    ...comment.comment,
    user: {
      id: comment.user.id,
      name: comment.user.name,
      lastName: comment.user.lastName,
      role: comment.user.role,
    },
  }));
};

export const createComment = async (
  createCommentDto: CreateCommentDto
): Promise<void> => {
  await db.insert(comment).values({
    content: createCommentDto.content,
    userId: createCommentDto.userId,
    thesisProjectId: createCommentDto.projectId,
  });
};
