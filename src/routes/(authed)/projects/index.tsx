import { component$, useContext } from '@builder.io/qwik';
import { ProjectPost } from '~/components/project/ProjectPost';
import { type DocumentHead, routeLoader$ } from '@builder.io/qwik-city';
import { handleRequest } from '~/server/db/lucia';
import { findProjectsByUserId } from '~/server/services/project/project';
import { Button } from '~/components/ui/button/button';
import { Card } from '~/components/ui/card/card';
import { ProjectContext } from '~/context/project/ProjectContext';
import { useNavigate } from '@builder.io/qwik-city';

export const useLoaderProjects = routeLoader$(
  async ({ url, cookie, redirect }) => {
    const authRequest = handleRequest({ cookie });
    const { user } = await authRequest.validateUser();
    if (!user) throw redirect(303, '/login');

    // get all the projects that the user is the author or contributor
    const projectsByUser = await findProjectsByUserId(user.id);

    // search for params if there is a search param
    const projectName = url.searchParams.get('search');

    // map the projects to remove the user password and email
    const projectsByUserMapped = projectsByUser.map((project) => ({
      ...project,
      user: {
        id: project.user?.id,
        name: project.user?.name,
        lastName: project.user?.lastName,
      },
    }));

    // if there is a search param, filter the projects by the search param
    if (projectName) {
      const projects = projectsByUserMapped.filter((project) =>
        project.title.toLowerCase().includes(projectName.toLowerCase())
      );

      return {
        projectsByUser: projects,
      };
    }

    // if there is no search param, return all the projects

    return {
      projectsByUser: projectsByUserMapped,
    };
  }
);

export default component$(() => {
  const loaderProjects = useLoaderProjects();
  const { showCreateProjectModal } = useContext(ProjectContext);
  const nav = useNavigate();

  return (
    <Card.Root class="w-full md:w-8/12 xl:w-4/12 mx-auto rounded-xl">
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
      {loaderProjects.value.projectsByUser.map((project) => (
        <ProjectPost
          key={project.id}
          createdAt={project.createdAt}
          description={project.description}
          id={project.id}
          title={project.title}
          urlPdf={project.urlPdf}
          urlImg={project.urlImg}
          projectStatus={project.status}
          onClick$={async () => await nav('/projects/' + project.id + '/')}
          authorName={project.user?.name + ' ' + project.user?.lastName}
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
