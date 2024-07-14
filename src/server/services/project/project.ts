import { eq, or } from 'drizzle-orm';
import { db } from '~/server/db/db';
import { thesisProject, userTable } from '~/server/db/schema';
import type { CreateProjectDto } from './dto/project';
import { Project } from './entities/project';

export const findOneThesisProject = async (
  projectId: string
): Promise<Project> => {
  const [projectFound] = await db
    .select()
    .from(thesisProject)
    .where(eq(thesisProject.id, projectId));
  return projectFound;
};

export const findProjectsByUserId = async (
  userId: string
): Promise<Project[]> => {
  const projectsByUser = await db
    .select({
      id: thesisProject.id,
      title: thesisProject.title,
      description: thesisProject.description,
      userId: thesisProject.userId,
      urlImg: thesisProject.urlImg,
      urlPdf: thesisProject.urlPdf,
      status: thesisProject.status,
      createdAt: thesisProject.createdAt,
      updatedAt: thesisProject.updatedAt,
      user: userTable,
    })
    .from(thesisProject)
    .innerJoin(userTable, eq(userTable.id, thesisProject.userId))
    .where(eq(thesisProject.userId, userId));

  return projectsByUser;
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
