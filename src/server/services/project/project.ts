import { and, count, desc, eq, or, sql } from 'drizzle-orm';
import { db } from '~/server/db/db';
import {
  committeeMember,
  thesisProject,
  userLike,
  userTable,
} from '~/server/db/schema';
import type { CreateProjectDto } from './dto/project';
import { Project } from './entities/project';

export const findOneThesisProject = async (
  projectId: string,
  userId: string
): Promise<Project | null> => {
  const [projectFound] = await db
    .select({
      project: thesisProject,
      user: {
        id: userTable.id,
        name: userTable.name,
        lastName: userTable.lastName,
        role: userTable.role,
      },
      likes: count(userLike.id),
      userLikeIds: sql<string[]>`ARRAY_AGG(${userLike.userId})`,
    })
    .from(thesisProject)
    .innerJoin(userTable, eq(userTable.id, thesisProject.userId))
    .leftJoin(userLike, eq(userLike.thesisProjectId, thesisProject.id))
    .where(
      and(eq(thesisProject.isVisible, true), eq(thesisProject.id, projectId))
    )
    .groupBy(userTable.id, thesisProject.id);

  if (!projectFound) return null;

  return {
    ...projectFound.project,
    user: projectFound.user,
    likes: projectFound.likes,
    userLikeIds: projectFound.userLikeIds,
    isLikedByTheUserAuth: projectFound.userLikeIds.includes(userId),
  };
};

export const findProjectsByUserId = async (
  userId: string,
  userRole: string
): Promise<Project[]> => {
  const projectsByUserSubQuery = db
    .select({
      projects: thesisProject,
      user: {
        id: userTable.id,
        name: userTable.name,
        lastName: userTable.lastName,
        role: userTable.role,
      },
      userLikeIds: sql<string[]>`ARRAY_AGG(${userLike.userId})`,
      likes: count(userLike.id),
    })
    .from(thesisProject)
    .innerJoin(userTable, eq(userTable.id, thesisProject.userId))
    .leftJoin(userLike, eq(userLike.thesisProjectId, thesisProject.id))
    .leftJoin(
      committeeMember,
      eq(committeeMember.thesisProjectId, thesisProject.id)
    )
    .groupBy(userTable.id, thesisProject.id)
    .orderBy(desc(thesisProject.createdAt));

  if (userRole === 'user') {
    const projects = await projectsByUserSubQuery.where(
      and(
        or(
          eq(thesisProject.userId, userId),
          eq(committeeMember.userId, userId)
        ),
        eq(thesisProject.isVisible, true)
      )
    );

    return projects.map((project) => ({
      ...project.projects,
      user: project.user,
      likes: project.likes,
      userLikeIds: project.userLikeIds,
      isLikedByTheUserAuth: project.userLikeIds.includes(userId),
    }));
  }
  const projects = await projectsByUserSubQuery.where(
    eq(thesisProject.isVisible, true)
  );

  return projects.map((project) => ({
    ...project.projects,
    user: project.user,
    likes: project.likes,
    userLikeIds: project.userLikeIds,
    isLikedByTheUserAuth: project.userLikeIds.includes(userId),
  }));
};

export const createProject = async ({
  userId,
  description,
  title,
  urlImg,
  urlPdf,
}: CreateProjectDto): Promise<void> => {
  await db.insert(thesisProject).values({
    title,
    description,
    userId,
    urlImg,
    urlPdf,
  });
};

export const updateStatusProjectById = async (
  projectId: string,
  status: string
): Promise<void> => {
  await db
    .update(thesisProject)
    .set({ status })
    .where(eq(thesisProject.id, projectId));
};

export const deleteProjectById = async (projectId: string): Promise<void> => {
  await db
    .update(thesisProject)
    .set({ isVisible: false })
    .where(eq(thesisProject.id, projectId));
};
