import { component$, useContext } from '@builder.io/qwik';
import { ProjectPost } from '~/components/project/ProjectPost';
import { type DocumentHead, routeLoader$ } from '@builder.io/qwik-city';
import { handleRequest } from '~/server/db/lucia';
import { findProjectsByUserId } from '~/server/services/project/project';
import { findOneUser } from '~/server/services/user/user';
import { Button } from '~/components/ui/button/button';
import { Card } from '~/components/ui/card/card';
import { ProjectContext } from '~/context/project/ProjectContext';

export const useLoaderProjects = routeLoader$(async (event) => {
  const authRequest = handleRequest(event);
  const { session } = await authRequest.validateUser();
  if (!session) throw event.redirect(303, '/login');

  // get all the projects that the user is the author or contributor
  const projectsByUser = await findProjectsByUserId(session.userId);

  // search for params if there is a search param
  const projectName = event.url.searchParams.get('search');

  // if there is a search param, filter the projects by the search param
  if (projectName) {
    const projects = projectsByUser.filter((project) => {
      return project.title.toLowerCase().includes(projectName.toLowerCase());
    });

    return {
      projectsByUser: projects,
    };
  }

  // if there is no search param, return all the projects
  return {
    projectsByUser,
  };
});

export const userLoaderUser = routeLoader$(async (event) => {
  const authRequest = handleRequest(event);
  const { session } = await authRequest.validateUser();
  if (!session) {
    return {
      error: 'Not logged in',
    };
  }

  const user = await findOneUser(session.userId);

  return {
    user,
  };
});

export default component$(() => {
  const loaderProjects = useLoaderProjects();
  const { showCreateProjectModal } = useContext(ProjectContext);

  return (
    <Card.Root class="w-4/12 mx-auto rounded-xl">
      <section class="flex items-center py-3 px-6">
        <p
          class="flex-1 text-gray-400 text-md cursor-text"
          onClick$={() => (showCreateProjectModal.value = true)}
        >
          Publica un proyecto...
        </p>
        <Button
          class="font-semibold text-md px-4 py-2"
          look="outline"
          onClick$={() => (showCreateProjectModal.value = true)}
        >
          Post
        </Button>
      </section>
      {loaderProjects.value?.projectsByUser?.map((project) => (
        <ProjectPost
          key={project.id}
          createdAt={project.createdAt}
          description={project.description}
          id={project.id}
          name={project.title}
        />
      ))}
    </Card.Root>
  );
});

export const head: DocumentHead = {
  title: 'Mis proyectos',
  meta: [
    {
      name: 'description',
      content: 'Administra tus proyectos',
    },
  ],
};
