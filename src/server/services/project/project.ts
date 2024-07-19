import { count, desc, eq, or, sql } from 'drizzle-orm';
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
  projectId: string
): Promise<Project> => {
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
      isLiked: sql<boolean>`CASE WHEN ${userLike.id} IS NOT NULL THEN TRUE ELSE FALSE END`,
    })
    .from(thesisProject)
    .innerJoin(userTable, eq(userTable.id, thesisProject.userId))
    .leftJoin(userLike, eq(userLike.thesisProjectId, thesisProject.id))
    .where(eq(thesisProject.id, projectId))
    .groupBy(userTable.id, thesisProject.id, userLike.id);

  return {
    ...projectFound.project,
    user: projectFound.user,
    likes: projectFound.likes,
    isLiked: projectFound.isLiked,
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
      likes: count(userLike.id),
      isLiked: sql<boolean>`CASE WHEN ${userLike.id} IS NOT NULL THEN TRUE ELSE FALSE END`,
    })
    .from(thesisProject)
    .innerJoin(userTable, eq(userTable.id, thesisProject.userId))
    .leftJoin(userLike, eq(userLike.thesisProjectId, thesisProject.id))
    .leftJoin(
      committeeMember,
      eq(committeeMember.thesisProjectId, thesisProject.id)
    )
    .groupBy(userTable.id, thesisProject.id, userLike.id)
    .orderBy(desc(thesisProject.createdAt));

  if (userRole === 'user') {
    const projects = await projectsByUserSubQuery.where(
      or(eq(thesisProject.userId, userId), eq(committeeMember.userId, userId))
    );
    return projects.map((project) => ({
      ...project.projects,
      user: project.user,
      likes: project.likes,
      isLiked: project.isLiked,
    }));
  }
  const projects = await projectsByUserSubQuery;

  return projects.map((project) => ({
    ...project.projects,
    user: project.user,
    likes: project.likes,
    isLiked: project.isLiked,
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
