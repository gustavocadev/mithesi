import { and, eq } from 'drizzle-orm';
import { db } from '~/server/db/db';
import { committeeMember, thesisProject, userTable } from '~/server/db/schema';
import { UserComitteeMember } from './types/comittee-member';

export const findCommitteeMembersByProjectId = async (
  projectId: string
): Promise<UserComitteeMember[]> => {
  const contributors = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      lastName: userTable.lastName,
    })
    .from(committeeMember)
    .innerJoin(
      thesisProject,
      eq(thesisProject.id, committeeMember.thesisProjectId)
    )
    .innerJoin(userTable, eq(userTable.id, committeeMember.userId))
    .where(eq(thesisProject.id, projectId));
  return contributors;
};

export const createContributor = async (
  userId: string,
  projectId: string
): Promise<void> => {
  await db.insert(committeeMember).values({
    userId,
    thesisProjectId: projectId,
  });
};

export const removeOneContributor = async (
  projectId: string,
  userId: string
): Promise<void> => {
  await db.transaction(async (tx) => {
    try {
      await db
        .delete(committeeMember)
        .where(
          and(
            eq(committeeMember.userId, userId),
            eq(committeeMember.thesisProjectId, projectId)
          )
        );
    } catch (error) {
      tx.rollback();
    }
  });
};
