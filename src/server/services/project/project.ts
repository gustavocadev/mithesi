import { eq } from 'drizzle-orm';
import { db } from '~/server/db/db';
import { thesisProject, userTable } from '~/server/db/schema';
import type { CreateProjectDto } from './dto/project';
import { Project } from './entities/project';

export const findOneThesisProject = async (
  projectId: string
): Promise<Project> => {
  const [projectFound] = await db
    .select({
      project: thesisProject,
      user: userTable,
    })
    .from(thesisProject)
    .where(eq(thesisProject.id, projectId));

  return {
    ...projectFound.project,
    user: projectFound.user,
  };
};

export const findProjectsByUserId = async (
  userId: string
): Promise<Project[]> => {
  const projectsByUser = await db
    .select({
      projects: thesisProject,
      user: userTable,
    })
    .from(thesisProject)
    .innerJoin(userTable, eq(userTable.id, thesisProject.userId))
    .where(eq(thesisProject.userId, userId));

  const projects = projectsByUser.map((project) => {
    return {
      ...project.projects,
      user: project.user,
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
