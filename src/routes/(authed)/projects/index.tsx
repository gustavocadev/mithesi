import { component$, useContext, useTask$ } from '@builder.io/qwik';
import { ProjectPost } from '~/components/project/ProjectPost';
import {
  type DocumentHead,
  routeLoader$,
  useNavigate,
} from '@builder.io/qwik-city';
import { findProjectsByUserId } from '~/server/services/project/project';
import { Button } from '~/components/ui/button/button';
import { Card } from '~/components/ui/card/card';
import { ProjectContext } from '~/context/project/ProjectContext';

import type { User } from 'lucia';

export const useProjects = routeLoader$(async ({ url, sharedMap }) => {
  const user = sharedMap.get('user') as User;

  // get all the projects that the user is the author or contributor
  const projectsByUser = await findProjectsByUserId(user.id, user.role);

  // search for params if there is a search param
  const projectName = url.searchParams.get('search');

  // if there is a search param, filter the projects by the search param
  if (projectName) {
    const projects = projectsByUser.filter((project) =>
      project.title.toLowerCase().includes(projectName.toLowerCase())
    );

    return projects;
  }

  // if there is no search param, return all the projects

  return projectsByUser;
});

export default component$(() => {
  const projectsData = useProjects();
  const { showCreateProjectModal, projectSelected, projects } =
    useContext(ProjectContext);

  const nav = useNavigate();

  useTask$(({ track }) => {
    track(() => projectsData.value);
    projects.value = projectsData.value;
  });

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
      {projects.value.map((project) => (
        <ProjectPost
          key={project.id}
          project={project}
          class="cursor-pointer rounded-none border-t"
          onClick$={() => {
            projectSelected.value = project;
            nav('/projects/' + project.id + '/');
          }}
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
