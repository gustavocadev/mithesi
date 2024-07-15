import { count, eq } from 'drizzle-orm';
import { db } from '~/server/db/db';
import { thesisProject, userLike, userTable } from '~/server/db/schema';
import type { CreateProjectDto } from './dto/project';
import { Project } from './entities/project';

export const findOneThesisProject = async (
  projectId: string
): Promise<Project> => {
  const [projectFound] = await db
    .select({
      project: thesisProject,
      user: userTable,
      userLike: userLike,
      likes: count(userLike.id),
    })
    .from(thesisProject)
    .innerJoin(userTable, eq(userTable.id, thesisProject.userId))
    .leftJoin(userLike, eq(userLike.thesisProjectId, thesisProject.id))
    .where(eq(thesisProject.id, projectId))
    .groupBy(userTable.id, thesisProject.id, userLike.id);

  return {
    ...projectFound.project,
    user: projectFound.user,
    userLike: projectFound.userLike,
    likes: projectFound.likes,
  };
};

export const findProjectsByUserId = async (
  userId: string
): Promise<Project[]> => {
  const projectsByUser = await db
    .select({
      projects: thesisProject,
      user: userTable,
      userLike: userLike,
      likes: count(userLike.id),
    })
    .from(thesisProject)
    .innerJoin(userTable, eq(userTable.id, thesisProject.userId))
    .leftJoin(userLike, eq(userLike.thesisProjectId, thesisProject.id))
    .where(eq(thesisProject.userId, userId))
    .groupBy(userTable.id, thesisProject.id, userLike.id);

  const projects = projectsByUser.map((project) => {
    return {
      ...project.projects,
      user: project.user,
      userLike: project.userLike,
      likes: project.likes,
    };
  });

  return projects;
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
